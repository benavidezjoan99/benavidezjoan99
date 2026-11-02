import { NextResponse } from "next/server";
import { exportCatalogCsv, getCatalog, importCatalogCsv } from "@/lib/projects";

export const runtime = "nodejs";

export function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("format") === "csv") {
    const csv = exportCatalogCsv();
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="obracalc-catalog.csv"',
      },
    });
  }
  return NextResponse.json({ items: getCatalog() });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let text = "";
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { csv?: string };
      text = body.csv ?? "";
    } else {
      text = await request.text();
    }
    if (!text.trim()) {
      return NextResponse.json({ error: "CSV vacío" }, { status: 400 });
    }
    const result = importCatalogCsv(text);
    return NextResponse.json({
      ok: true,
      updated: result.updated,
      inserted: result.inserted,
      totalRows: result.rows.length,
      items: getCatalog(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al importar CSV";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
