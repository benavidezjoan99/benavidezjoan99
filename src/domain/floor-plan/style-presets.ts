import type { RoomType } from "@/lib/types";

/** Niveles de acabado rápido para piso (UI ES). */
export type FloorBudgetTier = "economico" | "medio" | "premium";

export const FLOOR_BUDGET_TIERS: FloorBudgetTier[] = [
  "economico",
  "medio",
  "premium",
];

export const FLOOR_BUDGET_TIER_LABELS_ES: Record<FloorBudgetTier, string> = {
  economico: "Económico",
  medio: "Medio",
  premium: "Premium",
};

/**
 * SKU preferido por nivel × tipo de ambiente.
 * Solo usa IDs de catálogo semilla (acabados por área).
 */
const FLOOR_PRESET_BY_ROOM: Record<
  string,
  Record<FloorBudgetTier, string>
> = {
  sala: {
    economico: "vinil-madera",
    medio: "piso-laminado",
    premium: "madera-ingenieria",
  },
  comedor: {
    economico: "vinil-madera",
    medio: "piso-laminado",
    premium: "madera-ingenieria",
  },
  cocina: {
    economico: "ceramica-piso",
    medio: "porcelanato",
    premium: "porcelanato-lujo",
  },
  bano: {
    economico: "ceramica-piso",
    medio: "porcelanato",
    premium: "porcelanato-lujo",
  },
  lavanderia: {
    economico: "ceramica-piso",
    medio: "ceramica-piso",
    premium: "porcelanato",
  },
  dormitorio: {
    economico: "alfombra-residencial",
    medio: "piso-laminado",
    premium: "madera-ingenieria",
  },
  pasillo: {
    economico: "ceramica-piso",
    medio: "piso-laminado",
    premium: "porcelanato",
  },
  garage: {
    economico: "piso-epoxico",
    medio: "piso-epoxico",
    premium: "piso-epoxico",
  },
  exterior: {
    economico: "ceramica-piso",
    medio: "porcelanato",
    premium: "porcelanato-lujo",
  },
  otro: {
    economico: "ceramica-piso",
    medio: "piso-laminado",
    premium: "porcelanato",
  },
};

const DEFAULT_PRESETS: Record<FloorBudgetTier, string> = {
  economico: "ceramica-piso",
  medio: "piso-laminado",
  premium: "porcelanato",
};

/** SKU de piso sugerido para un preset de presupuesto. */
export function floorSkuForPreset(
  roomType: RoomType | string,
  tier: FloorBudgetTier,
): string {
  return FLOOR_PRESET_BY_ROOM[roomType]?.[tier] ?? DEFAULT_PRESETS[tier];
}

/**
 * Infiera el tier más cercano a un SKU (para resaltar el botón activo).
 * Devuelve null si el SKU no coincide con ningún preset del tipo.
 */
export function inferFloorTierFromSku(
  roomType: RoomType | string,
  catalogItemId: string | null | undefined,
): FloorBudgetTier | null {
  if (!catalogItemId) return null;
  const presets = FLOOR_PRESET_BY_ROOM[roomType] ?? DEFAULT_PRESETS;
  for (const tier of FLOOR_BUDGET_TIERS) {
    if (presets[tier] === catalogItemId) return tier;
  }
  return null;
}

/** Estilo visual del pack de muebles/gabinetes. */
export type FurnitureStyle = "basico" | "moderno";

export const FURNITURE_STYLES: FurnitureStyle[] = ["basico", "moderno"];

export const FURNITURE_STYLE_LABELS_ES: Record<FurnitureStyle, string> = {
  basico: "Básico",
  moderno: "Moderno",
};

/** Tipos de ambiente con pack de muebles disponible. */
export const FURNITURE_PACK_ROOM_TYPES = [
  "sala",
  "cocina",
  "dormitorio",
  "bano",
] as const;

export type FurniturePackRoomType = (typeof FURNITURE_PACK_ROOM_TYPES)[number];

export function hasFurniturePack(roomType: RoomType | string): boolean {
  return (FURNITURE_PACK_ROOM_TYPES as readonly string[]).includes(roomType);
}

/**
 * SKU de gabinetes / carpintería opcional al aplicar pack al presupuesto.
 * Solo cocina (y vanity baño) afectan líneas de material en este slice.
 */
export function cabinetSkuForPack(
  roomType: RoomType | string,
  style: FurnitureStyle,
): string | null {
  if (roomType === "cocina") {
    return style === "basico" ? "gabinetes-cocina-basico" : "gabinetes-cocina";
  }
  if (roomType === "bano") {
    return style === "basico" ? "vanity-bano-basico" : "vanity-bano";
  }
  if (roomType === "dormitorio") {
    return style === "basico" ? "closet-rods" : "closet-sistema";
  }
  return null;
}

export function normalizeFurnitureStyle(
  value: string | null | undefined,
): FurnitureStyle {
  return value === "basico" ? "basico" : "moderno";
}
