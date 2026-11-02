"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

export function CatalogImportPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    setStatus(null);
    const text = await file.text();
    const res = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "text/csv; charset=utf-8" },
      body: text,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al importar");
      return;
    }
    setStatus(
      `Importado: ${data.updated} actualizados, ${data.inserted} nuevos (${data.totalRows} filas).`,
    );
  }

  return (
    <section className="fade-in-delay space-y-3 border-t border-[var(--line)] pt-6">
      <h2 className="brand-mark text-2xl text-[var(--bg-deep)]">Catálogo</h2>
      <p className="text-sm text-[var(--ink-muted)]">
        Exporta el catálogo semilla, edita precios en CSV y vuelve a importar. Fuente se marca como{" "}
        <code className="text-xs">csv</code> con fecha. Sin scraping.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="/api/catalog?format=csv"
          className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--surface)]"
        >
          {t("catalog.export")}
        </a>
        <label className="cursor-pointer rounded-md bg-[var(--bg-mid)] px-4 py-2 text-sm font-medium text-white">
          {t("catalog.import")}
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {(status || error) && (
        <p className={`text-sm ${error ? "text-[var(--danger)]" : "text-[var(--accent-strong)]"}`}>
          {error || status}
        </p>
      )}
    </section>
  );
}
