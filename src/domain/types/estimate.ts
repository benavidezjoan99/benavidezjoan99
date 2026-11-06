import type { PricedLine, PriceSource } from "./pricing";

export type LaborMode = "percent_of_materials" | "hourly" | "unit" | "fixed" | "hybrid";

export type LaborInput =
  | { mode: "percent_of_materials"; percent: number }
  | {
      mode: "hourly";
      hours: number;
      rateUsdPerHour: number;
      /** Multiplier on wages (taxes, insurance). Default 1. */
      burdenFactor?: number;
    }
  | {
      mode: "unit";
      quantity: number;
      rateUsdPerUnit: number;
      unit: string;
      burdenFactor?: number;
    }
  | {
      mode: "fixed";
      amountUsd: number;
    }
  | {
      mode: "hybrid";
      percentOfMaterials?: number;
      trades?: Array<{
        kind: "hourly" | "unit" | "fixed";
        hours?: number;
        rateUsdPerHour?: number;
        quantity?: number;
        rateUsdPerUnit?: number;
        amountUsd?: number;
        burdenFactor?: number;
        label?: string;
      }>;
    };

export type LaborResult = {
  mode: LaborMode;
  total: number;
  breakdown: Array<{ label: string; amount: number; detail?: string }>;
};

export type EstimateBreakdownRow = {
  key: string;
  label: string;
  materials: number;
  laborShare: number;
  total: number;
};

export type EstimateResult = {
  materials: number;
  labor: number;
  contingency: number;
  markup: number;
  tax: number;
  grandTotal: number;
  costPerM2: number | null;
  costPerFt2: number | null;
  bySpace: EstimateBreakdownRow[];
  byCategory: EstimateBreakdownRow[];
  lines: PricedLine[];
  laborDetail: LaborResult;
  engineVersion: string;
};

export type EstimationConfig = {
  labor: LaborInput;
  contingencyPercent: number;
  /** Professional markup % over (materials + labor + contingency). Default 0. */
  markupPercent?: number;
  /** Optional IVU / sales tax % over taxable base. Default 0. */
  ivuPercent?: number;
  approxM2?: number | null;
  approxFt2?: number | null;
};

export type MoneyLineInput = {
  quantity: number;
  unitPrice: number;
  category?: string;
  spaceId?: string | null;
  spaceLabel?: string;
  priceSource?: PriceSource;
};

export const ENGINE_VERSION = "1.0.0";
