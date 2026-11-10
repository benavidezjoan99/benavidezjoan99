import { and, asc, eq } from "drizzle-orm";
import { computeProjectTotals } from "@/domain/engines/estimation-engine";
import { buildRoomQuantityLines } from "@/domain/engines/quantity-takeoff-engine";
import { resolvePrice } from "@/domain/engines/pricing-engine";
import {
  cabinetSkuForPack,
  flooringQuantityFromPlan,
  isAreaFloorFinish,
  isInteriorWallPaint,
  nextPlanPlacement,
  normalizeFurnitureStyle,
  normalizePlanRect,
  planRectFromAreaM2,
  rectAreaM2,
  wallColorIdFromCatalog,
  wallPaintQuantityFromPlan,
  type FurnitureStyle,
  type PlanRect,
} from "@/domain/floor-plan";
import {
  catalogToCsv,
  type CsvCatalogRow,
} from "@/providers/pricing/csv-import-provider";
import {
  formatCatalogCsvIssues,
  validateCatalogCsv,
  type CatalogCsvValidationResult,
} from "@/providers/pricing/catalog-csv-validate";
import { computeTotals } from "./calculations";
import { getDb, getSqlite, schema } from "./db";
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
  return db
    .select()
    .from(catalogItems)
    .orderBy(asc(catalogItems.category), asc(catalogItems.name))
    .all();
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

  // EstimationEngine (vía computeProjectTotals) — misma fórmula, sin doble conteo
  const totals = computeProjectTotals({
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
  /** Solo "construir" en Fase 1; se acepta el campo por extensión. */
  mode?: ProjectMode;
};

export function createProject(input: CreateProjectInput): Project {
  const db = getDb();
  const id = newId();
  const ts = nowIso();
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
  /** Si true, coloca el ambiente en el croquis 2D. */
  placeOnPlan?: boolean;
  planX?: number | null;
  planY?: number | null;
  planWFt?: number | null;
  planHFt?: number | null;
};

export function addRoom(projectId: string, input: AddRoomInput): Room | null {
  const db = getDb();
  const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project) return null;

  const existingRooms = db.select().from(rooms).where(eq(rooms.projectId, projectId)).all();
  const roomId = newId();
  const count = input.count && input.count > 0 ? input.count : 1;

  let plan: PlanRect | null = null;
  if (
    input.planWFt != null &&
    input.planHFt != null &&
    input.planX != null &&
    input.planY != null
  ) {
    plan = normalizePlanRect({
      planX: input.planX,
      planY: input.planY,
      planWFt: input.planWFt,
      planHFt: input.planHFt,
    });
  } else if (input.placeOnPlan) {
    const existingPlans: PlanRect[] = existingRooms
      .filter((r) => r.planWFt != null && r.planHFt != null)
      .map((r) =>
        normalizePlanRect({
          planX: r.planX ?? 0,
          planY: r.planY ?? 0,
          planWFt: r.planWFt!,
          planHFt: r.planHFt!,
        }),
      );
    const sized =
      input.areaM2 != null && input.areaM2 > 0
        ? planRectFromAreaM2(input.areaM2)
        : { planWFt: 12, planHFt: 10 };
    plan = nextPlanPlacement(existingPlans, sized.planWFt, sized.planHFt);
  }

  const areaFromPlan = plan ? rectAreaM2(plan.planWFt, plan.planHFt) : null;

  const room: Room = {
    id: roomId,
    projectId,
    name: input.name.trim(),
    roomType: input.roomType,
    count,
    areaM2: areaFromPlan ?? input.areaM2 ?? null,
    sortOrder: existingRooms.length,
    planX: plan?.planX ?? null,
    planY: plan?.planY ?? null,
    planWFt: plan?.planWFt ?? null,
    planHFt: plan?.planHFt ?? null,
    floorCatalogItemId: null,
    wallPaintCatalogItemId: null,
    wallColorId: null,
    furnitureStyle: "moderno",
    furnitureVisible: true,
  };

  db.insert(rooms).values(room).run();

  if (input.suggestMaterials !== false) {
    const catalog = getCatalog();
    const byId = new Map(catalog.map((c) => [c.id, c]));
    const catalogUnits = Object.fromEntries(
      catalog.map((c) => [c.id, { unit: c.unit }]),
    );
    const suggestions = suggestionsForRoom(input.roomType);
    // Dimensional QuantityTakeoffEngine when areaM2 is set; else MVP templates.
    const qtyLines = buildRoomQuantityLines({
      spaceType: input.roomType,
      spaceId: roomId,
      count,
      areaM2: input.areaM2 ?? null,
      suggestions,
      catalogUnits,
    });
    const existingLines = db
      .select()
      .from(lineItems)
      .where(eq(lineItems.projectId, projectId))
      .all();

    let order = existingLines.length;
    const pricedAt = todayDate();
    for (const q of qtyLines) {
      const item = byId.get(q.catalogItemId);
      if (!item) continue;
      const resolved = resolvePrice({
        catalogItemId: item.id,
        catalog: catalog.map((c) => ({
          id: c.id,
          name: c.name,
          category: c.category,
          unit: c.unit,
          unitPriceUsd: c.unitPriceUsd,
          isEstimate: c.isEstimate,
        })),
        prices: catalog.map((c) => ({
          catalogItemId: c.id,
          unitPriceUsd: c.unitPriceUsd,
          source: (c.priceSource as "seed" | "manual" | "csv") || "seed",
          pricedAt: c.pricedAt || pricedAt,
          isEstimate: c.isEstimate,
        })),
      });
      db.insert(lineItems)
        .values({
          id: newId(),
          projectId,
          roomId,
          catalogItemId: item.id,
          description: item.name,
          category: item.category,
          unit: item.unit,
          quantity: q.quantity,
          unitPrice: resolved?.unitPriceUsd ?? item.unitPriceUsd,
          sortOrder: order++,
          priceSource: resolved?.source ?? item.priceSource ?? "seed",
          pricedAt: resolved?.pricedAt ?? item.pricedAt ?? pricedAt,
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

export type UpdateRoomInput = Partial<{
  name: string;
  count: number;
  areaM2: number | null;
  roomType: RoomType;
  planX: number | null;
  planY: number | null;
  planWFt: number | null;
  planHFt: number | null;
  wallColorId: string | null;
  furnitureStyle: FurnitureStyle;
  furnitureVisible: boolean;
}>;

export function updateRoom(
  projectId: string,
  roomId: string,
  input: UpdateRoomInput,
): Room | null {
  const db = getDb();
  const room = db.select().from(rooms).where(eq(rooms.id, roomId)).get();
  if (!room || room.projectId !== projectId) return null;

  const hasPlanPatch =
    input.planX !== undefined ||
    input.planY !== undefined ||
    input.planWFt !== undefined ||
    input.planHFt !== undefined;

  let planX = input.planX !== undefined ? input.planX : room.planX;
  let planY = input.planY !== undefined ? input.planY : room.planY;
  let planWFt = input.planWFt !== undefined ? input.planWFt : room.planWFt;
  let planHFt = input.planHFt !== undefined ? input.planHFt : room.planHFt;
  let areaM2 = input.areaM2 !== undefined ? input.areaM2 : room.areaM2;

  if (
    hasPlanPatch &&
    planX != null &&
    planY != null &&
    planWFt != null &&
    planHFt != null
  ) {
    const normalized = normalizePlanRect({ planX, planY, planWFt, planHFt });
    planX = normalized.planX;
    planY = normalized.planY;
    planWFt = normalized.planWFt;
    planHFt = normalized.planHFt;
    // Geometría de planta manda sobre area_m2 cuando se edita el croquis.
    if (
      input.planWFt !== undefined ||
      input.planHFt !== undefined ||
      input.areaM2 === undefined
    ) {
      areaM2 = rectAreaM2(planWFt, planHFt);
    }
  }

  const updated: Room = {
    ...room,
    name: input.name?.trim() ?? room.name,
    count: input.count ?? room.count,
    areaM2,
    roomType: input.roomType ?? room.roomType,
    planX,
    planY,
    planWFt,
    planHFt,
    wallColorId:
      input.wallColorId !== undefined ? input.wallColorId : room.wallColorId,
    furnitureStyle:
      input.furnitureStyle !== undefined
        ? normalizeFurnitureStyle(input.furnitureStyle)
        : (room.furnitureStyle ?? "moderno"),
    furnitureVisible:
      input.furnitureVisible !== undefined
        ? input.furnitureVisible
        : (room.furnitureVisible ?? true),
  };
  db.update(rooms).set(updated).where(eq(rooms.id, roomId)).run();

  // Si hay piso aplicado y cambió el tamaño, recalcular cantidad.
  if (
    updated.floorCatalogItemId &&
    updated.planWFt != null &&
    updated.planHFt != null &&
    (input.planWFt !== undefined || input.planHFt !== undefined)
  ) {
    syncFloorLineQuantity(projectId, updated);
  }

  if (
    updated.wallPaintCatalogItemId &&
    updated.planWFt != null &&
    updated.planHFt != null &&
    (input.planWFt !== undefined || input.planHFt !== undefined)
  ) {
    syncPaintLineQuantity(projectId, updated);
  }

  db.update(projects)
    .set({ updatedAt: nowIso() })
    .where(eq(projects.id, projectId))
    .run();
  return updated;
}

function catalogPriceRows(catalog: CatalogItem[]) {
  const pricedAt = todayDate();
  return {
    catalogMeta: catalog.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      unit: c.unit,
      unitPriceUsd: c.unitPriceUsd,
      isEstimate: c.isEstimate,
    })),
    prices: catalog.map((c) => ({
      catalogItemId: c.id,
      unitPriceUsd: c.unitPriceUsd,
      source: (c.priceSource as "seed" | "manual" | "csv") || "seed",
      pricedAt: c.pricedAt || pricedAt,
      isEstimate: c.isEstimate,
    })),
  };
}

function syncFloorLineQuantity(projectId: string, room: Room) {
  if (
    !room.floorCatalogItemId ||
    room.planWFt == null ||
    room.planHFt == null
  ) {
    return;
  }
  const db = getDb();
  const catalog = getCatalog();
  const item = catalog.find((c) => c.id === room.floorCatalogItemId);
  if (!item || !isAreaFloorFinish(item)) return;

  const qty = flooringQuantityFromPlan({
    planWFt: room.planWFt,
    planHFt: room.planHFt,
    unit: item.unit,
  });

  const line = db
    .select()
    .from(lineItems)
    .where(
      and(
        eq(lineItems.projectId, projectId),
        eq(lineItems.roomId, room.id),
        eq(lineItems.catalogItemId, item.id),
      ),
    )
    .get();

  if (line) {
    db.update(lineItems)
      .set({ quantity: qty.quantity })
      .where(eq(lineItems.id, line.id))
      .run();
  }
}

/**
 * Aplica o cambia el acabado de piso de un ambiente desde la planta 2D.
 * Crea/actualiza la línea de material con qty = área × desperdicio y precio del catálogo.
 */
export function applyRoomFloorFinish(
  projectId: string,
  roomId: string,
  catalogItemId: string,
): { room: Room; line: LineItem } | null {
  const db = getDb();
  const room = db.select().from(rooms).where(eq(rooms.id, roomId)).get();
  if (!room || room.projectId !== projectId) return null;

  if (room.planWFt == null || room.planHFt == null) {
    throw new Error(
      "El ambiente no tiene geometría en la planta. Redimensiona el rectángulo primero.",
    );
  }

  const catalog = getCatalog();
  const item = catalog.find((c) => c.id === catalogItemId);
  if (!item) {
    throw new Error("Material de catálogo no encontrado.");
  }
  if (!isAreaFloorFinish(item)) {
    throw new Error(
      "Este material no se cotiza por área de piso (usa acabados en ft² / m²).",
    );
  }

  const qty = flooringQuantityFromPlan({
    planWFt: room.planWFt,
    planHFt: room.planHFt,
    unit: item.unit,
  });
  const { catalogMeta, prices } = catalogPriceRows(catalog);
  const resolved = resolvePrice({
    catalogItemId: item.id,
    catalog: catalogMeta,
    prices,
  });
  const pricedAt = resolved?.pricedAt ?? item.pricedAt ?? todayDate();
  const unitPrice = resolved?.unitPriceUsd ?? item.unitPriceUsd;
  const priceSource = resolved?.source ?? item.priceSource ?? "seed";

  const previousSku = room.floorCatalogItemId;
  let line: LineItem | undefined;

  if (previousSku && previousSku === item.id) {
    line = db
      .select()
      .from(lineItems)
      .where(
        and(
          eq(lineItems.projectId, projectId),
          eq(lineItems.roomId, roomId),
          eq(lineItems.catalogItemId, item.id),
        ),
      )
      .get();
  } else if (previousSku) {
    // Reemplazar línea del piso anterior si existe.
    const oldLine = db
      .select()
      .from(lineItems)
      .where(
        and(
          eq(lineItems.projectId, projectId),
          eq(lineItems.roomId, roomId),
          eq(lineItems.catalogItemId, previousSku),
        ),
      )
      .get();
    if (oldLine) {
      const updatedLine: LineItem = {
        ...oldLine,
        catalogItemId: item.id,
        description: item.name,
        category: item.category,
        unit: item.unit,
        quantity: qty.quantity,
        unitPrice,
        priceSource,
        pricedAt,
      };
      db.update(lineItems).set(updatedLine).where(eq(lineItems.id, oldLine.id)).run();
      line = updatedLine;
    }
  }

  if (!line) {
    line = db
      .select()
      .from(lineItems)
      .where(
        and(
          eq(lineItems.projectId, projectId),
          eq(lineItems.roomId, roomId),
          eq(lineItems.catalogItemId, item.id),
        ),
      )
      .get();
  }

  if (line && line.catalogItemId === item.id) {
    const updatedLine: LineItem = {
      ...line,
      description: item.name,
      category: item.category,
      unit: item.unit,
      quantity: qty.quantity,
      unitPrice,
      priceSource,
      pricedAt,
    };
    db.update(lineItems).set(updatedLine).where(eq(lineItems.id, line.id)).run();
    line = updatedLine;
  } else {
    const existing = db
      .select()
      .from(lineItems)
      .where(eq(lineItems.projectId, projectId))
      .all();
    line = {
      id: newId(),
      projectId,
      roomId,
      catalogItemId: item.id,
      description: item.name,
      category: item.category,
      unit: item.unit,
      quantity: qty.quantity,
      unitPrice,
      sortOrder: existing.length,
      priceSource,
      pricedAt,
    };
    db.insert(lineItems).values(line).run();
  }

  const updatedRoom: Room = {
    ...room,
    floorCatalogItemId: item.id,
    areaM2: qty.areaM2,
  };
  db.update(rooms).set(updatedRoom).where(eq(rooms.id, roomId)).run();
  db.update(projects)
    .set({ updatedAt: nowIso() })
    .where(eq(projects.id, projectId))
    .run();

  return { room: updatedRoom, line };
}

function syncPaintLineQuantity(projectId: string, room: Room) {
  if (
    !room.wallPaintCatalogItemId ||
    room.planWFt == null ||
    room.planHFt == null
  ) {
    return;
  }
  const db = getDb();
  const catalog = getCatalog();
  const item = catalog.find((c) => c.id === room.wallPaintCatalogItemId);
  if (!item || !isInteriorWallPaint(item)) return;

  const qty = wallPaintQuantityFromPlan({
    planWFt: room.planWFt,
    planHFt: room.planHFt,
    unit: item.unit,
  });
  const line = db
    .select()
    .from(lineItems)
    .where(
      and(
        eq(lineItems.projectId, projectId),
        eq(lineItems.roomId, room.id),
        eq(lineItems.catalogItemId, item.id),
      ),
    )
    .get();
  if (!line) return;
  db.update(lineItems)
    .set({ quantity: qty.quantity, unit: item.unit })
    .where(eq(lineItems.id, line.id))
    .run();
}

/**
 * Aplica o cambia la pintura de pared de un ambiente desde la planta 2D.
 * Cantidad = perímetro × altura × capas / cobertura (con desperdicio).
 */
export function applyRoomWallPaint(
  projectId: string,
  roomId: string,
  catalogItemId: string,
  wallColorId?: string | null,
): { room: Room; line: LineItem } | null {
  const db = getDb();
  const room = db.select().from(rooms).where(eq(rooms.id, roomId)).get();
  if (!room || room.projectId !== projectId) return null;

  if (room.planWFt == null || room.planHFt == null) {
    throw new Error(
      "El ambiente no tiene geometría en la planta. Redimensiona el rectángulo primero.",
    );
  }

  const catalog = getCatalog();
  const item = catalog.find((c) => c.id === catalogItemId);
  if (!item) {
    throw new Error("Material de catálogo no encontrado.");
  }
  if (!isInteriorWallPaint(item)) {
    throw new Error(
      "Este material no es pintura de pared interior (usa galones o cubetas de pintura).",
    );
  }

  const qty = wallPaintQuantityFromPlan({
    planWFt: room.planWFt,
    planHFt: room.planHFt,
    unit: item.unit,
  });
  const { catalogMeta, prices } = catalogPriceRows(catalog);
  const resolved = resolvePrice({
    catalogItemId: item.id,
    catalog: catalogMeta,
    prices,
  });
  const pricedAt = resolved?.pricedAt ?? item.pricedAt ?? todayDate();
  const unitPrice = resolved?.unitPriceUsd ?? item.unitPriceUsd;
  const priceSource = resolved?.source ?? item.priceSource ?? "seed";
  const colorId =
    wallColorId?.trim() || wallColorIdFromCatalog(item) || "blanco";

  const previousSku = room.wallPaintCatalogItemId;
  let line: LineItem | undefined;

  if (previousSku && previousSku === item.id) {
    line = db
      .select()
      .from(lineItems)
      .where(
        and(
          eq(lineItems.projectId, projectId),
          eq(lineItems.roomId, roomId),
          eq(lineItems.catalogItemId, item.id),
        ),
      )
      .get();
  } else if (previousSku) {
    const oldLine = db
      .select()
      .from(lineItems)
      .where(
        and(
          eq(lineItems.projectId, projectId),
          eq(lineItems.roomId, roomId),
          eq(lineItems.catalogItemId, previousSku),
        ),
      )
      .get();
    if (oldLine) {
      const updatedLine: LineItem = {
        ...oldLine,
        catalogItemId: item.id,
        description: item.name,
        category: item.category,
        unit: item.unit,
        quantity: qty.quantity,
        unitPrice,
        priceSource,
        pricedAt,
      };
      db.update(lineItems)
        .set(updatedLine)
        .where(eq(lineItems.id, oldLine.id))
        .run();
      line = updatedLine;
    }
  }

  if (!line) {
    line = db
      .select()
      .from(lineItems)
      .where(
        and(
          eq(lineItems.projectId, projectId),
          eq(lineItems.roomId, roomId),
          eq(lineItems.catalogItemId, item.id),
        ),
      )
      .get();
  }

  if (line && line.catalogItemId === item.id) {
    const updatedLine: LineItem = {
      ...line,
      description: item.name,
      category: item.category,
      unit: item.unit,
      quantity: qty.quantity,
      unitPrice,
      priceSource,
      pricedAt,
    };
    db.update(lineItems)
      .set(updatedLine)
      .where(eq(lineItems.id, line.id))
      .run();
    line = updatedLine;
  } else {
    const existing = db
      .select()
      .from(lineItems)
      .where(eq(lineItems.projectId, projectId))
      .all();
    line = {
      id: newId(),
      projectId,
      roomId,
      catalogItemId: item.id,
      description: item.name,
      category: item.category,
      unit: item.unit,
      quantity: qty.quantity,
      unitPrice,
      sortOrder: existing.length,
      priceSource,
      pricedAt,
    };
    db.insert(lineItems).values(line).run();
  }

  const updatedRoom: Room = {
    ...room,
    wallPaintCatalogItemId: item.id,
    wallColorId: colorId,
  };
  db.update(rooms).set(updatedRoom).where(eq(rooms.id, roomId)).run();
  db.update(projects)
    .set({ updatedAt: nowIso() })
    .where(eq(projects.id, projectId))
    .run();

  return { room: updatedRoom, line };
}

/**
 * Aplica gabinete / vanity / closet del pack de muebles al presupuesto.
 * Cantidad fija por ambiente (1 juego o pies lineales estimados del ancho).
 */
export function applyRoomFurniturePack(
  projectId: string,
  roomId: string,
  style?: FurnitureStyle,
): { room: Room; line: LineItem | null } | null {
  const db = getDb();
  const room = db.select().from(rooms).where(eq(rooms.id, roomId)).get();
  if (!room || room.projectId !== projectId) return null;

  const nextStyle = normalizeFurnitureStyle(
    style ?? room.furnitureStyle ?? "moderno",
  );
  const sku = cabinetSkuForPack(room.roomType, nextStyle);
  if (!sku) {
    const updatedRoom: Room = {
      ...room,
      furnitureStyle: nextStyle,
      furnitureVisible: true,
    };
    db.update(rooms).set(updatedRoom).where(eq(rooms.id, roomId)).run();
    return { room: updatedRoom, line: null };
  }

  const catalog = getCatalog();
  const item = catalog.find((c) => c.id === sku);
  if (!item) {
    throw new Error("Material de pack no encontrado en el catálogo.");
  }

  let quantity = 1;
  if (item.unit.includes("lineal") || item.unit === "ft") {
    const width = room.planWFt ?? 10;
    quantity = Math.max(4, Math.round(width * 0.85));
  }

  const { catalogMeta, prices } = catalogPriceRows(catalog);
  const resolved = resolvePrice({
    catalogItemId: item.id,
    catalog: catalogMeta,
    prices,
  });
  const pricedAt = resolved?.pricedAt ?? item.pricedAt ?? todayDate();
  const unitPrice = resolved?.unitPriceUsd ?? item.unitPriceUsd;
  const priceSource = resolved?.source ?? item.priceSource ?? "seed";

  // Reemplazar líneas previas de gabinete/vanity/closet del mismo ambiente.
  const packSkus = [
    "gabinetes-cocina",
    "gabinetes-cocina-basico",
    "vanity-bano",
    "vanity-bano-basico",
    "closet-rods",
    "closet-sistema",
  ];
  const existingLines = db
    .select()
    .from(lineItems)
    .where(and(eq(lineItems.projectId, projectId), eq(lineItems.roomId, roomId)))
    .all();
  let line: LineItem | undefined;
  for (const old of existingLines) {
    if (old.catalogItemId && packSkus.includes(old.catalogItemId)) {
      if (old.catalogItemId === item.id) {
        line = old;
      } else {
        db.delete(lineItems).where(eq(lineItems.id, old.id)).run();
      }
    }
  }

  if (line) {
    const updatedLine: LineItem = {
      ...line,
      description: item.name,
      category: item.category,
      unit: item.unit,
      quantity,
      unitPrice,
      priceSource,
      pricedAt,
    };
    db.update(lineItems)
      .set(updatedLine)
      .where(eq(lineItems.id, line.id))
      .run();
    line = updatedLine;
  } else {
    const all = db
      .select()
      .from(lineItems)
      .where(eq(lineItems.projectId, projectId))
      .all();
    line = {
      id: newId(),
      projectId,
      roomId,
      catalogItemId: item.id,
      description: item.name,
      category: item.category,
      unit: item.unit,
      quantity,
      unitPrice,
      sortOrder: all.length,
      priceSource,
      pricedAt,
    };
    db.insert(lineItems).values(line).run();
  }

  const updatedRoom: Room = {
    ...room,
    furnitureStyle: nextStyle,
    furnitureVisible: true,
  };
  db.update(rooms).set(updatedRoom).where(eq(rooms.id, roomId)).run();
  db.update(projects)
    .set({ updatedAt: nowIso() })
    .where(eq(projects.id, projectId))
    .run();

  return { room: updatedRoom, line };
}

/**
 * Asegura geometría de planta para ambientes que solo tienen área (editor lista).
 */
export function ensureRoomPlanGeometry(projectId: string, roomId: string): Room | null {
  const db = getDb();
  const room = db.select().from(rooms).where(eq(rooms.id, roomId)).get();
  if (!room || room.projectId !== projectId) return null;
  if (room.planWFt != null && room.planHFt != null && room.planX != null && room.planY != null) {
    return room;
  }

  const siblings = db.select().from(rooms).where(eq(rooms.projectId, projectId)).all();
  const existingPlans: PlanRect[] = siblings
    .filter((r) => r.id !== roomId && r.planWFt != null && r.planHFt != null)
    .map((r) =>
      normalizePlanRect({
        planX: r.planX ?? 0,
        planY: r.planY ?? 0,
        planWFt: r.planWFt!,
        planHFt: r.planHFt!,
      }),
    );
  const sized =
    room.areaM2 != null && room.areaM2 > 0
      ? planRectFromAreaM2(room.areaM2)
      : { planWFt: 12, planHFt: 10 };
  const plan = nextPlanPlacement(existingPlans, sized.planWFt, sized.planHFt);
  return updateRoom(projectId, roomId, plan);
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
  priceSource?: string | null;
  pricedAt?: string | null;
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
      priceSource:
        input.priceSource !== undefined ? input.priceSource : existing.priceSource,
      pricedAt: input.pricedAt !== undefined ? input.pricedAt : existing.pricedAt,
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
    priceSource: input.priceSource ?? (input.catalogItemId ? "seed" : "manual"),
    pricedAt: input.pricedAt ?? todayDate(),
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

export function exportCatalogCsv(): string {
  const items = getCatalog();
  return catalogToCsv(
    items.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      unit: i.unit,
      unitPriceUsd: i.unitPriceUsd,
      notes: i.notes,
      priceSource: i.priceSource,
      pricedAt: i.pricedAt,
      isEstimate: i.isEstimate,
    })),
  );
}

