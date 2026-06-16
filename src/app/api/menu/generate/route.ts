import { createClient } from "@/lib/supabase/server";
import { generateMenu, type ProposedMeal } from "@/lib/menu-agent";
import { NextResponse } from "next/server";

function currentWeekMonday() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  return monday.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("household_member")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "No household" }, { status: 400 });
  }
  const householdId = membership.household_id;

  const body = await request.json().catch(() => ({}));
  const menuId: string | undefined = body.menuId;
  const adjustmentNote: string | null = body.adjustmentNote ?? null;
  const weekOf: string = body.weekOf ?? currentWeekMonday();

  const { data: preference } = await supabase
    .from("preference")
    .select("dietary_rules, dislikes, cuisines, household_size, max_cook_time_minutes, notes")
    .eq("household_id", householdId)
    .maybeSingle();

  const profile = preference ?? {
    dietary_rules: [],
    dislikes: [],
    cuisines: [],
    household_size: 2,
    max_cook_time_minutes: null,
    notes: null,
  };

  // Recent meals across the household's last few menus, to avoid repeats.
  const { data: recentMenus } = await supabase
    .from("menu")
    .select("id, week_of, meal(name)")
    .eq("household_id", householdId)
    .order("week_of", { ascending: false })
    .limit(4);

  const recentMeals = (recentMenus ?? []).flatMap((m) =>
    (m.meal as unknown as { name: string }[]).map((meal) => ({
      name: meal.name,
      week_of: m.week_of as string,
    }))
  );

  let targetMenuId = menuId;
  let currentMeals: ProposedMeal[] | null = null;

  if (menuId) {
    const { data: menu } = await supabase
      .from("menu")
      .select("id, household_id")
      .eq("id", menuId)
      .maybeSingle();

    if (!menu || menu.household_id !== householdId) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const { data: meals } = await supabase
      .from("meal")
      .select("day_index, name, cuisine, cook_time_minutes, steps, ingredient(name, quantity, unit, aisle)")
      .eq("menu_id", menuId);

    currentMeals = (meals ?? []).map((m) => ({
      day_index: m.day_index,
      name: m.name,
      cuisine: m.cuisine,
      cook_time_minutes: m.cook_time_minutes,
      steps: m.steps,
      ingredients: m.ingredient as unknown as ProposedMeal["ingredients"],
    }));
  } else {
    const { data: newMenu, error: menuError } = await supabase
      .from("menu")
      .insert({ household_id: householdId, week_of: weekOf, status: "draft" })
      .select("id")
      .single();

    if (menuError || !newMenu) {
      return NextResponse.json(
        { error: menuError?.message ?? "Could not create menu" },
        { status: 500 }
      );
    }
    targetMenuId = newMenu.id;
  }

  let meals: ProposedMeal[];
  try {
    meals = await generateMenu({
      profile,
      recentMeals,
      currentMeals,
      adjustmentNote,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Menu generation failed" },
      { status: 500 }
    );
  }

  // Replace meals for this menu (cascade deletes their ingredients).
  await supabase.from("meal").delete().eq("menu_id", targetMenuId);

  for (const meal of meals) {
    const { data: insertedMeal, error: mealError } = await supabase
      .from("meal")
      .insert({
        menu_id: targetMenuId,
        name: meal.name,
        cuisine: meal.cuisine,
        cook_time_minutes: meal.cook_time_minutes,
        steps: meal.steps,
        day_index: meal.day_index,
      })
      .select("id")
      .single();

    if (mealError || !insertedMeal) {
      return NextResponse.json(
        { error: mealError?.message ?? "Could not save meal" },
        { status: 500 }
      );
    }

    if (meal.ingredients.length > 0) {
      await supabase.from("ingredient").insert(
        meal.ingredients.map((ing) => ({
          meal_id: insertedMeal.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          aisle: ing.aisle || "other",
        }))
      );
    }
  }

  return NextResponse.json({ menuId: targetMenuId });
}
