"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Transformer,
  Line,
  Group,
} from "react-konva";
import type Konva from "konva";
import {
  PLAN_PX_PER_FT,
  PLAN_SNAP_FT,
  ftToPx,
  pxToFt,
  resolveFloorTexture,
  snapFt,
  type FloorTextureKind,
} from "@/domain/floor-plan";
import type { RoomType } from "@/lib/types";
import type { Room } from "@/lib/db/schema";
import { FurnitureSprites } from "./FurnitureSprites";
import { ROOM_PLAN_COLORS } from "./room-colors";
import { getFloorPattern, TEXTURE_LEGEND_ES } from "./textures";

export type PlanRoom = Room & {
  planX: number;
  planY: number;
  planWFt: number;
  planHFt: number;
};

type CatalogHint = { id: string; name: string };

type LiveGeom = { x: number; y: number; w: number; h: number };

type Props = {
  rooms: PlanRoom[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onGeometryChange: (
    roomId: string,
    next: { planX: number; planY: number; planWFt: number; planHFt: number },
  ) => void;
  catalogById?: Record<string, CatalogHint>;
};

const STAGE_W = 920;
const STAGE_H = 580;
const PAD_PX = 28;
const WALL = "#2a2a28";

function gridLines(width: number, height: number, stepFt: number) {
  const step = ftToPx(stepFt);
  const vertical: number[] = [];
  const horizontal: number[] = [];
  for (let x = PAD_PX; x < width; x += step) vertical.push(x);
  for (let y = PAD_PX; y < height; y += step) horizontal.push(y);
  return { vertical, horizontal };
}

function formatDims(wFt: number, hFt: number): string {
  const w = Number.isInteger(wFt) ? String(wFt) : wFt.toFixed(1);
  const h = Number.isInteger(hFt) ? String(hFt) : hFt.toFixed(1);
  return `${w} × ${h} ft`;
}

function roomGeom(room: PlanRoom): LiveGeom {
  return {
    x: PAD_PX + ftToPx(room.planX),
    y: PAD_PX + ftToPx(room.planY),
    w: ftToPx(room.planWFt),
    h: ftToPx(room.planHFt),
  };
}

export function FloorPlanCanvas({
  rooms,
  selectedId,
  onSelect,
  onGeometryChange,
  catalogById = {},
}: Props) {
  const trRef = useRef<Konva.Transformer>(null);
  const shapeRefs = useRef<Record<string, Konva.Rect | null>>({});
  const size = { w: STAGE_W, h: STAGE_H };
  const [patternsReady, setPatternsReady] = useState(false);
  const [live, setLive] = useState<Record<string, LiveGeom>>({});
  const patterns = useRef<Partial<Record<FloorTextureKind, HTMLCanvasElement>>>(
    {},
  );

  useEffect(() => {
    const kinds: FloorTextureKind[] = [
      "wood",
      "tile",
      "carpet",
      "concrete",
      "neutral",
    ];
    for (const k of kinds) {
      patterns.current[k] = getFloorPattern(k);
    }
    setPatternsReady(true);
  }, []);

  useEffect(() => {
    setLive({});
  }, [rooms]);

  useEffect(() => {
    const selected = selectedId ? shapeRefs.current[selectedId] : null;
    if (trRef.current) {
      if (selected) {
        trRef.current.nodes([selected]);
      } else {
        trRef.current.nodes([]);
      }
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, rooms, patternsReady, live]);

  const grid = useMemo(() => gridLines(size.w, size.h, 2), [size.w, size.h]);

  const usedTextures = useMemo(() => {
    const set = new Set<FloorTextureKind>();
    for (const room of rooms) {
      const cat = room.floorCatalogItemId
        ? catalogById[room.floorCatalogItemId]
        : null;
      set.add(
        resolveFloorTexture({
          roomType: room.roomType,
          catalogItem: cat ?? { id: room.floorCatalogItemId },
        }),
      );
    }
    return [...set];
  }, [rooms, catalogById]);

  function geomFor(room: PlanRoom): LiveGeom {
    return live[room.id] ?? roomGeom(room);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[#efeae1]">
      <Stage
        width={size.w}
        height={size.h}
        onMouseDown={(e) => {
          const stage = e.target.getStage();
          if (!stage) return;
          // Fallback por geometría: evita fallos de hit-test con capas de textura
          const pos = stage.getPointerPosition();
          if (!pos) return;
          const hit = rooms.find((room) => {
            const g = geomFor(room);
            return (
              pos.x >= g.x &&
              pos.x <= g.x + g.w &&
              pos.y >= g.y &&
              pos.y <= g.y + g.h
            );
          });
          if (hit) {
            onSelect(hit.id);
            return;
          }
          if (e.target === stage) onSelect(null);
        }}
        onTouchStart={(e) => {
          const stage = e.target.getStage();
          if (!stage) return;
          const pos = stage.getPointerPosition();
          if (!pos) return;
          const hit = rooms.find((room) => {
            const g = geomFor(room);
            return (
              pos.x >= g.x &&
              pos.x <= g.x + g.w &&
              pos.y >= g.y &&
              pos.y <= g.y + g.h
            );
          });
          if (hit) {
            onSelect(hit.id);
            return;
          }
          if (e.target === stage) onSelect(null);
        }}
      >
        <Layer listening={false}>
          <Rect
            x={0}
            y={0}
            width={size.w}
            height={size.h}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: size.w, y: size.h }}
            fillLinearGradientColorStops={[
              0,
              "#e8efe4",
              0.45,
              "#efeae1",
              1,
              "#e4ddd2",
            ]}
          />
          {grid.vertical.map((x) => (
            <Line
              key={`v-${x}`}
              points={[x, 0, x, size.h]}
              stroke="rgba(120,110,95,0.18)"
              strokeWidth={x === PAD_PX ? 1 : 0.5}
            />
          ))}
          {grid.horizontal.map((y) => (
            <Line
              key={`h-${y}`}
              points={[0, y, size.w, y]}
              stroke="rgba(120,110,95,0.18)"
              strokeWidth={y === PAD_PX ? 1 : 0.5}
            />
          ))}
          <Text
            x={PAD_PX + 2}
            y={8}
            text="Rejilla 2 ft · croquis orientativo (no certificado)"
            fontSize={11}
            fill="#6e665a"
            fontFamily="Georgia, 'Times New Roman', serif"
          />
        </Layer>

        {/*
          Capa interactiva DEBAJO de texturas/muebles.
          Fill sólido opaco → hit-test Konva fiable (como el MVP).
        */}
        <Layer>
          {rooms.map((room) => {
            const g = geomFor(room);
            const selected = room.id === selectedId;
            const colors =
              ROOM_PLAN_COLORS[room.roomType as RoomType] ??
              ROOM_PLAN_COLORS.otro;
            return (
              <Rect
                key={room.id}
                ref={(node) => {
                  shapeRefs.current[room.id] = node;
                }}
                x={g.x}
                y={g.y}
                width={g.w}
                height={g.h}
                fill={colors.fill}
                stroke={selected ? "#1c3d34" : WALL}
                strokeWidth={selected ? 4 : 3.25}
                shadowColor="rgba(20,18,14,0.35)"
                shadowBlur={selected ? 10 : 6}
                shadowOffsetX={2}
                shadowOffsetY={3}
                shadowOpacity={0.65}
                draggable
                onMouseDown={() => onSelect(room.id)}
                onTouchStart={() => onSelect(room.id)}
                onClick={() => onSelect(room.id)}
                onTap={() => onSelect(room.id)}
                onDragMove={(e) => {
                  setLive((prev) => ({
                    ...prev,
                    [room.id]: {
                      x: e.target.x(),
                      y: e.target.y(),
                      w: e.target.width(),
                      h: e.target.height(),
                    },
                  }));
                }}
                onDragEnd={(e) => {
                  const nx = snapFt(
                    pxToFt(e.target.x() - PAD_PX),
                    PLAN_SNAP_FT,
                  );
                  const ny = snapFt(
                    pxToFt(e.target.y() - PAD_PX),
                    PLAN_SNAP_FT,
                  );
                  e.target.position({
                    x: PAD_PX + ftToPx(Math.max(0, nx)),
                    y: PAD_PX + ftToPx(Math.max(0, ny)),
                  });
                  onGeometryChange(room.id, {
                    planX: Math.max(0, nx),
                    planY: Math.max(0, ny),
                    planWFt: room.planWFt,
                    planHFt: room.planHFt,
                  });
                }}
                onTransform={(e) => {
                  const node = e.target;
                  setLive((prev) => ({
                    ...prev,
                    [room.id]: {
                      x: node.x(),
                      y: node.y(),
                      w: Math.max(20, node.width() * node.scaleX()),
                      h: Math.max(20, node.height() * node.scaleY()),
                    },
                  }));
                }}
                onTransformEnd={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  node.scaleX(1);
                  node.scaleY(1);
                  const nextW = snapFt(
                    Math.max(4, pxToFt(Math.max(20, node.width() * scaleX))),
                    PLAN_SNAP_FT,
                  );
                  const nextH = snapFt(
                    Math.max(4, pxToFt(Math.max(20, node.height() * scaleY))),
                    PLAN_SNAP_FT,
                  );
                  const nx = snapFt(pxToFt(node.x() - PAD_PX), PLAN_SNAP_FT);
                  const ny = snapFt(pxToFt(node.y() - PAD_PX), PLAN_SNAP_FT);
                  node.position({
                    x: PAD_PX + ftToPx(Math.max(0, nx)),
                    y: PAD_PX + ftToPx(Math.max(0, ny)),
                  });
                  node.size({ width: ftToPx(nextW), height: ftToPx(nextH) });
                  onGeometryChange(room.id, {
                    planX: Math.max(0, nx),
                    planY: Math.max(0, ny),
                    planWFt: nextW,
                    planHFt: nextH,
                  });
                }}
              />
            );
          })}
          <Transformer
            ref={trRef}
            rotateEnabled={false}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
              "middle-left",
              "middle-right",
              "top-center",
              "bottom-center",
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              const min = ftToPx(4);
              if (newBox.width < min || newBox.height < min) return oldBox;
              return newBox;
            }}
          />
        </Layer>

        {/* Texturas encima (listening=false → eventos pasan a la capa interactiva) */}
        <Layer listening={false}>
          {patternsReady &&
            rooms.map((room) => {
              const g = geomFor(room);
              const cat = room.floorCatalogItemId
                ? catalogById[room.floorCatalogItemId]
                : null;
              const texture = resolveFloorTexture({
                roomType: room.roomType,
                catalogItem: cat ?? { id: room.floorCatalogItemId },
              });
              const pattern = patterns.current[texture];
              return (
                <Rect
                  key={`tex-${room.id}`}
                  x={g.x}
                  y={g.y}
                  width={g.w}
                  height={g.h}
                  fillPatternImage={pattern as unknown as HTMLImageElement}
                  fillPatternRepeat="repeat"
                  fillPatternScaleX={0.95}
                  fillPatternScaleY={0.95}
                />
              );
            })}
        </Layer>

        {/* Muebles + etiquetas */}
        <Layer listening={false}>
          {rooms.map((room) => {
            const g = geomFor(room);
            const liveW = live[room.id]
              ? snapFt(pxToFt(live[room.id].w), PLAN_SNAP_FT)
              : room.planWFt;
            const liveH = live[room.id]
              ? snapFt(pxToFt(live[room.id].h), PLAN_SNAP_FT)
              : room.planHFt;
            const liveLabel = `${room.name.toUpperCase()}\n${formatDims(liveW, liveH)}`;
            return (
              <Group key={`decor-${room.id}`} x={g.x} y={g.y}>
                <Rect
                  width={g.w}
                  height={Math.min(12, g.h * 0.08)}
                  fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                  fillLinearGradientEndPoint={{ x: 0, y: 12 }}
                  fillLinearGradientColorStops={[
                    0,
                    "rgba(30,25,20,0.14)",
                    1,
                    "rgba(30,25,20,0)",
                  ]}
                />
                <FurnitureSprites
                  roomType={room.roomType as RoomType}
                  widthPx={g.w}
                  heightPx={g.h}
                />
                <Text
                  x={6}
                  y={g.h / 2 - 16}
                  width={Math.max(40, g.w - 12)}
                  align="center"
                  text={liveLabel}
                  fontSize={Math.min(13, Math.max(10, g.w / 14))}
                  fontStyle="bold"
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fill="#1a1814"
                  shadowColor="rgba(255,255,255,0.75)"
                  shadowBlur={3}
                  shadowOpacity={1}
                />
              </Group>
            );
          })}
        </Layer>

      </Stage>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] bg-[#f7f4ee] px-3 py-1.5 text-xs text-[var(--ink-muted)]">
        <p>
          Escala {PLAN_PX_PER_FT} px/ft · arrastra para mover · tiradores para
          redimensionar · texturas según piso de catálogo
        </p>
        {usedTextures.length > 0 && (
          <p className="text-[11px]">
            {usedTextures.map((k) => TEXTURE_LEGEND_ES[k]).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
