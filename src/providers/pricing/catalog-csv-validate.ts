import type { CatalogCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { ALLOWED_CATALOG_UNITS } from "@/lib/catalog-seed";
import {
  parseCatalogCsv,
  parseCsv,
  type CsvCatalogRow,
} from "./csv-import-provider";

export const CATALOG_CATEGORIES = Object.keys(CATEGORY_LABELS) as CatalogCategory[];

export type CatalogCsvIssue = {
  row: number; // 1-based data row (header = 0 conceptually; first data row = 1)
  field?: string;
  code: string;
  message: string;
  severity: "error" | "warning";
};

export type CatalogCsvValidationResult = {
  ok: boolean;
  rows: CsvCatalogRow[];
  errors: CatalogCsvIssue[];
  warnings: CatalogCsvIssue[];
};

const REQUIRED_HEADERS = {
  id: ["id", "sku", "catalog_item_id"],
  price: ["unit_price_usd", "unitpriceusd", "price", "precio", "unit_price"],
} as const;

const UNIT_SET = new Set<string>(ALLOWED_CATALOG_UNITS);
const CATEGORY_SET = new Set<string>(CATALOG_CATEGORIES);

function headerIndex(headers: string[], names: readonly string[]): number {
  for (const n of names) {
    const i = headers.indexOf(n);
    if (i >= 0) return i;
  }
  return -1;
}

/**
 * Valida estructura y valores de un CSV de catálogo.
 * - Columnas mínimas: id/sku + unit_price_usd/price
 * - Categorías deben estar en el enum ObraCalc
 * - Unidades no vacías; preferidas las de ALLOWED_CATALOG_UNITS
 * - Precios numéricos >= 0
 * No hace I/O ni scraping.
 */
export function validateCatalogCsv(text: string): CatalogCsvValidationResult {
  const errors: CatalogCsvIssue[] = [];
  const warnings: CatalogCsvIssue[] = [];

  if (!text.trim()) {
    return {
      ok: false,
      rows: [],
      errors: [
        {
          row: 0,
          code: "empty",
          message: "CSV vacío",
          severity: "error",
        },
      ],
      warnings: [],
    };
  }

  const raw = parseCsv(text);
  if (raw.length < 2) {
    return {
      ok: false,
      rows: [],
      errors: [
        {
          row: 0,
          code: "no_data",
          message: "CSV requiere encabezado y al menos una fila de datos",
          severity: "error",
        },
      ],
      warnings: [],
    };
  }

  const headers = raw[0].map((h) => h.trim().toLowerCase());
  const iId = headerIndex(headers, REQUIRED_HEADERS.id);
  const iPrice = headerIndex(headers, REQUIRED_HEADERS.price);
  const iCat = headerIndex(headers, ["category", "categoria", "categoría"]);
  const iUnit = headerIndex(headers, ["unit", "unidad"]);
  const iName = headerIndex(headers, ["name", "nombre", "description"]);

  if (iId < 0) {
    errors.push({
      row: 0,
      field: "id",
      code: "missing_column",
      message: "Falta columna id (o sku / catalog_item_id)",
      severity: "error",
    });
  }
  if (iPrice < 0) {
    errors.push({
      row: 0,
      field: "unit_price_usd",
      code: "missing_column",
      message: "Falta columna unit_price_usd (o price / precio)",
      severity: "error",
    });
  }
  if (iCat < 0) {
    warnings.push({
      row: 0,
      field: "category",
      code: "missing_optional_column",
      message:
        "Sin columna category: filas nuevas no se podrán insertar (solo actualizar por id)",
      severity: "warning",
    });
  }
  if (iUnit < 0) {
    warnings.push({
      row: 0,
      field: "unit",
      code: "missing_optional_column",
      message:
        "Sin columna unit: filas nuevas no se podrán insertar (solo actualizar por id)",
      severity: "warning",
    });
  }
  if (iName < 0) {
    warnings.push({
      row: 0,
      field: "name",
      code: "missing_optional_column",
      message:
        "Sin columna name: filas nuevas no se podrán insertar (solo actualizar por id)",
      severity: "warning",
    });
  }

  if (errors.length > 0) {
    return { ok: false, rows: [], errors, warnings };
  }

  let rows: CsvCatalogRow[] = [];
  try {
    rows = parseCatalogCsv(text);
  } catch (e) {
    return {
      ok: false,
      rows: [],
      errors: [
        {
          row: 0,
          code: "parse_error",
          message: e instanceof Error ? e.message : "Error al parsear CSV",
          severity: "error",
        },
      ],
      warnings,
    };
  }

  const seenIds = new Set<string>();
  // Map parsed rows back to approximate data-row numbers by scanning raw again
  let dataRowNum = 0;
  for (let r = 1; r < raw.length; r++) {
    const cols = raw[r];
    if (!cols.length || cols.every((c) => !c.trim())) continue;
    dataRowNum++;
    const id = (cols[iId!] ?? "").trim();
    const priceRaw = (cols[iPrice!] ?? "").trim().replace(/[$,]/g, "");
    const unitPriceUsd = Number(priceRaw);

    if (!id) {
      errors.push({
        row: dataRowNum,
        field: "id",
        code: "missing_id",
        message: "id/sku vacío",
        severity: "error",
      });
      continue;
    }

    if (!Number.isFinite(unitPriceUsd)) {
      errors.push({
        row: dataRowNum,
        field: "unit_price_usd",
        code: "invalid_price",
        message: `Precio no numérico: "${cols[iPrice!]?.trim() ?? ""}"`,
        severity: "error",
      });
      continue;
    }

    if (unitPriceUsd < 0) {
      errors.push({
        row: dataRowNum,
        field: "unit_price_usd",
        code: "negative_price",
        message: `Precio negativo: ${unitPriceUsd}`,
        severity: "error",
      });
    }

    if (seenIds.has(id)) {
      errors.push({
        row: dataRowNum,
        field: "id",
        code: "duplicate_id",
        message: `id duplicado en el CSV: ${id}`,
        severity: "error",
      });
    }
    seenIds.add(id);

    const category = iCat >= 0 ? (cols[iCat] ?? "").trim() : "";
    if (category) {
      if (!CATEGORY_SET.has(category)) {
        errors.push({
          row: dataRowNum,
          field: "category",
          code: "invalid_category",
          message: `Categoría no válida: "${category}". Usa: ${CATALOG_CATEGORIES.join(", ")}`,
          severity: "error",
        });
      }
    }

    const unit = iUnit >= 0 ? (cols[iUnit] ?? "").trim() : "";
    if (unit) {
      if (!UNIT_SET.has(unit)) {
        warnings.push({
          row: dataRowNum,
          field: "unit",
          code: "unusual_unit",
          message: `Unidad poco habitual: "${unit}". Preferidas: ${ALLOWED_CATALOG_UNITS.join(", ")}`,
          severity: "warning",
        });
      }
    }
  }

  // Ensure every successfully parsed row has source marked for honesty messaging
  for (const row of rows) {
    if (!row.source || row.source === "live" || row.source.toLowerCase() === "live") {
      row.source = "csv";
    }
    if (!row.pricedAt) {
      row.pricedAt = new Date().toISOString().slice(0, 10);
    }
  }

  return {
    ok: errors.length === 0,
    rows,
    errors,
    warnings,
  };
}

/** Formatea issues para CLI / logs. */
export function formatCatalogCsvIssues(result: CatalogCsvValidationResult): string {
  const lines: string[] = [];
  for (const e of result.errors) {
    lines.push(`ERROR fila ${e.row}${e.field ? ` [${e.field}]` : ""}: ${e.message}`);
  }
  for (const w of result.warnings) {
    lines.push(`AVISO fila ${w.row}${w.field ? ` [${w.field}]` : ""}: ${w.message}`);
  }
  return lines.join("\n");
}
