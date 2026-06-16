"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";

const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const overline: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink3)", textTransform: "uppercase" };

type Props = { initialTasks: Task[]; defaultAssignee: string; userName: string; partnerName: string; householdId: string };

export default function TasksClient({ initialTasks, defaultAssignee, userName, partnerName, householdId }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState<"schedule" | "all">("schedule");
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignee: defaultAssignee, task_type: "household" as "household" | "dog", scheduled_day: "Monday" as string, repeat_schedule: "none" as Task["repeat_schedule"], notes: "" });
  const [saving, setSaving] = useState(false);

  const assignees = [userName, partnerName, "Both"];
  const done = tasks.filter((t) => t.done).length;

  async function toggleTask(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
    await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ done: !task.done }) });
  }

  async function saveTask() {
    if (!newTask.title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ household_id: householdId, ...newTask }) });
    if (res.ok) {
      const created = await res.json();
      setTasks((prev) => [created, ...prev]);
      setShowAdd(false);
      setNewTask({ title: "", assignee: defaultAssignee, task_type: "household", scheduled_day: "Monday", repeat_schedule: "none", notes: "" });
    }
    setSaving(false);
  }

  function TaskRow({ task }: { task: Task }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: task.done ? "transparent" : "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", opacity: task.done ? 0.55 : 1 }}>
        <button
          onClick={() => toggleTask(task.id)}
          style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, cursor: "pointer", padding: 0, border: task.done ? "none" : "1.5px solid var(--ink3)", background: task.done ? "var(--green)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {task.done && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="var(--on-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: task.done ? 400 : 600, textDecoration: task.done ? "line-through" : "none", color: task.done ? "var(--ink3)" : "var(--ink)", fontSize: 14 }}>{task.title}</span>
          <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>
            {task.task_type === "dog" ? "Nala" : "Household"}
            {task.repeat_schedule !== "none" ? ` · ${task.repeat_schedule}` : ""}
            {task.notes ? ` · ${task.notes}` : ""}
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", background: "var(--green-soft)", borderRadius: 999, padding: "3px 10px", flexShrink: 0 }}>{task.assignee}</span>
      </div>
    );
  }

  function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
      <button onClick={onClick} style={{ border: active ? "1.5px solid var(--green)" : "1.5px solid var(--line)", background: active ? "var(--green)" : "var(--surface)", color: active ? "var(--on-green)" : "var(--ink2)", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "5px 12px", fontFamily: "inherit" }}>
        {children}
      </button>
    );
  }

  return (
    <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--coral)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Household</div>
        <div className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>Tasks <em style={{ fontWeight: 500 }}>&amp; reminders.</em></div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: "var(--green)", color: "var(--on-green)", border: "none", borderRadius: 999, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {showAdd ? "Cancel" : "Add task"}
        </button>
        <span style={{ fontSize: 13, color: "var(--ink2)" }}>{done}/{tasks.length} done</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "inline-flex", background: "var(--warm)", borderRadius: 999, padding: 3 }}>
          {[{ id: "schedule", label: "By day" }, { id: "all", label: "All" }].map((v) => (
            <button key={v.id} onClick={() => setView(v.id as "schedule" | "all")} style={{ padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: view === v.id ? "var(--surface)" : "transparent", color: view === v.id ? "var(--ink)" : "var(--ink2)" }}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, background: "var(--warmer)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%`, height: "100%", background: "var(--green)", borderRadius: 999, transition: "width 0.3s" }} />
      </div>

      {/* Add task form */}
      {showAdd && (
        <div style={{ background: "var(--surface)", borderRadius: 16, padding: 18, border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="serif" style={{ fontSize: 18, fontWeight: 700 }}>New task</div>
          <input
            value={newTask.title}
            onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
            placeholder="What needs doing?"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--ink)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          <div>
            <div style={{ ...overline, marginBottom: 8 }}>Scheduled day</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {WEEK_DAYS.map((d) => <Chip key={d} active={newTask.scheduled_day === d} onClick={() => setNewTask((p) => ({ ...p, scheduled_day: d }))}>{d.slice(0, 3)}</Chip>)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ ...overline, marginBottom: 8 }}>Assign to</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {assignees.map((a) => <Chip key={a} active={newTask.assignee === a} onClick={() => setNewTask((p) => ({ ...p, assignee: a }))}>{a}</Chip>)}
              </div>
            </div>
            <div>
              <div style={{ ...overline, marginBottom: 8 }}>Category</div>
              <div style={{ display: "flex", gap: 6 }}>
                <Chip active={newTask.task_type === "household"} onClick={() => setNewTask((p) => ({ ...p, task_type: "household" }))}>Household</Chip>
                <Chip active={newTask.task_type === "dog"} onClick={() => setNewTask((p) => ({ ...p, task_type: "dog" }))}>Nala</Chip>
              </div>
            </div>
          </div>
          <div>
            <div style={{ ...overline, marginBottom: 8 }}>Repeat</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["none", "daily", "weekly", "monthly"] as Task["repeat_schedule"][]).map((r) => (
                <Chip key={r} active={newTask.repeat_schedule === r} onClick={() => setNewTask((p) => ({ ...p, repeat_schedule: r }))}>{r === "none" ? "Once" : r.charAt(0).toUpperCase() + r.slice(1)}</Chip>
              ))}
            </div>
          </div>
          <input value={newTask.notes} onChange={(e) => setNewTask((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--ink)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          <button onClick={saveTask} disabled={saving || !newTask.title.trim()} style={{ background: "var(--green)", color: "var(--on-green)", border: "none", borderRadius: 999, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: (saving || !newTask.title.trim()) ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Save task"}
          </button>
        </div>
      )}

      {/* Task list */}
      {view === "schedule" ? (
        WEEK_DAYS.map((day) => {
          const dayTasks = tasks.filter((t) => t.scheduled_day === day);
          if (!dayTasks.length) return null;
          return (
            <div key={day}>
              <div className="serif" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>{day}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dayTasks.map((t) => <TaskRow key={t.id} task={t} />)}
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink3)" }}>
              <div className="serif" style={{ fontSize: 18, marginBottom: 8 }}>No tasks yet</div>
              <div style={{ fontSize: 13 }}>Add a task to get started.</div>
            </div>
          ) : tasks.map((t) => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
}
