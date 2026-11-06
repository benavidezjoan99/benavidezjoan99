import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import { SEED_CATALOG } from "../catalog-seed";
import * as schema from "./schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "casacalc.sqlite");

let sqlite: Database.Database | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function ensureSchema(database: Database.Database) {
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS catalog_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      unit_price_usd REAL NOT NULL,
      notes TEXT,
      is_estimate INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'construir',
      municipality TEXT NOT NULL,
      approx_m2 REAL,
      estimate_date TEXT NOT NULL,
      labor_percent REAL NOT NULL DEFAULT 35,
      contingency_percent REAL NOT NULL DEFAULT 10,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      room_type TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      area_m2 REAL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS line_items (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      room_id TEXT REFERENCES rooms(id) ON DELETE CASCADE,
      catalog_item_id TEXT REFERENCES catalog_items(id) ON DELETE SET NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      unit_price REAL NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);
}

function seedCatalogIfEmpty(database: Database.Database) {
  const row = database.prepare("SELECT COUNT(*) AS c FROM catalog_items").get() as {
    c: number;
  };
  if (row.c > 0) return;

  const insert = database.prepare(`
    INSERT INTO catalog_items (id, name, category, unit, unit_price_usd, notes, is_estimate)
    VALUES (@id, @name, @category, @unit, @unitPriceUsd, @notes, 1)
  `);

  const tx = database.transaction((items: typeof SEED_CATALOG) => {
    for (const item of items) {
      insert.run(item);
    }
  });
  tx(SEED_CATALOG);
}

export function getDb() {
  if (dbInstance) return dbInstance;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  ensureSchema(sqlite);
  seedCatalogIfEmpty(sqlite);

  dbInstance = drizzle(sqlite, { schema });
  return dbInstance;
}

export function getSqlite() {
  getDb();
  if (!sqlite) throw new Error("SQLite no inicializado");
  return sqlite;
}

export { schema };
