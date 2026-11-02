import { m2ToFt2, roundMoney } from "@/lib/money";
import type {
  EstimateBreakdownRow,
  EstimateResult,
  EstimationConfig,
  MoneyLineInput,
} from "../types/estimate";
import { ENGINE_VERSION } from "../types/estimate";
import type { PricedLine } from "../types/pricing";
import { computeLabor } from "./labor-cost-engine";
import { priceQuantityLines, type CatalogItemMeta, type PriceLinesInput } from "./pricing-engine";
import {
  computeTakeoff,
  type SpaceTakeoffInput,
  type TakeoffOptions,
} from "./quantity-takeoff-engine";

function sumMaterials(lines: Array<{ quantity: number; unitPrice: number }>): number {
  return roundMoney(
    lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
  );
}

function allocateProRata(
  rows: Map<string, { label: string; materials: number }>,
  labor: number,
  contingency: number,
  markup: number,
  tax: number,
): EstimateBreakdownRow[] {
  const materialsTotal = roundMoney(
    [...rows.values()].reduce((s, r) => s + r.materials, 0),
  );
  const result: EstimateBreakdownRow[] = [];
  for (const [key, row] of rows) {
    const share = materialsTotal > 0 ? row.materials / materialsTotal : 0;
    const laborShare = roundMoney(labor * share);
    const contShare = roundMoney(contingency * share);
    const markupShare = roundMoney(markup * share);
    const taxShare = roundMoney(tax * share);
    result.push({
      key,
      label: row.label,
      materials: row.materials,
      laborShare,
      total: roundMoney(row.materials + laborShare + contShare + markupShare + taxShare),
    });
  }
  result.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return result;
}

/**
 * Totales a partir de líneas ya valorizadas.
 * Labor % solo sobre materiales; contingencia sobre (materiales + labor);
 * markup sobre (mat+labor+cont); tax sobre (mat+labor+cont+markup).
 * Sin doble conteo: cada bucket se calcula una vez sobre la base correcta.
 */
export function computeEstimateFromLines(
  materialLines: MoneyLineInput[],
  config: EstimationConfig,
): EstimateResult {
  const materials = sumMaterials(materialLines);
  const laborDetail = computeLabor(materials, config.labor);
  const labor = laborDetail.total;
  const subtotal = roundMoney(materials + labor);
  const contingency = roundMoney(subtotal * (config.contingencyPercent / 100));
  const afterContingency = roundMoney(subtotal + contingency);
  const markupPercent = config.markupPercent ?? 0;
  const markup = roundMoney(afterContingency * (markupPercent / 100));
  const afterMarkup = roundMoney(afterContingency + markup);
  const ivuPercent = config.ivuPercent ?? 0;
  const tax = roundMoney(afterMarkup * (ivuPercent / 100));
  const grandTotal = roundMoney(afterMarkup + tax);

  const approxM2 = config.approxM2 && config.approxM2 > 0 ? config.approxM2 : null;
  const approxFt2 =
    config.approxFt2 && config.approxFt2 > 0
      ? config.approxFt2
      : approxM2
        ? m2ToFt2(approxM2)
        : null;

  const costPerM2 = approxM2 ? roundMoney(grandTotal / approxM2) : null;
  const costPerFt2 = approxFt2 ? roundMoney(grandTotal / approxFt2) : null;

  const bySpaceMap = new Map<string, { label: string; materials: number }>();
  const byCategoryMap = new Map<string, { label: string; materials: number }>();

  for (const line of materialLines) {
    const spaceKey = line.spaceId ?? "__none__";
    const spaceLabel = line.spaceLabel ?? (line.spaceId ? line.spaceId : "General");
    const spaceRow = bySpaceMap.get(spaceKey) ?? { label: spaceLabel, materials: 0 };
    spaceRow.materials = roundMoney(
      spaceRow.materials + line.quantity * line.unitPrice,
    );
    bySpaceMap.set(spaceKey, spaceRow);

    const cat = line.category ?? "otro";
    const catRow = byCategoryMap.get(cat) ?? { label: cat, materials: 0 };
    catRow.materials = roundMoney(catRow.materials + line.quantity * line.unitPrice);
    byCategoryMap.set(cat, catRow);
  }

  const pricedLines: PricedLine[] = materialLines.map((line) => ({
    catalogItemId: null,
    description: "",
    category: line.category ?? "otro",
    unit: "",
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    extended: roundMoney(line.quantity * line.unitPrice),
    priceSource: line.priceSource ?? "manual",
    pricedAt: null,
    isEstimate: true,
    spaceId: line.spaceId ?? null,
    sourceRuleId: null,
  }));

  return {
    materials,
    labor,
    contingency,
    markup,
    tax,
    grandTotal,
    costPerM2,
    costPerFt2,
    bySpace: allocateProRata(bySpaceMap, labor, contingency, markup, tax),
    byCategory: allocateProRata(byCategoryMap, labor, contingency, markup, tax),
    lines: pricedLines,
    laborDetail,
    engineVersion: ENGINE_VERSION,
  };
}

export type FullEstimateInput = {
  spaces: SpaceTakeoffInput[];
  catalog: CatalogItemMeta[];
  config: EstimationConfig;
  takeoffOptions?: TakeoffOptions;
  pricing?: Omit<PriceLinesInput, "quantityLines" | "catalog">;
  /** Líneas manuales adicionales (ya en el proyecto). */
  existingLines?: MoneyLineInput[];
};

/**
 * Pipeline completo: takeoff → pricing → labor → markups.
 * Si se pasan existingLines, se suman a materiales (sin volver a tomar takeoff de esas).
 */
export function computeFullEstimate(input: FullEstimateInput): EstimateResult {
  const qty = computeTakeoff(input.spaces, input.takeoffOptions);
  const priced = priceQuantityLines({
    quantityLines: qty,
    catalog: input.catalog,
    prices: input.pricing?.prices,
    overrides: input.pricing?.overrides,
    manualLines: input.pricing?.manualLines,
  });

  const materialLines: MoneyLineInput[] = [
    ...priced.map((p) => ({
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      category: p.category,
      spaceId: p.spaceId,
      priceSource: p.priceSource,
    })),
    ...(input.existingLines ?? []),
  ];

  const result = computeEstimateFromLines(materialLines, input.config);
  return {
    ...result,
    lines: priced,
  };
}

/**
 * Compatibilidad con el MVP: mismos totales que el antiguo computeTotals.
 */
export function computeProjectTotals(input: {
  materialLines: Array<{ quantity: number; unitPrice: number }>;
  laborPercent: number;
  contingencyPercent: number;
  approxM2: number | null;
}): {
  materials: number;
  labor: number;
  contingency: number;
  grandTotal: number;
  costPerM2: number | null;
} {
  const result = computeEstimateFromLines(input.materialLines, {
    labor: { mode: "percent_of_materials", percent: input.laborPercent },
    contingencyPercent: input.contingencyPercent,
    approxM2: input.approxM2,
  });
  return {
    materials: result.materials,
    labor: result.labor,
    contingency: result.contingency,
    grandTotal: result.grandTotal,
    costPerM2: result.costPerM2,
  };
}

export const EstimationEngine = {
  computeEstimateFromLines,
  computeFullEstimate,
  computeProjectTotals,
};
