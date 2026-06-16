import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";
import { getHouseholdId, getAccount } from "@/lib/queries";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const hh = await getHouseholdId(user.id);
  if (!hh) redirect("/onboarding");

  const account = await getAccount(hh.householdId);

  return <AccountClient initial={account} inviteCode={hh.inviteCode} />;
}
