import { computeProjectTotals } from "@/domain/engines/estimation-engine";
import type { ProjectTotals } from "./types";

export { formatUsd, roundMoney } from "@/lib/money";

/**
 * Compatibilidad MVP — delega en EstimationEngine (sin doble conteo).
 */
export function computeTotals(input: {
  materialLines: Array<{ quantity: number; unitPrice: number }>;
  laborPercent: number;
  contingencyPercent: number;
  approxM2: number | null;
}): ProjectTotals {
  return computeProjectTotals(input);
}
