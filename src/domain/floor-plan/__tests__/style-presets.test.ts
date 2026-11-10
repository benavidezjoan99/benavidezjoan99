import { describe, expect, it } from "vitest";
import {
  cabinetSkuForPack,
  floorSkuForPreset,
  hasFurniturePack,
  inferFloorTierFromSku,
  normalizeFurnitureStyle,
} from "../style-presets";

describe("floorSkuForPreset", () => {
  it("maps económico / medio / premium per room type", () => {
    expect(floorSkuForPreset("sala", "economico")).toBe("vinil-madera");
    expect(floorSkuForPreset("sala", "medio")).toBe("piso-laminado");
    expect(floorSkuForPreset("sala", "premium")).toBe("madera-ingenieria");
    expect(floorSkuForPreset("cocina", "economico")).toBe("ceramica-piso");
    expect(floorSkuForPreset("cocina", "premium")).toBe("porcelanato-lujo");
    expect(floorSkuForPreset("dormitorio", "economico")).toBe(
      "alfombra-residencial",
    );
    expect(floorSkuForPreset("bano", "medio")).toBe("porcelanato");
  });

  it("falls back for unknown room types", () => {
    expect(floorSkuForPreset("desconocido", "medio")).toBe("piso-laminado");
  });
});

describe("inferFloorTierFromSku", () => {
  it("detects active tier when SKU matches preset", () => {
    expect(inferFloorTierFromSku("sala", "piso-laminado")).toBe("medio");
    expect(inferFloorTierFromSku("cocina", "ceramica-piso")).toBe("economico");
  });

  it("returns null when SKU is unrelated", () => {
    expect(inferFloorTierFromSku("sala", "mystery-sku")).toBeNull();
    expect(inferFloorTierFromSku("sala", null)).toBeNull();
  });
});

describe("furniture packs", () => {
  it("exposes packs for sala, cocina, dormitorio, baño", () => {
    expect(hasFurniturePack("sala")).toBe(true);
    expect(hasFurniturePack("cocina")).toBe(true);
    expect(hasFurniturePack("dormitorio")).toBe(true);
    expect(hasFurniturePack("bano")).toBe(true);
    expect(hasFurniturePack("garage")).toBe(false);
  });

  it("maps cabinet / vanity / closet SKUs by style", () => {
    expect(cabinetSkuForPack("cocina", "basico")).toBe(
      "gabinetes-cocina-basico",
    );
    expect(cabinetSkuForPack("cocina", "moderno")).toBe("gabinetes-cocina");
    expect(cabinetSkuForPack("bano", "basico")).toBe("vanity-bano-basico");
    expect(cabinetSkuForPack("bano", "moderno")).toBe("vanity-bano");
    expect(cabinetSkuForPack("dormitorio", "moderno")).toBe("closet-sistema");
    expect(cabinetSkuForPack("sala", "moderno")).toBeNull();
  });

  it("normalizes furniture style", () => {
    expect(normalizeFurnitureStyle("basico")).toBe("basico");
    expect(normalizeFurnitureStyle("moderno")).toBe("moderno");
    expect(normalizeFurnitureStyle(null)).toBe("moderno");
    expect(normalizeFurnitureStyle("weird")).toBe("moderno");
  });
});
