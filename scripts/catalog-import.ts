#!/usr/bin/env npx tsx
/**
 * CLI: valida (y opcionalmente importa) un CSV de catálogo ObraCalc.
 *
 * Uso:
 *   npm run catalog:import -- path/to/catalog.csv
 *   npm run catalog:import -- path/to/catalog.csv --apply
 *   npm run catalog:import -- --validate-only path/to/catalog.csv
 *
 * Sin --apply solo valida (exit 1 si hay errores).
 * Con --apply escribe en SQLite local (source=csv + fecha).
 * No hace scraping ni llamadas HTTP a retailers.
 */
import fs from "fs";
import path from "path";
import {
  formatCatalogCsvIssues,
  validateCatalogCsv,
} from "../src/providers/pricing/catalog-csv-validate";

function printHelp() {
  console.log(`ObraCalc PR — catalog:import

Uso:
  npm run catalog:import -- <archivo.csv>
  npm run catalog:import -- <archivo.csv> --apply

Opciones:
  --apply           Importa a SQLite tras validar (marca source=csv + fecha)
  --validate-only   Solo valida (default si no hay --apply)
  -h, --help        Esta ayuda

Columnas requeridas: id (o sku), unit_price_usd (o price)
Categorías válidas: cemento_agregados, bloque_mamposteria, acero, madera,
  techos, electrico, plomeria, acabados, pintura, herramientas_misc
`);
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  if (args.includes("-h") || args.includes("--help") || args.length === 0) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const apply = args.includes("--apply");
  const fileArg = args.find((a) => !a.startsWith("--"));
  if (!fileArg) {
    console.error("Falta ruta al CSV.");
    printHelp();
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), fileArg);
  if (!fs.existsSync(filePath)) {
    console.error(`No existe: ${filePath}`);
    process.exit(1);
  }

  const text = fs.readFileSync(filePath, "utf8");
  const validation = validateCatalogCsv(text);

  console.log(`Archivo: ${filePath}`);
  console.log(`Filas parseadas: ${validation.rows.length}`);
  console.log(`Errores: ${validation.errors.length} · Avisos: ${validation.warnings.length}`);

  if (validation.errors.length || validation.warnings.length) {
    console.log(formatCatalogCsvIssues(validation));
  }

  if (!validation.ok) {
    console.error("Validación fallida — no se importa.");
    process.exit(1);
  }

  console.log("Validación OK.");

  if (!apply) {
    console.log("Modo solo-validar (pasa --apply para escribir en SQLite).");
    process.exit(0);
  }

  const { importCatalogCsv } = await import("../src/lib/projects");
  const result = importCatalogCsv(text);
  console.log(
    `Importado: ${result.updated} actualizados, ${result.inserted} nuevos, ${result.skipped} omitidos (source=csv).`,
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
