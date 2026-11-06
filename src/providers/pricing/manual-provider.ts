import type { PriceContext, PriceProvider, ProviderQuote } from "./types";

/**
 * ManualProvider — precios cargados a mano (mapa sku → precio).
 * No hace red; solo devuelve lo que se le configuró.
 */
export class ManualProvider implements PriceProvider {
  readonly id = "manual";

  constructor(
    private readonly prices: Record<
      string,
      { unitPriceUsd: number; pricedAt?: string; isEstimate?: boolean; storeLabel?: string }
    >,
  ) {}

  async fetchQuotes(skus: string[], ctx: PriceContext): Promise<ProviderQuote[]> {
    void ctx;
    const pricedAt = new Date().toISOString().slice(0, 10);
    const out: ProviderQuote[] = [];
    for (const sku of skus) {
      const row = this.prices[sku];
      if (!row) continue;
      out.push({
        sku,
        unitPriceUsd: row.unitPriceUsd,
        source: "manual",
        pricedAt: row.pricedAt ?? pricedAt,
        isEstimate: row.isEstimate ?? false,
        storeLabel: row.storeLabel,
      });
    }
    return out;
  }
}
