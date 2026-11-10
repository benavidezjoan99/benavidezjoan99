"use client";

import { Circle, Group, Line, Rect } from "react-konva";
import { ftToPx } from "@/domain/floor-plan";
import type { RoomType } from "@/lib/types";

type Props = {
  roomType: RoomType | string;
  /** Ancho del ambiente en px. */
  widthPx: number;
  /** Alto del ambiente en px. */
  heightPx: number;
};

const SHADOW = {
  shadowColor: "rgba(40, 30, 20, 0.28)",
  shadowBlur: 8,
  shadowOffsetX: 2,
  shadowOffsetY: 3,
  shadowOpacity: 0.55,
};

/** Muebles top-down placeholders por tipo de ambiente (estilo render 2D). */
export function FurnitureSprites({ roomType, widthPx, heightPx }: Props) {
  // Márgenes internos para no pegar a muros
  const pad = Math.max(8, Math.min(widthPx, heightPx) * 0.08);
  const innerW = widthPx - pad * 2;
  const innerH = heightPx - pad * 2;
  if (innerW < 28 || innerH < 28) return null;

  switch (roomType) {
    case "sala":
      return <LivingFurniture pad={pad} w={innerW} h={innerH} />;
    case "cocina":
      return <KitchenFurniture pad={pad} w={innerW} h={innerH} />;
    case "dormitorio":
      return <BedroomFurniture pad={pad} w={innerW} h={innerH} />;
    case "comedor":
      return <DiningFurniture pad={pad} w={innerW} h={innerH} />;
    case "bano":
      return <BathFurniture pad={pad} w={innerW} h={innerH} />;
    case "lavanderia":
      return <LaundryFurniture pad={pad} w={innerW} h={innerH} />;
    default:
      return null;
  }
}

function LivingFurniture({
  pad,
  w,
  h,
}: {
  pad: number;
  w: number;
  h: number;
}) {
  const sofaW = Math.min(w * 0.72, ftToPx(7.5));
  const sofaH = Math.min(h * 0.28, ftToPx(3));
  const tableW = Math.min(w * 0.35, ftToPx(4));
  const tableH = Math.min(h * 0.18, ftToPx(2));
  return (
    <Group listening={false}>
      {/* Sofá */}
      <Rect
        x={pad + (w - sofaW) / 2}
        y={pad + h - sofaH - 4}
        width={sofaW}
        height={sofaH}
        fill="#4a6fa5"
        cornerRadius={4}
        {...SHADOW}
      />
      <Rect
        x={pad + (w - sofaW) / 2 + 6}
        y={pad + h - sofaH + 4}
        width={sofaW - 12}
        height={sofaH * 0.35}
        fill="#5d82b8"
        cornerRadius={2}
      />
      {/* Mesa de centro */}
      <Rect
        x={pad + (w - tableW) / 2}
        y={pad + h * 0.38}
        width={tableW}
        height={tableH}
        fill="#a67c52"
        cornerRadius={2}
        {...SHADOW}
      />
      {/* Sillones */}
      <Rect
        x={pad + 4}
        y={pad + h * 0.32}
        width={ftToPx(2.2)}
        height={ftToPx(2.4)}
        fill="#4a6fa5"
        cornerRadius={3}
        {...SHADOW}
      />
      <Rect
        x={pad + w - ftToPx(2.2) - 4}
        y={pad + h * 0.32}
        width={ftToPx(2.2)}
        height={ftToPx(2.4)}
        fill="#4a6fa5"
        cornerRadius={3}
        {...SHADOW}
      />
    </Group>
  );
}

