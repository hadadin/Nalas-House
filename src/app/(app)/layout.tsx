import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import type { AccountSetting, Preference, Task } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("household_member")
    .select("household_id, household:household_id(name, invite_code)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) redirect("/onboarding");

  const householdId = membership.household_id;
  const household = membership.household as unknown as { name: string; invite_code: string };

  // Fetch account settings (or defaults)
  const { data: accountRow } = await supabase
    .from("account_setting")
    .select("*")
    .eq("household_id", householdId)
    .maybeSingle();

  const account: AccountSetting = accountRow ?? {
    id: "",
    household_id: householdId,
    user_name: "Noam",
    partner_name: "Maital",
    language: "English",
    week_starts_on: "Sunday",
    default_assignee: "Both",
    menu_reminders: true,
    task_reminders: true,
  };

  // Fetch tasks
  const { data: tasksData } = await supabase
    .from("task")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  const tasks: Task[] = (tasksData ?? []) as Task[];

  // Fetch preferences
  const { data: prefData } = await supabase
    .from("preference")
    .select("dietary_rules, dislikes, cuisines, household_size, max_cook_time_minutes, notes")
    .eq("household_id", householdId)
    .maybeSingle();

  const preferences: Preference | null = prefData ?? null;

  // Current menu id
  const { data: menuRow } = await supabase
    .from("menu")
    .select("id")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <AppShell
      householdName={household.name}
      account={account}
      tasks={tasks}
      preferences={preferences}
      menuId={menuRow?.id ?? null}
    >
      {children}
    </AppShell>
  );
}
