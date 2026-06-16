import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TasksClient from "./TasksClient";
import { getHouseholdId, getTasks, getAccount } from "@/lib/queries";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const hh = await getHouseholdId(user.id);
  if (!hh) redirect("/onboarding");

  // Both cached — zero extra DB calls if layout already fetched them
  const [tasks, account] = await Promise.all([
    getTasks(hh.householdId),
    getAccount(hh.householdId),
  ]);

  return (
    <TasksClient
      initialTasks={tasks}
      defaultAssignee={account.default_assignee}
      userName={account.user_name}
      partnerName={account.partner_name}
      householdId={hh.householdId}
    />
  );
}
