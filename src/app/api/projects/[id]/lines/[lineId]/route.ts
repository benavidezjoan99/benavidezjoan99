import { NextRequest, NextResponse } from "next/server";
import { deleteLineItem, upsertLineItem } from "@/lib/projects";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; lineId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id, lineId } = await params;
  const body = await req.json();
  const line = upsertLineItem(id, {
    id: lineId,
    roomId: body.roomId,
    catalogItemId: body.catalogItemId,
    description: body.description,
    category: body.category,
    unit: body.unit,
    quantity: Number(body.quantity),
    unitPrice: Number(body.unitPrice),
  });
  if (!line) {
    return NextResponse.json({ error: "Línea no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ line });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, lineId } = await params;
  const ok = deleteLineItem(id, lineId);
  if (!ok) {
    return NextResponse.json({ error: "Línea no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
