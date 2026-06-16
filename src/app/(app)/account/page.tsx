import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";
import type { AccountSetting } from "@/lib/types";

export default async function AccountPage() {
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

  const { data: accountRow } = await supabase
    .from("account_setting")
    .select("*")
    .eq("household_id", householdId)
    .maybeSingle();

  const account: AccountSetting = (accountRow as AccountSetting | null) ?? {
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

  return <AccountClient initial={account} inviteCode={household.invite_code} />;
}
