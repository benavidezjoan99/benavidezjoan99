import { roundMoney } from "@/lib/money";
import type { LaborInput, LaborResult } from "../types/estimate";

/**
 * LaborCostEngine — puro.
 * Soporta percent_of_materials (MVP), hourly, unit, fixed, hybrid stubs.
 */
export function computeLabor(materialsSubtotal: number, input: LaborInput): LaborResult {
  switch (input.mode) {
    case "percent_of_materials": {
      const total = roundMoney(materialsSubtotal * (input.percent / 100));
      return {
        mode: "percent_of_materials",
        total,
        breakdown: [
          {
            label: "percent_of_materials",
            amount: total,
            detail: `${input.percent}% de materiales`,
          },
        ],
      };
    }
    case "hourly": {
      const burden = input.burdenFactor ?? 1;
      const total = roundMoney(input.hours * input.rateUsdPerHour * burden);
      return {
        mode: "hourly",
        total,
        breakdown: [
          {
            label: "hourly",
            amount: total,
            detail: `${input.hours} h × $${input.rateUsdPerHour}/h × burden ${burden}`,
          },
        ],
      };
    }
    case "unit": {
      const burden = input.burdenFactor ?? 1;
      const total = roundMoney(input.quantity * input.rateUsdPerUnit * burden);
      return {
        mode: "unit",
        total,
        breakdown: [
          {
            label: "unit",
            amount: total,
            detail: `${input.quantity} ${input.unit} × $${input.rateUsdPerUnit} × burden ${burden}`,
          },
        ],
      };
    }
    case "fixed": {
      const total = roundMoney(input.amountUsd);
      return {
        mode: "fixed",
        total,
        breakdown: [{ label: "fixed", amount: total, detail: "Monto fijo" }],
      };
    }
    case "hybrid": {
      const breakdown: LaborResult["breakdown"] = [];
      let total = 0;
      if (input.percentOfMaterials != null && input.percentOfMaterials > 0) {
        const amt = roundMoney(materialsSubtotal * (input.percentOfMaterials / 100));
        total = roundMoney(total + amt);
        breakdown.push({
          label: "percent_of_materials",
          amount: amt,
          detail: `${input.percentOfMaterials}% de materiales`,
        });
      }
      for (const trade of input.trades ?? []) {
        const burden = trade.burdenFactor ?? 1;
        let amt = 0;
        let detail = trade.label ?? trade.kind;
        if (trade.kind === "hourly") {
          amt = roundMoney((trade.hours ?? 0) * (trade.rateUsdPerHour ?? 0) * burden);
          detail = `${trade.hours ?? 0} h × $${trade.rateUsdPerHour ?? 0}/h`;
        } else if (trade.kind === "unit") {
          amt = roundMoney((trade.quantity ?? 0) * (trade.rateUsdPerUnit ?? 0) * burden);
          detail = `${trade.quantity ?? 0} × $${trade.rateUsdPerUnit ?? 0}`;
        } else {
          amt = roundMoney(trade.amountUsd ?? 0);
          detail = "fijo";
        }
        total = roundMoney(total + amt);
        breakdown.push({ label: trade.label ?? trade.kind, amount: amt, detail });
      }
      return { mode: "hybrid", total, breakdown };
    }
    default: {
      const _exhaustive: never = input;
      void _exhaustive;
      return { mode: "fixed", total: 0, breakdown: [] };
    }
  }
}

export const LaborCostEngine = {
  computeLabor,
};
