"use client";

import Link from "next/link";

type NavItem = { href: string; label: string; icon: React.ReactNode };

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "var(--green)" : "var(--ink3)";
  const w = active ? 2.2 : 1.6;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 10.5L11 3l8 7.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1v-8.5z" stroke={c} strokeWidth={w} fill={active ? c : "none"} fillOpacity={active ? 0.12 : 0} />
      <path d="M8 20v-5h6v5" stroke={c} strokeWidth={1.6} />
    </svg>
  );
}

function FoodIcon({ active }: { active: boolean }) {
  const c = active ? "var(--green)" : "var(--ink3)";
  const w = active ? 2.2 : 1.6;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M7 2v7c0 2 1.5 3.5 4 3.5s4-1.5 4-3.5V2" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <path d="M11 12.5V20M16 2v18" stroke={c} strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
}

function TasksIcon({ active }: { active: boolean }) {
  const c = active ? "var(--green)" : "var(--ink3)";
  const w = active ? 2.2 : 1.6;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="16" height="16" rx="2.5" stroke={c} strokeWidth={w} />
      <path d="M7.5 9l2.5 2.5 5-5" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 15h7" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

function FinanceIcon({ active }: { active: boolean }) {
  const c = active ? "var(--green)" : "var(--ink3)";
  const w = active ? 2.2 : 1.6;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 15l5-5 3.5 3.5 4.5-6 3 3" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 19h16" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  const c = active ? "var(--green)" : "var(--ink3)";
  const w = active ? 2.2 : 1.6;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="8" r="3.5" stroke={c} strokeWidth={w} />
      <path d="M5 19c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={c} strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/food", label: "Food", Icon: FoodIcon },
  { href: "/tasks", label: "Tasks", Icon: TasksIcon },
  { href: "/finance", label: "Finance", Icon: FinanceIcon },
  { href: "/account", label: "Account", Icon: AccountIcon },
] as const;

export default function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        display: "flex",
        background: "var(--surface)",
        borderTop: "1px solid var(--line)",
        zIndex: 10,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{ flex: 1, padding: "9px 2px 7px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none" }}
          >
            <Icon active={active} />
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? "var(--green)" : "var(--ink3)" }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
