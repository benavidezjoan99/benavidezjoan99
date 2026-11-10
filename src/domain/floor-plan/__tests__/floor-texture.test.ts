import { describe, expect, it } from "vitest";
import {
  defaultFloorTextureForRoomType,
  inferFloorTextureFromCatalog,
  resolveFloorTexture,
} from "../floor-texture";

describe("inferFloorTextureFromCatalog", () => {
  it("maps ceramic / porcelain to tile", () => {
    expect(
      inferFloorTextureFromCatalog({
        id: "ceramica-piso",
        name: "Cerámica de piso 12x12",
      }),
    ).toBe("tile");
    expect(
      inferFloorTextureFromCatalog({ id: "porcelanato", name: "Porcelanato" }),
    ).toBe("tile");
  });

  it("maps laminate / wood names to wood", () => {
    expect(
      inferFloorTextureFromCatalog({
        id: "piso-laminado",
        name: "Piso laminado tipo madera",
      }),
    ).toBe("wood");
  });

  it("maps engineered hardwood to woodDark and epoxy/luxury tile", () => {
    expect(
      inferFloorTextureFromCatalog({
        id: "madera-ingenieria",
        name: "Piso madera ingeniería",
      }),
    ).toBe("woodDark");
    expect(
      inferFloorTextureFromCatalog({
        id: "porcelanato-lujo",
        name: "Porcelanato gran formato / lujo",
      }),
    ).toBe("tileLarge");
    expect(
      inferFloorTextureFromCatalog({
        id: "piso-epoxico",
        name: "Piso epóxico / garage",
      }),
    ).toBe("epoxy");
  });

  it("maps carpet / alfombra to carpet", () => {
    expect(
      inferFloorTextureFromCatalog({
        id: "alfombra-residencial",
        name: "Alfombra residencial",
      }),
    ).toBe("carpet");
  });

  it("returns null when unknown", () => {
    expect(
      inferFloorTextureFromCatalog({ id: "mystery", name: "Acabado genérico" }),
    ).toBeNull();
  });
});

describe("resolveFloorTexture", () => {
  it("prefers catalog over room-type default", () => {
    expect(
      resolveFloorTexture({
        roomType: "dormitorio",
        catalogItem: { id: "ceramica-piso", name: "Cerámica" },
      }),
    ).toBe("tile");
  });

  it("falls back to room type", () => {
    expect(resolveFloorTexture({ roomType: "dormitorio" })).toBe("carpet");
    expect(resolveFloorTexture({ roomType: "sala" })).toBe("wood");
    expect(resolveFloorTexture({ roomType: "bano" })).toBe("tile");
    expect(resolveFloorTexture({ roomType: "garage" })).toBe("concrete");
  });

  it("defaultFloorTextureForRoomType covers all common types", () => {
    expect(defaultFloorTextureForRoomType("cocina")).toBe("wood");
    expect(defaultFloorTextureForRoomType("lavanderia")).toBe("tile");
    expect(defaultFloorTextureForRoomType("pasillo")).toBe("neutral");
  });
});
