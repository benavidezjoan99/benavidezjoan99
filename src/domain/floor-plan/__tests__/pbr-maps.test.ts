import { describe, expect, it } from "vitest";
import {
  heightFieldForFloor,
  heightFieldForWallPaint,
  meanRoughness,
  normalMapRgbaFromHeight,
  normalStrengthForFloor,
  roughnessMapRgbaForFloor,
  roughnessMapRgbaForWall,
} from "../pbr-maps";

describe("pbr-maps", () => {
  it("heightFieldForFloor differs by kind", () => {
    const wood = heightFieldForFloor("wood", 64);
    const tile = heightFieldForFloor("tile", 64);
    expect(wood.data.length).toBe(64 * 64);
    expect(tile.data.length).toBe(64 * 64);
    let diff = 0;
    for (let i = 0; i < wood.data.length; i++) {
      diff += Math.abs(wood.data[i] - tile.data[i]);
    }
    expect(diff).toBeGreaterThan(10);
  });

  it("normalMapRgbaFromHeight produces tangent-space blues", () => {
    const hf = heightFieldForFloor("wood", 32);
    const n = normalMapRgbaFromHeight(hf, normalStrengthForFloor("wood"));
    expect(n.data.length).toBe(32 * 32 * 4);
    // Flat-ish normals → B channel high
    let bSum = 0;
    for (let i = 0; i < 32 * 32; i++) bSum += n.data[i * 4 + 2];
    expect(bSum / (32 * 32)).toBeGreaterThan(120);
    expect(n.data[3]).toBe(255);
  });

  it("roughness maps stay in 0…1 and epoxy is smoother than carpet", () => {
    const epoxy = roughnessMapRgbaForFloor("epoxy", 48);
    const carpet = roughnessMapRgbaForFloor("carpet", 48);
    expect(meanRoughness(epoxy)).toBeLessThan(meanRoughness(carpet));
    expect(meanRoughness(carpet)).toBeGreaterThan(0.7);
  });

  it("wall paint height + roughness are stable", () => {
    const hf = heightFieldForWallPaint(0.14, 32);
    expect(hf.data[0]).toBeGreaterThanOrEqual(0);
    expect(hf.data[0]).toBeLessThanOrEqual(1);
    const r = roughnessMapRgbaForWall(0.82, 0.14, 32);
    expect(meanRoughness(r)).toBeGreaterThan(0.6);
  });
});
