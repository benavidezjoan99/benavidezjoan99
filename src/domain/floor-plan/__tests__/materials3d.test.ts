import { describe, expect, it } from "vitest";
import {
  floorMaterialSpec,
  floorUvRepeat,
  furnitureMaterialSpec,
  shadeHex,
  wallMaterialSpec,
} from "../materials3d";

describe("materials3d", () => {
  it("floorMaterialSpec differs by texture kind", () => {
    const wood = floorMaterialSpec("wood");
    const tile = floorMaterialSpec("tile");
    const epoxy = floorMaterialSpec("epoxy");
    expect(wood.roughness).toBeLessThan(tile.roughness);
    expect(epoxy.metalness).toBeGreaterThan(wood.metalness);
    expect(wood.tileFt).toBeGreaterThan(0);
    expect(wood.baseColor).toMatch(/^#/);
  });

  it("floorUvRepeat scales with room size", () => {
    const uv = floorUvRepeat(12, 10, 2);
    expect(uv.x).toBe(6);
    expect(uv.y).toBe(5);
    expect(floorUvRepeat(3, 3, 4).x).toBe(1);
  });

  it("wallMaterialSpec keeps swatch colors", () => {
    const w = wallMaterialSpec({ fill: "#d5e0d4", stroke: "#2f3d32" });
    expect(w.fill).toBe("#d5e0d4");
    expect(w.variation).toBeGreaterThan(0);
    expect(w.roughness).toBeGreaterThan(0.5);
  });

  it("furnitureMaterialSpec maps finish by kind", () => {
    expect(furnitureMaterialSpec("sofa", "#4a6fa5").finish).toBe("fabric");
    expect(furnitureMaterialSpec("table", "#a67c52").finish).toBe("wood");
    expect(furnitureMaterialSpec("stove", "#3a3a38").finish).toBe("metal");
    expect(furnitureMaterialSpec("tub", "#9ec9d9").finish).toBe("ceramic");
  });

  it("shadeHex lightens and darkens", () => {
    const base = "#808080";
    expect(shadeHex(base, 0.5)).not.toBe(base);
    expect(shadeHex(base, -0.5)).not.toBe(base);
    expect(shadeHex("nope", 0.2)).toBe("nope");
  });
});
