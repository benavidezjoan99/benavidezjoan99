import { describe, expect, it } from "vitest";
import {
  buildOpeningEntities,
  countPartsByRole,
  doorAssemblyParts,
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
