/**
 * Assemblies / reglas de takeoff (semilla).
 * Fórmulas acotadas evaluadas por QuantityTakeoffEngine — sin eval() libre.
 *
 * Unidades de entrada: length/width/height en pies (imperial por defecto).
 * areaFt2 = length * width cuando no se pasa área explícita.
 */

export type QtyFormulaKind =
  | "per_space" // quantity = qtyPerUnit * count * waste
  | "blocks_wall" // (perimeter * height / blockFaceFt2) * count * waste
  | "concrete_slab" // (areaFt2 * thicknessFt / 27) yd³ * waste
  | "flooring_sf" // areaFt2 * count * waste
  | "paint_gallons" // wallAreaFt2 / coverageSfPerGal * coats * waste
  | "gypsum_sheets"; // wallAreaFt2 / sheetSf * waste

export type AssemblyRule = {
  id: string;
  catalogItemId: string;
  kind: QtyFormulaKind;
  /** Multiplier for per_space; otherwise rule-specific params below. */
  qtyPerUnit?: number;
  wasteFactor: number;
  /** Block face area in ft² (e.g. 8×16 block ≈ 0.889). */
  blockFaceFt2?: number;
  /** Slab thickness in inches (converted to ft in engine). */
  thicknessIn?: number;
  /** Paint coverage sf/gallon. */
  coverageSfPerGal?: number;
  coats?: number;
  /** Gypsum sheet coverage ft². */
  sheetSf?: number;
  spaceTypes?: string[];
};

export type AssemblyTemplate = {
  id: string;
  code: string;
  name: string;
  spaceType: string;
  version: number;
  rules: AssemblyRule[];
};

/**
 * Reglas parametrizadas mínimas Fase 1 (bloques, hormigón, piso, pintura, gypsum).
 * Los room-templates del MVP siguen disponibles como fallback `per_space`.
 */
export const TAKEOFF_RULES: AssemblyRule[] = [
  {
    id: "rule-blocks-8",
    catalogItemId: "bloque-8",
    kind: "blocks_wall",
    wasteFactor: 1.05,
    blockFaceFt2: (8 / 12) * (16 / 12), // 8"×16" face
  },
  {
    id: "rule-blocks-6",
    catalogItemId: "bloque-6",
    kind: "blocks_wall",
    wasteFactor: 1.05,
    blockFaceFt2: (6 / 12) * (16 / 12),
  },
  {
    id: "rule-concrete-slab",
    catalogItemId: "hormigon-listo",
    kind: "concrete_slab",
    wasteFactor: 1.08,
    thicknessIn: 4,
  },
  {
    id: "rule-flooring-ceramica",
    catalogItemId: "ceramica-piso",
    kind: "flooring_sf",
    wasteFactor: 1.1,
  },
  {
    id: "rule-paint-interior",
    catalogItemId: "pintura-interior",
    kind: "paint_gallons",
    wasteFactor: 1.1,
    coverageSfPerGal: 350,
    coats: 2,
  },
  {
    id: "rule-gypsum-1-2",
    catalogItemId: "drywall-1-2",
    kind: "gypsum_sheets",
    wasteFactor: 1.15,
    sheetSf: 32, // 4×8 sheet
  },
];

/** Defaults por tipo de ambiente: qué reglas de takeoff aplicar. */
export const SPACE_TAKEOFF_RULES: Record<string, string[]> = {
  sala: [
    "rule-blocks-8",
    "rule-flooring-ceramica",
    "rule-paint-interior",
    "rule-gypsum-1-2",
  ],
  cocina: [
    "rule-blocks-8",
    "rule-flooring-ceramica",
    "rule-paint-interior",
    "rule-gypsum-1-2",
  ],
  comedor: [
    "rule-blocks-8",
    "rule-flooring-ceramica",
    "rule-paint-interior",
    "rule-gypsum-1-2",
  ],
  bano: [
    "rule-blocks-6",
    "rule-flooring-ceramica",
    "rule-paint-interior",
  ],
  dormitorio: [
    "rule-blocks-8",
    "rule-flooring-ceramica",
    "rule-paint-interior",
    "rule-gypsum-1-2",
  ],
  lavanderia: ["rule-blocks-6", "rule-flooring-ceramica", "rule-paint-interior"],
  garage: ["rule-blocks-8", "rule-concrete-slab", "rule-paint-interior"],
  pasillo: ["rule-flooring-ceramica", "rule-paint-interior", "rule-gypsum-1-2"],
  exterior: ["rule-blocks-8", "rule-paint-interior"],
  otro: ["rule-blocks-8", "rule-flooring-ceramica", "rule-paint-interior"],
};
