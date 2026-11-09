import type { PriceContext, PriceProvider, ProviderQuote } from "./types";

export type CsvCatalogRow = {
  id: string;
  name?: string;
  category?: string;
  unit?: string;
  unitPriceUsd: number;
  notes?: string;
  source?: string;
  pricedAt?: string;
  isEstimate?: boolean;
};

/**
 * Parsea CSV de catálogo (coma). Primera fila = headers.
 * Columnas reconocidas (case-insensitive):
 * id/sku, name, category, unit, unit_price_usd / unitPriceUsd / price,
 * notes, source, priced_at / pricedAt, is_estimate
 */
export function parseCatalogCsv(text: string): CsvCatalogRow[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (names: string[]) => {
    for (const n of names) {
      const i = headers.indexOf(n);
      if (i >= 0) return i;
    }
    return -1;
  };

  const iId = idx(["id", "sku", "catalog_item_id"]);
  const iName = idx(["name", "nombre", "description"]);
  const iCat = idx(["category", "categoria", "categoría"]);
  const iUnit = idx(["unit", "unidad"]);
  const iPrice = idx(["unit_price_usd", "unitpriceusd", "price", "precio", "unit_price"]);
  const iNotes = idx(["notes", "notas"]);
  const iSource = idx(["source", "fuente"]);
  const iPricedAt = idx(["priced_at", "pricedat", "fecha", "effective_at"]);
  const iEst = idx(["is_estimate", "isestimate", "estimate"]);

  if (iId < 0 || iPrice < 0) {
    throw new Error(
      "CSV de catálogo requiere columnas id (o sku) y unit_price_usd (o price).",
    );
  }

  const out: CsvCatalogRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    if (!cols.length || cols.every((c) => !c.trim())) continue;
    const id = (cols[iId] ?? "").trim();
    const priceRaw = (cols[iPrice] ?? "").trim().replace(/[$,]/g, "");
    const unitPriceUsd = Number(priceRaw);
    if (!id || !Number.isFinite(unitPriceUsd)) continue;
    const estRaw = iEst >= 0 ? (cols[iEst] ?? "").trim().toLowerCase() : "";
    // Import siempre es csv — nunca aceptar "live" ni otras fuentes fingidas.
    const rawSource = iSource >= 0 ? (cols[iSource] ?? "").trim().toLowerCase() : "";
    const source =
      !rawSource || rawSource === "live" || rawSource === "en vivo" ? "csv" : rawSource === "manual" ? "manual" : "csv";
    out.push({
      id,
      name: iName >= 0 ? cols[iName]?.trim() : undefined,
      category: iCat >= 0 ? cols[iCat]?.trim() : undefined,
      unit: iUnit >= 0 ? cols[iUnit]?.trim() : undefined,
      unitPriceUsd,
      notes: iNotes >= 0 ? cols[iNotes]?.trim() : undefined,
      source,
      pricedAt:
        iPricedAt >= 0 && cols[iPricedAt]?.trim()
          ? cols[iPricedAt].trim()
          : new Date().toISOString().slice(0, 10),
      isEstimate:
        estRaw === "" || estRaw === "1" || estRaw === "true" || estRaw === "yes",
    });
  }
  return out;
}

/** CSV mínimo RFC4180-ish (comillas, comas, newlines). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;
  const s = text.replace(/^\uFEFF/, "");
  while (i < s.length) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cell += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i++;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i++;
      continue;
    }
    cell += ch;
    i++;
  }
  row.push(cell);
  if (row.length > 1 || row[0] !== "" || rows.length === 0) rows.push(row);
  return rows;
}

export function catalogToCsv(
  items: Array<{
    id: string;
    name: string;
    category: string;
    unit: string;
    unitPriceUsd: number;
    notes?: string | null;
    priceSource?: string | null;
    pricedAt?: string | null;
    isEstimate?: boolean | null;
  }>,
): string {
  const escape = (v: string | number | boolean | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    "id,name,category,unit,unit_price_usd,notes,source,priced_at,is_estimate",
  ];
  for (const item of items) {
    lines.push(
      [
        escape(item.id),
        escape(item.name),
        escape(item.category),
        escape(item.unit),
        escape(item.unitPriceUsd),
        escape(item.notes),
        escape(item.priceSource ?? "seed"),
        escape(item.pricedAt ?? ""),
        escape(item.isEstimate === false ? "false" : "true"),
      ].join(","),
    );
  }
  return lines.join("\n") + "\n";
}

/**
 * CsvImportProvider — cotiza desde filas ya parseadas de un CSV importado.
 */
export class CsvImportProvider implements PriceProvider {
  readonly id = "csv";

  constructor(private readonly rows: CsvCatalogRow[]) {}

  static fromCsvText(text: string): CsvImportProvider {
    return new CsvImportProvider(parseCatalogCsv(text));
  }

  async fetchQuotes(skus: string[], ctx: PriceContext): Promise<ProviderQuote[]> {
    void ctx;
    const byId = new Map(this.rows.map((r) => [r.id, r]));
    const out: ProviderQuote[] = [];
    for (const sku of skus) {
      const row = byId.get(sku);
      if (!row) continue;
      out.push({
        sku,
        unitPriceUsd: row.unitPriceUsd,
        source: "csv",
        pricedAt: row.pricedAt ?? new Date().toISOString().slice(0, 10),
        isEstimate: row.isEstimate ?? true,
      });
    }
    return out;
  }

  getRows(): CsvCatalogRow[] {
    return this.rows;
  }
}
