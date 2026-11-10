import { describe, expect, it } from "vitest";
import {
  clampRoomSize,
  nextPlanPlacement,
  normalizePlanRect,
  rectAreaFt2,
  rectAreaM2,
  snapFt,
} from "../geometry";
import { ft2ToM2 } from "@/lib/money";

describe("floor-plan geometry", () => {
  it("rectAreaFt2 is width × height (rounded)", () => {
    expect(rectAreaFt2(12, 10)).toBe(120);
    expect(rectAreaFt2(14.5, 11)).toBe(159.5);
  });

  it("rectAreaM2 matches ft2ToM2 of area", () => {
    const ft2 = rectAreaFt2(12, 10);
    expect(rectAreaM2(12, 10)).toBe(Math.round((ft2ToM2(ft2) + Number.EPSILON) * 100) / 100);
  });

  it("snapFt snaps to 0.5 by default", () => {
    expect(snapFt(12.24)).toBe(12);
    expect(snapFt(12.3)).toBe(12.5);
  });

  it("clampRoomSize enforces minimum 4 ft", () => {
    expect(clampRoomSize(1)).toBe(4);
    expect(clampRoomSize(9.2)).toBe(9);
  });

  it("normalizePlanRect fills defaults and clamps", () => {
    const r = normalizePlanRect({ planX: 1.2, planY: 3.7, planWFt: 2, planHFt: 20.4 });
    expect(r.planX).toBe(1);
    expect(r.planY).toBe(3.5);
    expect(r.planWFt).toBe(4);
    expect(r.planHFt).toBe(20.5);
  });

  it("nextPlanPlacement puts first room at 2,2 and next to the right", () => {
    const a = nextPlanPlacement([]);
    expect(a).toEqual({ planX: 2, planY: 2, planWFt: 12, planHFt: 10 });
    const b = nextPlanPlacement([a]);
    expect(b.planX).toBe(16);
    expect(b.planY).toBe(2);
  });
});
