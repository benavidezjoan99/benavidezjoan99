/** Redondeo monetario a 2 decimales (determinista). */
export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("es-PR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

/** Factor fijo documentado: 1 m² = 10.76391041671 ft² */
export const M2_TO_FT2 = 10.76391041671;

export function m2ToFt2(m2: number): number {
  return m2 * M2_TO_FT2;
}

export function ft2ToM2(ft2: number): number {
  return ft2 / M2_TO_FT2;
}
