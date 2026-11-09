/**
 * Capa de precios ObraCalc PR — Fase A (manual + CSV).
 *
 * Flujo:
 *   CSV / Manual adapters (aquí)  →  registros CatalogPriceRecord
 *                                    (source + pricedAt siempre presentes)
 *                                 →  PricingEngine.resolvePrice / priceQuantityLines
 *
 * Prioridad del resolver (ver `src/domain/engines/pricing-engine.ts`):
 *   project_override > manual > csv > provider:* > seed
 *
 * Reglas de producto:
 *   - Nunca fingir precios “en vivo”
 *   - Import CSV marca source=csv + fecha
 *   - Semilla marca source=seed + fecha DEMO
 *   - Sin scraping ni HTTP a retailers
 */

export type { PriceContext, PriceProvider, ProviderQuote } from "./types";
export { quotesToCatalogPrices } from "./types";

export { ManualProvider } from "./manual-provider";

export {
  CsvImportProvider,
  parseCatalogCsv,
  parseCsv,
  catalogToCsv,
  type CsvCatalogRow,
} from "./csv-import-provider";

export {
  validateCatalogCsv,
  formatCatalogCsvIssues,
  CATALOG_CATEGORIES,
  type CatalogCsvIssue,
  type CatalogCsvValidationResult,
} from "./catalog-csv-validate";
