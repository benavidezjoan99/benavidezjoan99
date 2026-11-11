import { roundMoney } from "@/lib/money";

export type PaintCatalogItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPriceUsd: number;
};

export type WallPaintQtyInput = {
  planWFt: number;
  planHFt: number;
  /** Altura de pared en pies. Default 8. */
  heightFt?: number;
  /** Capas. Default 2. */
  coats?: number;
  /** Cobertura ft²/gal. Default 350. */
  coverageSfPerGal?: number;
  /** Desperdicio ≥ 1. Default 1.1 */
  wasteFactor?: number;
  /** Unidad del ítem (gal, cubeta, …). */
  unit: string;
};

export type WallPaintQtyResult = {
  wallAreaFt2: number;
  quantity: number;
  unit: string;
};

const PAINT_UNITS_GAL = new Set(["gal", "galón", "galon", "gallon"]);
const PAINT_UNITS_BUCKET = new Set(["cubeta", "bucket", "5gal", "5 gal"]);

function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase();
}

/**
 * ¿El ítem es pintura aplicable a paredes interiores desde la planta?
 * Galones y cubetas de categoría pintura (excluye kits/cinta/techo).
 */
export function isInteriorWallPaint(
  item: Pick<PaintCatalogItem, "id" | "name" | "category" | "unit">,
): boolean {
  if (item.category !== "pintura") return false;
  const hay = `${item.id} ${item.name}`.toLowerCase();
  if (/(techo|elastomer|exterior|brocha|rodillo|cinta|primer)/i.test(hay)) {
    // Permitir primer y pintura interior; bloquear techo/exterior/kits.
    if (/techo|elastomer|exterior|brocha|rodillo|cinta/.test(hay)) return false;
  }
  if (/exterior/.test(hay)) return false;
  const u = normalizeUnit(item.unit);
  return PAINT_UNITS_GAL.has(u) || PAINT_UNITS_BUCKET.has(u);
}

/** Filtra catálogo a pinturas de pared interiores. */
export function filterWallPaintCatalog(
  items: PaintCatalogItem[],
): PaintCatalogItem[] {
  return items
    .filter(isInteriorWallPaint)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/**
 * Cantidad de pintura a partir del perímetro del croquis (2×(W+H)×altura).
 * Cubetas de 5 gal: convierte galones → cubetas (ceil).
 */
export function wallPaintQuantityFromPlan(
  input: WallPaintQtyInput,
): WallPaintQtyResult {
  const height = input.heightFt && input.heightFt > 0 ? input.heightFt : 8;
  const coats = input.coats && input.coats > 0 ? input.coats : 2;
  const coverage =
    input.coverageSfPerGal && input.coverageSfPerGal > 0
      ? input.coverageSfPerGal
      : 350;
  const waste =
    input.wasteFactor != null && input.wasteFactor > 0
      ? input.wasteFactor
      : 1.1;

  const perimeter = 2 * (input.planWFt + input.planHFt);
  const wallAreaFt2 = roundMoney(perimeter * height);
  const gallons = ((wallAreaFt2 * coats) / coverage) * waste;
  const u = normalizeUnit(input.unit);

  let quantity: number;
  if (PAINT_UNITS_BUCKET.has(u)) {
    quantity = Math.ceil(gallons / 5);
  } else {
    quantity = roundMoney(gallons);
  }

  return { wallAreaFt2, quantity, unit: input.unit };
}

/** Tintes suaves para el croquis (relleno / borde), no color de marketing. */
export type WallColorSwatch = {
  id: string;
  labelEs: string;
  /** Hex de relleno suave (habitación). */
  fill: string;
  /** Hex de borde / muro. */
  stroke: string;
};

export const WALL_COLOR_SWATCHES: WallColorSwatch[] = [
  {
    id: "blanco",
    labelEs: "Blanco cálido",
    fill: "#f3eee6",
    stroke: "#3a3834",
  },
  {
    id: "beige",
    labelEs: "Beige arena",
    fill: "#e8dcc8",
    stroke: "#4a4034",
  },
  {
    id: "gris",
    labelEs: "Gris piedra",
    fill: "#d8d6d2",
    stroke: "#3a3a38",
  },
  {
    id: "sage",
    labelEs: "Verde salvia",
    fill: "#d5e0d4",
    stroke: "#2f3d32",
  },
  {
    id: "azul",
    labelEs: "Azul suave",
    fill: "#d4e0ea",
    stroke: "#2a3844",
  },
  {
    id: "terracota",
    labelEs: "Terracota suave",
    fill: "#ead8cc",
    stroke: "#4a3428",
  },
];

const SWATCH_BY_ID = Object.fromEntries(
  WALL_COLOR_SWATCHES.map((s) => [s.id, s]),
) as Record<string, WallColorSwatch>;

/**
 * Infiera swatch desde SKU/nombre de pintura o id de color guardado.
 */
export function resolveWallColor(input: {
  wallColorId?: string | null;
  catalogItem?: { id?: string | null; name?: string | null } | null;
}): WallColorSwatch {
  if (input.wallColorId && SWATCH_BY_ID[input.wallColorId]) {
    return SWATCH_BY_ID[input.wallColorId];
  }
  const hay = `${input.catalogItem?.id ?? ""} ${input.catalogItem?.name ?? ""}`.toLowerCase();
  if (/beige|arena|linen|lino/.test(hay)) return SWATCH_BY_ID.beige;
  if (/gris|gray|grey|piedra|stone/.test(hay)) return SWATCH_BY_ID.gris;
  if (/sage|salvia|verde/.test(hay)) return SWATCH_BY_ID.sage;
  if (/azul|blue|celeste/.test(hay)) return SWATCH_BY_ID.azul;
  if (/terracota|coral|terracotta/.test(hay)) return SWATCH_BY_ID.terracota;
  if (/blanco|white|calido|cálido/.test(hay)) return SWATCH_BY_ID.blanco;
  return SWATCH_BY_ID.blanco;
}

export function wallColorIdFromCatalog(
  item: { id?: string | null; name?: string | null } | null | undefined,
): string {
  return resolveWallColor({ catalogItem: item }).id;
}
