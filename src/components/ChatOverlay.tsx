"use client";

import { useState, useRef, useEffect } from "react";
import type { AccountSetting, Task, Preference } from "@/lib/types";

type Message = { id: number; role: "user" | "assistant"; content: string };

type Props = {
  onClose: () => void;
  account: AccountSetting;
  tasks: Task[];
  preferences: Preference | null;
  menuId: string | null;
  onNavigate: (path: string) => void;
};

const QUICK_PROMPTS = [
  "Generate this week's menu",
  "Open shopping list",
  "Add a task for Monday",
  "What can you do?",
];

export default function ChatOverlay({ onClose, account, tasks, preferences, menuId, onNavigate }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: `Hi! I'm your household assistant. I can help with menus, tasks, shopping, and preferences. What would you like to do?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          context: { account, tasks: tasks.slice(0, 20), preferences, menuId },
        }),
      });

      if (!res.ok || !res.body) throw new Error("Chat request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      const assistantId = Date.now() + 1;
      setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE-style lines
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) {
                assistantText += parsed.delta;
                setMessages((m) =>
                  m.map((msg) => (msg.id === assistantId ? { ...msg, content: assistantText } : msg))
                );
              }
              // Handle navigation action
              if (parsed.action === "navigate" && parsed.path) {
                onNavigate(parsed.path);
                onClose();
              }
            } catch {
              // non-JSON chunk, skip
            }
          }
        }
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 2, role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-overlay" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", background: "var(--bg)", maxWidth: 430, left: "50%", transform: "translateX(-50%)", width: "100%" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>Household assistant</div>
          <div style={{ fontSize: 12, color: "var(--ink2)" }}>AI-powered · Nala&apos;s House</div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={onClose}
          style={{ background: "var(--warm)", border: "none", borderRadius: 999, padding: "6px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "var(--ink)" }}
        >
          Close
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%",
              padding: "11px 15px",
              whiteSpace: "pre-wrap",
              borderRadius: msg.role === "user" ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
              background: msg.role === "user" ? "var(--green)" : "var(--surface)",
              border: msg.role === "user" ? "none" : "1px solid var(--line)",
              color: msg.role === "user" ? "var(--on-green)" : "var(--ink)",
              fontSize: 14,
              lineHeight: 1.5,
            }}>
              {msg.content || (loading && msg.role === "assistant" ? "…" : "")}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div style={{ display: "flex" }}>
            <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 5px", background: "var(--surface)", border: "1px solid var(--line)", display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ink3)", opacity: 0.4 + i * 0.2 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ padding: "10px 16px 16px", borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              style={{ padding: "5px 12px", borderRadius: 999, border: "1.5px solid var(--line)", background: "var(--surface)", color: "var(--ink2)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, padding: 10, background: "var(--bg)", borderRadius: 16, border: "1.5px solid var(--line)" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask or command anything…"
            rows={2}
            style={{ flex: 1, border: "none", background: "transparent", color: "var(--ink)", fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", padding: "4px 6px" }}
          />
          <button
            disabled={!input.trim() || loading}
            onClick={() => send(input)}
            style={{ background: "var(--green)", color: "var(--on-green)", border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: (!input.trim() || loading) ? 0.5 : 1, alignSelf: "flex-end" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
