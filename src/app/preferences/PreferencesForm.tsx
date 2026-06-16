"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Preference = {
  dietary_rules: string[];
  dislikes: string[];
  cuisines: string[];
  household_size: number;
  max_cook_time_minutes: number | null;
  notes: string | null;
};

function parseStructuredNotes(notes: string | null) {
  const lines = (notes ?? "").split("\n");
  const get = (label: string) => {
    const line = lines.find((l) => l.toLowerCase().startsWith(`${label.toLowerCase()}:`));
    return line ? line.slice(line.indexOf(":") + 1).trim() : "";
  };
  const knownLabels = ["goals", "cooking skill", "equipment"];
  const extra = lines
    .filter((l) => !knownLabels.some((label) => l.toLowerCase().startsWith(`${label}:`)))
    .join("\n")
    .trim();
  return {
    goals: get("goals"),
    cookingSkill: get("cooking skill"),
    equipment: get("equipment"),
    extraNotes: extra,
  };
}

function buildNotes(goals: string, cookingSkill: string, equipment: string, extraNotes: string) {
  const lines: string[] = [];
  if (goals.trim()) lines.push(`Goals: ${goals.trim()}`);
  if (cookingSkill.trim()) lines.push(`Cooking skill: ${cookingSkill.trim()}`);
  if (equipment.trim()) lines.push(`Equipment: ${equipment.trim()}`);
  if (extraNotes.trim()) lines.push(extraNotes.trim());
  return lines.join("\n");
}

export default function PreferencesForm({
  householdId,
  initial,
}: {
  householdId: string;
  initial: Preference | null;
}) {
  const router = useRouter();
  const parsed = parseStructuredNotes(initial?.notes ?? null);

  const [dietaryRules, setDietaryRules] = useState(
    initial?.dietary_rules?.join(", ") ?? ""
  );
  const [dislikes, setDislikes] = useState(initial?.dislikes?.join(", ") ?? "");
  const [cuisines, setCuisines] = useState(initial?.cuisines?.join(", ") ?? "");
  const [householdSize, setHouseholdSize] = useState(
    initial?.household_size ?? 2
  );
  const [maxCookTime, setMaxCookTime] = useState(
    initial?.max_cook_time_minutes?.toString() ?? ""
  );
  const [goals, setGoals] = useState(parsed.goals);
  const [cookingSkill, setCookingSkill] = useState(parsed.cookingSkill);
  const [equipment, setEquipment] = useState(parsed.equipment);
  const [extraNotes, setExtraNotes] = useState(parsed.extraNotes);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toArray(value: string) {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error } = await supabase.from("preference").upsert(
      {
        household_id: householdId,
        dietary_rules: toArray(dietaryRules),
        dislikes: toArray(dislikes),
        cuisines: toArray(cuisines),
        household_size: Number(householdSize) || 2,
        max_cook_time_minutes: maxCookTime ? Number(maxCookTime) : null,
        notes: buildNotes(goals, cookingSkill, equipment, extraNotes),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "household_id" }
    );

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
      <Field label="Dietary rules (hard constraint)" hint="comma-separated, e.g. vegetarian, no pork">
        <input
          value={dietaryRules}
          onChange={(e) => setDietaryRules(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </Field>

      <Field label="Allergies / things to never use" hint="comma-separated — also a hard constraint, stored under dietary rules for now">
        <input
          value={dislikes}
          onChange={(e) => setDislikes(e.target.value)}
          className="rounded border px-3 py-2"
          placeholder="e.g. peanuts, shellfish, cilantro"
        />
      </Field>

      <Field label="Cuisines you enjoy" hint="comma-separated">
        <input
          value={cuisines}
          onChange={(e) => setCuisines(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </Field>

      <div className="flex gap-3">
        <Field label="Household size" className="flex-1">
          <input
            type="number"
            min={1}
            value={householdSize}
            onChange={(e) => setHouseholdSize(Number(e.target.value))}
            className="rounded border px-3 py-2"
          />
        </Field>
        <Field label="Max cook time (min)" className="flex-1">
          <input
            type="number"
            min={0}
            value={maxCookTime}
            onChange={(e) => setMaxCookTime(e.target.value)}
            className="rounded border px-3 py-2"
            placeholder="e.g. 30"
          />
        </Field>
      </div>

      <Field label="Goals" hint="e.g. lose weight, eat more vegetables">
        <input
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </Field>

      <Field label="Cooking skill" hint="beginner, intermediate, or confident">
        <input
          value={cookingSkill}
          onChange={(e) => setCookingSkill(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </Field>

      <Field label="Equipment available" hint="comma-separated, e.g. oven, air fryer, slow cooker">
        <input
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </Field>

      <Field label="Anything else">
        <textarea
          value={extraNotes}
          onChange={(e) => setExtraNotes(e.target.value)}
          className="rounded border px-3 py-2"
          rows={3}
        />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save preferences"}
      </button>
      {saved && <p className="text-sm text-green-600">Saved.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
