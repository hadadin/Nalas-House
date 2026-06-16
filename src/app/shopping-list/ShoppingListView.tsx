"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Item = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  aisle: string;
  is_checked: boolean;
};

export default function ShoppingListView({
  menu,
  items,
}: {
  menu: { id: string; week_of: string } | null;
  items: Item[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!menu) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/menu/${menu.id}/shopping-list`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function toggle(item: Item) {
    const supabase = createClient();
    await supabase
      .from("shopping_item")
      .update({ is_checked: !item.is_checked })
      .eq("id", item.id);
    router.refresh();
  }

  if (!menu) {
    return <p className="text-gray-600">Approve a week&apos;s menu first to build a shopping list.</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-gray-600">No shopping list yet for week of {menu.week_of}.</p>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Building..." : "Build shopping list"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const byAisle = new Map<string, Item[]>();
  for (const item of items) {
    const list = byAisle.get(item.aisle) ?? [];
    list.push(item);
    byAisle.set(item.aisle, list);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Week of {menu.week_of}</p>
        <button onClick={generate} disabled={loading} className="text-sm underline disabled:opacity-50">
          {loading ? "Rebuilding..." : "Rebuild from menu"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {Array.from(byAisle.entries()).map(([aisle, aisleItems]) => (
        <div key={aisle}>
          <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">{aisle}</h2>
          <ul className="flex flex-col gap-1">
            {aisleItems.map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.is_checked}
                  onChange={() => toggle(item)}
                />
                <span className={item.is_checked ? "text-gray-400 line-through" : ""}>
                  {item.quantity ? `${item.quantity} ` : ""}
                  {item.unit ? `${item.unit} ` : ""}
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
