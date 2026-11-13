"use client";

import * as THREE from "three";
import type { FloorTextureKind } from "@/domain/floor-plan";
import { shadeHex } from "@/domain/floor-plan";

/**
 * Texturas procedurales de mayor resolución para Three.js.
 * Solo cliente (canvas). Cache por kind / swatch.
 */

const floorCache = new Map<FloorTextureKind, THREE.CanvasTexture>();
const wallCache = new Map<string, THREE.CanvasTexture>();
const fabricCache = new Map<string, THREE.CanvasTexture>();
const woodFinishCache = new Map<string, THREE.CanvasTexture>();

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function asTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function paintWood(dark: boolean): HTMLCanvasElement {
  const c = makeCanvas(256, 256);
  const ctx = c.getContext("2d")!;
  const base = dark ? "#8a6444" : "#d4b896";
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  const plankH = 32;
  for (let y = 0; y < 256; y += plankH) {
    const even = (y / plankH) % 2 === 0;
    ctx.fillStyle = dark
      ? even
        ? "#7a5638"
        : "#9a7250"
      : even
        ? "#c9a87a"
        : "#e0c49a";
    ctx.fillRect(0, y, 256, plankH - 2);
    // Vetas
    ctx.strokeStyle = dark
      ? "rgba(40, 22, 10, 0.28)"
      : "rgba(110, 70, 30, 0.18)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const yy = y + 4 + i * 4 + ((y * 3 + i * 17) % 5);
      ctx.beginPath();
      ctx.moveTo(0, yy);
      for (let x = 0; x < 256; x += 16) {
        ctx.lineTo(x + 8, yy + Math.sin((x + y) * 0.04) * 1.5);
      }
      ctx.stroke();
    }
    // Junta
    ctx.strokeStyle = dark
      ? "rgba(30, 18, 8, 0.55)"
      : "rgba(80, 50, 25, 0.4)";
    ctx.beginPath();
    ctx.moveTo(0, y + plankH - 1);
    ctx.lineTo(256, y + plankH - 1);
    ctx.stroke();
    // Offset de tabla
    const offset = even ? 40 : 0;
    ctx.strokeStyle = dark
      ? "rgba(30, 18, 8, 0.35)"
      : "rgba(80, 50, 25, 0.25)";
    for (let x = offset; x < 256; x += 96) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + plankH - 2);
      ctx.stroke();
    }
  }
  return c;
}

function paintTile(large: boolean): HTMLCanvasElement {
  const size = large ? 96 : 64;
  const c = makeCanvas(256, 256);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = large ? "#c4beb2" : "#cfc8bc";
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += size) {
    for (let x = 0; x < 256; x += size) {
      const checker = ((x / size) + (y / size)) % 2 === 0;
      ctx.fillStyle = large
        ? checker
          ? "#d8d2c6"
          : "#beb8ac"
        : checker
          ? "#d8d2c6"
          : "#c4beb2";
      ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
      // Micro-ruido
      for (let i = 0; i < 18; i++) {
        const px = x + 4 + ((i * 37 + x) % (size - 8));
        const py = y + 4 + ((i * 53 + y) % (size - 8));
        ctx.fillStyle = "rgba(90, 80, 60, 0.06)";
        ctx.fillRect(px, py, 2, 2);
      }
      ctx.strokeStyle = "rgba(70, 60, 45, 0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
    }
  }
  return c;
}

function paintCarpet(): HTMLCanvasElement {
  const c = makeCanvas(256, 256);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#e6ddd0";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4200; i++) {
    const x = (i * 47) % 256;
    const y = (i * 89) % 256;
    ctx.fillStyle =
      i % 3 === 0 ? "rgba(150, 130, 110, 0.16)" : "rgba(200, 185, 165, 0.2)";
    ctx.fillRect(x, y, 2, 2);
  }
  // Suave trama cruzada
  ctx.strokeStyle = "rgba(140, 120, 100, 0.08)";
  for (let a = -256; a < 256; a += 12) {
    ctx.beginPath();
    ctx.moveTo(a, 0);
    ctx.lineTo(a + 256, 256);
    ctx.stroke();
  }
  return c;
}

function paintConcrete(): HTMLCanvasElement {
  const c = makeCanvas(256, 256);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#d0d0cc";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2200; i++) {
    const x = (i * 31) % 256;
    const y = (i * 57) % 256;
    ctx.fillStyle =
      i % 2 === 0 ? "rgba(100, 100, 95, 0.12)" : "rgba(80, 80, 75, 0.08)";
    ctx.fillRect(x, y, 3, 2);
  }
  // Fisuras suaves
  ctx.strokeStyle = "rgba(90, 90, 85, 0.15)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(20 + i * 40, 10);
    for (let x = 20; x < 240; x += 20) {
      ctx.lineTo(x, 30 + i * 40 + Math.sin(x * 0.08 + i) * 8);
    }
    ctx.stroke();
  }
  return c;
}

