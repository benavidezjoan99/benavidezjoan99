import { NextRequest, NextResponse } from "next/server";
import { applyRoomWallPaint, getProjectDetail } from "@/lib/projects";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; roomId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id, roomId } = await params;
  const body = await req.json();
  if (!body?.catalogItemId?.trim()) {
    return NextResponse.json(
      { error: "catalogItemId es obligatorio." },
      { status: 400 },
    );
  }
  try {
    const result = applyRoomWallPaint(
      id,
      roomId,
      String(body.catalogItemId),
      body.wallColorId != null ? String(body.wallColorId) : undefined,
    );
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
      err instanceof Error ? err.message : "No se pudo aplicar la pintura";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
