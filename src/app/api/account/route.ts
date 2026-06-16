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

  const payload = {
    household_id: householdId,
    user_name: body.user_name,
    partner_name: body.partner_name,
    language: body.language,
    week_starts_on: body.week_starts_on,
    default_assignee: body.default_assignee,
    menu_reminders: body.menu_reminders,
    task_reminders: body.task_reminders,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("account_setting")
    .upsert(payload, { onConflict: "household_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
