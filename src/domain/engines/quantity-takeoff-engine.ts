import {
  SPACE_TAKEOFF_RULES,
  TAKEOFF_RULES,
  type AssemblyRule,
} from "../templates/assemblies-seed";
import type { QuantityLine } from "../types/pricing";
import { roundMoney } from "@/lib/money";

export type SpaceTakeoffInput = {
  id?: string;
  spaceType: string;
  count?: number;
  /** Área en ft² (preferida). Si falta, se usa length×width. */
  areaFt2?: number | null;
  lengthFt?: number | null;
  widthFt?: number | null;
  heightFt?: number | null;
  /** Área en m² — se convierte si no hay areaFt2. */
  areaM2?: number | null;
};

export type CatalogUnitLookup = Record<string, { unit: string }>;

export type TakeoffOptions = {
  /** Override default rules by space type. */
  ruleIdsBySpaceType?: Record<string, string[]>;
  rules?: AssemblyRule[];
  /** Default wall height when missing (ft). */
  defaultHeightFt?: number;
  catalogUnits?: CatalogUnitLookup;
};

const M2_TO_FT2 = 10.76391041671;

function resolveAreaFt2(space: SpaceTakeoffInput): number {
  if (space.areaFt2 != null && space.areaFt2 > 0) return space.areaFt2;
  if (space.lengthFt != null && space.widthFt != null && space.lengthFt > 0 && space.widthFt > 0) {
    return space.lengthFt * space.widthFt;
  }
  if (space.areaM2 != null && space.areaM2 > 0) return space.areaM2 * M2_TO_FT2;
  return 0;
}

function resolvePerimeterFt(space: SpaceTakeoffInput, areaFt2: number): number {
  if (space.lengthFt != null && space.widthFt != null && space.lengthFt > 0 && space.widthFt > 0) {
    return 2 * (space.lengthFt + space.widthFt);
  }
  // Approximate square room from area
  if (areaFt2 > 0) {
    const side = Math.sqrt(areaFt2);
    return 4 * side;
  }
  return 0;
}

function qtyForRule(
  rule: AssemblyRule,
  space: SpaceTakeoffInput,
  count: number,
  defaultHeightFt: number,
): number {
  const areaFt2 = resolveAreaFt2(space);
  const heightFt = space.heightFt && space.heightFt > 0 ? space.heightFt : defaultHeightFt;
  const perimeter = resolvePerimeterFt(space, areaFt2);
  const waste = rule.wasteFactor > 0 ? rule.wasteFactor : 1;

  switch (rule.kind) {
    case "per_space": {
      const base = rule.qtyPerUnit ?? 0;
      return roundMoney(base * count * waste);
    }
    case "blocks_wall": {
      const face = rule.blockFaceFt2 && rule.blockFaceFt2 > 0 ? rule.blockFaceFt2 : 0.889;
      const wallArea = perimeter * heightFt;
      if (wallArea <= 0) return 0;
      return Math.ceil((wallArea / face) * count * waste);
    }
    case "concrete_slab": {
      const thicknessFt = (rule.thicknessIn ?? 4) / 12;
      if (areaFt2 <= 0) return 0;
      const yd3 = (areaFt2 * thicknessFt) / 27;
      return roundMoney(yd3 * count * waste);
    }
    case "flooring_sf": {
      if (areaFt2 <= 0) return 0;
      return roundMoney(areaFt2 * count * waste);
    }
    case "paint_gallons": {
      const coverage = rule.coverageSfPerGal && rule.coverageSfPerGal > 0 ? rule.coverageSfPerGal : 350;
      const coats = rule.coats && rule.coats > 0 ? rule.coats : 2;
      const wallArea = perimeter * heightFt;
      if (wallArea <= 0) return 0;
      return roundMoney(((wallArea * coats) / coverage) * count * waste);
    }
    case "gypsum_sheets": {
      const sheetSf = rule.sheetSf && rule.sheetSf > 0 ? rule.sheetSf : 32;
      const wallArea = perimeter * heightFt;
      if (wallArea <= 0) return 0;
      return Math.ceil((wallArea / sheetSf) * count * waste);
    }
    default:
      return 0;
  }
}

/**
 * QuantityTakeoffEngine — puro, determinista, sin I/O.
 * Mismas entradas ⇒ mismas cantidades (bit-identical).
 */
