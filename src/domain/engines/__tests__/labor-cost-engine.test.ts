import { describe, expect, it } from "vitest";
import { computeLabor } from "../labor-cost-engine";

describe("LaborCostEngine", () => {
  it("percent_of_materials: 35% of 1000 = 350", () => {
    const r = computeLabor(1000, { mode: "percent_of_materials", percent: 35 });
    expect(r.total).toBe(350);
  });

  it("hourly stub: 40h × $25 × burden 1.3", () => {
    // 40*25*1.3 = 1300
    const r = computeLabor(0, {
      mode: "hourly",
      hours: 40,
      rateUsdPerHour: 25,
      burdenFactor: 1.3,
    });
    expect(r.total).toBe(1300);
  });

  it("unit stub: 100 sf × $2.5", () => {
    const r = computeLabor(0, {
      mode: "unit",
      quantity: 100,
      rateUsdPerUnit: 2.5,
      unit: "sf",
    });
    expect(r.total).toBe(250);
  });

  it("fixed stub", () => {
    const r = computeLabor(999, { mode: "fixed", amountUsd: 500.55 });
    expect(r.total).toBe(500.55);
  });

  it("hybrid combines percent + trades without double-count within labor", () => {
    // 10% of 1000 = 100; + 10h*$20 = 200; total 300
    const r = computeLabor(1000, {
      mode: "hybrid",
      percentOfMaterials: 10,
      trades: [{ kind: "hourly", hours: 10, rateUsdPerHour: 20, label: "albanil" }],
    });
    expect(r.total).toBe(300);
    expect(r.breakdown).toHaveLength(2);
  });
});
