import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const catalogItems = sqliteTable("catalog_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  unitPriceUsd: real("unit_price_usd").notNull(),
  notes: text("notes"),
  isEstimate: integer("is_estimate", { mode: "boolean" }).notNull().default(true),
  /** seed | manual | csv | provider:* */
  priceSource: text("price_source").notNull().default("seed"),
  /** ISO date when price was set / imported */
  pricedAt: text("priced_at"),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  /** MVP: solo "construir". "remodelar" queda como extensión futura. */
  mode: text("mode").notNull().default("construir"),
  municipality: text("municipality").notNull(),
  approxM2: real("approx_m2"),
  estimateDate: text("estimate_date").notNull(),
  laborPercent: real("labor_percent").notNull().default(35),
  contingencyPercent: real("contingency_percent").notNull().default(10),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  roomType: text("room_type").notNull(),
  count: integer("count").notNull().default(1),
  areaM2: real("area_m2"),
  sortOrder: integer("sort_order").notNull().default(0),
  /** Croquis 2D: origen X en pies (esquina superior-izquierda). */
  planX: real("plan_x"),
  planY: real("plan_y"),
  /** Ancho del rectángulo en pies. */
  planWFt: real("plan_w_ft"),
  /** Fondo / profundidad del rectángulo en pies. */
  planHFt: real("plan_h_ft"),
  /** SKU de acabado de piso aplicado desde la planta. */
  floorCatalogItemId: text("floor_catalog_item_id"),
});

export const lineItems = sqliteTable("line_items", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  roomId: text("room_id").references(() => rooms.id, { onDelete: "cascade" }),
  catalogItemId: text("catalog_item_id").references(() => catalogItems.id, {
    onDelete: "set null",
  }),
  description: text("description").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  quantity: real("quantity").notNull().default(0),
  unitPrice: real("unit_price").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  priceSource: text("price_source"),
  pricedAt: text("priced_at"),
});

export type CatalogItem = typeof catalogItems.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type LineItem = typeof lineItems.$inferSelect;
