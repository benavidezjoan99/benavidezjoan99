import { NextRequest, NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/projects";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ projects: listProjects() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name?.trim() || !body?.municipality) {
      return NextResponse.json(
        { error: "Nombre y municipio son obligatorios." },
        { status: 400 },
      );
    }
    const project = createProject({
      name: body.name,
      municipality: body.municipality,
      approxM2: body.approxM2 ?? null,
      estimateDate: body.estimateDate,
      laborPercent: body.laborPercent,
      contingencyPercent: body.contingencyPercent,
      notes: body.notes ?? null,
      mode: body.mode,
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear proyecto";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
