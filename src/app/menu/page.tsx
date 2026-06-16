import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MenuView from "./MenuView";

export default async function MenuPage() {
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
    .select("id, week_of, status, meal(id, day_index, name, cuisine, cook_time_minutes, steps, ingredient(id, name, quantity, unit, aisle))")
    .eq("household_id", membership.household_id)
    .order("week_of", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">This week&apos;s menu</h1>
      <MenuView menu={menu ?? null} />
    </main>
  );
}
