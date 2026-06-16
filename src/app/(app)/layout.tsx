import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getHouseholdId, getAccount, getTasks, getPreferences, getLatestMenuId } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const hh = await getHouseholdId(user.id);
  if (!hh) redirect("/onboarding");

  const [account, tasks, preferences, menuId] = await Promise.all([
    getAccount(hh.householdId),
    getTasks(hh.householdId),
    getPreferences(hh.householdId),
    getLatestMenuId(hh.householdId),
  ]);

  return (
    <AppShell
      householdName={hh.householdName}
      account={account}
      tasks={tasks}
      preferences={preferences}
      menuId={menuId}
    >
      {children}
    </AppShell>
  );
}
