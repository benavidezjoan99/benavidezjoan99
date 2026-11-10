import { NextRequest, NextResponse } from "next/server";
import { deleteRoom, updateRoom } from "@/lib/projects";
import type { RoomType } from "@/lib/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; roomId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id, roomId } = await params;
  const body = await req.json();
  const room = updateRoom(id, roomId, {
    name: body.name,
    count: body.count,
    areaM2: body.areaM2,
    roomType: body.roomType as RoomType | undefined,
    planX: body.planX,
    planY: body.planY,
    planWFt: body.planWFt,
    planHFt: body.planHFt,
  });
  if (!room) {
    return NextResponse.json({ error: "Ambiente no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ room });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, roomId } = await params;
  const ok = deleteRoom(id, roomId);
  if (!ok) {
    return NextResponse.json({ error: "Ambiente no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
