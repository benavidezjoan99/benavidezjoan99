import { describe, expect, it } from "vitest";
import {
  boundsOverlapXY,
  buildOpeningEntities,
  countPartsByRole,
  doorAssemblyParts,
  partBoundsXY,
  windowAssemblyParts,
} from "../openings3d";
import { buildScene3D, type PlanRoom3DInput } from "../scene3d";

const sala: PlanRoom3DInput = {
  id: "r-sala",
  name: "Sala",
  roomType: "sala",
  planX: 2,
  planY: 2,
  planWFt: 14,
  planHFt: 12,
  wallColorId: "sage",
};

const cocina: PlanRoom3DInput = {
  id: "r-cocina",
  name: "Cocina",
  roomType: "cocina",
  planX: 16,
  planY: 2,
  planWFt: 12,
  planHFt: 12,
  wallColorId: "beige",
};

describe("openings3d entities", () => {
  it("doorAssemblyParts includes frame, leaf, handle, threshold", () => {
    const parts = doorAssemblyParts(3, 7, 0.45);
    const counts = countPartsByRole(parts);
    expect(counts.frame).toBeGreaterThanOrEqual(3);
    expect(counts.leaf).toBeGreaterThanOrEqual(1);
    expect(counts.handle).toBe(1);
    expect(counts.threshold).toBe(1);
  });

  it("windowAssemblyParts includes frame, glass, sill, mullion", () => {
    const parts = windowAssemblyParts(3.5, 3.5, 0.45);
    const counts = countPartsByRole(parts);
    expect(counts.frame).toBeGreaterThanOrEqual(3);
    expect(counts.glass).toBe(4);
    expect(counts.sill).toBe(1);
    expect(counts.mullion).toBeGreaterThanOrEqual(2);
  });

  it("window frame sits inside the opening (no edge-centered jambs)", () => {
    const w = 3.5;
    const h = 3.5;
    const jamb = 0.11;
    const parts = windowAssemblyParts(w, h, 0.45);
    const left = parts.find((p) => p.id === "jamb-l")!;
    const right = parts.find((p) => p.id === "jamb-r")!;
    // Centros dentro del hueco, no en ±w/2 (que z-fight con el muro)
    expect(left.localPosition.x).toBeCloseTo(-w / 2 + jamb / 2, 5);
    expect(right.localPosition.x).toBeCloseTo(w / 2 - jamb / 2, 5);
    expect(Math.abs(left.localPosition.x)).toBeLessThan(w / 2);
    expect(Math.abs(right.localPosition.x)).toBeLessThan(w / 2);
  });

  it("window glass does not overlap frame/mullion in XY", () => {
    const parts = windowAssemblyParts(3.5, 3.5, 0.45);
    const glass = parts.filter((p) => p.role === "glass");
    const solids = parts.filter(
      (p) => p.role === "frame" || p.role === "mullion" || p.role === "sill",
    );
    for (const g of glass) {
      const gb = partBoundsXY(g);
      for (const s of solids) {
        expect(boundsOverlapXY(gb, partBoundsXY(s), 0.01)).toBe(false);
      }
    }
  });

  it("buildScene3D emits explicit opening entities", () => {
    const scene = buildScene3D([sala, cocina]);
    expect(scene.openings.length).toBeGreaterThan(0);
    const doors = scene.openings.filter((o) => o.openingKind === "door");
    const windows = scene.openings.filter((o) => o.openingKind === "window");
    expect(doors.length).toBeGreaterThanOrEqual(1);
    expect(windows.length).toBeGreaterThanOrEqual(1);
    expect(doors[0].parts.some((p) => p.role === "leaf")).toBe(true);
    expect(windows[0].parts.some((p) => p.role === "glass")).toBe(true);
  });

  it("buildOpeningEntities matches wall openings 1:1", () => {
    const scene = buildScene3D([sala]);
    const fromWalls = scene.walls.reduce((n, w) => n + w.openings.length, 0);
    expect(buildOpeningEntities(scene.walls)).toHaveLength(fromWalls);
  });
});
