/**
 * React `cache()` deduplicates identical calls within the same render tree
 * (e.g. layout + page both calling getAccount — only one DB round-trip).
 */
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AccountSetting, Task, Preference } from "./types";

export const getHouseholdId = cache(async (userId: string): Promise<{ householdId: string; householdName: string; inviteCode: string } | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("household_member")
    .select("household_id, household:household_id(name, invite_code)")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  const h = data.household as unknown as { name: string; invite_code: string };
  return { householdId: data.household_id, householdName: h.name, inviteCode: h.invite_code };
});

export const getAccount = cache(async (householdId: string): Promise<AccountSetting> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("account_setting")
    .select("*")
    .eq("household_id", householdId)
    .maybeSingle();
  return (data as AccountSetting | null) ?? {
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
});

export const getTasks = cache(async (householdId: string): Promise<Task[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("task")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Task[];
});

export const getPreferences = cache(async (householdId: string): Promise<Preference | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("preference")
    .select("dietary_rules, dislikes, cuisines, household_size, max_cook_time_minutes, notes")
    .eq("household_id", householdId)
    .maybeSingle();
  return data ?? null;
});

export const getLatestMenuId = cache(async (householdId: string): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("menu")
    .select("id")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
});
