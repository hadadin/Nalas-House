"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
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
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Set up your household</h1>

      <div className="flex gap-2">
        <button
          onClick={() => setMode("create")}
          className={`rounded px-3 py-1 ${mode === "create" ? "bg-black text-white" : "border"}`}
        >
          Create new
        </button>
        <button
          onClick={() => setMode("join")}
          className={`rounded px-3 py-1 ${mode === "join" ? "bg-black text-white" : "border"}`}
        >
          Join existing
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        {mode === "create" ? (
          <input
            required
            placeholder="Household name (e.g. Nala's House)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border px-3 py-2"
          />
        ) : (
          <input
            required
            placeholder="Invite code from your partner"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded border px-3 py-2"
          />
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
