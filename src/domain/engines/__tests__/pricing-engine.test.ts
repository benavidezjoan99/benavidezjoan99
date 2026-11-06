import { describe, expect, it } from "vitest";
import { priceQuantityLines, resolvePrice } from "../pricing-engine";
import { parseCatalogCsv, CsvImportProvider } from "@/providers/pricing/csv-import-provider";

describe("PricingEngine / PriceResolver", () => {
  const catalog = [
    {
      id: "bloque-8",
      name: "Bloque 8\"",
      category: "bloque_mamposteria",
      unit: "u",
      unitPriceUsd: 2.75,
      isEstimate: true,
    },
  ];

  it("priority: project override > manual > csv > seed", () => {
    const prices = [
      {
        catalogItemId: "bloque-8",
        unitPriceUsd: 2.75,
        source: "seed" as const,
        pricedAt: "2026-01-01",
        isEstimate: true,
      },
      {
        catalogItemId: "bloque-8",
        unitPriceUsd: 2.9,
        source: "csv" as const,
        pricedAt: "2026-06-01",
        isEstimate: false,
      },
      {
        catalogItemId: "bloque-8",
        unitPriceUsd: 3.1,
        source: "manual" as const,
        pricedAt: "2026-07-01",
        isEstimate: false,
      },
    ];

    expect(
      resolvePrice({
        catalogItemId: "bloque-8",
        prices,
        catalog,
      })?.unitPriceUsd,
    ).toBe(3.1);

    expect(
      resolvePrice({
        catalogItemId: "bloque-8",
        prices: prices.filter((p) => p.source !== "manual"),
        catalog,
      })?.source,
    ).toBe("csv");

    expect(
      resolvePrice({
        catalogItemId: "bloque-8",
        prices,
        catalog,
        overrides: [{ catalogItemId: "bloque-8", unitPriceUsd: 4.0 }],
      })?.source,
    ).toBe("project_override");
  });

  it("never invents live prices without source", () => {
    const priced = priceQuantityLines({
      quantityLines: [
        {
          catalogItemId: "bloque-8",
          quantity: 10,
          unit: "u",
          sourceRuleId: "t",
        },
      ],
      catalog,
      prices: [
        {
          catalogItemId: "bloque-8",
          unitPriceUsd: 2.75,
          source: "seed",
          pricedAt: "2026-11-02",
          isEstimate: true,
        },
      ],
    });
    expect(priced[0].priceSource).toBe("seed");
    expect(priced[0].pricedAt).toBe("2026-11-02");
    expect(priced[0].extended).toBe(27.5);
  });

  it("CSV round-trip parse updates price", () => {
    const csv = `id,name,category,unit,unit_price_usd,source,priced_at,is_estimate
bloque-8,Bloque 8 pulg,bloque_mamposteria,u,3.25,csv,2026-11-02,false
`;
    const rows = parseCatalogCsv(csv);
    expect(rows[0].unitPriceUsd).toBe(3.25);
    const provider = new CsvImportProvider(rows);
    return provider.fetchQuotes(["bloque-8"], {}).then((q) => {
      expect(q[0].unitPriceUsd).toBe(3.25);
      expect(q[0].source).toBe("csv");
    });
  });
});
