"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import ChatOverlay from "./ChatOverlay";
import type { AccountSetting, Task, Preference } from "@/lib/types";

type Props = {
  children: React.ReactNode;
  householdName: string;
  account: AccountSetting;
  tasks: Task[];
  preferences: Preference | null;
  menuId: string | null;
};

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "var(--green)" : "var(--ink3)"; const w = active ? 2.2 : 1.6;
  return <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M3 10.5L11 3l8 7.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1v-8.5z" stroke={c} strokeWidth={w} fill={active ? c : "none"} fillOpacity={active ? 0.12 : 0} /><path d="M8 20v-5h6v5" stroke={c} strokeWidth={1.6} /></svg>;
}
function FoodIcon({ active }: { active: boolean }) {
  const c = active ? "var(--green)" : "var(--ink3)"; const w = active ? 2.2 : 1.6;
  return <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M7 2v7c0 2 1.5 3.5 4 3.5s4-1.5 4-3.5V2" stroke={c} strokeWidth={w} strokeLinecap="round" /><path d="M11 12.5V20M16 2v18" stroke={c} strokeWidth={w} strokeLinecap="round" /></svg>;
}
function TasksIcon({ active }: { active: boolean }) {
  const c = active ? "var(--green)" : "var(--ink3)"; const w = active ? 2.2 : 1.6;
  return <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="2.5" stroke={c} strokeWidth={w} /><path d="M7.5 9l2.5 2.5 5-5" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 15h7" stroke={c} strokeWidth={1.6} strokeLinecap="round" /></svg>;
}
function FinanceIcon({ active }: { active: boolean }) {
  const c = active ? "var(--green)" : "var(--ink3)"; const w = active ? 2.2 : 1.6;
  return <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M3 15l5-5 3.5 3.5 4.5-6 3 3" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /><path d="M3 19h16" stroke={c} strokeWidth={1.6} strokeLinecap="round" /></svg>;
}
function AccountIcon({ active }: { active: boolean }) {
  const c = active ? "var(--green)" : "var(--ink3)"; const w = active ? 2.2 : 1.6;
  return <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="3.5" stroke={c} strokeWidth={w} /><path d="M5 19c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={c} strokeWidth={w} strokeLinecap="round" /></svg>;
}
function ChatIcon() {
  return <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 2C6.5 2 3 5.1 3 9c0 2 .9 3.8 2.4 5.1L5 19l3.8-1.1c.7.2 1.5.4 2.3.4 4.5 0 8-3.1 8-7s-3.5-7-8-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

const NAV = [
  { href: "/",        label: "Home",    Icon: HomeIcon },
  { href: "/food",    label: "Food",    Icon: FoodIcon },
  { href: "/tasks",   label: "Tasks",   Icon: TasksIcon },
  { href: "/finance", label: "Finance", Icon: FinanceIcon },
  { href: "/account", label: "Account", Icon: AccountIcon },
] as const;

export default function AppShell({ children, householdName, account, tasks, preferences, menuId }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <div id="app-frame" style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "var(--bg)" }}>

      {/* ── Header ── */}
      <header className="app-header" style={{ padding: "0 24px", background: "var(--bg)", position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", height: 60 }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <span className="serif" style={{ fontSize: 19, fontWeight: 700, color: "var(--ink)" }}>{householdName}</span>
        </button>
        <div style={{ flex: 1 }} />
        {/* Desktop: chat button in header */}
        <button
          onClick={() => setChatOpen(true)}
          className="desktop-header-chat"
          style={{ display: "none", alignItems: "center", gap: 6, background: "var(--green-soft)", border: "none", borderRadius: 999, padding: "7px 14px 7px 10px", cursor: "pointer", marginRight: 12 }}
        >
          <ChatIcon />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>Ask AI</span>
        </button>
        <button onClick={() => router.push("/account")} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--warm)", border: "1px solid var(--line)", borderRadius: 999, padding: "4px 10px 4px 4px", cursor: "pointer" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--green)", color: "var(--on-green)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {account.user_name[0]}{account.partner_name[0]}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink2)" }}>{account.user_name} &amp; {account.partner_name}</span>
        </button>
      </header>

      {/* ── Sidebar (desktop only via CSS) ── */}
      <aside className="app-sidebar" style={{ display: "none", background: "var(--bg)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 12px", flex: 1 }}>
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, textDecoration: "none", background: active ? "var(--green-soft)" : "transparent", color: active ? "var(--green)" : "var(--ink2)", fontWeight: active ? 700 : 500, fontSize: 14, transition: "background .1s" }}>
                <Icon active={active} />
                {label}
              </Link>
            );
          })}
        </div>
        {/* Assistant button at bottom of sidebar */}
        <div style={{ padding: "12px 12px 8px", borderTop: "1px solid var(--line)", marginTop: "auto" }}>
          <button onClick={() => setChatOpen(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--green-soft)", background: "var(--green-soft)", cursor: "pointer", color: "var(--green)", fontWeight: 700, fontSize: 14 }}>
            <ChatIcon />
            Household assistant
          </button>
        </div>
      </aside>

      {/* ── Page content ── */}
      <main className="app-content" style={{ flex: 1, paddingBottom: 74 }}>
        {children}
      </main>

      {/* ── Mobile: chat FAB ── */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)} className="chat-fab" style={{ position: "fixed", bottom: 82, right: 16, width: 52, height: 52, borderRadius: "50%", background: "var(--green)", color: "var(--on-green)", border: "none", cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(31,61,46,0.3)" }} aria-label="Open assistant">
          <ChatIcon />
        </button>
      )}

      {/* ── Mobile bottom nav ── */}
      <nav className="bottom-nav" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, display: "flex", background: "var(--surface)", borderTop: "1px solid var(--line)", zIndex: 10, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ flex: 1, padding: "9px 2px 7px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none" }}>
              <Icon active={active} />
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? "var(--green)" : "var(--ink3)" }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Chat overlay ── */}
      {chatOpen && (
        <ChatOverlay onClose={() => setChatOpen(false)} account={account} tasks={tasks} preferences={preferences} menuId={menuId} onNavigate={(p) => { router.push(p); setChatOpen(false); }} />
      )}
    </div>
  );
}