function KitchenFurniture({
  pad,
  w,
  h,
}: {
  pad: number;
  w: number;
  h: number;
}) {
  const cabDepth = Math.min(ftToPx(2), h * 0.18);
  const islandW = Math.min(w * 0.45, ftToPx(6));
  const islandH = Math.min(h * 0.28, ftToPx(3));
  return (
    <Group listening={false}>
      {/* Gabinetes perimetrales */}
      <Rect
        x={pad}
        y={pad}
        width={w}
        height={cabDepth}
        fill="#6b5a48"
        {...SHADOW}
      />
      <Rect
        x={pad}
        y={pad}
        width={cabDepth}
        height={h * 0.55}
        fill="#6b5a48"
      />
      {/* Encimera / top */}
      <Rect
        x={pad + 2}
        y={pad + 2}
        width={w - 4}
        height={cabDepth - 4}
        fill="#9a9a96"
      />
      {/* Isla */}
      <Rect
        x={pad + (w - islandW) / 2}
        y={pad + h * 0.42}
        width={islandW}
        height={islandH}
        fill="#8a8a86"
        cornerRadius={2}
        {...SHADOW}
      />
      <Rect
        x={pad + (w - islandW) / 2 + 4}
        y={pad + h * 0.42 + 4}
        width={islandW - 8}
        height={islandH - 8}
        fill="#b0b0aa"
        cornerRadius={1}
      />
      {/* Banquetas */}
      {[0, 1, 2].map((i) => (
        <Circle
          key={i}
          x={pad + (w - islandW) / 2 + islandW * ((i + 1) / 4)}
          y={pad + h * 0.42 + islandH + ftToPx(1.1)}
          radius={ftToPx(0.55)}
          fill="#f2f0ea"
          stroke="#c8c4ba"
          strokeWidth={1}
          {...SHADOW}
        />
      ))}
      {/* Estufa simbólica */}
      <Rect
        x={pad + w * 0.55}
        y={pad + 4}
        width={ftToPx(2.4)}
        height={cabDepth - 6}
        fill="#3a3a38"
      />
      {[0, 1, 2, 3].map((i) => (
        <Circle
          key={`b-${i}`}
          x={pad + w * 0.55 + 8 + (i % 2) * 14}
          y={pad + 10 + Math.floor(i / 2) * 12}
          radius={4}
          fill="#222"
          stroke="#666"
          strokeWidth={1}
        />
      ))}
    </Group>
  );
}

function BedroomFurniture({
  pad,
  w,
  h,
}: {
  pad: number;
  w: number;
  h: number;
}) {
  const bedW = Math.min(w * 0.55, ftToPx(6));
  const bedH = Math.min(h * 0.7, ftToPx(7));
  const bedX = pad + (w - bedW) / 2;
  const bedY = pad + (h - bedH) / 2;
  const ns = ftToPx(1.4);
  return (
    <Group listening={false}>
      {/* Cama */}
      <Rect
        x={bedX}
        y={bedY}
        width={bedW}
        height={bedH}
        fill="#e8e4dc"
        stroke="#c5beb2"
        strokeWidth={1}
        cornerRadius={2}
        {...SHADOW}
      />
      {/* Cabecera */}
      <Rect
        x={bedX}
        y={bedY}
        width={bedW}
        height={ftToPx(0.7)}
        fill="#5a4a3a"
      />
      {/* Almohadas */}
      <Rect
        x={bedX + 6}
        y={bedY + ftToPx(0.85)}
        width={bedW * 0.38}
        height={ftToPx(1.2)}
        fill="#f7f5f0"
        cornerRadius={2}
      />
      <Rect
        x={bedX + bedW * 0.55}
        y={bedY + ftToPx(0.85)}
        width={bedW * 0.38}
        height={ftToPx(1.2)}
        fill="#f7f5f0"
        cornerRadius={2}
      />
      {/* Runner / cobertor */}
      <Rect
        x={bedX + 4}
        y={bedY + bedH * 0.45}
        width={bedW - 8}
        height={bedH * 0.48}
        fill="#3d5a80"
        opacity={0.85}
      />
      {/* Mesitas */}
      <Rect
        x={bedX - ns - 4}
        y={bedY + 4}
        width={ns}
        height={ns}
        fill="#8b7355"
        {...SHADOW}
      />
      <Rect
        x={bedX + bedW + 4}
        y={bedY + 4}
        width={ns}
        height={ns}
        fill="#8b7355"
        {...SHADOW}
      />
      <Circle
        x={bedX - ns / 2 - 4}
        y={bedY + 4 + ns / 2}
        radius={3}
        fill="#e8dcc8"
      />
      <Circle
        x={bedX + bedW + 4 + ns / 2}
        y={bedY + 4 + ns / 2}
        radius={3}
        fill="#e8dcc8"
      />
    </Group>
  );
}

