import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Task, Meal, MealType } from "@/lib/types";

const MEAL_LABELS: Record<MealType, string> = { breakfast: "BREAKFAST", lunch: "LUNCH", dinner: "DINNER" };
const MEAL_COLORS: Record<MealType, string> = { breakfast: "#F6D9A8", lunch: "#CFE3B0", dinner: "#EBC3A2" };

function dayOfWeekIndex(d: Date): number {
  return (d.getDay() + 6) % 7; // Mon=0 … Sun=6
}

export default async function HomePage() {
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

  const { data: accountRow } = await supabase
    .from("account_setting")
    .select("user_name")
    .eq("household_id", householdId)
    .maybeSingle();
  const userName: string = (accountRow as { user_name?: string } | null)?.user_name ?? "there";

  // Current week's menu
  const { data: menuRow } = await supabase
    .from("menu")
    .select("id, week_of, meal(id, day_index, meal_type, name, cook_time_minutes)")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const todayIndex = dayOfWeekIndex(new Date()); // Mon=0
  const todayMeals = menuRow
    ? ((menuRow.meal as unknown as Meal[]) ?? []).filter((m) => m.day_index === todayIndex)
    : [];

  // Upcoming tasks (not done)
  const { data: tasksData } = await supabase
    .from("task")
    .select("*")
    .eq("household_id", householdId)
    .eq("done", false)
    .order("created_at")
    .limit(3);
  const tasks: Task[] = (tasksData ?? []) as Task[];

  const hasMenu = !!menuRow;

  const overline: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink3)", textTransform: "uppercase" };

  return (
    <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 26 }}>
      {/* Greeting */}
      <div>
        <div style={{ fontSize: 12, color: "var(--coral)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
          The week ahead
        </div>
        <div className="serif" style={{ fontSize: 30, lineHeight: 1.1, color: "var(--ink)" }}>
          <span style={{ fontWeight: 700 }}>Good </span>
          <span style={{ fontStyle: "italic", fontWeight: 500 }}>morning, {userName}.</span>
        </div>
      </div>

      {/* Yellow hero CTA */}
      <div style={{ background: "var(--brand)", borderRadius: 20, padding: "20px 22px" }}>
        <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: "var(--on-brand)", lineHeight: 1.15, maxWidth: 220 }}>
          Plan your week{" "}
          <span style={{ fontStyle: "italic", fontWeight: 500 }}>in 30 seconds.</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--on-brand)", opacity: 0.8, marginTop: 6, marginBottom: 16 }}>
          AI-generated from your taste &amp; diet preferences
        </div>
        <Link
          href="/food"
          style={{ display: "inline-block", background: "var(--green)", color: "var(--on-green)", borderRadius: 999, padding: "10px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
        >
          {hasMenu ? "View this week's menu" : "Generate this week's menu"}
        </Link>
      </div>

      {/* Today's meals */}
      {todayMeals.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <div style={overline}>Today</div>
            <div style={{ flex: 1 }} />
            <Link href="/food" style={{ fontSize: 13, fontWeight: 700, color: "var(--coral)", textDecoration: "none" }}>Calendar</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {(["breakfast", "lunch", "dinner"] as MealType[]).map((mt, i) => {
              const meal = todayMeals.find((m) => m.meal_type === mt);
              return (
                <div key={mt} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < 2 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: MEAL_COLORS[mt], flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink3)", marginBottom: 2 }}>{MEAL_LABELS[mt]}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--coral)" }}>{meal?.name ?? "—"}</div>
                    {meal?.cook_time_minutes && (
                      <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 1 }}>{meal.cook_time_minutes} min</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tasks preview */}
      {tasks.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <div style={overline}>Upcoming tasks</div>
            <div style={{ flex: 1 }} />
            <Link href="/tasks" style={{ fontSize: 13, fontWeight: 700, color: "var(--coral)", textDecoration: "none" }}>See all</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map((task) => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: task.task_type === "dog" ? "var(--coral)" : "var(--green)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</div>
                  {task.scheduled_day && <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 1 }}>{task.scheduled_day}</div>}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", background: "var(--green-soft)", borderRadius: 999, padding: "3px 10px" }}>
                  {task.assignee}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasMenu && tasks.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--ink3)" }}>
          <div className="serif" style={{ fontSize: 18, marginBottom: 8 }}>Nothing here yet.</div>
          <div style={{ fontSize: 13 }}>Generate a menu or add tasks to get started.</div>
        </div>
      )}
    </div>
  );
}
