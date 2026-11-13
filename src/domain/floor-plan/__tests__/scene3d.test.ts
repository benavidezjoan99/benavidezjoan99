import { describe, expect, it } from "vitest";
import {
  buildScene3D,
  findSharedOpening,
  floorColorForTexture,
  furnitureForRoom,
  wallSolidParts,
  type PlanRoom3DInput,
} from "../scene3d";

const sala: PlanRoom3DInput = {
  id: "r-sala",
  name: "Sala",
  roomType: "sala",
  planX: 2,
  planY: 2,
  planWFt: 14,
  planHFt: 12,
  floorCatalogItemId: "piso-laminado",
  wallColorId: "sage",
  furnitureStyle: "moderno",
  furnitureVisible: true,
};

const cocina: PlanRoom3DInput = {
  id: "r-cocina",
  name: "Cocina",
  roomType: "cocina",
  planX: 16,
  planY: 2,
  planWFt: 12,
  planHFt: 12,
  floorCatalogItemId: "ceramica-piso",
  wallColorId: "beige",
  furnitureStyle: "basico",
  furnitureVisible: true,
};

describe("scene3d mapping", () => {
  it("buildScene3D creates floors from plan rects", () => {
    const scene = buildScene3D([sala, cocina], {
      catalogById: {
        "piso-laminado": { id: "piso-laminado", name: "Piso laminado" },
        "ceramica-piso": { id: "ceramica-piso", name: "Cerámica" },
      },
    });
    expect(scene.floors).toHaveLength(2);
    expect(scene.floors[0].texture).toBe("wood");
    expect(scene.floors[1].texture).toBe("tile");
    expect(scene.center.x).toBeCloseTo(15, 0);
    expect(scene.wallHeightFt).toBe(8);
  });

  it("shared edge between adjacent rooms yields a door opening", () => {
    const scene = buildScene3D([sala, cocina]);
    const sharedWalls = scene.walls.filter((w) => w.shared);
    expect(sharedWalls.length).toBeGreaterThanOrEqual(1);
    const withDoor = sharedWalls.find((w) =>
      w.openings.some((o) => o.kind === "door"),
    );
    expect(withDoor).toBeTruthy();
  });

  it("exterior walls get window openings when long enough", () => {
    const scene = buildScene3D([sala]);
    const windows = scene.walls.flatMap((w) =>
      w.openings.filter((o) => o.kind === "window"),
    );
    expect(windows.length).toBeGreaterThan(0);
  });

  it("wall paint color resolves from wallColorId", () => {
    const scene = buildScene3D([sala]);
    expect(scene.walls[0].color.id).toBe("sage");
  });

  it("furniture proxies honor visibility and style packs", () => {
    const visible = furnitureForRoom(sala);
    expect(visible.some((f) => f.furnitureKind === "sofa")).toBe(true);
    expect(visible.some((f) => f.furnitureKind === "chair")).toBe(true);

    const hidden = furnitureForRoom({ ...sala, furnitureVisible: false });
    expect(hidden).toHaveLength(0);

    const basic = furnitureForRoom({ ...sala, furnitureStyle: "basico" });
    expect(basic.some((f) => f.furnitureKind === "chair")).toBe(false);
  });

  it("findSharedOpening detects opposing edges", () => {
    const edge = {
      roomId: "a",
      side: "east" as const,
      fixed: 16,
      start: 2,
      end: 14,
    };
    const others = [
      {
        roomId: "b",
        side: "west" as const,
        fixed: 16,
        start: 2,
        end: 14,
      },
    ];
    const hit = findSharedOpening(edge, others);
    expect(hit?.shared).toBe(true);
    expect(hit!.overlapLen).toBeGreaterThan(5);
  });

  it("wallSolidParts punches door and window voids", () => {
    const parts = wallSolidParts(12, 8, [
      { kind: "door", alongFt: 4.5, widthFt: 3, heightFt: 7, sillFt: 0 },
    ]);
    expect(parts.length).toBeGreaterThanOrEqual(2);
    const totalArea = parts.reduce((s, p) => s + p.w * p.h, 0);
    // Full wall 96; door void ~21 → remaining ~75
    expect(totalArea).toBeLessThan(12 * 8);
    expect(totalArea).toBeGreaterThan(60);

    const withWindow = wallSolidParts(12, 8, [
      {
        kind: "window",
        alongFt: 4,
        widthFt: 3.5,
        heightFt: 3.5,
        sillFt: 2.5,
      },
    ]);
    expect(withWindow.some((p) => p.y === 0 && p.h === 2.5)).toBe(true);
  });

  it("floorColorForTexture returns stable hexes", () => {
    expect(floorColorForTexture("wood")).toMatch(/^#/);
    expect(floorColorForTexture("tile")).toMatch(/^#/);
  });
});
