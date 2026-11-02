import { describe, expect, it } from "vitest";
import { computeTakeoff, computeTakeoffFromSuggestions } from "../quantity-takeoff-engine";

describe("QuantityTakeoffEngine", () => {
  it("is deterministic (bit-identical) across two runs", () => {
    const spaces = [
      {
        id: "sala-1",
        spaceType: "sala",
        count: 1,
        lengthFt: 14,
        widthFt: 12,
        heightFt: 8,
      },
    ];
    const a = computeTakeoff(spaces);
    const b = computeTakeoff(spaces);
    expect(a).toEqual(b);
  });

  it("blocks_wall: hand-checked 14×12×8 room with 8\" blocks", () => {
    // perimeter = 2*(14+12)=52 ft; wall area = 52*8 = 416 ft²
    // block face 8"×16" = 0.888... ft²; raw = 416 / (8/12*16/12) = 468; *1.05 waste → ceil 492
    const lines = computeTakeoff([
      {
        id: "r1",
        spaceType: "sala",
        count: 1,
        lengthFt: 14,
        widthFt: 12,
        heightFt: 8,
      },
    ]);
    const blocks = lines.find((l) => l.sourceRuleId === "rule-blocks-8");
    expect(blocks).toBeDefined();
    const face = (8 / 12) * (16 / 12);
    const expected = Math.ceil((52 * 8) / face * 1 * 1.05);
    expect(blocks!.quantity).toBe(expected);
    expect(expected).toBe(492);
  });

  it("concrete_slab: hand-checked 20×20 garage 4\" slab", () => {
    // area 400 ft²; thickness 4/12 ft; yd³ = 400*(4/12)/27 = 4.938...; *1.08 = 5.333...
    const lines = computeTakeoff([
      {
        id: "g1",
        spaceType: "garage",
        count: 1,
        lengthFt: 20,
        widthFt: 20,
        heightFt: 8,
      },
    ]);
    const slab = lines.find((l) => l.sourceRuleId === "rule-concrete-slab");
    expect(slab).toBeDefined();
    const yd3 = (400 * (4 / 12)) / 27;
    const expected = Math.round((yd3 * 1.08 + Number.EPSILON) * 100) / 100;
    expect(slab!.quantity).toBe(expected);
    expect(expected).toBe(5.33);
  });

  it("flooring_sf: 12×10 dormitorio with 10% waste", () => {
    const lines = computeTakeoff([
      {
        id: "d1",
        spaceType: "dormitorio",
        count: 1,
        lengthFt: 12,
        widthFt: 10,
        heightFt: 8,
      },
    ]);
    const floor = lines.find((l) => l.sourceRuleId === "rule-flooring-ceramica");
    expect(floor!.quantity).toBe(132); // 120 * 1.1
  });

  it("paint_gallons: hand-checked wall area / coverage", () => {
    // 10×10×8 → peri=40; wall=320; coats=2 → 640; /350 *1.1 = 2.011...
    const lines = computeTakeoff([
      {
        id: "p1",
        spaceType: "pasillo",
        count: 1,
        lengthFt: 10,
        widthFt: 10,
        heightFt: 8,
      },
    ]);
    const paint = lines.find((l) => l.sourceRuleId === "rule-paint-interior");
    const expected = Math.round((((40 * 8 * 2) / 350) * 1.1 + Number.EPSILON) * 100) / 100;
    expect(paint!.quantity).toBe(expected);
  });

  it("gypsum_sheets: ceil(wallArea/32 * waste)", () => {
    // 12×10×8 → peri=44; wall=352; /32=11; *1.15=12.65 → ceil 13
    const lines = computeTakeoff([
      {
        id: "d1",
        spaceType: "dormitorio",
        count: 1,
        lengthFt: 12,
        widthFt: 10,
        heightFt: 8,
      },
    ]);
    const gypsum = lines.find((l) => l.sourceRuleId === "rule-gypsum-1-2");
    expect(gypsum!.quantity).toBe(13);
  });

  it("MVP suggestions path multiplies by count", () => {
    const lines = computeTakeoffFromSuggestions(
      [
        { catalogId: "bloque-8", quantityPerUnit: 100 },
        { catalogId: "pintura-interior", quantityPerUnit: 2 },
      ],
      { spaceId: "x", count: 2 },
    );
    expect(lines[0].quantity).toBe(200);
    expect(lines[1].quantity).toBe(4);
  });
});
