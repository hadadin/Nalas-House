import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FoodClient from "./FoodClient";
import type { Menu, ShoppingItem, Meal, Preference } from "@/lib/types";

export default async function FoodPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("household_member")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) redirect("/onboarding");

  const householdId = membership.household_id;

  // Latest menu
  const { data: menuRow } = await supabase
    .from("menu")
    .select("id, household_id, week_of, status, meal(id, menu_id, day_index, meal_type, name, cuisine, cook_time_minutes, steps, ingredient(id, meal_id, name, quantity, unit, aisle))")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const menu: Menu | null = menuRow
    ? { ...menuRow, meal: (menuRow.meal as unknown as Meal[]) ?? [] }
    : null;

  // Shopping items
  const { data: shoppingData } = menuRow
    ? await supabase
        .from("shopping_item")
        .select("*")
        .eq("menu_id", menuRow.id)
        .order("aisle")
    : { data: [] };

  const shopping: ShoppingItem[] = (shoppingData ?? []) as ShoppingItem[];

  // Preferences
  const { data: prefData } = await supabase
    .from("preference")
    .select("dietary_rules, dislikes, cuisines, household_size, max_cook_time_minutes, notes")
    .eq("household_id", householdId)
    .maybeSingle();

  const preferences: Preference | null = prefData ?? null;

  return (
    <FoodClient
      menu={menu}
      shopping={shopping}
      preferences={preferences}
      householdId={householdId}
    />
  );
}
