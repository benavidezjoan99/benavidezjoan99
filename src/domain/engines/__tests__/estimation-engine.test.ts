import { describe, expect, it } from "vitest";
import {
  computeEstimateFromLines,
  computeFullEstimate,
  computeProjectTotals,
} from "../estimation-engine";

describe("EstimationEngine", () => {
  it("fixture A: hand-checked materials + 35% labor + 10% contingency", () => {
    // materials = 2*12.5 + 100*2.75 = 25 + 275 = 300
    // labor = 300 * 0.35 = 105
    // subtotal = 405; contingency = 40.5; grand = 445.5
    const lines = [
      { quantity: 2, unitPrice: 12.5, category: "cemento_agregados", spaceId: "a" },
      { quantity: 100, unitPrice: 2.75, category: "bloque_mamposteria", spaceId: "a" },
    ];
    const result = computeEstimateFromLines(lines, {
      labor: { mode: "percent_of_materials", percent: 35 },
      contingencyPercent: 10,
      approxM2: 100,
    });
    expect(result.materials).toBe(300);
    expect(result.labor).toBe(105);
    expect(result.contingency).toBe(40.5);
    expect(result.grandTotal).toBe(445.5);
    expect(result.costPerM2).toBe(4.46);
  });

  it("fixture B: second sample project (± $0.01)", () => {
    // ceramica 180 sf * $3.25 = 585; paint 3 * $42 = 126; drywall 12 * $14.5 = 174
    // materials = 885
    // labor 30% = 265.5
    // sub = 1150.5; cont 8% = 92.04; grand = 1242.54
    const lines = [
      { quantity: 180, unitPrice: 3.25, category: "acabados", spaceId: "sala" },
      { quantity: 3, unitPrice: 42, category: "pintura", spaceId: "sala" },
      { quantity: 12, unitPrice: 14.5, category: "acabados", spaceId: "sala" },
    ];
    const result = computeEstimateFromLines(lines, {
      labor: { mode: "percent_of_materials", percent: 30 },
      contingencyPercent: 8,
      approxM2: 85,
    });
    expect(result.materials).toBe(885);
    expect(result.labor).toBe(265.5);
    expect(result.contingency).toBe(92.04);
    expect(result.grandTotal).toBe(1242.54);
    expect(result.costPerM2).toBe(14.62);
  });

  it("does not double-count: contingency is on materials+labor only once", () => {
    const result = computeEstimateFromLines([{ quantity: 1, unitPrice: 100 }], {
      labor: { mode: "percent_of_materials", percent: 50 },
      contingencyPercent: 10,
      markupPercent: 0,
      ivuPercent: 0,
    });
    // mat 100 + labor 50 = 150; cont 15; total 165 — not applying % twice
    expect(result.grandTotal).toBe(165);
    expect(result.materials + result.labor + result.contingency).toBe(result.grandTotal);
  });

  it("computeProjectTotals matches EstimationEngine (MVP parity)", () => {
    const input = {
      materialLines: [
        { quantity: 10, unitPrice: 11.11 },
        { quantity: 3, unitPrice: 7.77 },
      ],
      laborPercent: 35,
      contingencyPercent: 10,
      approxM2: 50,
    };
    const a = computeProjectTotals(input);
    const b = computeEstimateFromLines(input.materialLines, {
      labor: { mode: "percent_of_materials", percent: 35 },
      contingencyPercent: 10,
      approxM2: 50,
    });
    expect(a.materials).toBe(b.materials);
    expect(a.labor).toBe(b.labor);
    expect(a.contingency).toBe(b.contingency);
    expect(a.grandTotal).toBe(b.grandTotal);
  });

  it("full pipeline takeoff→price→estimate is deterministic", () => {
    const catalog = [
      {
        id: "bloque-8",
        name: "Bloque 8",
        category: "bloque_mamposteria",
        unit: "u",
        unitPriceUsd: 2.75,
      },
      {
        id: "ceramica-piso",
        name: "Cerámica",
        category: "acabados",
        unit: "sf",
        unitPriceUsd: 3.25,
      },
      {
        id: "pintura-interior",
        name: "Pintura",
        category: "pintura",
        unit: "gal",
        unitPriceUsd: 42,
      },
      {
        id: "drywall-1-2",
        name: "Drywall",
        category: "acabados",
        unit: "plancha",
        unitPriceUsd: 14.5,
      },
    ];
    const input = {
      spaces: [
        {
          id: "s1",
          spaceType: "sala",
          count: 1,
          lengthFt: 14,
          widthFt: 12,
          heightFt: 8,
        },
      ],
      catalog,
      config: {
        labor: { mode: "percent_of_materials" as const, percent: 35 },
        contingencyPercent: 10,
        approxM2: 15.5,
      },
    };
    const a = computeFullEstimate(input);
    const b = computeFullEstimate(input);
    expect(a).toEqual(b);
    expect(a.grandTotal).toBeGreaterThan(0);
    expect(a.engineVersion).toBe("1.0.0");
  });
});
