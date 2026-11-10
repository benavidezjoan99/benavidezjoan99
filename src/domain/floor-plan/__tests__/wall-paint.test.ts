import { describe, expect, it } from "vitest";
import {
  filterWallPaintCatalog,
  isInteriorWallPaint,
  resolveWallColor,
  wallPaintQuantityFromPlan,
} from "../wall-paint";

describe("isInteriorWallPaint", () => {
  it("accepts interior latex gallons and buckets", () => {
    expect(
      isInteriorWallPaint({
        id: "pintura-interior",
        name: "Pintura interior látex",
        category: "pintura",
        unit: "gal",
      }),
    ).toBe(true);
    expect(
      isInteriorWallPaint({
        id: "pintura-interior-5gal",
        name: "Pintura interior (cubeta 5 gal)",
        category: "pintura",
        unit: "cubeta",
      }),
    ).toBe(true);
  });

  it("rejects exterior, roof, and supply kits", () => {
    expect(
      isInteriorWallPaint({
        id: "pintura-exterior",
        name: "Pintura exterior",
        category: "pintura",
        unit: "gal",
      }),
    ).toBe(false);
    expect(
      isInteriorWallPaint({
        id: "pintura-techo",
        name: "Pintura techo",
        category: "pintura",
        unit: "gal",
      }),
    ).toBe(false);
    expect(
      isInteriorWallPaint({
        id: "cinta-pintor",
        name: "Cinta de pintor",
        category: "pintura",
        unit: "rollo",
      }),
    ).toBe(false);
  });
});

describe("wallPaintQuantityFromPlan", () => {
  it("computes gallons from perimeter × height × coats / coverage", () => {
    // 12×10 → perimeter 44; ×8 = 352 sf; ×2 coats / 350 × 1.1
    const r = wallPaintQuantityFromPlan({
      planWFt: 12,
      planHFt: 10,
      unit: "gal",
    });
    expect(r.wallAreaFt2).toBe(352);
    // roundMoney(2 decimals): ((352*2)/350)*1.1 ≈ 2.21257 → 2.21
    expect(r.quantity).toBe(2.21);
  });

  it("converts to 5-gal buckets with ceil", () => {
    const r = wallPaintQuantityFromPlan({
      planWFt: 20,
      planHFt: 20,
      unit: "cubeta",
    });
    // perimeter 80 × 8 = 640; gallons = 640*2/350*1.1 ≈ 4.022 → 1 cubeta
    expect(r.quantity).toBe(1);
  });
});

describe("filterWallPaintCatalog", () => {
  it("keeps only interior wall paints", () => {
    const filtered = filterWallPaintCatalog([
      {
        id: "pintura-interior",
        name: "Interior",
        category: "pintura",
        unit: "gal",
        unitPriceUsd: 38,
      },
      {
        id: "pintura-exterior",
        name: "Exterior",
        category: "pintura",
        unit: "gal",
        unitPriceUsd: 45,
      },
      {
        id: "ceramica-piso",
        name: "Cerámica",
        category: "acabados",
        unit: "ft²",
        unitPriceUsd: 3,
      },
    ]);
    expect(filtered.map((i) => i.id)).toEqual(["pintura-interior"]);
  });
});

describe("resolveWallColor", () => {
  it("prefers explicit wallColorId", () => {
    expect(
      resolveWallColor({
        wallColorId: "sage",
        catalogItem: { id: "pintura-interior-gris", name: "Gris" },
      }).id,
    ).toBe("sage");
  });

  it("infers from catalog name/sku", () => {
    expect(
      resolveWallColor({
        catalogItem: { id: "pintura-interior-azul", name: "Azul suave" },
      }).id,
    ).toBe("azul");
    expect(
      resolveWallColor({
        catalogItem: { id: "x", name: "Pintura beige arena" },
      }).id,
    ).toBe("beige");
  });

  it("defaults to blanco cálido", () => {
    expect(resolveWallColor({}).id).toBe("blanco");
  });
});
