import Anthropic from "@anthropic-ai/sdk";

export type ProposedIngredient = {
  name: string;
  quantity: number | null;
  unit: string | null;
  aisle: string;
};

export type ProposedMeal = {
  day_index: number;
  name: string;
  cuisine: string | null;
  cook_time_minutes: number | null;
  steps: string[];
  ingredients: ProposedIngredient[];
};

export type HouseholdProfile = {
  dietary_rules: string[];
  dislikes: string[];
  cuisines: string[];
  household_size: number;
  max_cook_time_minutes: number | null;
  notes: string | null;
};

export type RecentMeal = { name: string; week_of: string };

const MENU_TOOL = {
  name: "propose_menu",
  description: "Propose or update a full 7-day household menu.",
  input_schema: {
    type: "object" as const,
    properties: {
      meals: {
        type: "array",
        description: "Exactly 7 meals, one per day_index 0-6 (0=Monday).",
        items: {
          type: "object",
          properties: {
            day_index: { type: "integer", minimum: 0, maximum: 6 },
            name: { type: "string" },
            cuisine: { type: "string" },
            cook_time_minutes: { type: "integer" },
            steps: { type: "array", items: { type: "string" } },
            ingredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  aisle: {
                    type: "string",
                    description:
                      "produce, dairy, pantry, protein, frozen, bakery, or other",
                  },
                },
                required: ["name", "aisle"],
              },
            },
          },
          required: ["day_index", "name", "steps", "ingredients"],
        },
      },
    },
    required: ["meals"],
  },
};

function buildSystemPrompt() {
  return `You are the menu-planning agent for a 2-person household app called Nala's House.
Your job: propose a full week's menu (7 meals, one per day) that this household will
actually cook, given their stored profile below. You always return your answer via the
propose_menu tool — never as plain text.

Hard constraints — never violate, even under pressure to be creative or fast:
- Allergies and dietary rules listed in the profile.

Soft preferences — steer toward, but don't treat as absolute:
- Dislikes, favored cuisines, cooking skill, equipment, goals, time budget.

When given a "current menu" plus an adjustment instruction, keep every day unchanged
except the ones the instruction actually targets, and return the full 7-day menu either
way (not a partial diff). When given no current menu, propose a fresh week, trying to
avoid repeating meals from "recent menus" if provided.`;
}

function buildUserPrompt({
  profile,
  recentMeals,
  currentMeals,
  adjustmentNote,
}: {
  profile: HouseholdProfile;
  recentMeals: RecentMeal[];
  currentMeals: ProposedMeal[] | null;
  adjustmentNote: string | null;
}) {
  const parts: string[] = [];
  parts.push(`Household profile:\n${JSON.stringify(profile, null, 2)}`);

  if (recentMeals.length > 0) {
    parts.push(
      `Recent meals already cooked (avoid repeating these):\n${recentMeals
        .map((m) => `- ${m.name} (week of ${m.week_of})`)
        .join("\n")}`
    );
  }

  if (currentMeals) {
    parts.push(
      `Current proposed menu (full week, to revise):\n${JSON.stringify(
        currentMeals,
        null,
        2
      )}`
    );
  }

  if (adjustmentNote) {
    parts.push(`Adjustment requested: ${adjustmentNote}`);
    parts.push(
      "Apply this adjustment to the relevant day(s) only, and return the full updated 7-day menu."
    );
  } else {
    parts.push("Propose a brand new full week's menu.");
  }

  return parts.join("\n\n");
}

export async function generateMenu(input: {
  profile: HouseholdProfile;
  recentMeals: RecentMeal[];
  currentMeals: ProposedMeal[] | null;
  adjustmentNote: string | null;
}): Promise<ProposedMeal[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (and Vercel env vars) to enable menu generation."
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: buildSystemPrompt(),
    tools: [MENU_TOOL],
    tool_choice: { type: "tool", name: "propose_menu" },
    messages: [
      {
        role: "user",
        content: buildUserPrompt(input),
      },
    ],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Menu agent did not return a structured menu.");
  }

  const result = toolUse.input as { meals: ProposedMeal[] };
  if (!result.meals || result.meals.length === 0) {
    throw new Error("Menu agent returned no meals.");
  }
  return result.meals;
}
