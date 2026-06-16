import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ menuId: string }> }) {
  const { menuId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await supabase
    .from("menu")
    .select("id, household_id, week_of, status, meal(id, menu_id, day_index, meal_type, name, cuisine, cook_time_minutes, steps, ingredient(id, meal_id, name, quantity, unit, aisle))")
    .eq("id", menuId)
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
