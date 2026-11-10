import { ft2ToM2, m2ToFt2, roundMoney } from "@/lib/money";

/** Escala canvas: píxeles por pie (solo presentación; la lógica usa ft). */
export const PLAN_PX_PER_FT = 14;

/** Desperdicio por defecto para piso (alineado a rule-flooring-ceramica). */
export const DEFAULT_FLOORING_WASTE = 1.1;

/** Tamaño mínimo de ambiente en el croquis (ft). */
export const MIN_ROOM_FT = 4;

/** Snap de redimensionado / movimiento (ft). */
export const PLAN_SNAP_FT = 0.5;

export type PlanRect = {
  planX: number;
  planY: number;
  planWFt: number;
  planHFt: number;
};

export function snapFt(value: number, snap: number = PLAN_SNAP_FT): number {
  if (snap <= 0) return value;
  return Math.round(value / snap) * snap;
}

export function clampRoomSize(ft: number): number {
  if (!Number.isFinite(ft) || ft < MIN_ROOM_FT) return MIN_ROOM_FT;
  return snapFt(ft);
}

/** Área del rectángulo en ft². */
export function rectAreaFt2(widthFt: number, heightFt: number): number {
  const w = Math.max(0, widthFt);
  const h = Math.max(0, heightFt);
  return roundMoney(w * h);
}

export function rectAreaM2(widthFt: number, heightFt: number): number {
  return roundMoney(ft2ToM2(rectAreaFt2(widthFt, heightFt)));
}

export function planRectFromAreaM2(
  areaM2: number,
  aspectW = 12,
  aspectH = 10,
): { planWFt: number; planHFt: number } {
  if (!areaM2 || areaM2 <= 0) {
    return { planWFt: aspectW, planHFt: aspectH };
  }
  const areaFt2 = m2ToFt2(areaM2);
  const ratio = aspectW / aspectH;
  const h = Math.sqrt(areaFt2 / ratio);
  const w = areaFt2 / h;
  return {
    planWFt: clampRoomSize(w),
    planHFt: clampRoomSize(h),
  };
}

/**
 * Coloca un ambiente nuevo sin solapar groseramente los existentes.
 * Origen del croquis en (2, 2) ft con separación horizontal.
 */
export function nextPlanPlacement(
  existing: PlanRect[],
  defaultW = 12,
  defaultH = 10,
): PlanRect {
  const gap = 2;
  let x = 2;
  let y = 2;
  if (existing.length === 0) {
    return { planX: x, planY: y, planWFt: defaultW, planHFt: defaultH };
  }
  const maxRight = Math.max(...existing.map((r) => r.planX + r.planWFt));
  x = snapFt(maxRight + gap);
  if (x + defaultW > 80) {
    x = 2;
    const maxBottom = Math.max(...existing.map((r) => r.planY + r.planHFt));
    y = snapFt(maxBottom + gap);
  }
  return { planX: x, planY: y, planWFt: defaultW, planHFt: defaultH };
}

export function normalizePlanRect(input: Partial<PlanRect>): PlanRect {
  return {
    planX: snapFt(Number(input.planX) || 0),
    planY: snapFt(Number(input.planY) || 0),
    planWFt: clampRoomSize(Number(input.planWFt) || MIN_ROOM_FT),
    planHFt: clampRoomSize(Number(input.planHFt) || MIN_ROOM_FT),
  };
}

/** ft → px en el lienzo. */
export function ftToPx(ft: number, scale = PLAN_PX_PER_FT): number {
  return ft * scale;
}

export function pxToFt(px: number, scale = PLAN_PX_PER_FT): number {
  return px / scale;
}

export { ft2ToM2, m2ToFt2 };
