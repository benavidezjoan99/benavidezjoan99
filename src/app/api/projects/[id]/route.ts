import { NextRequest, NextResponse } from "next/server";
import { deleteProject, getProjectDetail, updateProject } from "@/lib/projects";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const detail = getProjectDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }
  return NextResponse.json(detail);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const project = updateProject(id, body);
  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = deleteProject(id);
  if (!ok) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
