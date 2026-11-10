import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import { SEED_CATALOG, SEED_CATALOG_DATE } from "../catalog-seed";
import * as schema from "./schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "obracalc.sqlite");
const LEGACY_DB_PATH = path.join(DATA_DIR, "casacalc.sqlite");

let sqlite: Database.Database | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function migrateLegacyDbIfNeeded() {
  if (fs.existsSync(DB_PATH)) return;
  if (!fs.existsSync(LEGACY_DB_PATH)) return;
  fs.copyFileSync(LEGACY_DB_PATH, DB_PATH);
  for (const suffix of ["-wal", "-shm"]) {
    const legacy = LEGACY_DB_PATH + suffix;
    if (fs.existsSync(legacy)) {
      fs.copyFileSync(legacy, DB_PATH + suffix);
    }
  }
}

function columnExists(database: Database.Database, table: string, column: string): boolean {
  const cols = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return cols.some((c) => c.name === column);
}

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
      is_estimate INTEGER NOT NULL DEFAULT 1,
      price_source TEXT NOT NULL DEFAULT 'seed',
      priced_at TEXT
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
      sort_order INTEGER NOT NULL DEFAULT 0,
      plan_x REAL,
      plan_y REAL,
      plan_w_ft REAL,
      plan_h_ft REAL,
      floor_catalog_item_id TEXT,
      wall_paint_catalog_item_id TEXT,
      wall_color_id TEXT,
      furniture_style TEXT DEFAULT 'moderno',
      furniture_visible INTEGER DEFAULT 1
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
      sort_order INTEGER NOT NULL DEFAULT 0,
      price_source TEXT,
      priced_at TEXT
    );
  `);

  // Additive migrations for DBs created by CasaCalc MVP
  if (!columnExists(database, "catalog_items", "price_source")) {
    database.exec(
      `ALTER TABLE catalog_items ADD COLUMN price_source TEXT NOT NULL DEFAULT 'seed'`,
    );
  }
  if (!columnExists(database, "catalog_items", "priced_at")) {
    database.exec(`ALTER TABLE catalog_items ADD COLUMN priced_at TEXT`);
  }
  if (!columnExists(database, "line_items", "price_source")) {
    database.exec(`ALTER TABLE line_items ADD COLUMN price_source TEXT`);
  }
  if (!columnExists(database, "line_items", "priced_at")) {
    database.exec(`ALTER TABLE line_items ADD COLUMN priced_at TEXT`);
  }
  // Planta 2D — geometría del croquis + piso aplicado
  if (!columnExists(database, "rooms", "plan_x")) {
    database.exec(`ALTER TABLE rooms ADD COLUMN plan_x REAL`);
  }
  if (!columnExists(database, "rooms", "plan_y")) {
    database.exec(`ALTER TABLE rooms ADD COLUMN plan_y REAL`);
  }
  if (!columnExists(database, "rooms", "plan_w_ft")) {
    database.exec(`ALTER TABLE rooms ADD COLUMN plan_w_ft REAL`);
  }
  if (!columnExists(database, "rooms", "plan_h_ft")) {
    database.exec(`ALTER TABLE rooms ADD COLUMN plan_h_ft REAL`);
  }
  if (!columnExists(database, "rooms", "floor_catalog_item_id")) {
    database.exec(`ALTER TABLE rooms ADD COLUMN floor_catalog_item_id TEXT`);
  }
  // Planta 2D — personalización (pintura, color, muebles)
  if (!columnExists(database, "rooms", "wall_paint_catalog_item_id")) {
    database.exec(`ALTER TABLE rooms ADD COLUMN wall_paint_catalog_item_id TEXT`);
  }
  if (!columnExists(database, "rooms", "wall_color_id")) {
    database.exec(`ALTER TABLE rooms ADD COLUMN wall_color_id TEXT`);
  }
  if (!columnExists(database, "rooms", "furniture_style")) {
    database.exec(
      `ALTER TABLE rooms ADD COLUMN furniture_style TEXT DEFAULT 'moderno'`,
    );
  }
  if (!columnExists(database, "rooms", "furniture_visible")) {
    database.exec(
      `ALTER TABLE rooms ADD COLUMN furniture_visible INTEGER DEFAULT 1`,
    );
  }
}

/**
 * Si el catálogo está vacío, inserta toda la semilla DEMO.
 * Si ya hay filas, inserta solo SKUs semilla faltantes (no pisa CSV/manual).
 */
function seedCatalogIfEmpty(database: Database.Database) {
  const row = database.prepare("SELECT COUNT(*) AS c FROM catalog_items").get() as {
    c: number;
  };

  const insert = database.prepare(`
    INSERT OR IGNORE INTO catalog_items (id, name, category, unit, unit_price_usd, notes, is_estimate, price_source, priced_at)
    VALUES (@id, @name, @category, @unit, @unitPriceUsd, @notes, 1, 'seed', @pricedAt)
  `);

  const tx = database.transaction((items: typeof SEED_CATALOG) => {
    for (const item of items) {
      insert.run({
        id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        unitPriceUsd: item.unitPriceUsd,
        notes: item.notes,
        pricedAt: item.pricedAt ?? SEED_CATALOG_DATE,
      });
    }
  });

  if (row.c === 0) {
    tx(SEED_CATALOG);
    return;
  }

  // Enrich existing DBs with new seed SKUs without overwriting user/CSV prices.
  tx(SEED_CATALOG);
}

export function getDb() {
  if (dbInstance) return dbInstance;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  migrateLegacyDbIfNeeded();
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

export function getDbPath() {
  return DB_PATH;
}

/** True when Supabase env is present (Fase 1b). Fase 1a always uses SQLite. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export { schema };