function paintEpoxy(): HTMLCanvasElement {
  const c = makeCanvas(256, 256);
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, "#c8d0d8");
  g.addColorStop(0.5, "#b0b8c0");
  g.addColorStop(1, "#a8b4c0");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 80; i++) {
    const x = (i * 41) % 256;
    const y = (i * 73) % 256;
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(x, y, 18, 2);
  }
  return c;
}

function paintNeutral(): HTMLCanvasElement {
  const c = makeCanvas(128, 128);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ebe6dc";
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "rgba(140, 130, 115, 0.12)";
  ctx.strokeRect(0.5, 0.5, 127, 127);
  return c;
}

export function getFloorTexture3D(kind: FloorTextureKind): THREE.CanvasTexture {
  let tex = floorCache.get(kind);
  if (tex) return tex;
  let canvas: HTMLCanvasElement;
  switch (kind) {
    case "wood":
      canvas = paintWood(false);
      break;
    case "woodDark":
      canvas = paintWood(true);
      break;
    case "tile":
      canvas = paintTile(false);
      break;
    case "tileLarge":
      canvas = paintTile(true);
      break;
    case "carpet":
      canvas = paintCarpet();
      break;
    case "concrete":
      canvas = paintConcrete();
      break;
    case "epoxy":
      canvas = paintEpoxy();
      break;
    default:
      canvas = paintNeutral();
  }
  tex = asTexture(canvas);
  floorCache.set(kind, tex);
  return tex;
}

/** Textura de pintura con variación de rodillo / ruido. */
export function getWallPaintTexture3D(
  fill: string,
  variation = 0.14,
): THREE.CanvasTexture {
  const key = `${fill}|${variation}`;
  let tex = wallCache.get(key);
  if (tex) return tex;
  const c = makeCanvas(256, 256);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 256, 256);
  const light = shadeHex(fill, Math.min(0.35, variation * 2));
  const dark = shadeHex(fill, -Math.min(0.25, variation * 1.5));
  // Pasadas de rodillo horizontales
  for (let y = 0; y < 256; y += 6) {
    ctx.fillStyle = y % 12 === 0 ? light : dark;
    ctx.globalAlpha = 0.08 + (y % 18) * 0.004;
    ctx.fillRect(0, y, 256, 4);
  }
  ctx.globalAlpha = 1;
  // Ruido fino
  for (let i = 0; i < 1800; i++) {
    const x = (i * 29) % 256;
    const y = (i * 71) % 256;
    ctx.fillStyle = i % 2 === 0 ? light : dark;
    ctx.globalAlpha = 0.05;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  tex = asTexture(c);
  tex.repeat.set(2.5, 2);
  wallCache.set(key, tex);
  return tex;
}

export function getFabricTexture3D(color: string): THREE.CanvasTexture {
  let tex = fabricCache.get(color);
  if (tex) return tex;
  const c = makeCanvas(128, 128);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 128, 128);
  const light = shadeHex(color, 0.12);
  const dark = shadeHex(color, -0.12);
  for (let y = 0; y < 128; y += 3) {
    for (let x = 0; x < 128; x += 3) {
      ctx.fillStyle = (x + y) % 6 === 0 ? light : dark;
      ctx.globalAlpha = 0.18;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
  tex = asTexture(c);
  tex.repeat.set(3, 3);
  fabricCache.set(color, tex);
  return tex;
}

export function getWoodFinishTexture3D(color: string): THREE.CanvasTexture {
  let tex = woodFinishCache.get(color);
  if (tex) return tex;
  const c = makeCanvas(128, 128);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 128, 128);
  const dark = shadeHex(color, -0.18);
  const light = shadeHex(color, 0.1);
  for (let y = 0; y < 128; y += 8) {
    ctx.fillStyle = y % 16 === 0 ? dark : light;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(0, y, 128, 6);
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = dark;
    ctx.beginPath();
    ctx.moveTo(0, y + 3);
    for (let x = 0; x < 128; x += 8) {
      ctx.lineTo(x, y + 3 + Math.sin(x * 0.2) * 1.2);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  tex = asTexture(c);
  tex.repeat.set(2, 2);
  woodFinishCache.set(color, tex);
  return tex;
}

/** Clona textura de piso con UV repeat propio del ambiente (no muta el cache). */
export function floorTextureForRoom(
  kind: FloorTextureKind,
  repeatX: number,
  repeatY: number,
): THREE.CanvasTexture {
  const base = getFloorTexture3D(kind);
  const clone = base.clone();
  clone.wrapS = THREE.RepeatWrapping;
  clone.wrapT = THREE.RepeatWrapping;
  clone.repeat.set(repeatX, repeatY);
  clone.needsUpdate = true;
  return clone;
}
