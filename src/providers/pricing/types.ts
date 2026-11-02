import type { CatalogPriceRecord } from "@/domain/types/pricing";

export type PriceContext = {
  municipality?: string;
  zip?: string;
  asOf?: string;
};

export type ProviderQuote = {
  sku: string;
  unitPriceUsd: number;
  source: string;
  pricedAt: string;
  isEstimate: boolean;
  storeLabel?: string;
};

/**
 * Adaptadores de precio — fuera del hot path de engines.
 * Fase 1: Manual + Csv. Sin scraping ni “live” fingido.
 */
export interface PriceProvider {
  id: string;
  fetchQuotes(skus: string[], ctx: PriceContext): Promise<ProviderQuote[]>;
}

export function quotesToCatalogPrices(quotes: ProviderQuote[]): CatalogPriceRecord[] {
  return quotes.map((q) => ({
    catalogItemId: q.sku,
    unitPriceUsd: q.unitPriceUsd,
    source: q.source.startsWith("provider:")
      ? (q.source as CatalogPriceRecord["source"])
      : (`provider:${q.source}` as CatalogPriceRecord["source"]),
    pricedAt: q.pricedAt,
    isEstimate: q.isEstimate,
    storeLabel: q.storeLabel ?? null,
  }));
}
