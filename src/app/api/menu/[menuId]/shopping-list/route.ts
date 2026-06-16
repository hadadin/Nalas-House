import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;
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

  const { data: menu } = await supabase
    .from("menu")
    .select("id, household_id, status")
    .eq("id", menuId)
    .maybeSingle();

  if (!menu || menu.household_id !== membership.household_id) {
    return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  }
  if (menu.status !== "accepted") {
    return NextResponse.json(
      { error: "Approve this week's menu before generating a shopping list." },
      { status: 400 }
    );
  }

  const { data: meals } = await supabase
    .from("meal")
    .select("ingredient(name, quantity, unit, aisle)")
    .eq("menu_id", menuId);

  type Ing = { name: string; quantity: number | null; unit: string | null; aisle: string };
  const allIngredients: Ing[] = (meals ?? []).flatMap(
    (m) => m.ingredient as unknown as Ing[]
  );

  type Bucket = {
    name: string;
    unit: string | null;
    aisle: string;
    quantity: number | null;
    ambiguous: boolean;
  };
  const buckets = new Map<string, Bucket>();

  for (const ing of allIngredients) {
    const key = `${ing.name.trim().toLowerCase()}|${(ing.unit ?? "").trim().toLowerCase()}`;
    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, {
        name: ing.name.trim(),
        unit: ing.unit,
        aisle: ing.aisle || "other",
        quantity: ing.quantity,
        ambiguous: ing.quantity === null,
      });
    } else {
      if (existing.ambiguous || ing.quantity === null) {
        existing.ambiguous = true;
        existing.quantity = null;
      } else {
        existing.quantity = (existing.quantity ?? 0) + ing.quantity;
      }
    }
  }

  await supabase.from("shopping_item").delete().eq("menu_id", menuId);

  const items = Array.from(buckets.values()).map((b) => ({
    menu_id: menuId,
    name: b.ambiguous ? `${b.name} (to taste / amount varies)` : b.name,
    quantity: b.quantity,
    unit: b.unit,
    aisle: b.aisle,
    is_checked: false,
  }));

  if (items.length > 0) {
    const { error } = await supabase.from("shopping_item").insert(items);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ count: items.length });
}
