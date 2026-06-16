"use client";

import { useState, useTransition } from "react";
import type { Menu, ShoppingItem, Preference, MealType } from "@/lib/types";
import { WEEK_DAYS } from "@/lib/types";

const MEAL_LABELS: Record<MealType, string> = { breakfast: "BREAKFAST", lunch: "LUNCH", dinner: "DINNER" };
const MEAL_COLORS: Record<MealType, string[]> = {
  breakfast: ["#F6D9A8", "#F2C98C", "#EFD3A0"],
  lunch: ["#CFE3B0", "#BFD79A", "#D2E2B4"],
  dinner: ["#EBC3A2", "#E3AE86", "#E8BE9C"],
};
const DIET_OPTIONS = ["Omnivore", "Pescatarian", "Vegetarian", "Vegan"];
const ALLERGY_OPTIONS = ["Nuts", "Gluten", "Dairy", "Shellfish", "Eggs", "Soy"];
const CUISINE_OPTIONS = ["Mediterranean", "Israeli", "Italian", "Asian", "Mexican", "American", "French", "Indian"];
const SPICE_OPTIONS = ["Mild", "Medium", "Spicy", "Very spicy"];
const AISLE_COLORS: Record<string, string> = {
  produce: "#4E9A5B", dairy: "#3E6E8E", protein: "#D5532A", pantry: "#9A8B6E",
  bakery: "#E0A91E", frozen: "#7A5EA6", other: "#A69C88",
};

type Props = {
  menu: Menu | null;
  shopping: ShoppingItem[];
  preferences: Preference | null;
  householdId: string;
};

const overline: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink3)", textTransform: "uppercase" };

