import type { FloorTextureKind } from "./floor-texture";
import { floorMaterialSpec } from "./materials3d";

/**
 * Generadores PBR procedurales (albedo hints + height → normal + roughness).
 * Puros / sin DOM — testeables en Vitest. El cliente envuelve en CanvasTexture.
 */

export type HeightField = {
  width: number;
  height: number;
  /** Valores 0…1 */
  data: Float32Array;
};

export type RgbaBuffer = {
  width: number;
  height: number;
  /** length = width * height * 4 */
  data: Uint8ClampedArray;
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash2(x0, y0);
  const b = hash2(x0 + 1, y0);
  const c = hash2(x0, y0 + 1);
  const d = hash2(x0 + 1, y0 + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number, octaves = 4): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

/** Height field de piso según FloorTextureKind (misma familia que croquis 2D). */
export function heightFieldForFloor(
  kind: FloorTextureKind,
  size = 128,
): HeightField {
  const data = new Float32Array(size * size);
  const plank = Math.max(8, Math.round(size / 8));
  const tile = kind === "tileLarge" ? Math.round(size / 2.5) : Math.round(size / 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let h = 0.5;
      switch (kind) {
        case "wood":
        case "woodDark": {
          const row = Math.floor(y / plank);
          const seam = y % plank < 2 ? 0.15 : 0;
          const offset = row % 2 === 0 ? 0 : Math.round(size / 3);
          const boardSeam = (x + offset) % Math.round(size / 2.5) < 2 ? 0.12 : 0;
          const grain = fbm(x * 0.35, y * 0.08, 3) * 0.25;
          h = 0.55 - seam - boardSeam + grain;
          break;
        }
        case "tile":
        case "tileLarge": {
          const gx = x % tile;
          const gy = y % tile;
          const grout = gx < 3 || gy < 3 ? 0.2 : 0.62;
          const micro = fbm(x * 0.2, y * 0.2, 2) * 0.08;
          h = grout + micro;
          break;
        }
        case "carpet": {
          h = 0.45 + fbm(x * 0.6, y * 0.6, 4) * 0.35;
          break;
        }
        case "concrete": {
          h = 0.48 + fbm(x * 0.12, y * 0.12, 5) * 0.22;
          if (hash2(x, y) > 0.97) h -= 0.08;
          break;
        }
        case "epoxy": {
          h = 0.52 + fbm(x * 0.05, y * 0.05, 2) * 0.06;
          break;
        }
        default:
          h = 0.5 + fbm(x * 0.1, y * 0.1, 2) * 0.05;
      }
      data[y * size + x] = clamp01(h);
    }
  }
  return { width: size, height: size, data };
}

/** Height field suave para pintura de pared (rodillo + ruido). */
export function heightFieldForWallPaint(
  variation = 0.14,
  size = 128,
): HeightField {
  const data = new Float32Array(size * size);
  const v = Math.max(0.05, Math.min(0.4, variation));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const roller = Math.sin(y * 0.45) * 0.5 + 0.5;
      const noise = fbm(x * 0.2, y * 0.15, 3);
      data[y * size + x] = clamp01(0.5 + (roller - 0.5) * v + (noise - 0.5) * v);
    }
  }
  return { width: size, height: size, data };
}

/**
 * Normal map RGBA (tangent-space) desde height field.
 * Canal R=X, G=Y, B=Z apuntando hacia afuera; A=255.
 */
export function normalMapRgbaFromHeight(
  hf: HeightField,
  strength = 2.5,
): RgbaBuffer {
  const { width: w, height: h, data } = hf;
  const out = new Uint8ClampedArray(w * h * 4);
  const sample = (x: number, y: number) => {
    const xx = Math.max(0, Math.min(w - 1, x));
    const yy = Math.max(0, Math.min(h - 1, y));
    return data[yy * w + xx];
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (sample(x + 1, y) - sample(x - 1, y)) * strength;
      const dy = (sample(x, y + 1) - sample(x, y - 1)) * strength;
      // Normal ≈ (-dx, -dy, 1)
      let nx = -dx;
      let ny = -dy;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;
      const i = (y * w + x) * 4;
      out[i] = Math.round((nx * 0.5 + 0.5) * 255);
      out[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      out[i + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      out[i + 3] = 255;
    }
  }
  return { width: w, height: h, data: out };
}

/** Roughness map grayscale RGBA (R=G=B=roughness*255). */
export function roughnessMapRgbaForFloor(
  kind: FloorTextureKind,
  size = 128,
): RgbaBuffer {
  const spec = floorMaterialSpec(kind);
  const base = spec.roughness;
  const hf = heightFieldForFloor(kind, size);
  const out = new Uint8ClampedArray(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    // Juntas / valles → más rough; crestas → un poco menos
    const h = hf.data[i];
    let r = base;
    if (kind === "wood" || kind === "woodDark") {
      r = clamp01(base + (0.55 - h) * 0.25);
    } else if (kind === "tile" || kind === "tileLarge") {
      r = h < 0.35 ? clamp01(base + 0.25) : clamp01(base - 0.08);
    } else if (kind === "epoxy") {
      r = clamp01(base + (h - 0.5) * 0.1);
    } else if (kind === "carpet") {
      r = clamp01(0.85 + h * 0.12);
    } else {
      r = clamp01(base + (0.5 - h) * 0.15);
    }
    const v = Math.round(r * 255);
    const o = i * 4;
    out[o] = v;
    out[o + 1] = v;
    out[o + 2] = v;
    out[o + 3] = 255;
  }
  return { width: size, height: size, data: out };
}

export function roughnessMapRgbaForWall(
  baseRoughness = 0.82,
  variation = 0.14,
  size = 128,
): RgbaBuffer {
  const hf = heightFieldForWallPaint(variation, size);
  const out = new Uint8ClampedArray(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const r = clamp01(baseRoughness + (hf.data[i] - 0.5) * 0.2);
    const v = Math.round(r * 255);
    const o = i * 4;
    out[o] = v;
    out[o + 1] = v;
    out[o + 2] = v;
    out[o + 3] = 255;
  }
  return { width: size, height: size, data: out };
}

/** Intensidad de normal map sugerida por tipo de piso. */
export function normalStrengthForFloor(kind: FloorTextureKind): number {
  switch (kind) {
    case "wood":
    case "woodDark":
      return 3.2;
    case "tile":
    case "tileLarge":
      return 4.0;
    case "carpet":
      return 2.2;
    case "concrete":
      return 2.8;
    case "epoxy":
      return 1.2;
    default:
      return 1.5;
  }
}

/** Media de roughness del mapa (para tests / debug). */
export function meanRoughness(map: RgbaBuffer): number {
  let sum = 0;
  const n = map.width * map.height;
  for (let i = 0; i < n; i++) sum += map.data[i * 4] / 255;
  return sum / n;
}
