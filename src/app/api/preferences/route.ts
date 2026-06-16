import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: membership } = await supabase
    .from("household_member")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "No household" }, { status: 400 });

  const householdId = membership.household_id;
  const body = await request.json();

  const { error } = await supabase
    .from("preference")
    .upsert({
      household_id: householdId,
      dietary_rules: body.dietary_rules ?? [],
      dislikes: body.dislikes ?? [],
      cuisines: body.cuisines ?? [],
      household_size: body.household_size ?? 2,
      max_cook_time_minutes: body.max_cook_time_minutes ?? null,
      notes: body.notes ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "household_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
