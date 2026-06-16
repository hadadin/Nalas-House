import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FoodClient from "./FoodClient";
import { getHouseholdId, getLatestMenuId, getPreferences } from "@/lib/queries";
import type { Menu, ShoppingItem, Meal } from "@/lib/types";

export default async function FoodPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const hh = await getHouseholdId(user.id);
  if (!hh) redirect("/onboarding");

  const householdId = hh.householdId;

  // Cached — no extra calls
  const [menuId, preferences] = await Promise.all([
    getLatestMenuId(householdId),
    getPreferences(householdId),
  ]);

  // Menu data needs full detail — fetch separately
  let menu: Menu | null = null;
  let shopping: ShoppingItem[] = [];

  if (menuId) {
    const [menuRes, shopRes] = await Promise.all([
      supabase
        .from("menu")
        .select("id, household_id, week_of, status, meal(id, menu_id, day_index, meal_type, name, cuisine, cook_time_minutes, steps, ingredient(id, meal_id, name, quantity, unit, aisle))")
        .eq("id", menuId)
        .single(),
      supabase
        .from("shopping_item")
        .select("*")
        .eq("menu_id", menuId)
        .order("aisle"),
    ]);
    if (menuRes.data) {
      menu = { ...menuRes.data, meal: (menuRes.data.meal as unknown as Meal[]) ?? [] };
    }
    shopping = (shopRes.data ?? []) as ShoppingItem[];
  }

  return (
    <FoodClient
      menu={menu}
      shopping={shopping}
      preferences={preferences}
      householdId={householdId}
    />
  );
}
