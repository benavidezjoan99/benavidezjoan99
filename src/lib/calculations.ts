import type { ProjectTotals } from "./types";

export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeTotals(input: {
  materialLines: Array<{ quantity: number; unitPrice: number }>;
  laborPercent: number;
  contingencyPercent: number;
  approxM2: number | null;
}): ProjectTotals {
  const materials = roundMoney(
    input.materialLines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0,
    ),
  );
  const labor = roundMoney(materials * (input.laborPercent / 100));
  const subtotal = materials + labor;
  const contingency = roundMoney(subtotal * (input.contingencyPercent / 100));
  const grandTotal = roundMoney(subtotal + contingency);
  const costPerM2 =
    input.approxM2 && input.approxM2 > 0
      ? roundMoney(grandTotal / input.approxM2)
      : null;

  return { materials, labor, contingency, grandTotal, costPerM2 };
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("es-PR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}
