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

function woodPattern(dark = false): HTMLCanvasElement {
  const c = makeCanvas(48, 28);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = dark ? "#9a7350" : "#d4b896";
  ctx.fillRect(0, 0, 48, 28);
  const plankH = 7;
  for (let y = 0; y < 28; y += plankH) {
    const shade = dark
      ? y % (plankH * 2) === 0
        ? "#8a6444"
        : "#a57c58"
      : y % (plankH * 2) === 0
        ? "#c9a87a"
        : "#dcc4a0";
    ctx.fillStyle = shade;
    ctx.fillRect(0, y, 48, plankH - 1);
    ctx.strokeStyle = dark ? "rgba(50, 30, 15, 0.35)" : "rgba(90, 60, 30, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + plankH - 0.5);
    ctx.lineTo(48, y + plankH - 0.5);
    ctx.stroke();
    ctx.strokeStyle = dark
      ? "rgba(40, 25, 10, 0.18)"
      : "rgba(120, 80, 40, 0.12)";
    for (let x = 4 + (y % 8); x < 48; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x + 8, y + 2);
      ctx.stroke();
    }
  }
  return c;
}

function tilePattern(large = false): HTMLCanvasElement {
  const size = large ? 40 : 28;
  const half = size / 2;
  const c = makeCanvas(size, size);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = large ? "#c8c2b6" : "#cfc8bc";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = large ? "#ddd7cb" : "#d8d2c6";
  ctx.fillRect(1, 1, half - 2, half - 2);
  ctx.fillRect(half + 1, half + 1, half - 2, half - 2);
  ctx.fillStyle = large ? "#bdb6aa" : "#c4beb2";
  ctx.fillRect(half + 1, 1, half - 2, half - 2);
  ctx.fillRect(1, half + 1, half - 2, half - 2);
  ctx.strokeStyle = "rgba(80, 70, 55, 0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  ctx.beginPath();
  ctx.moveTo(half, 0);
  ctx.lineTo(half, size);
  ctx.moveTo(0, half);
  ctx.lineTo(size, half);
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

function epoxyPattern(): HTMLCanvasElement {
  const c = makeCanvas(36, 36);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#b8c0c8";
  ctx.fillRect(0, 0, 36, 36);
  const grad = ctx.createLinearGradient(0, 0, 36, 36);
  grad.addColorStop(0, "rgba(255,255,255,0.18)");
  grad.addColorStop(1, "rgba(40,60,80,0.12)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 36, 36);
  for (let i = 0; i < 40; i++) {
    const x = (i * 11) % 36;
    const y = (i * 17) % 36;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(x, y, 3, 1);
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
      cached = woodPattern(false);
      break;
    case "woodDark":
      cached = woodPattern(true);
      break;
    case "tile":
      cached = tilePattern(false);
      break;
    case "tileLarge":
      cached = tilePattern(true);
      break;
    case "carpet":
      cached = carpetPattern();
      break;
    case "concrete":
      cached = concretePattern();
      break;
    case "epoxy":
      cached = epoxyPattern();
      break;
    default:
      cached = neutralPattern();
  }
  cache.set(kind, cached);
  return cached;
}

export const TEXTURE_LEGEND_ES: Record<FloorTextureKind, string> = {
  wood: "Madera / laminado",
  woodDark: "Madera ingeniería",
  tile: "Cerámica / porcelanato",
  tileLarge: "Porcelanato gran formato",
  carpet: "Alfombra",
  concrete: "Concreto / exterior",
  epoxy: "Epóxico / garage",
  neutral: "Neutro",
};
