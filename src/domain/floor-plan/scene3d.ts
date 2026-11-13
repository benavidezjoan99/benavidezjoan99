import {
  normalizeFurnitureStyle,
  type FurnitureStyle,
} from "./style-presets";
import {
  resolveFloorTexture,
  type FloorTextureKind,
} from "./floor-texture";
import { resolveWallColor, type WallColorSwatch } from "./wall-paint";
import {
  buildOpeningEntities,
  type OpeningEntity3D,
} from "./openings3d";
import type { RoomType } from "@/lib/types";

/** Altura de pared por defecto (ft) — alineada a wallPaintQuantityFromPlan. */
export const DEFAULT_WALL_HEIGHT_FT = 8;

/** Grosor de muro en pies (visual, no estructural). */
export const WALL_THICKNESS_FT = 0.45;

/** Ancho de puerta / ventana en pies. */
export const DOOR_WIDTH_FT = 3;
export const DOOR_HEIGHT_FT = 7;
export const WINDOW_WIDTH_FT = 3.5;
export const WINDOW_HEIGHT_FT = 3.5;
export const WINDOW_SILL_FT = 2.5;

/** Tolerancia para detectar bordes compartidos (ft). */
export const EDGE_TOLERANCE_FT = 0.51;

export type PlanRoom3DInput = {
  id: string;
  name: string;
  roomType: RoomType | string;
  planX: number;
  planY: number;
  planWFt: number;
  planHFt: number;
  floorCatalogItemId?: string | null;
  wallPaintCatalogItemId?: string | null;
  wallColorId?: string | null;
  furnitureStyle?: string | null;
  furnitureVisible?: boolean | null;
};

export type CatalogHint3D = { id?: string | null; name?: string | null };

export type Vec3 = { x: number; y: number; z: number };

export type FloorMesh3D = {
  kind: "floor";
  id: string;
  roomId: string;
  /** Centro en espacio 3D (Y = 0). */
  position: Vec3;
  widthFt: number;
  depthFt: number;
  texture: FloorTextureKind;
  label: string;
  roomType: string;
};

export type WallSegmentSide = "north" | "south" | "east" | "west";

export type Opening3D = {
  kind: "door" | "window";
  /** Offset a lo largo del muro desde el extremo “inicio” (ft). */
  alongFt: number;
  widthFt: number;
  heightFt: number;
  /** Altura del alféizar desde el piso (0 para puertas). */
  sillFt: number;
};

export type WallMesh3D = {
  kind: "wall";
  id: string;
  roomId: string;
  side: WallSegmentSide;
  /** Centro del segmento (incl. grosor). */
  position: Vec3;
  /** Longitud a lo largo del muro (ft). */
  lengthFt: number;
  heightFt: number;
  thicknessFt: number;
  /** Rotación Y en radianes (0 = muro paralelo a X). */
  rotationY: number;
  color: WallColorSwatch;
  openings: Opening3D[];
  shared: boolean;
};

export type FurnitureKind3D =
  | "sofa"
  | "table"
  | "chair"
  | "cabinet"
  | "island"
  | "bed"
  | "nightstand"
  | "tub"
  | "vanity"
  | "toilet"
  | "appliance"
  | "stove";

export type FurnitureMesh3D = {
  kind: "furniture";
  id: string;
  roomId: string;
  furnitureKind: FurnitureKind3D;
  position: Vec3;
  widthFt: number;
  depthFt: number;
  heightFt: number;
  rotationY: number;
  color: string;
  style: FurnitureStyle;
};

export type Scene3D = {
  floors: FloorMesh3D[];
  walls: WallMesh3D[];
  furniture: FurnitureMesh3D[];
  /** Puertas/ventanas como entidades con marco/hoja/vidrio. */
  openings: OpeningEntity3D[];
  /** Centro aproximado de la planta (para cámara). */
  center: Vec3;
  /** Extensión máxima en XZ (ft). */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  wallHeightFt: number;
};

type Edge = {
  roomId: string;
  side: WallSegmentSide;
  /** Coordenada fija del borde (x o z). */
  fixed: number;
  /** Rango a lo largo del borde. */
  start: number;
  end: number;
};

