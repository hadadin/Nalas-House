"use client";

import { useState } from "react";
import type { AccountSetting } from "@/lib/types";

type Props = { initial: AccountSetting; inviteCode: string };

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)" }}>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
      <button
        onClick={onChange}
        style={{ width: 44, height: 26, borderRadius: 999, border: "none", cursor: "pointer", padding: 2, background: on ? "var(--green)" : "var(--warmer)", transition: "background .15s", display: "flex", alignItems: "center", justifyContent: on ? "flex-end" : "flex-start" }}
      >
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--surface)" }} />
      </button>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ border: active ? "1.5px solid var(--green)" : "1.5px solid var(--line)", background: active ? "var(--green)" : "var(--surface)", color: active ? "var(--on-green)" : "var(--ink2)", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: "7px 14px", fontFamily: "inherit" }}>
      {children}
    </button>
  );
}

const overline: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink3)", textTransform: "uppercase" };

export default function AccountClient({ initial, inviteCode }: Props) {
  const [account, setAccount] = useState<AccountSetting>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  function update<K extends keyof AccountSetting>(key: K, value: AccountSetting[K]) {
    setAccount((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(account) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--coral)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Your household</div>
        <div className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>Account <em style={{ fontWeight: 500 }}>&amp; settings.</em></div>
      </div>

      {/* Profile card */}
      <div style={{ background: "var(--green)", borderRadius: 18, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--brand)", color: "var(--on-brand)", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--on-green)" }}>
            {account.user_name[0]}
          </div>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--coral-soft)", color: "var(--coral)", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--on-green)", marginLeft: -12 }}>
            {account.partner_name[0]}
          </div>
        </div>
        <div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 700, color: "var(--on-green)" }}>{account.user_name} &amp; {account.partner_name}</div>
          <div style={{ fontSize: 12, color: "var(--on-green)", opacity: 0.75, marginTop: 2 }}>Household members</div>
        </div>
      </div>

      {/* Invite code */}
      <div style={{ background: "var(--surface)", borderRadius: 14, padding: "14px 16px", border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...overline, marginBottom: 4 }}>Partner invite code</div>
          <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", color: "var(--ink)" }}>{inviteCode}</div>
        </div>
        <button onClick={copyInvite} style={{ background: "var(--green-soft)", color: "var(--green)", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Names */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={overline}>Household members</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)", marginBottom: 6 }}>Your name</div>
            <input value={account.user_name} onChange={(e) => update("user_name", e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--ink)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)", marginBottom: 6 }}>Partner&apos;s name</div>
            <input value={account.partner_name} onChange={(e) => update("partner_name", e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--ink)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={overline}>Preferences</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)", marginBottom: 8 }}>Language</div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["English", "Hebrew"] as const).map((lang) => (
              <Chip key={lang} active={account.language === lang} onClick={() => update("language", lang)}>{lang}</Chip>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)", marginBottom: 8 }}>Week starts on</div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["Sunday", "Monday"] as const).map((d) => (
              <Chip key={d} active={account.week_starts_on === d} onClick={() => update("week_starts_on", d)}>{d}</Chip>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)", marginBottom: 8 }}>Default task assignee</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[account.user_name, account.partner_name, "Both"].map((a) => (
              <Chip key={a} active={account.default_assignee === a} onClick={() => update("default_assignee", a)}>{a}</Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={overline}>Notifications</div>
        <Toggle label="Weekly menu reminders" on={account.menu_reminders} onChange={() => update("menu_reminders", !account.menu_reminders)} />
        <Toggle label="Task due-date reminders" on={account.task_reminders} onChange={() => update("task_reminders", !account.task_reminders)} />
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving} style={{ background: "var(--green)", color: "var(--on-green)", border: "none", borderRadius: 999, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save settings"}
      </button>
    </div>
  );
}
