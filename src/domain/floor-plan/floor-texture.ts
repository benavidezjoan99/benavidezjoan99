import type { RoomType } from "@/lib/types";

/**
 * Familia visual de textura de piso en el croquis 2D (estilo render).
 * No es un tipo de catálogo: se infiere del SKU/nombre o del tipo de ambiente.
 */
export type FloorTextureKind =
  | "wood"
  | "woodDark"
  | "tile"
  | "tileLarge"
  | "carpet"
  | "concrete"
  | "epoxy"
  | "neutral";

export type FloorTextureCatalogHint = {
  id?: string | null;
  name?: string | null;
};

const WOOD_DARK_RE =
  /(madera[\s-]?ingenier|engineered|hardwood|roble[\s-]?oscuro|oak[\s-]?dark|parquet)/i;
const WOOD_RE =
  /(madera|laminat|parquet|engineered|hardwood|oak|roble|piso[\s-]?lamin|vinil[\s-]?madera|\bwood\b|lvp|spc)/i;
const TILE_LARGE_RE =
  /(porcelanato[\s-]?lujo|porcelan[\w\s-]*24|large[\s-]?format|gran[\s-]?formato)/i;
const TILE_RE =
  /(ceram|cerám|porcelan|\btile\b|azulejo|mosaico|baldosa|piso[\s-]?ceram)/i;
const CARPET_RE =
  /(carpet|alfombra|moqueta|carpeting|tapiz[\s-]?piso)/i;
const EPOXY_RE = /(epoxy|epoxi|piso[\s-]?epox)/i;
const CONCRETE_RE = /(concret|hormig|cemento|\bgarage\b)/i;

/** Inferencia desde SKU / nombre de catálogo. */
export function inferFloorTextureFromCatalog(
  item: FloorTextureCatalogHint | null | undefined,
): FloorTextureKind | null {
  if (!item) return null;
  const haystack = `${item.id ?? ""} ${item.name ?? ""}`.trim();
  if (!haystack) return null;
  if (EPOXY_RE.test(haystack)) return "epoxy";
  if (WOOD_DARK_RE.test(haystack)) return "woodDark";
  if (WOOD_RE.test(haystack)) return "wood";
  if (TILE_LARGE_RE.test(haystack)) return "tileLarge";
  if (TILE_RE.test(haystack)) return "tile";
  if (CARPET_RE.test(haystack)) return "carpet";
  if (CONCRETE_RE.test(haystack)) return "concrete";
  return null;
}

/** Fallback visual por tipo de ambiente cuando no hay piso aplicado. */
export function defaultFloorTextureForRoomType(
  roomType: RoomType | string,
): FloorTextureKind {
  switch (roomType) {
    case "sala":
    case "comedor":
    case "cocina":
      return "wood";
    case "bano":
    case "lavanderia":
      return "tile";
    case "dormitorio":
      return "carpet";
    case "garage":
      return "concrete";
    case "exterior":
      return "concrete";
    case "pasillo":
      return "neutral";
    default:
      return "neutral";
  }
}

/**
 * Textura efectiva para el lienzo: catálogo gana; si no, tipo de ambiente.
 */
export function resolveFloorTexture(input: {
  roomType: RoomType | string;
  catalogItem?: FloorTextureCatalogHint | null;
}): FloorTextureKind {
  return (
    inferFloorTextureFromCatalog(input.catalogItem) ??
    defaultFloorTextureForRoomType(input.roomType)
  );
}
