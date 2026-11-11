import { NextRequest, NextResponse } from "next/server";
import { applyRoomFurniturePack, getProjectDetail } from "@/lib/projects";
import type { FurnitureStyle } from "@/domain/floor-plan";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; roomId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id, roomId } = await params;
  const body = await req.json().catch(() => ({}));
  const style =
    body?.style === "basico" || body?.style === "moderno"
      ? (body.style as FurnitureStyle)
      : undefined;
  try {
    const result = applyRoomFurniturePack(id, roomId, style);
    if (!result) {
      return NextResponse.json({ error: "Ambiente no encontrado" }, { status: 404 });
    }
    const detail = getProjectDetail(id);
    return NextResponse.json({
      room: result.room,
      line: result.line,
      totals: detail?.totals ?? null,
      lineItems: detail?.lineItems ?? [],
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo aplicar el pack";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
