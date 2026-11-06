import { asc, eq } from "drizzle-orm";
import { computeTotals } from "./calculations";
import { getDb, schema } from "./db";
import { newId, nowIso, todayDate } from "./id";
import { suggestionsForRoom } from "./room-templates";
import type { ProjectMode, RoomType } from "./types";
import type { CatalogItem, LineItem, Project, Room } from "./db/schema";

const { projects, rooms, lineItems, catalogItems } = schema;

export type ProjectDetail = {
  project: Project;
  rooms: Room[];
  lineItems: LineItem[];
  totals: ReturnType<typeof computeTotals>;
};

export function listProjects(): Project[] {
  const db = getDb();
  return db.select().from(projects).orderBy(asc(projects.updatedAt)).all().reverse();
}

export function getCatalog(): CatalogItem[] {
  const db = getDb();
  return db.select().from(catalogItems).orderBy(asc(catalogItems.category), asc(catalogItems.name)).all();
}

export function getProjectDetail(id: string): ProjectDetail | null {
  const db = getDb();
  const project = db.select().from(projects).where(eq(projects.id, id)).get();
  if (!project) return null;

  const projectRooms = db
    .select()
    .from(rooms)
    .where(eq(rooms.projectId, id))
    .orderBy(asc(rooms.sortOrder))
    .all();

  const items = db
    .select()
    .from(lineItems)
    .where(eq(lineItems.projectId, id))
    .orderBy(asc(lineItems.sortOrder))
    .all();

  const totals = computeTotals({
    materialLines: items.map((i) => ({
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    laborPercent: project.laborPercent,
    contingencyPercent: project.contingencyPercent,
    approxM2: project.approxM2,
  });

  return { project, rooms: projectRooms, lineItems: items, totals };
}

export type CreateProjectInput = {
  name: string;
  municipality: string;
  approxM2?: number | null;
  estimateDate?: string;
  laborPercent?: number;
  contingencyPercent?: number;
  notes?: string | null;
  /** Solo "construir" en MVP; se acepta el campo por extensión. */
  mode?: ProjectMode;
};

export function createProject(input: CreateProjectInput): Project {
  const db = getDb();
  const id = newId();
  const ts = nowIso();
  // Extensión futura: aceptar "remodelar" cuando exista UI/flujo. MVP solo construye.
  if (input.mode === "remodelar") {
    throw new Error(
      "El modo remodelar aún no está disponible. Usa construir (obra nueva).",
    );
  }
  const mode: ProjectMode = "construir";

  const row: Project = {
    id,
    name: input.name.trim(),
    mode,
    municipality: input.municipality,
    approxM2: input.approxM2 ?? null,
    estimateDate: input.estimateDate || todayDate(),
    laborPercent: input.laborPercent ?? 35,
    contingencyPercent: input.contingencyPercent ?? 10,
    notes: input.notes ?? null,
    createdAt: ts,
    updatedAt: ts,
  };

  db.insert(projects).values(row).run();
  return row;
}

export type UpdateProjectInput = Partial<{
  name: string;
  municipality: string;
  approxM2: number | null;
  estimateDate: string;
  laborPercent: number;
  contingencyPercent: number;
  notes: string | null;
}>;

export function updateProject(id: string, input: UpdateProjectInput): Project | null {
  const db = getDb();
  const existing = db.select().from(projects).where(eq(projects.id, id)).get();
  if (!existing) return null;

  const updated: Project = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    municipality: input.municipality ?? existing.municipality,
    approxM2: input.approxM2 !== undefined ? input.approxM2 : existing.approxM2,
    estimateDate: input.estimateDate ?? existing.estimateDate,
    laborPercent: input.laborPercent ?? existing.laborPercent,
    contingencyPercent: input.contingencyPercent ?? existing.contingencyPercent,
    notes: input.notes !== undefined ? input.notes : existing.notes,
    updatedAt: nowIso(),
  };

  db.update(projects).set(updated).where(eq(projects.id, id)).run();
  return updated;
}

export function deleteProject(id: string): boolean {
  const db = getDb();
  const result = db.delete(projects).where(eq(projects.id, id)).run();
  return result.changes > 0;
}

export type AddRoomInput = {
  name: string;
  roomType: RoomType;
  count?: number;
  areaM2?: number | null;
  suggestMaterials?: boolean;
};

export function addRoom(projectId: string, input: AddRoomInput): Room | null {
  const db = getDb();
  const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project) return null;

  const existingRooms = db.select().from(rooms).where(eq(rooms.projectId, projectId)).all();
  const roomId = newId();
  const count = input.count && input.count > 0 ? input.count : 1;

  const room: Room = {
    id: roomId,
    projectId,
    name: input.name.trim(),
    roomType: input.roomType,
    count,
    areaM2: input.areaM2 ?? null,
    sortOrder: existingRooms.length,
  };

  db.insert(rooms).values(room).run();

  if (input.suggestMaterials !== false) {
    const catalog = getCatalog();
    const byId = new Map(catalog.map((c) => [c.id, c]));
    const suggestions = suggestionsForRoom(input.roomType);
    const existingLines = db
      .select()
      .from(lineItems)
      .where(eq(lineItems.projectId, projectId))
      .all();

    let order = existingLines.length;
    for (const suggestion of suggestions) {
      const item = byId.get(suggestion.catalogId);
      if (!item) continue;
      db.insert(lineItems)
        .values({
          id: newId(),
          projectId,
          roomId,
          catalogItemId: item.id,
          description: item.name,
          category: item.category,
          unit: item.unit,
          quantity: suggestion.quantityPerUnit * count,
          unitPrice: item.unitPriceUsd,
          sortOrder: order++,
        })
        .run();
    }
  }

  db.update(projects)
    .set({ updatedAt: nowIso() })
    .where(eq(projects.id, projectId))
    .run();

  return room;
}

export function updateRoom(
  projectId: string,
  roomId: string,
  input: Partial<{ name: string; count: number; areaM2: number | null; roomType: RoomType }>,
): Room | null {
  const db = getDb();
  const room = db.select().from(rooms).where(eq(rooms.id, roomId)).get();
  if (!room || room.projectId !== projectId) return null;

  const updated: Room = {
    ...room,
    name: input.name?.trim() ?? room.name,
    count: input.count ?? room.count,
    areaM2: input.areaM2 !== undefined ? input.areaM2 : room.areaM2,
    roomType: input.roomType ?? room.roomType,
  };
  db.update(rooms).set(updated).where(eq(rooms.id, roomId)).run();
  db.update(projects)
    .set({ updatedAt: nowIso() })
    .where(eq(projects.id, projectId))
    .run();
  return updated;
}

export function deleteRoom(projectId: string, roomId: string): boolean {
  const db = getDb();
  const room = db.select().from(rooms).where(eq(rooms.id, roomId)).get();
  if (!room || room.projectId !== projectId) return false;
  db.delete(rooms).where(eq(rooms.id, roomId)).run();
  db.update(projects)
    .set({ updatedAt: nowIso() })
    .where(eq(projects.id, projectId))
    .run();
  return true;
}

export type UpsertLineInput = {
  id?: string;
  roomId?: string | null;
  catalogItemId?: string | null;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
};

export function upsertLineItem(projectId: string, input: UpsertLineInput): LineItem | null {
  const db = getDb();
  const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project) return null;

  if (input.id) {
    const existing = db.select().from(lineItems).where(eq(lineItems.id, input.id)).get();
    if (!existing || existing.projectId !== projectId) return null;
    const updated: LineItem = {
      ...existing,
      roomId: input.roomId !== undefined ? input.roomId : existing.roomId,
      catalogItemId:
        input.catalogItemId !== undefined ? input.catalogItemId : existing.catalogItemId,
      description: input.description.trim(),
      category: input.category,
      unit: input.unit,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
    };
    db.update(lineItems).set(updated).where(eq(lineItems.id, input.id)).run();
    db.update(projects)
      .set({ updatedAt: nowIso() })
      .where(eq(projects.id, projectId))
      .run();
    return updated;
  }

  const existing = db.select().from(lineItems).where(eq(lineItems.projectId, projectId)).all();
  const row: LineItem = {
    id: newId(),
    projectId,
    roomId: input.roomId ?? null,
    catalogItemId: input.catalogItemId ?? null,
    description: input.description.trim(),
    category: input.category,
    unit: input.unit,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    sortOrder: existing.length,
  };
  db.insert(lineItems).values(row).run();
  db.update(projects)
    .set({ updatedAt: nowIso() })
    .where(eq(projects.id, projectId))
    .run();
  return row;
}

