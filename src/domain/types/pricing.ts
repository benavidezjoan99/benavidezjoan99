/** Fuentes de precio honestas — nunca “live” sin fecha/fuente. */
export type PriceSource =
  | "seed"
  | "manual"
  | "csv"
  | "project_override"
  | `provider:${string}`;

export type CatalogPriceRecord = {
  catalogItemId: string;
  unitPriceUsd: number;
  source: PriceSource;
  /** ISO date or datetime when this price was recorded / effective. */
  pricedAt: string;
  isEstimate: boolean;
  storeLabel?: string | null;
  notes?: string | null;
};

export type ProjectPriceOverride = {
  catalogItemId: string;
  unitPriceUsd: number;
  note?: string | null;
};

export type PricedLine = {
  catalogItemId: string | null;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  extended: number;
  priceSource: PriceSource;
  pricedAt: string | null;
  isEstimate: boolean;
  spaceId?: string | null;
  sourceRuleId?: string | null;
};

export type QuantityLine = {
  catalogItemId: string;
  quantity: number;
  unit: string;
  spaceId?: string | null;
  sourceRuleId: string;
  description?: string;
  category?: string;
};