function roomEdges(room: PlanRoom3DInput): Edge[] {
  const x0 = room.planX;
  const x1 = room.planX + room.planWFt;
  const z0 = room.planY;
  const z1 = room.planY + room.planHFt;
  return [
    { roomId: room.id, side: "north", fixed: z0, start: x0, end: x1 },
    { roomId: room.id, side: "south", fixed: z1, start: x0, end: x1 },
    { roomId: room.id, side: "west", fixed: x0, start: z0, end: z1 },
    { roomId: room.id, side: "east", fixed: x1, start: z0, end: z1 },
  ];
}

function rangesOverlap(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
  tol = EDGE_TOLERANCE_FT,
): { start: number; end: number } | null {
  const start = Math.max(Math.min(a0, a1), Math.min(b0, b1));
  const end = Math.min(Math.max(a0, a1), Math.max(b0, b1));
  if (end - start < 1) return null;
  if (Math.abs(a0 - b0) > 1000) return null;
  void tol;
  return { start, end };
}

function oppositeSide(side: WallSegmentSide): WallSegmentSide {
  switch (side) {
    case "north":
      return "south";
    case "south":
      return "north";
    case "east":
      return "west";
    case "west":
      return "east";
  }
}

/**
 * Detecta si un borde comparte tramo con el borde opuesto de otro ambiente.
 */
export function findSharedOpening(
  edge: Edge,
  others: Edge[],
): { alongMid: number; overlapLen: number; shared: boolean } | null {
  const candidates = others.filter(
    (o) =>
      o.roomId !== edge.roomId &&
      o.side === oppositeSide(edge.side) &&
      Math.abs(o.fixed - edge.fixed) <= EDGE_TOLERANCE_FT,
  );
  let best: { alongMid: number; overlapLen: number } | null = null;
  for (const o of candidates) {
    const ov = rangesOverlap(edge.start, edge.end, o.start, o.end);
    if (!ov) continue;
    const len = ov.end - ov.start;
    const mid = (ov.start + ov.end) / 2;
    if (!best || len > best.overlapLen) {
      best = { alongMid: mid - Math.min(edge.start, edge.end), overlapLen: len };
    }
  }
  if (!best) return null;
  return { ...best, shared: true };
}

function wallCenterAndRotation(
  room: PlanRoom3DInput,
  side: WallSegmentSide,
  heightFt: number,
  thicknessFt: number,
): { position: Vec3; lengthFt: number; rotationY: number } {
  const cx = room.planX + room.planWFt / 2;
  const cz = room.planY + room.planHFt / 2;
  const halfT = thicknessFt / 2;
  switch (side) {
    case "north":
      return {
        position: {
          x: cx,
          y: heightFt / 2,
          z: room.planY + halfT,
        },
        lengthFt: room.planWFt,
        rotationY: 0,
      };
    case "south":
      return {
        position: {
          x: cx,
          y: heightFt / 2,
          z: room.planY + room.planHFt - halfT,
        },
        lengthFt: room.planWFt,
        rotationY: 0,
      };
    case "west":
      return {
        position: {
          x: room.planX + halfT,
          y: heightFt / 2,
          z: cz,
        },
        lengthFt: room.planHFt,
        rotationY: Math.PI / 2,
      };
    case "east":
      return {
        position: {
          x: room.planX + room.planWFt - halfT,
          y: heightFt / 2,
          z: cz,
        },
        lengthFt: room.planHFt,
        rotationY: Math.PI / 2,
      };
  }
}

function openingsForEdge(
  edge: Edge,
  shared: ReturnType<typeof findSharedOpening>,
  lengthFt: number,
): Opening3D[] {
  if (shared) {
    const width = Math.min(DOOR_WIDTH_FT, Math.max(2.5, shared.overlapLen * 0.45));
    const along = Math.min(
      Math.max(shared.alongMid - width / 2, 0.4),
      Math.max(0.4, lengthFt - width - 0.4),
    );
    return [
      {
        kind: "door",
        alongFt: along,
        widthFt: width,
        heightFt: DOOR_HEIGHT_FT,
        sillFt: 0,
      },
    ];
  }
  // Ventana en muro exterior si el lado es suficientemente largo
  if (lengthFt < 6) return [];
  const width = Math.min(WINDOW_WIDTH_FT, lengthFt * 0.35);
  const along = (lengthFt - width) / 2;
  return [
    {
      kind: "window",
      alongFt: along,
      widthFt: width,
      heightFt: WINDOW_HEIGHT_FT,
      sillFt: WINDOW_SILL_FT,
    },
  ];
}

