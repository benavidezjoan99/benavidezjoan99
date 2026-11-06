"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PR_MUNICIPALITIES } from "@/lib/municipalities";
import { EstimateBanner } from "@/components/EstimateBanner";

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      municipality: String(form.get("municipality") || ""),
      approxM2: form.get("approxM2") ? Number(form.get("approxM2")) : null,
      estimateDate: String(form.get("estimateDate") || ""),
      laborPercent: Number(form.get("laborPercent") || 35),
      contingencyPercent: Number(form.get("contingencyPercent") || 10),
      notes: String(form.get("notes") || "") || null,
      mode: "construir" as const,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "No se pudo crear el proyecto");
      return;
    }
    router.push(`/proyectos/${data.project.id}`);
    router.refresh();
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fade-in mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
          Obra nueva
        </p>
        <h1 className="brand-mark mt-1 text-3xl text-[var(--bg-deep)]">Nuevo proyecto</h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          Define el marco del presupuesto. Luego agregas ambientes y materiales.
        </p>
      </div>

      <EstimateBanner />

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Nombre del proyecto</span>
          <input
            name="name"
            required
            placeholder="Casa en Carolina"
            className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Municipio (Puerto Rico)</span>
          <select
            name="municipality"
            required
            defaultValue="San Juan"
            className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          >
            {PR_MUNICIPALITIES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Área aprox. (m²)</span>
            <input
              name="approxM2"
              type="number"
              min={1}
              step={0.1}
              placeholder="120"
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Fecha de estimación</span>
            <input
              name="estimateDate"
              type="date"
              defaultValue={today}
              required
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Mano de obra (%)</span>
            <input
              name="laborPercent"
              type="number"
              min={0}
              max={200}
              step={0.5}
              defaultValue={35}
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Imprevistos (%)</span>
            <input
              name="contingencyPercent"
              type="number"
              min={0}
              max={100}
              step={0.5}
              defaultValue={10}
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Notas (opcional)</span>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>

        <p className="text-sm text-[var(--ink-muted)]">
          Modo: <strong>construir</strong>. Remodelar se habilitará en una fase posterior.
        </p>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-strong)] disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Crear y continuar"}
          </button>
          <Link href="/" className="rounded-md px-4 py-2.5 text-sm text-[var(--ink-muted)]">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
