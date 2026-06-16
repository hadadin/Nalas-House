import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("household_member")
    .select("household_id, household:household_id(name, invite_code)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  const household = membership.household as unknown as {
    name: string;
    invite_code: string;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">{household.name}</h1>
      <p className="text-gray-600">You&apos;re signed in as {user.email}.</p>
      <p className="text-sm text-gray-500">
        Invite code for your partner:{" "}
        <span className="font-mono font-semibold">{household.invite_code}</span>
      </p>
      <p className="text-sm text-gray-500">
        Phase 0 complete — Phase 1 (menu + shopping list) lands here next.
      </p>
    </main>
  );
}