export function computeTakeoff(
  spaces: SpaceTakeoffInput[],
  options: TakeoffOptions = {},
): QuantityLine[] {
  const rules = options.rules ?? TAKEOFF_RULES;
  const ruleById = new Map(rules.map((r) => [r.id, r]));
  const bySpace = options.ruleIdsBySpaceType ?? SPACE_TAKEOFF_RULES;
  const defaultHeightFt = options.defaultHeightFt ?? 8;
  const catalogUnits = options.catalogUnits ?? {};

  const lines: QuantityLine[] = [];

  for (const space of spaces) {
    const count = space.count && space.count > 0 ? space.count : 1;
    const ruleIds = bySpace[space.spaceType] ?? bySpace.otro ?? [];
    for (const ruleId of ruleIds) {
      const rule = ruleById.get(ruleId);
      if (!rule) continue;
      const quantity = qtyForRule(rule, space, count, defaultHeightFt);
      if (quantity <= 0) continue;
      const unit = catalogUnits[rule.catalogItemId]?.unit ?? inferUnit(rule.kind);
      lines.push({
        catalogItemId: rule.catalogItemId,
        quantity,
        unit,
        spaceId: space.id ?? null,
        sourceRuleId: rule.id,
      });
    }
  }

  // Stable sort for determinism
  lines.sort((a, b) => {
    const sa = `${a.spaceId ?? ""}\0${a.sourceRuleId}\0${a.catalogItemId}`;
    const sb = `${b.spaceId ?? ""}\0${b.sourceRuleId}\0${b.catalogItemId}`;
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });

  return lines;
}

function inferUnit(kind: AssemblyRule["kind"]): string {
  switch (kind) {
    case "blocks_wall":
      return "u";
    case "concrete_slab":
      return "yd³";
    case "flooring_sf":
      return "sf";
    case "paint_gallons":
      return "gal";
    case "gypsum_sheets":
      return "plancha";
    default:
      return "u";
  }
}

/**
 * Takeoff desde plantillas fijas MVP (qty_per_unit × count), sin dimensiones.
 * Útil para paridad con room-templates cuando no hay área/largo/ancho.
 */
export function computeTakeoffFromSuggestions(
  suggestions: Array<{ catalogId: string; quantityPerUnit: number }>,
  input: { spaceId?: string | null; count?: number; sourcePrefix?: string },
): QuantityLine[] {
  const count = input.count && input.count > 0 ? input.count : 1;
  const prefix = input.sourcePrefix ?? "mvp-suggest";
  return suggestions.map((s, i) => ({
    catalogItemId: s.catalogId,
    quantity: roundMoney(s.quantityPerUnit * count),
    unit: "u",
    spaceId: input.spaceId ?? null,
    sourceRuleId: `${prefix}:${s.catalogId}:${i}`,
  }));
}

export type RoomSuggestionQty = { catalogId: string; quantityPerUnit: number };

export type BuildRoomQuantityLinesInput = {
  spaceType: string;
  spaceId?: string | null;
  count?: number;
  areaM2?: number | null;
  lengthFt?: number | null;
  widthFt?: number | null;
  heightFt?: number | null;
  /** Plantillas fijas MVP (eléctricos, puertas, etc.). */
  suggestions: RoomSuggestionQty[];
  catalogUnits?: CatalogUnitLookup;
};

/**
 * Flujo de producto «Agregar ambiente»:
 * - Con área o largo×ancho → QuantityTakeoffEngine dimensional + sugerencias
 *   no cubiertas por reglas (p. ej. tomacorrientes, puertas).
 * - Sin dimensiones → solo plantillas fijas MVP.
 */
export function buildRoomQuantityLines(input: BuildRoomQuantityLinesInput): QuantityLine[] {
  const count = input.count && input.count > 0 ? input.count : 1;
  const areaM2 = input.areaM2 != null && input.areaM2 > 0 ? input.areaM2 : null;
  const hasLengthWidth =
    input.lengthFt != null &&
    input.widthFt != null &&
    input.lengthFt > 0 &&
    input.widthFt > 0;
  const hasDimensions = areaM2 != null || hasLengthWidth;

  if (!hasDimensions) {
    return computeTakeoffFromSuggestions(input.suggestions, {
      spaceId: input.spaceId,
      count,
      sourcePrefix: "mvp-suggest",
    });
  }

  const dimensional = computeTakeoff(
    [
      {
        id: input.spaceId ?? undefined,
        spaceType: input.spaceType,
        count,
        areaM2,
        lengthFt: input.lengthFt,
        widthFt: input.widthFt,
        heightFt: input.heightFt,
      },
    ],
    { catalogUnits: input.catalogUnits },
  );

  const covered = new Set(dimensional.map((l) => l.catalogItemId));
  const extras = input.suggestions.filter((s) => !covered.has(s.catalogId));
  const suggestionLines = computeTakeoffFromSuggestions(extras, {
    spaceId: input.spaceId,
    count,
    sourcePrefix: "mvp-suggest",
  });

  const merged = [...dimensional, ...suggestionLines];
  merged.sort((a, b) => {
    const sa = `${a.spaceId ?? ""}\0${a.sourceRuleId}\0${a.catalogItemId}`;
    const sb = `${b.spaceId ?? ""}\0${b.sourceRuleId}\0${b.catalogItemId}`;
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
  return merged;
}

export const QuantityTakeoffEngine = {
  computeTakeoff,
  computeTakeoffFromSuggestions,
  buildRoomQuantityLines,
};
