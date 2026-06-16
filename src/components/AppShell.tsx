"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNav from "./BottomNav";
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

export default function AppShell({ children, householdName, account, tasks, preferences, menuId }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);

  function navigate(path: string) {
    router.push(path);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 14px", background: "var(--bg)", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>
              {householdName}
            </div>
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => navigate("/account")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--warm)", border: "1px solid var(--line)", borderRadius: 999, padding: "4px 10px 4px 4px", cursor: "pointer" }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--green)", color: "var(--on-green)", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {account.user_name[0]}{account.partner_name[0]}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink2)" }}>
              {account.user_name} &amp; {account.partner_name}
            </span>
          </button>
        </div>
      </div>

      {/* Page content */}
      <div style={{ flex: 1, paddingBottom: 74 }}>
        {children}
      </div>

      {/* Chat FAB */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: "fixed",
            bottom: 82,
            right: 16,
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--green)",
            color: "var(--on-green)",
            border: "none",
            cursor: "pointer",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(31,61,46,0.3)",
          }}
          aria-label="Open assistant"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2C6.5 2 3 5.1 3 9c0 2 .9 3.8 2.4 5.1L5 19l3.8-1.1c.7.2 1.5.4 2.3.4 4.5 0 8-3.1 8-7s-3.5-7-8-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Bottom nav */}
      <BottomNav pathname={pathname} />

      {/* Chat overlay */}
      {chatOpen && (
        <ChatOverlay
          onClose={() => setChatOpen(false)}
          account={account}
          tasks={tasks}
          preferences={preferences}
          menuId={menuId}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
