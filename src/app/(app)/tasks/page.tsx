import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TasksClient from "./TasksClient";
import type { Task, AccountSetting } from "@/lib/types";

export default async function TasksPage() {
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

  const { data: tasksData } = await supabase
    .from("task")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  const { data: accountRow } = await supabase
    .from("account_setting")
    .select("user_name, partner_name, default_assignee")
    .eq("household_id", householdId)
    .maybeSingle();

  const tasks: Task[] = (tasksData ?? []) as Task[];
  const account = accountRow as Pick<AccountSetting, "user_name" | "partner_name" | "default_assignee"> | null;

  return (
    <TasksClient
      initialTasks={tasks}
      defaultAssignee={account?.default_assignee ?? "Both"}
      userName={account?.user_name ?? "You"}
      partnerName={account?.partner_name ?? "Partner"}
      householdId={householdId}
    />
  );
}
