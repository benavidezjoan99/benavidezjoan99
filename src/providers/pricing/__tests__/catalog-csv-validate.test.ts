import { describe, expect, it } from "vitest";
import {
  formatCatalogCsvIssues,
  validateCatalogCsv,
} from "../catalog-csv-validate";
import { catalogToCsv, parseCatalogCsv } from "../csv-import-provider";
import { ManualProvider } from "../manual-provider";
import { CsvImportProvider } from "../csv-import-provider";
import { resolvePrice } from "@/domain/engines/pricing-engine";

describe("validateCatalogCsv", () => {
  it("rejects empty CSV", () => {
    const r = validateCatalogCsv("");
    expect(r.ok).toBe(false);
    expect(r.errors[0].code).toBe("empty");
  });

  it("requires id and price columns", () => {
    const r = validateCatalogCsv("name,unit\nfoo,u\n");
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.code === "missing_column")).toBe(true);
  });

  it("rejects invalid categories", () => {
    const csv = `id,name,category,unit,unit_price_usd
x1,Thing,no_existe,u,1.5
`;
    const r = validateCatalogCsv(csv);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.code === "invalid_category")).toBe(true);
  });

  it("warns on unusual units but still ok", () => {
    const csv = `id,name,category,unit,unit_price_usd
x1,Thing,pintura,barril,1.5
`;
    const r = validateCatalogCsv(csv);
    expect(r.ok).toBe(true);
    expect(r.warnings.some((w) => w.code === "unusual_unit")).toBe(true);
  });

  it("rejects negative prices and duplicates", () => {
    const csv = `id,name,category,unit,unit_price_usd
a1,A,pintura,gal,-2
a1,A2,pintura,gal,3
`;
    const r = validateCatalogCsv(csv);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.code === "negative_price")).toBe(true);
    expect(r.errors.some((e) => e.code === "duplicate_id")).toBe(true);
  });

  it("accepts valid PR-oriented row and stamps source/date", () => {
    const csv = `id,name,category,unit,unit_price_usd,source,priced_at,is_estimate
bloque-8,"Bloque 8 pulg",bloque_mamposteria,u,2.95,live,2026-11-08,false
`;
    const r = validateCatalogCsv(csv);
    expect(r.ok).toBe(true);
    expect(r.rows[0].source).toBe("csv"); // never keep "live"
    expect(r.rows[0].pricedAt).toBe("2026-11-08");
    expect(r.rows[0].unitPriceUsd).toBe(2.95);
  });

  it("formatCatalogCsvIssues lists errors", () => {
    const r = validateCatalogCsv("name\nx\n");
    const text = formatCatalogCsvIssues(r);
    expect(text).toContain("ERROR");
  });
});

describe("CSV parse + providers → PricingEngine", () => {
  it("CsvImportProvider quotes feed resolvePrice as csv", async () => {
    const csv = `id,name,category,unit,unit_price_usd,priced_at,is_estimate
cable-12-romex,Romex 12/2,electrico,ft,0.99,2026-11-08,false
`;
    const rows = parseCatalogCsv(csv);
    const provider = new CsvImportProvider(rows);
    const quotes = await provider.fetchQuotes(["cable-12-romex"], {});
    expect(quotes[0].source).toBe("csv");

    const resolved = resolvePrice({
      catalogItemId: "cable-12-romex",
      catalog: [
        {
          id: "cable-12-romex",
          name: "Romex 12/2",
          category: "electrico",
          unit: "ft",
          unitPriceUsd: 0.85,
          isEstimate: true,
        },
      ],
      prices: [
        {
          catalogItemId: "cable-12-romex",
          unitPriceUsd: quotes[0].unitPriceUsd,
          source: "csv",
          pricedAt: quotes[0].pricedAt,
          isEstimate: false,
        },
      ],
    });
    expect(resolved?.source).toBe("csv");
    expect(resolved?.unitPriceUsd).toBe(0.99);
  });

  it("ManualProvider beats csv in resolvePrice", async () => {
    const manual = new ManualProvider({
      "bloque-8": { unitPriceUsd: 3.4, pricedAt: "2026-11-08", isEstimate: false },
    });
    const quotes = await manual.fetchQuotes(["bloque-8"], {});
    const resolved = resolvePrice({
      catalogItemId: "bloque-8",
      catalog: [
        {
          id: "bloque-8",
          name: "Bloque",
          category: "bloque_mamposteria",
          unit: "u",
          unitPriceUsd: 2.75,
        },
      ],
      prices: [
        {
          catalogItemId: "bloque-8",
          unitPriceUsd: 2.9,
          source: "csv",
          pricedAt: "2026-10-01",
          isEstimate: false,
        },
        {
          catalogItemId: "bloque-8",
          unitPriceUsd: quotes[0].unitPriceUsd,
          source: "manual",
          pricedAt: quotes[0].pricedAt,
          isEstimate: false,
        },
      ],
    });
    expect(resolved?.source).toBe("manual");
    expect(resolved?.unitPriceUsd).toBe(3.4);
  });

  it("catalogToCsv round-trip keeps source and date", () => {
    const csv = catalogToCsv([
      {
        id: "pintura-interior",
        name: "Pintura interior",
        category: "pintura",
        unit: "gal",
        unitPriceUsd: 38,
        notes: "DEMO",
        priceSource: "seed",
        pricedAt: "2026-11-08",
        isEstimate: true,
      },
    ]);
    const rows = parseCatalogCsv(csv);
    expect(rows[0].id).toBe("pintura-interior");
    expect(rows[0].unitPriceUsd).toBe(38);
    // Re-import path forces csv (honest import marker)
    expect(rows[0].source).toBe("csv");
    expect(rows[0].pricedAt).toBe("2026-11-08");
  });
});
