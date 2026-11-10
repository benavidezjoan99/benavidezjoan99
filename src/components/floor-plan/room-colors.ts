import type { RoomType } from "@/lib/types";

/** Rellenos suaves por tipo (sin glow ni púrpura genérico). */
export const ROOM_PLAN_COLORS: Record<RoomType, { fill: string; stroke: string }> = {
  sala: { fill: "#d9e8e2", stroke: "#2f5d50" },
  cocina: { fill: "#f3e0d0", stroke: "#8a4b2a" },
  comedor: { fill: "#e8e0d4", stroke: "#6b5a45" },
  bano: { fill: "#d6e4ef", stroke: "#3a5f7a" },
  dormitorio: { fill: "#e4dce8", stroke: "#5a4570" },
  lavanderia: { fill: "#dce8ef", stroke: "#3d6a7a" },
  garage: { fill: "#e2e2dc", stroke: "#555550" },
  pasillo: { fill: "#ebe6dc", stroke: "#6a6358" },
  exterior: { fill: "#d8ead0", stroke: "#3f6b38" },
  otro: { fill: "#e8e4de", stroke: "#5c564c" },
};
