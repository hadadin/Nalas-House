import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ShoppingListView from "./ShoppingListView";

export default async function ShoppingListPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("household_member")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  const { data: menu } = await supabase
    .from("menu")
    .select("id, week_of")
    .eq("household_id", membership.household_id)
    .eq("status", "accepted")
    .order("week_of", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: items } = menu
    ? await supabase
        .from("shopping_item")
        .select("id, name, quantity, unit, aisle, is_checked")
        .eq("menu_id", menu.id)
        .order("aisle", { ascending: true })
    : { data: null };

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Shopping list</h1>
      <ShoppingListView menu={menu ?? null} items={items ?? []} />
    </main>
  );
}
