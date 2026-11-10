"use client";

import { useEffect, useMemo, useRef } from "react";
import { Stage, Layer, Rect, Text, Transformer, Line } from "react-konva";
import type Konva from "konva";
import {
  PLAN_PX_PER_FT,
  PLAN_SNAP_FT,
  ftToPx,
  pxToFt,
  rectAreaFt2,
  snapFt,
} from "@/domain/floor-plan";
import type { RoomType } from "@/lib/types";
import type { Room } from "@/lib/db/schema";
import { ROOM_PLAN_COLORS } from "./room-colors";

export type PlanRoom = Room & {
  planX: number;
  planY: number;
  planWFt: number;
  planHFt: number;
};

type Props = {
  rooms: PlanRoom[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onGeometryChange: (
    roomId: string,
    next: { planX: number; planY: number; planWFt: number; planHFt: number },
  ) => void;
};

const STAGE_W = 900;
const STAGE_H = 560;
const PAD_PX = 24;

function gridLines(width: number, height: number, stepFt: number) {
  const step = ftToPx(stepFt);
  const vertical: number[] = [];
  const horizontal: number[] = [];
  for (let x = PAD_PX; x < width; x += step) vertical.push(x);
  for (let y = PAD_PX; y < height; y += step) horizontal.push(y);
  return { vertical, horizontal };
}

export function FloorPlanCanvas({
  rooms,
  selectedId,
  onSelect,
  onGeometryChange,
}: Props) {
  const trRef = useRef<Konva.Transformer>(null);
  const shapeRefs = useRef<Record<string, Konva.Rect | null>>({});
  const size = { w: STAGE_W, h: STAGE_H };

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
  }, [selectedId, rooms]);

  const grid = useMemo(() => gridLines(size.w, size.h, 2), [size.w, size.h]);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[#f7f5f0]">
      <Stage
        width={size.w}
        height={size.h}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelect(null);
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) onSelect(null);
        }}
      >
        <Layer listening={false}>
          {grid.vertical.map((x) => (
            <Line
              key={`v-${x}`}
              points={[x, 0, x, size.h]}
              stroke="#d5d0c6"
              strokeWidth={x === PAD_PX ? 1.2 : 0.6}
            />
          ))}
          {grid.horizontal.map((y) => (
            <Line
              key={`h-${y}`}
              points={[0, y, size.w, y]}
              stroke="#d5d0c6"
              strokeWidth={y === PAD_PX ? 1.2 : 0.6}
            />
          ))}
          <Text
            x={PAD_PX + 4}
            y={6}
            text="Rejilla 2 ft · croquis orientativo"
            fontSize={11}
            fill="#7a7468"
          />
        </Layer>
        <Layer>
          {rooms.map((room) => {
            const colors =
              ROOM_PLAN_COLORS[room.roomType as RoomType] ?? ROOM_PLAN_COLORS.otro;
            const x = PAD_PX + ftToPx(room.planX);
            const y = PAD_PX + ftToPx(room.planY);
            const w = ftToPx(room.planWFt);
            const h = ftToPx(room.planHFt);
            const selected = room.id === selectedId;

            return (
              <Rect
                key={room.id}
                ref={(node) => {
                  shapeRefs.current[room.id] = node;
                }}
                x={x}
                y={y}
                width={w}
                height={h}
                fill={colors.fill}
                stroke={selected ? "#1c3d34" : colors.stroke}
                strokeWidth={selected ? 2.5 : 1.5}
                draggable
                onClick={() => onSelect(room.id)}
                onTap={() => onSelect(room.id)}
                onDragEnd={(e) => {
                  const nx = snapFt(pxToFt(e.target.x() - PAD_PX), PLAN_SNAP_FT);
                  const ny = snapFt(pxToFt(e.target.y() - PAD_PX), PLAN_SNAP_FT);
                  e.target.position({
                    x: PAD_PX + ftToPx(nx),
                    y: PAD_PX + ftToPx(ny),
                  });
                  onGeometryChange(room.id, {
                    planX: Math.max(0, nx),
                    planY: Math.max(0, ny),
                    planWFt: room.planWFt,
                    planHFt: room.planHFt,
                  });
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
          {rooms.map((room) => {
            const x = PAD_PX + ftToPx(room.planX);
            const y = PAD_PX + ftToPx(room.planY);
            const w = ftToPx(room.planWFt);
            const area = rectAreaFt2(room.planWFt, room.planHFt);
            return (
              <Text
                key={`label-${room.id}`}
                x={x + 6}
                y={y + 6}
                width={Math.max(40, w - 12)}
                text={`${room.name}\n${area} ft²`}
                fontSize={12}
                fontFamily="var(--font-dm-sans), sans-serif"
                fill="#1c1a16"
                listening={false}
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
      </Stage>
      <p className="border-t border-[var(--line)] px-3 py-1.5 text-xs text-[var(--ink-muted)]">
        Escala {PLAN_PX_PER_FT} px/ft · arrastra para mover · tiradores para
        redimensionar
      </p>
    </div>
  );
}
