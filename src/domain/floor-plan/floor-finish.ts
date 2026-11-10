import { roundMoney } from "@/lib/money";
import {
  DEFAULT_FLOORING_WASTE,
  rectAreaFt2,
  rectAreaM2,
} from "./geometry";

export type FloorFinishCatalogItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPriceUsd: number;
};

export type FloorFinishQtyInput = {
  planWFt: number;
  planHFt: number;
  /** Factor de desperdicio (≥ 1). Default 1.1 */
  wasteFactor?: number;
  /** Unidad del ítem de catálogo (ft², sf, m², …). */
  unit: string;
};

export type FloorFinishQtyResult = {
  areaFt2: number;
  areaM2: number;
  quantity: number;
  unit: string;
};

const AREA_UNITS_FT2 = new Set(["ft²", "ft2", "sf", "sqft", "sq ft"]);
const AREA_UNITS_M2 = new Set(["m²", "m2", "m^2"]);

function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase();
}

/**
 * ¿El ítem se cotiza por área de piso? (ft² / sf / m²).
 * Gabinetes (pie lineal) y unidades sueltas quedan fuera del MVP de piso.
 */
export function isAreaFloorFinish(item: Pick<FloorFinishCatalogItem, "category" | "unit">): boolean {
  if (item.category !== "acabados") return false;
  const u = normalizeUnit(item.unit);
  return AREA_UNITS_FT2.has(u) || AREA_UNITS_M2.has(u);
}

/**
 * Cantidad de acabado de piso a partir de la geometría del ambiente.
 * Puro y determinista: mismas entradas ⇒ misma cantidad.
 */
export function flooringQuantityFromPlan(input: FloorFinishQtyInput): FloorFinishQtyResult {
  const waste =
    input.wasteFactor != null && input.wasteFactor > 0
      ? input.wasteFactor
      : DEFAULT_FLOORING_WASTE;
  const areaFt2 = rectAreaFt2(input.planWFt, input.planHFt);
  const areaM2 = rectAreaM2(input.planWFt, input.planHFt);
  const u = normalizeUnit(input.unit);

  let quantity: number;
  if (AREA_UNITS_M2.has(u)) {
    quantity = roundMoney(areaM2 * waste);
  } else {
    // Default: ft² / sf
    quantity = roundMoney(areaFt2 * waste);
  }

  return {
    areaFt2,
    areaM2,
    quantity,
    unit: input.unit,
  };
}

/** Filtra catálogo a acabados aplicables como piso en el MVP. */
export function filterFloorFinishCatalog(
  items: FloorFinishCatalogItem[],
): FloorFinishCatalogItem[] {
  return items.filter(isAreaFloorFinish).sort((a, b) => a.name.localeCompare(b.name, "es"));
}
