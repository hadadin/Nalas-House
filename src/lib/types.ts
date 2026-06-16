export type MealType = "breakfast" | "lunch" | "dinner";

export type Meal = {
  id: string;
  menu_id: string;
  day_index: number; // 0=Monday … 6=Sunday
  meal_type: MealType;
  name: string;
  cuisine: string | null;
  cook_time_minutes: number | null;
  steps: string[];
  ingredient: Ingredient[];
};

export type Ingredient = {
  id: string;
  meal_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  aisle: string;
};

export type Menu = {
  id: string;
  household_id: string;
  week_of: string;
  status: "draft" | "accepted";
  meal: Meal[];
};

export type ShoppingItem = {
  id: string;
  menu_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  aisle: string;
  is_checked: boolean;
};

export type Task = {
  id: string;
  household_id: string;
  title: string;
  assignee: string;
  task_type: "household" | "dog";
  done: boolean;
  scheduled_day: string | null;
  repeat_schedule: "none" | "daily" | "weekly" | "monthly";
  notes: string | null;
  created_at: string;
};

export type AccountSetting = {
  id: string;
  household_id: string;
  user_name: string;
  partner_name: string;
  language: "English" | "Hebrew";
  week_starts_on: "Sunday" | "Monday";
  default_assignee: string;
  menu_reminders: boolean;
  task_reminders: boolean;
};

export type Preference = {
  dietary_rules: string[];
  dislikes: string[];
  cuisines: string[];
  household_size: number;
  max_cook_time_minutes: number | null;
  notes: string | null;
};

export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};