function DiningFurniture({
  pad,
  w,
  h,
}: {
  pad: number;
  w: number;
  h: number;
}) {
  const tw = Math.min(w * 0.45, ftToPx(5));
  const th = Math.min(h * 0.35, ftToPx(3.5));
  const cx = pad + w / 2;
  const cy = pad + h / 2;
  const chairR = ftToPx(0.7);
  return (
    <Group listening={false}>
      <Rect
        x={cx - tw / 2}
        y={cy - th / 2}
        width={tw}
        height={th}
        fill="#a67c52"
        cornerRadius={3}
        {...SHADOW}
      />
      {[
        [0, -th / 2 - chairR - 4],
        [0, th / 2 + chairR + 4],
        [-tw / 2 - chairR - 4, 0],
        [tw / 2 + chairR + 4, 0],
      ].map(([dx, dy], i) => (
        <Circle
          key={i}
          x={cx + dx}
          y={cy + dy}
          radius={chairR}
          fill="#f0ebe3"
          stroke="#c8c0b4"
          strokeWidth={1}
          {...SHADOW}
        />
      ))}
    </Group>
  );
}

function BathFurniture({
  pad,
  w,
  h,
}: {
  pad: number;
  w: number;
  h: number;
}) {
  const tubW = Math.min(w * 0.4, ftToPx(5));
  const tubH = Math.min(h * 0.35, ftToPx(2.8));
  return (
    <Group listening={false}>
      {/* Tina */}
      <Rect
        x={pad + 4}
        y={pad + 4}
        width={tubW}
        height={tubH}
        fill="#9ec9d9"
        stroke="#6a9aab"
        strokeWidth={1.5}
        cornerRadius={6}
        {...SHADOW}
      />
      {/* Vanity */}
      <Rect
        x={pad + w - ftToPx(3.2)}
        y={pad + 4}
        width={ftToPx(3)}
        height={ftToPx(1.8)}
        fill="#d8d4cc"
        stroke="#a8a49c"
        strokeWidth={1}
        {...SHADOW}
      />
      <Circle
        x={pad + w - ftToPx(1.7)}
        y={pad + 4 + ftToPx(0.9)}
        radius={ftToPx(0.55)}
        fill="#b8d4e0"
        stroke="#7aa0b0"
        strokeWidth={1}
      />
      {/* Inodoro */}
      <Rect
        x={pad + w - ftToPx(2)}
        y={pad + h - ftToPx(3)}
        width={ftToPx(1.6)}
        height={ftToPx(2.4)}
        fill="#f5f3ef"
        stroke="#c8c4bc"
        strokeWidth={1}
        cornerRadius={4}
        {...SHADOW}
      />
      <EllipseOval
        x={pad + w - ftToPx(1.2)}
        y={pad + h - ftToPx(1.6)}
      />
    </Group>
  );
}

function EllipseOval({ x, y }: { x: number; y: number }) {
  return (
    <Circle
      x={x}
      y={y}
      radius={ftToPx(0.45)}
      scaleY={1.35}
      fill="#e8e4dc"
      stroke="#b8b4ac"
      strokeWidth={1}
    />
  );
}

function LaundryFurniture({
  pad,
}: {
  pad: number;
  w: number;
  h: number;
}) {
  const unit = ftToPx(2.4);
  return (
    <Group listening={false}>
      <Rect
        x={pad + 4}
        y={pad + 4}
        width={unit}
        height={unit}
        fill="#d0d4d8"
        stroke="#8a9096"
        strokeWidth={1}
        {...SHADOW}
      />
      <Rect
        x={pad + 4 + unit + 6}
        y={pad + 4}
        width={unit}
        height={unit}
        fill="#d0d4d8"
        stroke="#8a9096"
        strokeWidth={1}
        {...SHADOW}
      />
      <Line
        points={[
          pad + 4 + unit / 2 - 6,
          pad + 4 + unit / 2,
          pad + 4 + unit / 2 + 6,
          pad + 4 + unit / 2,
        ]}
        stroke="#555"
        strokeWidth={1}
      />
    </Group>
  );
}
