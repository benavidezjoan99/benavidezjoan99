import { NextRequest, NextResponse } from "next/server";
import { addRoom } from "@/lib/projects";
import type { RoomType } from "@/lib/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  if (!body?.name?.trim() || !body?.roomType) {
    return NextResponse.json(
      { error: "Nombre y tipo de ambiente son obligatorios." },
      { status: 400 },
    );
  }
  const room = addRoom(id, {
    name: body.name,
    roomType: body.roomType as RoomType,
    count: body.count,
    areaM2: body.areaM2 ?? null,
    suggestMaterials: body.suggestMaterials,
  });
  if (!room) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ room }, { status: 201 });
}