export type CatalogImportResult = {
  updated: number;
  inserted: number;
  skipped: number;
  rows: CsvCatalogRow[];
  validation: CatalogCsvValidationResult;
};

/**
 * Importa CSV de catálogo tras validar columnas/categorías/unidades.
 * Actualiza precio/fuente/fecha de ítems existentes (source=csv + fecha);
 * inserta filas nuevas si traen name+category+unit.
 */
export function importCatalogCsv(text: string): CatalogImportResult {
  const validation = validateCatalogCsv(text);
  if (!validation.ok) {
    throw new Error(
      `CSV de catálogo inválido:\n${formatCatalogCsvIssues(validation)}`,
    );
  }

  const rows = validation.rows;
  const db = getDb();
  let updated = 0;
  let inserted = 0;
  let skipped = 0;
  const pricedAtDefault = todayDate();

  const sqlite = getSqlite();
  const apply = sqlite.transaction(() => {
    for (const row of rows) {
      const existing = db
        .select()
        .from(catalogItems)
        .where(eq(catalogItems.id, row.id))
        .get();
      // Import path always stamps source=csv + date (honest pricing layer).
      const priceSource = row.source === "manual" ? "manual" : "csv";
      if (existing) {
        db.update(catalogItems)
          .set({
            unitPriceUsd: row.unitPriceUsd,
            priceSource,
            pricedAt: row.pricedAt || pricedAtDefault,
            isEstimate: row.isEstimate ?? true,
            notes: row.notes !== undefined ? row.notes : existing.notes,
            name: row.name?.trim() || existing.name,
            category: row.category?.trim() || existing.category,
            unit: row.unit?.trim() || existing.unit,
          })
          .where(eq(catalogItems.id, row.id))
          .run();
        updated++;
      } else if (row.name && row.category && row.unit) {
        db.insert(catalogItems)
          .values({
            id: row.id,
            name: row.name.trim(),
            category: row.category.trim(),
            unit: row.unit.trim(),
            unitPriceUsd: row.unitPriceUsd,
            notes: row.notes ?? "Importado CSV",
            isEstimate: row.isEstimate ?? true,
            priceSource,
            pricedAt: row.pricedAt || pricedAtDefault,
          })
          .run();
        inserted++;
      } else {
        skipped++;
      }
    }
  });
  apply();

  return { updated, inserted, skipped, rows, validation };
}

export function buildCsv(detail: ProjectDetail): string {
  const escape = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines: string[] = [];
  lines.push("ObraCalc PR — Presupuesto (estimación orientativa)");
  lines.push(`Proyecto,${escape(detail.project.name)}`);
  lines.push(`Modo,${escape(detail.project.mode)}`);
  lines.push(`Municipio,${escape(detail.project.municipality)}`);
  lines.push(`m² aprox.,${escape(detail.project.approxM2)}`);
  lines.push(`Fecha,${escape(detail.project.estimateDate)}`);
  lines.push(`Mano de obra %,${escape(detail.project.laborPercent)}`);
  lines.push(`Imprevistos %,${escape(detail.project.contingencyPercent)}`);
  lines.push("");
  lines.push(
    "Ambiente,Descripción,Categoría,Unidad,Cantidad,Precio unitario USD,Subtotal USD,Fuente,Fecha precio",
  );

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
        escape(item.priceSource),
        escape(item.pricedAt),
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
  lines.push(
    "Nota,Precios de catálogo semilla son estimaciones en USD (PR/US). No es cotización de contratista. Sin scraping ni precios en vivo fingidos.",
  );

  return lines.join("\n");
}
