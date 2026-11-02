/**
 * Fuerza el seed del catálogo (útil si borraste data/ o quieres reinicializar).
 * Uso: npm run db:seed
 */
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "obracalc.sqlite");
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  for (const suffix of ["-wal", "-shm"]) {
    const p = dbPath + suffix;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  console.log("Base anterior eliminada.");
}

import { getDb, getDbPath } from "../src/lib/db";
import { getCatalog } from "../src/lib/projects";

getDb();
const items = getCatalog();
console.log(`Catálogo semilla listo: ${items.length} materiales en ${getDbPath()}`);
