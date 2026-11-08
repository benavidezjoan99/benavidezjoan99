"use client";

import { useMemo, useState } from "react";
import { formatUsd } from "@/lib/money";
import { CATEGORY_LABELS, type CatalogCategory } from "@/lib/types";
import { t } from "@/lib/i18n";

export type CatalogBrowserItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPriceUsd: number;
  notes: string | null;
  isEstimate: boolean;
  priceSource: string;
  pricedAt: string | null;
};

const ALL = "all";

function sourceLabel(source: string): string {
  if (source === "seed") return t("catalog.source.seed");
  if (source === "csv") return t("catalog.source.csv");
  if (source === "manual") return t("catalog.source.manual");
  if (source.startsWith("provider:")) return source;
  return source;
}

export function CatalogBrowser({ items }: { items: CatalogBrowserItem[] }) {
  const [category, setCategory] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return (Object.keys(CATEGORY_LABELS) as CatalogCategory[]).filter((c) =>
      set.has(c),
    );
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== ALL && item.category !== category) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.notes ?? "").toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q)
      );
    });
  }, [items, category, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:max-w-md">
          <label htmlFor="catalog-search" className="text-sm font-medium text-[var(--bg-deep)]">
            {t("catalog.search")}
          </label>
          <input
            id="catalog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("catalog.searchPlaceholder")}
            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="flex flex-col gap-2 sm:w-64">
          <label htmlFor="catalog-category" className="text-sm font-medium text-[var(--bg-deep)]">
            {t("catalog.filterCategory")}
          </label>
          <select
            id="catalog-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value={ALL}>{t("catalog.allCategories")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-[var(--ink-muted)]">
        {t("catalog.showing")} {filtered.length} / {items.length}
      </p>

      <div className="overflow-x-auto border-y border-[var(--line)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-[var(--ink-muted)]">
              <th className="py-2 pr-3 font-medium">{t("catalog.col.name")}</th>
              <th className="py-2 pr-3 font-medium">{t("catalog.col.category")}</th>
              <th className="py-2 pr-3 font-medium">{t("catalog.col.unit")}</th>
              <th className="py-2 pr-3 font-medium">{t("catalog.col.price")}</th>
              <th className="py-2 pr-3 font-medium">{t("catalog.col.source")}</th>
              <th className="py-2 font-medium">{t("catalog.col.date")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-[var(--ink-muted)]">
                  {t("catalog.noResults")}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-b border-[var(--line)]/70 align-top">
                  <td className="py-3 pr-3">
                    <p className="font-medium text-[var(--bg-deep)]">{item.name}</p>
                    <p className="font-mono text-xs text-[var(--ink-muted)]">{item.id}</p>
                    {item.notes ? (
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">{item.notes}</p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-3 text-[var(--ink-muted)]">
                    {CATEGORY_LABELS[item.category as CatalogCategory] ?? item.category}
                  </td>
                  <td className="py-3 pr-3">{item.unit}</td>
                  <td className="num py-3 pr-3 font-medium">
                    {formatUsd(item.unitPriceUsd)}
                    {item.isEstimate ? (
                      <span className="ml-1 text-xs font-normal text-[var(--ink-muted)]">
                        ({t("catalog.estimate")})
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-3">
                    <span className="rounded border border-[var(--line)] bg-white px-1.5 py-0.5 text-xs">
                      {sourceLabel(item.priceSource)}
                    </span>
                  </td>
                  <td className="num py-3 text-[var(--ink-muted)]">
                    {item.pricedAt ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
