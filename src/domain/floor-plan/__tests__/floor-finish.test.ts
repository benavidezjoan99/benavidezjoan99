import { describe, expect, it } from "vitest";
import {
  filterFloorFinishCatalog,
  flooringQuantityFromPlan,
  isAreaFloorFinish,
} from "../floor-finish";
import { DEFAULT_FLOORING_WASTE } from "../geometry";

describe("flooringQuantityFromPlan", () => {
  it("geometry → areaFt2 → qty with 10% waste (determinista)", () => {
    const a = flooringQuantityFromPlan({
      planWFt: 12,
      planHFt: 10,
      unit: "ft²",
    });
    const b = flooringQuantityFromPlan({
      planWFt: 12,
      planHFt: 10,
      unit: "ft²",
    });
    expect(a).toEqual(b);
    expect(a.areaFt2).toBe(120);
    expect(a.quantity).toBe(Math.round(120 * DEFAULT_FLOORING_WASTE * 100) / 100);
    expect(a.quantity).toBe(132);
  });

  it("uses m² when catalog unit is metric", () => {
    const r = flooringQuantityFromPlan({
      planWFt: 10,
      planHFt: 10,
      unit: "m²",
      wasteFactor: 1,
    });
    expect(r.areaFt2).toBe(100);
    // 100 ft² / 10.7639… ≈ 9.29 m²
    expect(r.quantity).toBe(r.areaM2);
    expect(r.quantity).toBeGreaterThan(9);
    expect(r.quantity).toBeLessThan(10);
  });

  it("sf unit behaves like ft²", () => {
    const r = flooringQuantityFromPlan({ planWFt: 8, planHFt: 8, unit: "sf" });
    expect(r.quantity).toBe(70.4); // 64 * 1.1
  });
});

describe("isAreaFloorFinish / filterFloorFinishCatalog", () => {
  it("accepts acabados sold by area", () => {
    expect(
      isAreaFloorFinish({ category: "acabados", unit: "ft²" }),
    ).toBe(true);
    expect(
      isAreaFloorFinish({ category: "acabados", unit: "ft lineal" }),
    ).toBe(false);
    expect(
      isAreaFloorFinish({ category: "pintura", unit: "ft²" }),
    ).toBe(false);
  });

  it("filters catalog to floor finishes", () => {
    const items = [
      {
        id: "ceramica-piso",
        name: "Cerámica",
        category: "acabados",
        unit: "ft²",
        unitPriceUsd: 2.85,
      },
      {
        id: "gabinetes-cocina",
        name: "Gabinetes",
        category: "acabados",
        unit: "ft lineal",
        unitPriceUsd: 95,
      },
      {
        id: "bloque-8",
        name: "Bloque",
        category: "bloque_mamposteria",
        unit: "u",
        unitPriceUsd: 2,
      },
    ];
    const filtered = filterFloorFinishCatalog(items);
    expect(filtered.map((i) => i.id)).toEqual(["ceramica-piso"]);
  });
});
