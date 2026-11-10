import type { RoomType } from "@/lib/types";

/**
 * Colores de respaldo por tipo (panel / legado).
 * El lienzo estilo render usa texturas procedurales; estos rellenos
 * siguen siendo suaves (sin glow ni púrpura genérico).
 */
export const ROOM_PLAN_COLORS: Record<
  RoomType,
  { fill: string; stroke: string }
> = {
  sala: { fill: "#d9e8e2", stroke: "#2a2a28" },
  cocina: { fill: "#f3e0d0", stroke: "#2a2a28" },
  comedor: { fill: "#e8e0d4", stroke: "#2a2a28" },
  bano: { fill: "#d6e4ef", stroke: "#2a2a28" },
  dormitorio: { fill: "#e6ddd0", stroke: "#2a2a28" },
  lavanderia: { fill: "#dce8ef", stroke: "#2a2a28" },
  garage: { fill: "#d0d0cc", stroke: "#2a2a28" },
  pasillo: { fill: "#ebe6dc", stroke: "#2a2a28" },
  exterior: { fill: "#d8ead0", stroke: "#2a2a28" },
  otro: { fill: "#e8e4de", stroke: "#2a2a28" },
};