/**
 * Colores sólidos para texturas de piso en 3D (sin canvas; SSR-safe).
 */
export function floorColorForTexture(kind: FloorTextureKind): string {
  switch (kind) {
    case "wood":
      return "#c9a87a";
    case "woodDark":
      return "#8a6444";
    case "tile":
      return "#cfc8bc";
    case "tileLarge":
      return "#c8c2b6";
    case "carpet":
      return "#e6ddd0";
    case "concrete":
      return "#d0d0cc";
    case "epoxy":
      return "#b8c0c8";
    default:
      return "#ebe6dc";
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * Proxies 3D de muebles alineados al layout top-down del croquis 2D.
 * Coordenadas absolutas en pies (mismo origen que planX/planY).
 */
export function furnitureForRoom(
  room: PlanRoom3DInput,
): FurnitureMesh3D[] {
  if (room.furnitureVisible === false) return [];
  const style = normalizeFurnitureStyle(room.furnitureStyle);
  const pad = Math.max(0.6, Math.min(room.planWFt, room.planHFt) * 0.08);
  const x0 = room.planX + pad;
  const z0 = room.planY + pad;
  const iw = room.planWFt - pad * 2;
  const ih = room.planHFt - pad * 2;
  if (iw < 2 || ih < 2) return [];

  const items: FurnitureMesh3D[] = [];
  const push = (
    furnitureKind: FurnitureKind3D,
    localX: number,
    localZ: number,
    w: number,
    d: number,
    h: number,
    color: string,
    rotationY = 0,
  ) => {
    items.push({
      kind: "furniture",
      id: `${room.id}-${furnitureKind}-${items.length}`,
      roomId: room.id,
      furnitureKind,
      position: {
        x: x0 + localX,
        y: h / 2,
        z: z0 + localZ,
      },
      widthFt: w,
      depthFt: d,
      heightFt: h,
      rotationY,
      color,
      style,
    });
  };

  switch (room.roomType) {
    case "sala": {
      const sofaW = clamp(iw * (style === "basico" ? 0.62 : 0.72), 4, 7.5);
      const sofaD = clamp(ih * 0.28, 2, 3);
      const tableW = clamp(iw * 0.35, 2, 4);
      const tableD = clamp(ih * 0.18, 1.2, 2);
      push(
        "sofa",
        (iw - sofaW) / 2 + sofaW / 2,
        ih - sofaD / 2 - 0.3,
        sofaW,
        sofaD,
        2.6,
        style === "basico" ? "#6a7a8a" : "#4a6fa5",
      );
      push(
        "table",
        iw / 2,
        ih * 0.38 + tableD / 2,
        tableW,
        tableD,
        1.4,
        style === "basico" ? "#b0a090" : "#a67c52",
      );
      if (style === "moderno") {
        push("chair", 1.1, ih * 0.32 + 1.2, 2.2, 2.4, 2.8, "#4a6fa5");
        push("chair", iw - 1.1, ih * 0.32 + 1.2, 2.2, 2.4, 2.8, "#4a6fa5");
      }
      break;
    }
    case "cocina": {
      const cabD = clamp(Math.min(2, ih * 0.18), 1.2, 2);
      const cabFill = style === "basico" ? "#8a8074" : "#6b5a48";
      push("cabinet", iw / 2, cabD / 2, iw, cabD, 3, cabFill);
      if (style === "moderno") {
        push("cabinet", cabD / 2, ih * 0.28, cabD, ih * 0.55, 3, cabFill);
        const islandW = clamp(iw * 0.45, 3, 6);
        const islandD = clamp(ih * 0.28, 2, 3);
        push(
          "island",
          iw / 2,
          ih * 0.42 + islandD / 2,
          islandW,
          islandD,
          3,
          "#8a8a86",
        );
        push("stove", iw * 0.55 + 1.2, cabD / 2, 2.4, cabD - 0.2, 3.2, "#3a3a38");
      } else {
        push("stove", iw * 0.35 + 1.1, cabD / 2, 2.2, cabD - 0.2, 3.2, "#555555");
      }
      break;
    }
    case "dormitorio": {
      const bedW = clamp(iw * (style === "basico" ? 0.5 : 0.55), 4, 6);
      const bedD = clamp(ih * 0.7, 5, 7);
      push("bed", iw / 2, ih / 2, bedW, bedD, 2.2, "#e8e4dc");
      if (style === "moderno") {
        const ns = 1.4;
        push(
          "nightstand",
          iw / 2 - bedW / 2 - ns / 2 - 0.3,
          ih / 2 - bedD / 2 + ns / 2 + 0.3,
          ns,
          ns,
          2,
          "#8b7355",
        );
        push(
          "nightstand",
          iw / 2 + bedW / 2 + ns / 2 + 0.3,
          ih / 2 - bedD / 2 + ns / 2 + 0.3,
          ns,
          ns,
          2,
          "#8b7355",
        );
      }
      break;
    }
    case "comedor": {
      const tw = clamp(iw * 0.45, 3, 5);
      const td = clamp(ih * 0.35, 2.5, 3.5);
      push(
        "table",
        iw / 2,
        ih / 2,
        tw,
        td,
        2.5,
        style === "basico" ? "#b0a090" : "#a67c52",
      );
      const chairOffsets =
        style === "basico"
          ? [
              [0, -td / 2 - 1],
              [0, td / 2 + 1],
            ]
          : [
              [0, -td / 2 - 1],
              [0, td / 2 + 1],
              [-tw / 2 - 1, 0],
              [tw / 2 + 1, 0],
            ];
      for (const [dx, dz] of chairOffsets) {
        push("chair", iw / 2 + dx, ih / 2 + dz, 1.4, 1.4, 3, "#f0ebe3");
      }
      break;
    }
    case "bano": {
      if (style === "moderno") {
        push(
          "tub",
          0.3 + Math.min(iw * 0.4, 5) / 2,
          0.3 + Math.min(ih * 0.35, 2.8) / 2,
          Math.min(iw * 0.4, 5),
          Math.min(ih * 0.35, 2.8),
          1.8,
          "#9ec9d9",
        );
      } else {
        const s = Math.min(iw * 0.32, ih * 0.32, 3.5);
        push("tub", 0.3 + s / 2, 0.3 + s / 2, s, s, 2, "#c8d8e0");
      }
      const vanityW = style === "basico" ? 2.4 : 3;
      push(
        "vanity",
        iw - vanityW / 2 - 0.2,
        0.3 + 0.9,
        vanityW,
        1.8,
        2.8,
        style === "basico" ? "#e0dcd4" : "#d8d4cc",
      );
      push("toilet", iw - 1, ih - 1.5, 1.6, 2.4, 2.4, "#f5f3ef");
      break;
    }
    case "lavanderia": {
      push("appliance", 1.2, 1.2, 2.4, 2.4, 3.2, "#d0d4d8");
      push("appliance", 1.2 + 2.4 + 0.5, 1.2, 2.4, 2.4, 3.2, "#d0d4d8");
      break;
    }
    default:
      break;
  }
  return items;
}

/**
 * Construye la escena 3D a partir del mismo modelo de planta 2D
 * (rectángulos + textura de piso + color de pared + pack de muebles).
 */
export function buildScene3D(
  rooms: PlanRoom3DInput[],
  options?: {
    catalogById?: Record<string, CatalogHint3D>;
    wallHeightFt?: number;
  },
): Scene3D {
  const wallHeightFt = options?.wallHeightFt ?? DEFAULT_WALL_HEIGHT_FT;
  const catalogById = options?.catalogById ?? {};
  const allEdges = rooms.flatMap(roomEdges);

  const floors: FloorMesh3D[] = [];
  const walls: WallMesh3D[] = [];
  const furniture: FurnitureMesh3D[] = [];

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const room of rooms) {
    minX = Math.min(minX, room.planX);
    maxX = Math.max(maxX, room.planX + room.planWFt);
    minZ = Math.min(minZ, room.planY);
    maxZ = Math.max(maxZ, room.planY + room.planHFt);

    const cat = room.floorCatalogItemId
      ? catalogById[room.floorCatalogItemId]
      : null;
    const texture = resolveFloorTexture({
      roomType: room.roomType,
      catalogItem: cat ?? { id: room.floorCatalogItemId },
    });
    floors.push({
      kind: "floor",
      id: `floor-${room.id}`,
      roomId: room.id,
      position: {
        x: room.planX + room.planWFt / 2,
        y: 0,
        z: room.planY + room.planHFt / 2,
      },
      widthFt: room.planWFt,
      depthFt: room.planHFt,
      texture,
      label: room.name,
      roomType: String(room.roomType),
    });

    const color = resolveWallColor({
      wallColorId: room.wallColorId,
      catalogItem: room.wallPaintCatalogItemId
        ? catalogById[room.wallPaintCatalogItemId]
        : null,
    });

    for (const edge of roomEdges(room)) {
      const shared = findSharedOpening(edge, allEdges);
      const { position, lengthFt, rotationY } = wallCenterAndRotation(
        room,
        edge.side,
        wallHeightFt,
        WALL_THICKNESS_FT,
      );
      // En bordes compartidos, solo un ambiente dibuja el muro (id lexicográfico menor)
      // para evitar z-fighting; el otro omite el segmento.
      if (shared) {
        const neighbor = allEdges.find(
          (o) =>
            o.roomId !== edge.roomId &&
            o.side === oppositeSide(edge.side) &&
            Math.abs(o.fixed - edge.fixed) <= EDGE_TOLERANCE_FT,
        );
        if (neighbor && neighbor.roomId < room.id) {
          continue;
        }
      }
      walls.push({
        kind: "wall",
        id: `wall-${room.id}-${edge.side}`,
        roomId: room.id,
        side: edge.side,
        position,
        lengthFt,
        heightFt: wallHeightFt,
        thicknessFt: WALL_THICKNESS_FT,
        rotationY,
        color,
        openings: openingsForEdge(edge, shared, lengthFt),
        shared: Boolean(shared),
      });
    }

    furniture.push(...furnitureForRoom(room));
  }

  if (!Number.isFinite(minX)) {
    minX = 0;
    maxX = 20;
    minZ = 0;
    maxZ = 20;
  }

  return {
    floors,
    walls,
    furniture,
    openings: buildOpeningEntities(walls),
    center: {
      x: (minX + maxX) / 2,
      y: 0,
      z: (minZ + maxZ) / 2,
    },
    bounds: { minX, maxX, minZ, maxZ },
    wallHeightFt,
  };
}

/**
 * Partes sólidas de un muro con huecos (puerta/ventana) para mesh boxes.
 * Devuelve rectángulos en el plano local del muro: x a lo largo, y altura.
 */
export function wallSolidParts(
  lengthFt: number,
  heightFt: number,
  openings: Opening3D[],
): { x: number; y: number; w: number; h: number }[] {
  if (openings.length === 0) {
    return [{ x: 0, y: 0, w: lengthFt, h: heightFt }];
  }
  const parts: { x: number; y: number; w: number; h: number }[] = [];
  const sorted = [...openings].sort((a, b) => a.alongFt - b.alongFt);
  let cursor = 0;
  for (const op of sorted) {
    const opStart = clamp(op.alongFt, 0, lengthFt);
    const opEnd = clamp(op.alongFt + op.widthFt, 0, lengthFt);
    if (opStart > cursor + 0.05) {
      parts.push({ x: cursor, y: 0, w: opStart - cursor, h: heightFt });
    }
    const sill = op.sillFt;
    const top = sill + op.heightFt;
    if (sill > 0.05) {
      parts.push({ x: opStart, y: 0, w: opEnd - opStart, h: sill });
    }
    if (top < heightFt - 0.05) {
      parts.push({
        x: opStart,
        y: top,
        w: opEnd - opStart,
        h: heightFt - top,
      });
    }
    cursor = Math.max(cursor, opEnd);
  }
  if (cursor < lengthFt - 0.05) {
    parts.push({ x: cursor, y: 0, w: lengthFt - cursor, h: heightFt });
  }
  return parts.filter((p) => p.w > 0.05 && p.h > 0.05);
}