export default function FoodClient({ menu, shopping: initialShopping, preferences: initialPrefs, householdId }: Props) {
  const [tab, setTab] = useState<"calendar" | "shopping" | "chef">("calendar");
  const [currentMenu, setCurrentMenu] = useState(menu);
  const [shopping, setShopping] = useState(initialShopping);
  const [prefs, setPrefs] = useState<Preference>(initialPrefs ?? { dietary_rules: [], dislikes: [], cuisines: [], household_size: 2, max_cook_time_minutes: null, notes: null });
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [openRecipe, setOpenRecipe] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function generateMenu() {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/menu/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId: currentMenu?.id ?? undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Generation failed");
      // Reload menu
      const menuRes = await fetch(`/api/menu/${json.menuId}`);
      if (menuRes.ok) {
        const refreshed = await menuRes.json();
        setCurrentMenu(refreshed);
      } else {
        // Fallback: just show success message
        setCurrentMenu({ id: json.menuId, household_id: householdId, week_of: "", status: "draft", meal: [] });
      }
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleItem(id: string, checked: boolean) {
    setShopping((prev) => prev.map((i) => i.id === id ? { ...i, is_checked: !checked } : i));
    await fetch(`/api/shopping/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_checked: !checked }) });
  }

  async function savePrefs() {
    await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ household_id: householdId, ...prefs }),
    });
  }

  const meals = currentMenu?.meal ?? [];
  const checkedCount = shopping.filter((i) => i.is_checked).length;
  const aisles = [...new Set(shopping.map((i) => i.aisle))].sort();

  function SubTab({ id, label }: { id: "calendar" | "shopping" | "chef"; label: string }) {
    return (
      <button
        onClick={() => setTab(id)}
        style={{ padding: "7px 18px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", background: tab === id ? "var(--surface)" : "transparent", color: tab === id ? "var(--ink)" : "var(--ink2)" }}
      >
        {label}
      </button>
    );
  }

  return (
    <div>
      {/* Header area with sub-tabs */}
      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tab === "calendar" && (
            <div>
              <div style={{ fontSize: 12, color: "var(--coral)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Meals</div>
              <div className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>The <em style={{ fontWeight: 500 }}>week ahead.</em></div>
            </div>
          )}
          {tab === "shopping" && (
            <div>
              <div style={{ fontSize: 12, color: "var(--coral)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>From your menu</div>
              <div className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>Shopping <em style={{ fontWeight: 500 }}>list.</em></div>
            </div>
          )}
          {tab === "chef" && (
            <div>
              <div style={{ fontSize: 12, color: "var(--coral)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Personalize</div>
              <div className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>My <em style={{ fontWeight: 500 }}>chef.</em></div>
            </div>
          )}
          <div style={{ display: "inline-flex", background: "var(--warm)", borderRadius: 999, padding: 4, alignSelf: "flex-start" }}>
            <SubTab id="calendar" label="Calendar" />
            <SubTab id="shopping" label="Shopping list" />
            <SubTab id="chef" label="Chef" />
          </div>
          {tab === "calendar" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }} />
              <button
                onClick={generateMenu}
                disabled={generating}
                style={{ background: "var(--green)", color: "var(--on-green)", border: "none", borderRadius: 999, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: generating ? "default" : "pointer", opacity: generating ? 0.6 : 1 }}
              >
                {generating ? "Cooking…" : currentMenu ? "Regenerate" : "Generate"}
              </button>
            </div>
          )}
        </div>
      </div>

      {generateError && (
        <div style={{ margin: "12px 20px 0", padding: "10px 14px", background: "var(--coral-soft)", borderRadius: 12, fontSize: 13, color: "var(--coral)" }}>
          {generateError}
        </div>
      )}

      {/* ── CALENDAR ── */}
      {tab === "calendar" && (
        <div style={{ padding: "16px 20px" }}>
          {generating && (
            <div style={{ padding: "12px 16px", background: "var(--brand)", borderRadius: 14, marginBottom: 16, fontSize: 13, fontWeight: 600, color: "var(--on-brand)" }}>
              Claude is generating a personalised 7-day menu…
            </div>
          )}
          {!currentMenu ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink3)" }}>
              <div className="serif" style={{ fontSize: 18, marginBottom: 8 }}>No menu yet</div>
              <div style={{ fontSize: 13 }}>Tap Generate to create this week&apos;s menu.</div>
            </div>
          ) : (
            WEEK_DAYS.map((day, di) => {
              const dayMeals = meals.filter((m) => m.day_index === di);
              if (dayMeals.length === 0 && !generating) return null;
              return (
                <div key={day} style={{ paddingBottom: 20, marginBottom: 20, borderBottom: di < 6 ? "1px solid var(--line)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                    <div className="serif" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{day}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {(["breakfast", "lunch", "dinner"] as MealType[]).map((mt, idx) => {
                      const meal = dayMeals.find((m) => m.meal_type === mt);
                      const recipeKey = `${di}-${mt}`;
                      const isOpen = openRecipe === recipeKey;
                      return (
                        <div key={mt}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 14, borderBottom: idx < 2 ? "1px solid var(--line)" : "none", marginBottom: idx < 2 ? 14 : 0 }}>
                            <div style={{ width: 54, height: 54, borderRadius: 12, flexShrink: 0, background: MEAL_COLORS[mt][di % 3] }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink3)", marginBottom: 2 }}>{MEAL_LABELS[mt]}</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--coral)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {meal?.name ?? "—"}
                              </div>
                              {meal?.cook_time_minutes && (
                                <div style={{ fontSize: 11, color: "var(--ink3)" }}>{meal.cook_time_minutes} min</div>
                              )}
                            </div>
                            {meal?.steps && meal.steps.length > 0 && (
                              <button
                                onClick={() => setOpenRecipe(isOpen ? null : recipeKey)}
                                style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", background: "var(--green-soft)", border: "none", borderRadius: 999, padding: "4px 12px", cursor: "pointer", flexShrink: 0 }}
                              >
                                {isOpen ? "Hide" : "Recipe"}
                              </button>
                            )}
                          </div>
                          {isOpen && meal && (
                            <div style={{ background: "var(--warm)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {meal.ingredient && meal.ingredient.length > 0 && (
                                  <div>
                                    <div style={{ ...overline, marginBottom: 6 }}>Ingredients</div>
                                    {meal.ingredient.map((ing, i) => (
                                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--coral)", flexShrink: 0 }} />
                                        <span style={{ fontSize: 13 }}>{ing.quantity ? `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ""} ` : ""}{ing.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div style={{ height: 1, background: "var(--line)" }} />
                                <div>
                                  <div style={{ ...overline, marginBottom: 6 }}>Instructions</div>
                                  {meal.steps.map((step, i) => (
                                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 6 }}>
                                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--green)", color: "var(--on-green)", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                                      <span style={{ fontSize: 13, lineHeight: 1.4 }}>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── SHOPPING ── */}
      {tab === "shopping" && (
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
          {shopping.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink3)" }}>
              <div className="serif" style={{ fontSize: 18, marginBottom: 8 }}>No shopping list yet</div>
              <div style={{ fontSize: 13 }}>Generate a menu first, then the shopping list will appear here.</div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ color: "var(--ink2)", fontSize: 14 }}>{shopping.length - checkedCount} items still needed</span>
                <div style={{ flex: 1 }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Progress</span>
                  <span style={{ fontSize: 12, color: "var(--ink2)" }}>{checkedCount} / {shopping.length}</span>
                </div>
                <div style={{ height: 8, background: "var(--warmer)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${shopping.length ? (checkedCount / shopping.length) * 100 : 0}%`, height: "100%", background: "var(--green)", borderRadius: 999, transition: "width 0.3s" }} />
                </div>
              </div>
              {aisles.map((aisle) => {
                const items = shopping.filter((i) => i.aisle === aisle);
                return (
                  <div key={aisle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: AISLE_COLORS[aisle] ?? "var(--ink3)" }} />
                      <span className="serif" style={{ fontSize: 17, fontWeight: 700 }}>{aisle.charAt(0).toUpperCase() + aisle.slice(1)}</span>
                      <div style={{ flex: 1 }} />
                      <span style={{ fontSize: 12, color: "var(--ink3)" }}>{items.filter((i) => i.is_checked).length}/{items.length}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleItem(item.id, item.is_checked)}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: item.is_checked ? "transparent" : "var(--surface)", borderRadius: 12, border: `1px solid ${item.is_checked ? "transparent" : "var(--line)"}`, cursor: "pointer" }}
                        >
                          <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, border: item.is_checked ? "none" : "1.5px solid var(--ink3)", background: item.is_checked ? "var(--green)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {item.is_checked && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="var(--on-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span style={{ color: item.is_checked ? "var(--ink3)" : "var(--ink)", textDecoration: item.is_checked ? "line-through" : "none", fontWeight: 500, fontSize: 14 }}>
                            {item.quantity ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""} ` : ""}{item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── CHEF ── */}
      {tab === "chef" && (
        <div style={{ padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "var(--brand)", borderRadius: 14, padding: "12px 16px", fontSize: 13, color: "var(--on-brand)", fontWeight: 600 }}>
            Changes here affect future menu generation.
          </div>
          <ChefSection label="Diet">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DIET_OPTIONS.map((d) => (
                <ChipBtn key={d} active={prefs.dietary_rules.includes(d)} onClick={() => setPrefs((p) => ({ ...p, dietary_rules: p.dietary_rules.includes(d) ? p.dietary_rules.filter((x) => x !== d) : [...p.dietary_rules, d] }))}>{d}</ChipBtn>
              ))}
            </div>
          </ChefSection>
          <div style={{ height: 1, background: "var(--line)" }} />
          <ChefSection label="Allergies">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ALLERGY_OPTIONS.map((a) => (
                <ChipBtn key={a} active={prefs.dietary_rules.includes(a)} onClick={() => setPrefs((p) => ({ ...p, dietary_rules: p.dietary_rules.includes(a) ? p.dietary_rules.filter((x) => x !== a) : [...p.dietary_rules, a] }))}>{a}</ChipBtn>
              ))}
            </div>
          </ChefSection>
          <div style={{ height: 1, background: "var(--line)" }} />
          <ChefSection label="Favourite cuisines">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CUISINE_OPTIONS.map((c) => (
                <ChipBtn key={c} active={prefs.cuisines.includes(c)} onClick={() => setPrefs((p) => ({ ...p, cuisines: p.cuisines.includes(c) ? p.cuisines.filter((x) => x !== c) : [...p.cuisines, c] }))}>{c}</ChipBtn>
              ))}
            </div>
          </ChefSection>
          <div style={{ height: 1, background: "var(--line)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <ChefSection label="Servings">
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
                <button onClick={() => setPrefs((p) => ({ ...p, household_size: Math.max(1, p.household_size - 1) }))} style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--line)", background: "var(--surface)", cursor: "pointer", fontSize: 18, color: "var(--ink)" }}>–</button>
                <span className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--coral)" }}>{prefs.household_size}</span>
                <button onClick={() => setPrefs((p) => ({ ...p, household_size: Math.min(10, p.household_size + 1) }))} style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--line)", background: "var(--surface)", cursor: "pointer", fontSize: 18, color: "var(--ink)" }}>+</button>
              </div>
            </ChefSection>
          </div>
          <div style={{ height: 1, background: "var(--line)" }} />
          <ChefSection label="Disliked foods">
            <input
              value={prefs.dislikes.join(", ")}
              onChange={(e) => setPrefs((p) => ({ ...p, dislikes: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))}
              placeholder="e.g. liver, coriander, olives…"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </ChefSection>
          <button
            onClick={savePrefs}
            style={{ background: "var(--green)", color: "var(--on-green)", border: "none", borderRadius: 999, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Save preferences
          </button>
        </div>
      )}
    </div>
  );
}

function ChefSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="serif" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: "var(--ink)" }}>{label}</div>
      {children}
    </div>
  );
}

function ChipBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{ border: active ? "1.5px solid var(--green)" : "1.5px solid var(--line)", background: active ? "var(--green)" : "var(--surface)", color: active ? "var(--on-green)" : "var(--ink2)", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "7px 14px" }}
    >
      {children}
    </button>
  );
}
