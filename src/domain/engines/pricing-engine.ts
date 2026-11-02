import { roundMoney } from "@/lib/money";
import type {
  CatalogPriceRecord,
  PricedLine,
  PriceSource,
  ProjectPriceOverride,
  QuantityLine,
} from "../types/pricing";

export type CatalogItemMeta = {
  id: string;
  name: string;
  category: string;
  unit: string;
  /** Fallback seed price if no CatalogPriceRecord. */
  unitPriceUsd?: number;
  isEstimate?: boolean;
};

export type PriceResolveInput = {
  catalogItemId: string;
  overrides?: ProjectPriceOverride[];
  prices?: CatalogPriceRecord[];
  catalog?: CatalogItemMeta[];
};

export type ResolvedPrice = {
  unitPriceUsd: number;
  source: PriceSource;
  pricedAt: string | null;
  isEstimate: boolean;
};

/**
 * Prioridad: override proyecto > manual > csv > provider:* > seed > catalog.unitPriceUsd
 */
export function resolvePrice(input: PriceResolveInput): ResolvedPrice | null {
  const { catalogItemId } = input;
  const override = (input.overrides ?? []).find((o) => o.catalogItemId === catalogItemId);
  if (override) {
    return {
      unitPriceUsd: override.unitPriceUsd,
      source: "project_override",
      pricedAt: new Date(0).toISOString().slice(0, 10), // date not tracked on override; UI may set
      isEstimate: false,
    };
  }

  const records = (input.prices ?? []).filter((p) => p.catalogItemId === catalogItemId);
  const pick = (source: PriceSource) =>
    records
      .filter((r) => r.source === source)
      .sort((a, b) => (a.pricedAt < b.pricedAt ? 1 : a.pricedAt > b.pricedAt ? -1 : 0))[0];

  const manual = pick("manual");
  if (manual) {
    return {
      unitPriceUsd: manual.unitPriceUsd,
      source: "manual",
      pricedAt: manual.pricedAt,
      isEstimate: manual.isEstimate,
    };
  }

  const csv = pick("csv");
  if (csv) {
    return {
      unitPriceUsd: csv.unitPriceUsd,
      source: "csv",
      pricedAt: csv.pricedAt,
      isEstimate: csv.isEstimate,
    };
  }

  // Any provider:* — take newest among provider sources
  const providers = records
    .filter((r) => r.source.startsWith("provider:"))
    .sort((a, b) => (a.pricedAt < b.pricedAt ? 1 : a.pricedAt > b.pricedAt ? -1 : 0));
  if (providers[0]) {
    return {
      unitPriceUsd: providers[0].unitPriceUsd,
      source: providers[0].source,
      pricedAt: providers[0].pricedAt,
      isEstimate: providers[0].isEstimate,
    };
  }

  const seed = pick("seed");
  if (seed) {
    return {
      unitPriceUsd: seed.unitPriceUsd,
      source: "seed",
      pricedAt: seed.pricedAt,
      isEstimate: seed.isEstimate,
    };
  }

  const item = (input.catalog ?? []).find((c) => c.id === catalogItemId);
  if (item && item.unitPriceUsd != null) {
    return {
      unitPriceUsd: item.unitPriceUsd,
      source: "seed",
      pricedAt: null,
      isEstimate: item.isEstimate ?? true,
    };
  }

  return null;
}

export type PriceLinesInput = {
  quantityLines: QuantityLine[];
  catalog: CatalogItemMeta[];
  prices?: CatalogPriceRecord[];
  overrides?: ProjectPriceOverride[];
  /** Manual lines already valued (no catalog resolve). */
  manualLines?: Array<{
    description: string;
    category: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    spaceId?: string | null;
    priceSource?: PriceSource;
    pricedAt?: string | null;
    isEstimate?: boolean;
  }>;
};

/**
 * PricingEngine — valoriza líneas de cantidad usando PriceResolver.
 */
export function priceQuantityLines(input: PriceLinesInput): PricedLine[] {
  const catalogById = new Map(input.catalog.map((c) => [c.id, c]));
  const priced: PricedLine[] = [];

  for (const q of input.quantityLines) {
    const item = catalogById.get(q.catalogItemId);
    const resolved = resolvePrice({
      catalogItemId: q.catalogItemId,
      overrides: input.overrides,
      prices: input.prices,
      catalog: input.catalog,
    });
    if (!resolved || !item) continue;
    const unitPrice = resolved.unitPriceUsd;
    const extended = roundMoney(q.quantity * unitPrice);
    priced.push({
      catalogItemId: q.catalogItemId,
      description: item.name,
      category: item.category,
      unit: q.unit || item.unit,
      quantity: q.quantity,
      unitPrice,
      extended,
      priceSource: resolved.source,
      pricedAt: resolved.pricedAt,
      isEstimate: resolved.isEstimate,
      spaceId: q.spaceId ?? null,
      sourceRuleId: q.sourceRuleId,
    });
  }

  for (const m of input.manualLines ?? []) {
    priced.push({
      catalogItemId: null,
      description: m.description,
      category: m.category,
      unit: m.unit,
      quantity: m.quantity,
      unitPrice: m.unitPrice,
      extended: roundMoney(m.quantity * m.unitPrice),
      priceSource: m.priceSource ?? "manual",
      pricedAt: m.pricedAt ?? null,
      isEstimate: m.isEstimate ?? false,
      spaceId: m.spaceId ?? null,
      sourceRuleId: null,
    });
  }

  return priced;
}

export const PricingEngine = {
  resolvePrice,
  priceQuantityLines,
};