export function deleteLineItem(projectId: string, lineId: string): boolean {
  const db = getDb();
  const line = db.select().from(lineItems).where(eq(lineItems.id, lineId)).get();
  if (!line || line.projectId !== projectId) return false;
  db.delete(lineItems).where(eq(lineItems.id, lineId)).run();
  db.update(projects)
    .set({ updatedAt: nowIso() })
    .where(eq(projects.id, projectId))
    .run();
  return true;
}

export function buildCsv(detail: ProjectDetail): string {
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines: string[] = [];
  lines.push("CasaCalc PR — Presupuesto (estimación orientativa)");
  lines.push(`Proyecto,${escape(detail.project.name)}`);
  lines.push(`Modo,${escape(detail.project.mode)}`);
  lines.push(`Municipio,${escape(detail.project.municipality)}`);
  lines.push(`m² aprox.,${escape(detail.project.approxM2)}`);
  lines.push(`Fecha,${escape(detail.project.estimateDate)}`);
  lines.push(`Mano de obra %,${escape(detail.project.laborPercent)}`);
  lines.push(`Imprevistos %,${escape(detail.project.contingencyPercent)}`);
  lines.push("");
  lines.push("Ambiente,Descripción,Categoría,Unidad,Cantidad,Precio unitario USD,Subtotal USD");

  const roomName = (id: string | null) =>
    detail.rooms.find((r) => r.id === id)?.name ?? "General";

  for (const item of detail.lineItems) {
    const sub = item.quantity * item.unitPrice;
    lines.push(
      [
        escape(roomName(item.roomId)),
        escape(item.description),
        escape(item.category),
        escape(item.unit),
        escape(item.quantity),
        escape(item.unitPrice),
        escape(Math.round(sub * 100) / 100),
      ].join(","),
    );
  }

  lines.push("");
  lines.push(`Materiales,,,${escape(detail.totals.materials)}`);
  lines.push(`Mano de obra,,,${escape(detail.totals.labor)}`);
  lines.push(`Imprevistos,,,${escape(detail.totals.contingency)}`);
  lines.push(`Gran total,,,${escape(detail.totals.grandTotal)}`);
  if (detail.totals.costPerM2 != null) {
    lines.push(`USD/m²,,,${escape(detail.totals.costPerM2)}`);
  }
  lines.push("");
  lines.push("Nota,Precios de catálogo semilla son estimaciones en USD (PR/US). No es cotización de contratista.");

  return lines.join("\n");
}
