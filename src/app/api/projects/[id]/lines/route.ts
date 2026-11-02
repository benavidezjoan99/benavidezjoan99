import { NextRequest, NextResponse } from "next/server";
import { upsertLineItem } from "@/lib/projects";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  if (!body?.description?.trim()) {
    return NextResponse.json({ error: "Descripción obligatoria." }, { status: 400 });
  }
  const line = upsertLineItem(id, {
    roomId: body.roomId ?? null,
    catalogItemId: body.catalogItemId ?? null,
    description: body.description,
    category: body.category || "herramientas_misc",
    unit: body.unit || "u",
    quantity: Number(body.quantity) || 0,
    unitPrice: Number(body.unitPrice) || 0,
  });
  if (!line) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ line }, { status: 201 });
}
