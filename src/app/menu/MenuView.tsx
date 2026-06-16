"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Ingredient = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  aisle: string;
};

type Meal = {
  id: string;
  day_index: number;
  name: string;
  cuisine: string | null;
  cook_time_minutes: number | null;
  steps: string[];
  ingredient: Ingredient[];
};

type Menu = {
  id: string;
  week_of: string;
  status: "draft" | "accepted";
  meal: Meal[];
};

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MenuView({ menu }: { menu: Menu | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [showDeclinePrompt, setShowDeclinePrompt] = useState(false);

  async function generate(menuId?: string, note?: string | null) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/menu/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId, adjustmentNote: note ?? null }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }
      setAdjustmentNote("");
      setShowDeclinePrompt(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    if (!menu) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("menu")
      .update({ status: "accepted" })
      .eq("id", menu.id);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function reopen() {
    if (!menu) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("menu")
      .update({ status: "draft" })
      .eq("id", menu.id);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  if (!menu) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-gray-600">No menu yet for this week.</p>
        <button
          onClick={() => generate()}
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate this week's menu"}
        </button>
        {error && <p className="max-w-md text-center text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const sortedMeals = [...menu.meal].sort((a, b) => a.day_index - b.day_index);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Week of {menu.week_of} —{" "}
          <span className="font-medium">{menu.status === "accepted" ? "Locked in" : "Draft"}</span>
        </p>
        {menu.status === "accepted" && (
          <Link href="/shopping-list" className="text-sm underline">
            View shopping list →
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {sortedMeals.map((meal) => (
          <div key={meal.id} className="rounded border p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold">
                {DAY_NAMES[meal.day_index]} — {meal.name}
              </h3>
              <span className="text-xs text-gray-500">
                {meal.cuisine ?? ""} {meal.cook_time_minutes ? `· ${meal.cook_time_minutes} min` : ""}
              </span>
            </div>
            {meal.steps.length > 0 && (
              <ol className="mt-2 list-decimal pl-5 text-sm text-gray-700">
                {meal.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
            {meal.ingredient.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                {meal.ingredient
                  .map((ing) => `${ing.quantity ?? ""} ${ing.unit ?? ""} ${ing.name}`.trim())
                  .join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {menu.status === "draft" ? (
        <div className="flex flex-col gap-3 rounded border p-4">
          <div className="flex gap-2">
            <button
              onClick={approve}
              disabled={loading}
              className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
            >
              Approve menu
            </button>
            <button
              onClick={() => setShowDeclinePrompt(true)}
              disabled={loading}
              className="rounded border px-3 py-2 disabled:opacity-50"
            >
              This isn&apos;t working
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Adjust something specific (e.g. &quot;swap Wednesday for something vegetarian&quot;)
            </label>
            <div className="flex gap-2">
              <input
                value={adjustmentNote}
                onChange={(e) => setAdjustmentNote(e.target.value)}
                className="flex-1 rounded border px-3 py-2"
                placeholder="What should change?"
              />
              <button
                onClick={() => generate(menu.id, adjustmentNote)}
                disabled={loading || !adjustmentNote.trim()}
                className="rounded border px-3 py-2 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>

          {showDeclinePrompt && (
            <div className="flex flex-col gap-2 border-t pt-3">
              <label className="text-sm font-medium">
                What&apos;s wrong with this menu — variety, difficulty, or ingredients?
              </label>
              <div className="flex gap-2">
                <input
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  className="flex-1 rounded border px-3 py-2"
                  placeholder="Tell me what to optimize for"
                />
                <button
                  onClick={() => generate(menu.id, `Whole week doesn't work: ${adjustmentNote}`)}
                  disabled={loading || !adjustmentNote.trim()}
                  className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
                >
                  Re-propose week
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={reopen}
          disabled={loading}
          className="self-start rounded border px-3 py-2 text-sm disabled:opacity-50"
        >
          Make changes to this week
        </button>
      )}
    </div>
  );
}
