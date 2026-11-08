import { NextResponse } from "next/server";
import { exportCatalogCsv, getCatalog, importCatalogCsv } from "@/lib/projects";
import { validateCatalogCsv } from "@/providers/pricing/catalog-csv-validate";

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
  if (url.searchParams.get("validate") === "1") {
    // Dry-run helper: POST body preferred; GET without body just documents endpoint.
    return NextResponse.json({
      hint: "POST CSV text with ?validate=1 to validate without importing",
    });
  }
  return NextResponse.json({ items: getCatalog() });
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const validateOnly = url.searchParams.get("validate") === "1";
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

    if (validateOnly) {
      const validation = validateCatalogCsv(text);
      return NextResponse.json(
        {
          ok: validation.ok,
          errors: validation.errors,
          warnings: validation.warnings,
          totalRows: validation.rows.length,
        },
        { status: validation.ok ? 200 : 400 },
      );
    }

    const result = importCatalogCsv(text);
    return NextResponse.json({
      ok: true,
      updated: result.updated,
      inserted: result.inserted,
      skipped: result.skipped,
      totalRows: result.rows.length,
      warnings: result.validation.warnings,
      items: getCatalog(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al importar CSV";
    // Try to surface structured validation if present
    try {
      const contentType = request.headers.get("content-type") || "";
      // body already consumed above; re-validate from message only
      void contentType;
    } catch {
      /* ignore */
    }
    return NextResponse.json(
      {
        error: message,
        errors: message
          .split("\n")
          .slice(1)
          .filter(Boolean)
          .map((line) => ({ message: line })),
      },
      { status: 400 },
    );
  }
}
