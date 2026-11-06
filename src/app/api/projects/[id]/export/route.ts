import { NextRequest, NextResponse } from "next/server";
import { buildCsv, getProjectDetail } from "@/lib/projects";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const detail = getProjectDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }
  const csv = buildCsv(detail);
  const filename = `presupuesto-${detail.project.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
