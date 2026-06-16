"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("Nala's House");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } =
      mode === "create"
        ? await supabase.rpc("create_household", { household_name: name })
        : await supabase.rpc("join_household", { code });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/");
    router.refresh();
  }

  const tab = (t: "create" | "join", label: string) => (
    <button
      type="button"
      onClick={() => setMode(t)}
      style={{
        flex: 1,
        padding: "8px 0",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 700,
        background: mode === t ? "var(--surface)" : "transparent",
        color: mode === t ? "var(--ink)" : "var(--ink2)",
      }}
    >
      {label}
    </button>
  );

  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>
          Set up your household
        </div>
        <div style={{ marginTop: 6, fontSize: 14, color: "var(--ink2)" }}>
          Create a new one or join with an invite code.
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 360, background: "var(--surface)", borderRadius: 20, border: "1px solid var(--line)", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", background: "var(--warm)", borderRadius: 999, padding: 4 }}>
          {tab("create", "Create new")}
          {tab("join", "Join with code")}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "create" ? (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)", display: "block", marginBottom: 6 }}>Household name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nala's House"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--ink)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)", display: "block", marginBottom: 6 }}>Invite code</label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--ink)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "monospace", letterSpacing: "0.2em" }}
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ background: "var(--green)", color: "var(--on-green)", border: "none", borderRadius: 999, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Setting up…" : "Continue"}
          </button>
          {error && <div style={{ textAlign: "center", fontSize: 13, color: "var(--coral)" }}>{error}</div>}
        </form>
      </div>
    </main>
  );
}
