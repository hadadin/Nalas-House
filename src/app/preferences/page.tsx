import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PreferencesForm from "./PreferencesForm";

export default async function PreferencesPage() {
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

  const { data: preference } = await supabase
    .from("preference")
    .select("*")
    .eq("household_id", membership.household_id)
    .maybeSingle();

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Household preferences</h1>
      <p className="max-w-md text-center text-sm text-gray-500">
        This is what the menu agent reads every time it plans a week. Allergies
        and dietary rules are hard constraints — it will never violate them.
      </p>
      <PreferencesForm
        householdId={membership.household_id}
        initial={preference ?? null}
      />
    </main>
  );
}
