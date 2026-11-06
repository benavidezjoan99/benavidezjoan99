import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/projects";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ items: getCatalog() });
}
