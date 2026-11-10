import type { FloorTextureKind } from "@/domain/floor-plan";

/**
 * Patrones procedurales (canvas) para relleno Konva.
 * Se generan una vez en el cliente y se reutilizan.
 */

const cache = new Map<FloorTextureKind, HTMLCanvasElement>();

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function woodPattern(): HTMLCanvasElement {
  const c = makeCanvas(48, 28);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#d4b896";
  ctx.fillRect(0, 0, 48, 28);
  const plankH = 7;
  for (let y = 0; y < 28; y += plankH) {
    const shade = y % (plankH * 2) === 0 ? "#c9a87a" : "#dcc4a0";
    ctx.fillStyle = shade;
    ctx.fillRect(0, y, 48, plankH - 1);
    ctx.strokeStyle = "rgba(90, 60, 30, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + plankH - 0.5);
    ctx.lineTo(48, y + plankH - 0.5);
    ctx.stroke();
    // grain dashes
    ctx.strokeStyle = "rgba(120, 80, 40, 0.12)";
    for (let x = 4 + (y % 8); x < 48; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x + 8, y + 2);
      ctx.stroke();
    }
  }
  return c;
}

function tilePattern(): HTMLCanvasElement {
  const c = makeCanvas(28, 28);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#cfc8bc";
  ctx.fillRect(0, 0, 28, 28);
  ctx.fillStyle = "#d8d2c6";
  ctx.fillRect(1, 1, 12, 12);
  ctx.fillRect(15, 15, 12, 12);
  ctx.fillStyle = "#c4beb2";
  ctx.fillRect(15, 1, 12, 12);
  ctx.fillRect(1, 15, 12, 12);
  ctx.strokeStyle = "rgba(80, 70, 55, 0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, 27, 27);
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(14, 28);
  ctx.moveTo(0, 14);
  ctx.lineTo(28, 14);
  ctx.stroke();
  return c;
}

function carpetPattern(): HTMLCanvasElement {
  const c = makeCanvas(32, 32);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#e6ddd0";
  ctx.fillRect(0, 0, 32, 32);
  for (let i = 0; i < 180; i++) {
    const x = (i * 17) % 32;
    const y = (i * 29) % 32;
    ctx.fillStyle =
      i % 3 === 0 ? "rgba(160,140,120,0.18)" : "rgba(200,185,165,0.22)";
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  return c;
}

function concretePattern(): HTMLCanvasElement {
  const c = makeCanvas(36, 36);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#d0d0cc";
  ctx.fillRect(0, 0, 36, 36);
  for (let i = 0; i < 90; i++) {
    const x = (i * 13) % 36;
    const y = (i * 19) % 36;
    ctx.fillStyle = i % 2 === 0 ? "rgba(110,110,105,0.12)" : "rgba(90,90,85,0.08)";
    ctx.fillRect(x, y, 2, 2);
  }
  return c;
}

function neutralPattern(): HTMLCanvasElement {
  const c = makeCanvas(24, 24);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ebe6dc";
  ctx.fillRect(0, 0, 24, 24);
  ctx.strokeStyle = "rgba(140,130,115,0.12)";
  ctx.strokeRect(0.5, 0.5, 23, 23);
  return c;
}

export function getFloorPattern(kind: FloorTextureKind): HTMLCanvasElement {
  let cached = cache.get(kind);
  if (cached) return cached;
  switch (kind) {
    case "wood":
      cached = woodPattern();
      break;
    case "tile":
      cached = tilePattern();
      break;
    case "carpet":
      cached = carpetPattern();
      break;
    case "concrete":
      cached = concretePattern();
      break;
    default:
      cached = neutralPattern();
  }
  cache.set(kind, cached);
  return cached;
}

export const TEXTURE_LEGEND_ES: Record<FloorTextureKind, string> = {
  wood: "Madera / laminado",
  tile: "Cerámica / porcelanato",
  carpet: "Alfombra",
  concrete: "Concreto / exterior",
  neutral: "Neutro",
};
