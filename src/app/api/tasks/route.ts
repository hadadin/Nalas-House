import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();

  const { data: membership } = await supabase
    .from("household_member")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "No household" }, { status: 400 });

  const { data, error } = await supabase
    .from("task")
    .insert({
      household_id: membership.household_id,
      title: body.title,
      assignee: body.assignee ?? "Both",
      task_type: body.task_type ?? "household",
      done: false,
      scheduled_day: body.scheduled_day ?? null,
      repeat_schedule: body.repeat_schedule ?? "none",
      notes: body.notes ?? null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
