import Anthropic from "@anthropic-ai/sdk";

export type ProposedIngredient = {
  name: string;
  quantity: number | null;
  unit: string | null;
  aisle: string;
};

export type ProposedMeal = {
  day_index: number; // 0=Monday … 6=Sunday
  meal_type: "breakfast" | "lunch" | "dinner";
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
  description: "Propose a full 7-day household menu with breakfast, lunch, and dinner for each day.",
  input_schema: {
    type: "object" as const,
    properties: {
      meals: {
        type: "array",
        description: "Exactly 21 meals: 3 per day (breakfast/lunch/dinner) × 7 days. day_index 0=Monday, 6=Sunday.",
        items: {
          type: "object",
          required: ["day_index", "meal_type", "name", "steps", "ingredients"],
          properties: {
            day_index: { type: "integer", minimum: 0, maximum: 6 },
            meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner"] },
            name: { type: "string" },
            cuisine: { type: "string" },
            cook_time_minutes: { type: "integer" },
            steps: { type: "array", items: { type: "string" }, description: "3-6 cooking steps" },
            ingredients: {
              type: "array",
              items: {
                type: "object",
                required: ["name", "aisle"],
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  aisle: {
                    type: "string",
                    enum: ["produce", "dairy", "protein", "pantry", "bakery", "frozen", "other"],
                  },
                },
              },
            },
          },
        },
      },
    },
    required: ["meals"],
  },
};

function buildSystemPrompt(
  profile: HouseholdProfile,
  recentMeals: RecentMeal[],
  currentMeals: ProposedMeal[] | null,
  adjustmentNote: string | null
): string {
  const lines: string[] = [
    "You are a professional home chef creating a personalised weekly meal plan.",
    "",
    "Household profile:",
    `- Dietary rules: ${profile.dietary_rules.length ? profile.dietary_rules.join(", ") : "none"}`,
    `- Dislikes: ${profile.dislikes.length ? profile.dislikes.join(", ") : "none"}`,
    `- Preferred cuisines: ${profile.cuisines.length ? profile.cuisines.join(", ") : "any"}`,
    `- Household size: ${profile.household_size} people`,
    profile.max_cook_time_minutes
      ? `- Max cook time: ${profile.max_cook_time_minutes} min`
      : "",
    profile.notes ? `- Notes: ${profile.notes}` : "",
    "",
    "Create 21 meals total (breakfast, lunch, dinner for each of 7 days).",
    "Breakfasts: quick (≤20 min). Lunches: light. Dinners: more substantial.",
    "Vary cuisines and ingredients. Include Israeli/Mediterranean favourites when no preference is set.",
    "Provide 3-6 ingredients per breakfast, 4-8 per lunch/dinner.",
    "Provide 2-4 steps for breakfast, 4-6 for lunch/dinner.",
  ];

  if (recentMeals.length > 0) {
    lines.push("", "Avoid repeating these recent meals:");
    recentMeals.slice(0, 14).forEach((m) => lines.push(`- ${m.name}`));
  }

  if (currentMeals && currentMeals.length > 0) {
    lines.push("", "Current menu (keep meals unless adjusting):");
    currentMeals.forEach((m) => lines.push(`- Day ${m.day_index} ${m.meal_type}: ${m.name}`));
  }

  if (adjustmentNote) {
    lines.push("", `User adjustment request: "${adjustmentNote}"`);
  }

  return lines.filter((l) => l !== undefined).join("\n");
}

export async function generateMenu({
  profile,
  recentMeals,
  currentMeals,
  adjustmentNote,
}: {
  profile: HouseholdProfile;
  recentMeals: RecentMeal[];
  currentMeals: ProposedMeal[] | null;
  adjustmentNote: string | null;
}): Promise<ProposedMeal[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const system = buildSystemPrompt(profile, recentMeals, currentMeals, adjustmentNote);

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 8192,
    system,
    tools: [MENU_TOOL],
    tool_choice: { type: "any" },
    messages: [
      {
        role: "user",
        content: adjustmentNote
          ? `Please adjust the menu: ${adjustmentNote}`
          : "Please generate this week's meal plan.",
      },
    ],
  });

  for (const block of response.content) {
    if (block.type === "tool_use" && block.name === "propose_menu") {
      const input = block.input as { meals: ProposedMeal[] };
      if (!Array.isArray(input.meals)) {
        throw new Error("Invalid menu structure from AI");
      }
      return input.meals;
    }
  }

  throw new Error("AI did not return a menu — try again.");
}
