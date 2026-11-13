import type { FloorTextureKind } from "./floor-texture";
import type { FurnitureKind3D } from "./scene3d";
import { floorColorForTexture } from "./scene3d";

/** Parámetros de material PBR para pisos 3D (sin Three.js — testeable). */
export type FloorMaterialSpec = {
  kind: FloorTextureKind;
  baseColor: string;
  roughness: number;
  metalness: number;
  /** Tamaño del tile de textura en pies (UV repeat = sizeFt / tileFt). */
  tileFt: number;
  /** Ligero bump/contrast hint para el generador de canvas. */
  contrast: "low" | "medium" | "high";
};

export type WallMaterialSpec = {
  fill: string;
  stroke: string;
  roughness: number;
  metalness: number;
  /** Intensidad de variación / “rodillo” en la textura procedural. */
  variation: number;
};

export type FurnitureMaterialSpec = {
  color: string;
  roughness: number;
  metalness: number;
  /** Acabado visual para el generador (tela, madera, metal, etc.). */
  finish: "fabric" | "wood" | "metal" | "ceramic" | "plastic" | "stone";
};

/**
 * Spec PBR de piso alineado a FloorTextureKind del croquis 2D.
 */
export function floorMaterialSpec(kind: FloorTextureKind): FloorMaterialSpec {
  const baseColor = floorColorForTexture(kind);
  switch (kind) {
    case "wood":
      return {
        kind,
        baseColor,
        roughness: 0.48,
        metalness: 0.02,
        tileFt: 2.4,
        contrast: "medium",
      };
    case "woodDark":
      return {
        kind,
        baseColor,
        roughness: 0.42,
        metalness: 0.03,
        tileFt: 2.2,
        contrast: "high",
      };
    case "tile":
      return {
        kind,
        baseColor,
        roughness: 0.62,
        metalness: 0.04,
        tileFt: 1.5,
        contrast: "medium",
      };
    case "tileLarge":
      return {
        kind,
        baseColor,
        roughness: 0.55,
        metalness: 0.05,
        tileFt: 2.8,
        contrast: "medium",
      };
    case "carpet":
      return {
        kind,
        baseColor,
        roughness: 0.92,
        metalness: 0,
        tileFt: 1.8,
        contrast: "low",
      };
    case "concrete":
      return {
        kind,
        baseColor,
        roughness: 0.88,
        metalness: 0.02,
        tileFt: 4,
        contrast: "low",
      };
    case "epoxy":
      return {
        kind,
        baseColor,
        roughness: 0.22,
        metalness: 0.18,
        tileFt: 5,
        contrast: "low",
      };
    default:
      return {
        kind,
        baseColor,
        roughness: 0.8,
        metalness: 0.02,
        tileFt: 3,
        contrast: "low",
      };
  }
}

/** Repeticiones UV según tamaño del ambiente en pies. */
export function floorUvRepeat(
  widthFt: number,
  depthFt: number,
  tileFt: number,
): { x: number; y: number } {
  const t = tileFt > 0 ? tileFt : 2;
  return {
    x: Math.max(1, widthFt / t),
    y: Math.max(1, depthFt / t),
  };
}

/**
 * Spec de pintura de pared a partir del swatch 2D (fill/stroke).
 */
export function wallMaterialSpec(input: {
  fill: string;
  stroke: string;
}): WallMaterialSpec {
  return {
    fill: input.fill,
    stroke: input.stroke,
    roughness: 0.82,
    metalness: 0.01,
    variation: 0.14,
  };
}

/**
 * Spec de mueble por tipo + color base del pack 2D.
 */
export function furnitureMaterialSpec(
  furnitureKind: FurnitureKind3D,
  color: string,
): FurnitureMaterialSpec {
  switch (furnitureKind) {
    case "sofa":
    case "chair":
      return { color, roughness: 0.78, metalness: 0.02, finish: "fabric" };
    case "table":
    case "nightstand":
    case "cabinet":
    case "island":
    case "bed":
    case "vanity":
      return { color, roughness: 0.45, metalness: 0.04, finish: "wood" };
    case "stove":
    case "appliance":
      return { color, roughness: 0.28, metalness: 0.55, finish: "metal" };
    case "tub":
    case "toilet":
      return { color, roughness: 0.25, metalness: 0.08, finish: "ceramic" };
    default:
      return { color, roughness: 0.6, metalness: 0.05, finish: "plastic" };
  }
}

/** Aclara u oscurece un hex (#rrggbb) por factor (−1…1). */
export function shadeHex(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const adj = (c: number) => {
    if (amount >= 0) return Math.round(c + (255 - c) * amount);
    return Math.round(c * (1 + amount));
  };
  const to = (c: number) => adj(c).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
