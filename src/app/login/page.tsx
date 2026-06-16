"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
      }}
    >
      {/* Logo area */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div
          className="serif"
          style={{ fontSize: 32, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1 }}
        >
          Nala&apos;s{" "}
          <span style={{ fontStyle: "italic", fontWeight: 500 }}>House.</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: "var(--ink2)" }}>
          Your household, organised.
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--surface)",
          borderRadius: 20,
          border: "1px solid var(--line)",
          padding: "28px 24px",
        }}
      >
        {status === "sent" ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "var(--green-soft)",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 11l5 5 9-9" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>Check your email</div>
            <div style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.5 }}>
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </div>
            <button
              onClick={() => setStatus("idle")}
              style={{ marginTop: 8, fontSize: 13, color: "var(--coral)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink2)", display: "block", marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1.5px solid var(--line)",
                  background: "var(--bg)",
                  color: "var(--ink)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                background: "var(--green)",
                color: "var(--on-green)",
                border: "none",
                borderRadius: 999,
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 700,
                cursor: status === "sending" ? "default" : "pointer",
                opacity: status === "sending" ? 0.6 : 1,
              }}
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {status === "error" && (
              <div style={{ textAlign: "center", fontSize: 13, color: "var(--coral)" }}>
                Something went wrong. Please try again.
              </div>
            )}
            <div style={{ textAlign: "center", fontSize: 12, color: "var(--ink3)" }}>
              No password needed — we&apos;ll email you a secure link.
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
