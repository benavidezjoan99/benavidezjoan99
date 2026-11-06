"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatUsd } from "@/lib/calculations";
import { t } from "@/lib/i18n";
import { PR_MUNICIPALITIES } from "@/lib/municipalities";
import {
  CATEGORY_LABELS,
  ROOM_TYPE_LABELS,
  type CatalogCategory,
  type RoomType,
} from "@/lib/types";
import type { CatalogItem, LineItem, Project, Room } from "@/lib/db/schema";
import type { ProjectTotals } from "@/lib/types";
import { EstimateBanner } from "./EstimateBanner";
import { TotalsPanel } from "./TotalsPanel";

type Props = {
  initial: {
    project: Project;
    rooms: Room[];
    lineItems: LineItem[];
    totals: ProjectTotals;
  };
  catalog: CatalogItem[];
};

export function ProjectEditor({ initial, catalog }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [project, setProject] = useState(initial.project);
  const [rooms, setRooms] = useState(initial.rooms);
  const [lines, setLines] = useState(initial.lineItems);
  const [totals, setTotals] = useState(initial.totals);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [roomForm, setRoomForm] = useState({
    name: "",
    roomType: "dormitorio" as RoomType,
    count: 1,
    areaM2: "",
    suggestMaterials: true,
  });

  const [lineForm, setLineForm] = useState({
    roomId: "",
    catalogItemId: "",
    description: "",
    category: "acabados",
    unit: "u",
    quantity: 1,
    unitPrice: 0,
  });

  async function refresh() {
    const res = await fetch(`/api/projects/${project.id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo refrescar");
    setProject(data.project);
    setRooms(data.rooms);
    setLines(data.lineItems);
    setTotals(data.totals);
    startTransition(() => router.refresh());
  }

  async function saveProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        municipality: form.get("municipality"),
        approxM2: form.get("approxM2") ? Number(form.get("approxM2")) : null,
        estimateDate: form.get("estimateDate"),
        laborPercent: Number(form.get("laborPercent")),
        contingencyPercent: Number(form.get("contingencyPercent")),
        notes: String(form.get("notes") || "") || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al guardar");
      return;
    }
    setMessage("Proyecto actualizado");
    await refresh();
  }

  async function addRoom(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/projects/${project.id}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: roomForm.name || ROOM_TYPE_LABELS[roomForm.roomType],
        roomType: roomForm.roomType,
        count: roomForm.count,
        areaM2: roomForm.areaM2 ? Number(roomForm.areaM2) : null,
        suggestMaterials: roomForm.suggestMaterials,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "No se pudo agregar ambiente");
      return;
    }
    setRoomForm({
      name: "",
      roomType: "dormitorio",
      count: 1,
      areaM2: "",
      suggestMaterials: true,
    });
    setMessage("Ambiente agregado con materiales sugeridos");
    await refresh();
  }

  async function removeRoom(roomId: string) {
    if (!confirm("¿Eliminar ambiente y sus materiales?")) return;
    await fetch(`/api/projects/${project.id}/rooms/${roomId}`, { method: "DELETE" });
    await refresh();
  }

  async function saveLine(line: LineItem, patch: Partial<LineItem>) {
    const res = await fetch(`/api/projects/${project.id}/lines/${line.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: patch.description ?? line.description,
        category: patch.category ?? line.category,
        unit: patch.unit ?? line.unit,
        quantity: patch.quantity ?? line.quantity,
        unitPrice: patch.unitPrice ?? line.unitPrice,
        roomId: patch.roomId !== undefined ? patch.roomId : line.roomId,
        catalogItemId: line.catalogItemId,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al actualizar línea");
      return;
    }
    await refresh();
  }

  async function removeLine(lineId: string) {
    await fetch(`/api/projects/${project.id}/lines/${lineId}`, { method: "DELETE" });
    await refresh();
  }

  async function addLine(e: React.FormEvent) {
    e.preventDefault();
    const catalogItem = catalog.find((c) => c.id === lineForm.catalogItemId);
    const payload = {
      roomId: lineForm.roomId || null,
      catalogItemId: catalogItem?.id ?? null,
      description: lineForm.description || catalogItem?.name || "Material",
      category: catalogItem?.category || lineForm.category,
      unit: catalogItem?.unit || lineForm.unit,
      quantity: lineForm.quantity,
      unitPrice: catalogItem ? catalogItem.unitPriceUsd : lineForm.unitPrice,
    };
    const res = await fetch(`/api/projects/${project.id}/lines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo agregar línea");
      return;
    }
    setLineForm({
      roomId: "",
      catalogItemId: "",
      description: "",
      category: "acabados",
      unit: "u",
      quantity: 1,
      unitPrice: 0,
    });
    await refresh();
  }

  async function deleteProject() {
    if (!confirm("¿Eliminar este proyecto por completo?")) return;
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  const roomMap = useMemo(() => {
    const m = new Map<string, Room>();
    for (const r of rooms) m.set(r.id, r);
    return m;
  }, [rooms]);

  const linesByRoom = useMemo(() => {
    const grouped = new Map<string, LineItem[]>();
    grouped.set("__none__", []);
    for (const room of rooms) grouped.set(room.id, []);
    for (const line of lines) {
      const key = line.roomId && grouped.has(line.roomId) ? line.roomId : "__none__";
      grouped.get(key)!.push(line);
    }
    return grouped;
  }, [lines, rooms]);

  return (
    <div className="fade-in space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
            Construir · {project.municipality}
          </p>
          <h1 className="brand-mark mt-1 text-3xl text-[var(--bg-deep)] sm:text-4xl">
            {project.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/projects/${project.id}/export`}
            className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--surface)]"
          >
            {t("editor.exportCsv")}
          </a>
          <button
            type="button"
            onClick={deleteProject}
            className="rounded-md px-4 py-2 text-sm text-[var(--danger)]"
          >
            {t("editor.delete")}
          </button>
        </div>
      </div>

      <EstimateBanner />
      {(message || error) && (
        <p className={`text-sm ${error ? "text-[var(--danger)]" : "text-[var(--accent-strong)]"}`}>
          {error || message}
          {pending ? " · actualizando…" : ""}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="brand-mark text-2xl text-[var(--bg-deep)]">{t("editor.projectData")}</h2>
            <form onSubmit={saveProject} className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 sm:col-span-2">
                <span className="text-sm font-medium">Nombre</span>
                <input
                  name="name"
                  defaultValue={project.name}
                  required
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Municipio</span>
                <select
                  name="municipality"
                  defaultValue={project.municipality}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                >
                  {PR_MUNICIPALITIES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Fecha</span>
                <input
                  name="estimateDate"
                  type="date"
                  defaultValue={project.estimateDate}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Área (m²)</span>
                <input
                  name="approxM2"
                  type="number"
                  step={0.1}
                  defaultValue={project.approxM2 ?? ""}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Mano de obra %</span>
                <input
                  name="laborPercent"
                  type="number"
                  step={0.5}
                  defaultValue={project.laborPercent}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Imprevistos %</span>
                <input
                  name="contingencyPercent"
                  type="number"
                  step={0.5}
                  defaultValue={project.contingencyPercent}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-sm font-medium">Notas</span>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={project.notes ?? ""}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-strong)]"
                >
                  Guardar datos
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="brand-mark text-2xl text-[var(--bg-deep)]">{t("editor.rooms")}</h2>
            <form
              onSubmit={addRoom}
              className="grid gap-3 rounded-lg border border-dashed border-[var(--line)] bg-white/60 p-4 sm:grid-cols-2"
            >
              <label className="space-y-1">
                <span className="text-sm font-medium">Tipo</span>
                <select
                  value={roomForm.roomType}
                  onChange={(e) =>
                    setRoomForm((s) => ({ ...s, roomType: e.target.value as RoomType }))
                  }
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                >
                  {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((t) => (
                    <option key={t} value={t}>
                      {ROOM_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Nombre</span>
                <input
                  value={roomForm.name}
                  onChange={(e) => setRoomForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder={ROOM_TYPE_LABELS[roomForm.roomType]}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Cantidad</span>
                <input
                  type="number"
                  min={1}
                  value={roomForm.count}
                  onChange={(e) =>
                    setRoomForm((s) => ({ ...s, count: Number(e.target.value) || 1 }))
                  }
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">m² (opcional)</span>
                <input
                  value={roomForm.areaM2}
                  onChange={(e) => setRoomForm((s) => ({ ...s, areaM2: e.target.value }))}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                />
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={roomForm.suggestMaterials}
                  onChange={(e) =>
                    setRoomForm((s) => ({ ...s, suggestMaterials: e.target.checked }))
                  }
                />
                <span className="text-sm">{t("editor.catalogSuggest")}</span>
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-md bg-[var(--bg-mid)] px-4 py-2 text-sm font-medium text-white"
                >
                  Agregar ambiente
                </button>
              </div>
            </form>

            {rooms.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">
                Agrega sala, cocina, baños, dormitorios… para armar el presupuesto.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {rooms.map((room) => (
                  <li key={room.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-[var(--ink-muted)]">
                        {ROOM_TYPE_LABELS[room.roomType as RoomType] || room.roomType} · ×
                        {room.count}
                        {room.areaM2 ? ` · ${room.areaM2} m²` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRoom(room.id)}
                      className="text-sm text-[var(--danger)]"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="brand-mark text-2xl text-[var(--bg-deep)]">{t("editor.materials")}</h2>
            <form
              onSubmit={addLine}
              className="grid gap-3 rounded-lg border border-dashed border-[var(--line)] bg-white/60 p-4"
            >
              <label className="space-y-1">
                <span className="text-sm font-medium">Del catálogo (opcional)</span>
                <select
                  value={lineForm.catalogItemId}
                  onChange={(e) => {
                    const item = catalog.find((c) => c.id === e.target.value);
                    setLineForm((s) => ({
                      ...s,
                      catalogItemId: e.target.value,
                      description: item?.name || s.description,
                      category: item?.category || s.category,
                      unit: item?.unit || s.unit,
                      unitPrice: item?.unitPriceUsd ?? s.unitPrice,
                    }));
                  }}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                >
                  <option value="">— Manual / elegir —</option>
                  {catalog.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({formatUsd(item.unitPriceUsd)}/{item.unit})
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 sm:col-span-2">
                  <span className="text-sm font-medium">Descripción</span>
                  <input
                    value={lineForm.description}
                    onChange={(e) =>
                      setLineForm((s) => ({ ...s, description: e.target.value }))
                    }
                    className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                    required
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Ambiente</span>
                  <select
                    value={lineForm.roomId}
                    onChange={(e) => setLineForm((s) => ({ ...s, roomId: e.target.value }))}
                    className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                  >
                    <option value="">General</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Cantidad</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={lineForm.quantity}
                    onChange={(e) =>
                      setLineForm((s) => ({ ...s, quantity: Number(e.target.value) }))
                    }
                    className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium">Precio unitario USD</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={lineForm.unitPrice}
                    onChange={(e) =>
                      setLineForm((s) => ({ ...s, unitPrice: Number(e.target.value) }))
                    }
                    className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="w-fit rounded-md bg-[var(--bg-mid)] px-4 py-2 text-sm font-medium text-white"
              >
                Agregar material
              </button>
            </form>

            {lines.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">
                Sin líneas aún. Agrega ambientes con sugerencias o materiales manuales.
              </p>
            ) : (
              <div className="space-y-6">
                {[...rooms.map((r) => r.id), "__none__"].map((roomKey) => {
                  const group = linesByRoom.get(roomKey) || [];
                  if (group.length === 0) return null;
                  const title =
                    roomKey === "__none__"
                      ? "General / sin ambiente"
                      : roomMap.get(roomKey)?.name || "Ambiente";
                  return (
                    <div key={roomKey}>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                        {title}
                      </h3>
                      <div className="table-wrap">
                        <table className="w-full min-w-[640px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-[var(--line)] text-[var(--ink-muted)]">
                              <th className="py-2 pr-2 font-medium">Material</th>
                              <th className="py-2 pr-2 font-medium">Categoría</th>
                              <th className="py-2 pr-2 font-medium">Cant.</th>
                              <th className="py-2 pr-2 font-medium">P. unit.</th>
                              <th className="py-2 pr-2 font-medium">Subtotal</th>
                              <th className="py-2 font-medium" />
                            </tr>
                          </thead>
                          <tbody>
                            {group.map((line) => (
                              <tr key={line.id} className="border-b border-[var(--line)]/70">
                                <td className="py-2 pr-2">
                                  <input
                                    defaultValue={line.description}
                                    onBlur={(e) => {
                                      if (e.target.value !== line.description) {
                                        void saveLine(line, { description: e.target.value });
                                      }
                                    }}
                                    className="w-full min-w-[12rem] rounded border border-transparent bg-transparent px-1 py-1 hover:border-[var(--line)] focus:border-[var(--accent)]"
                                  />
                                  <span className="text-xs text-[var(--ink-muted)]">
                                    {line.unit}
                                    {line.priceSource
                                      ? ` · ${line.priceSource}${line.pricedAt ? ` @ ${line.pricedAt}` : ""}`
                                      : ""}
                                  </span>
                                </td>
                                <td className="py-2 pr-2 text-[var(--ink-muted)]">
                                  {CATEGORY_LABELS[line.category as CatalogCategory] ||
                                    line.category}
                                </td>
                                <td className="py-2 pr-2">
                                  <input
                                    type="number"
                                    step={0.01}
                                    defaultValue={line.quantity}
                                    onBlur={(e) => {
                                      const quantity = Number(e.target.value);
                                      if (quantity !== line.quantity) {
                                        void saveLine(line, { quantity });
                                      }
                                    }}
                                    className="num w-20 rounded border border-transparent bg-transparent px-1 py-1 hover:border-[var(--line)] focus:border-[var(--accent)]"
                                  />
                                </td>
                                <td className="py-2 pr-2">
                                  <input
                                    type="number"
                                    step={0.01}
                                    defaultValue={line.unitPrice}
                                    onBlur={(e) => {
                                      const unitPrice = Number(e.target.value);
                                      if (unitPrice !== line.unitPrice) {
                                        void saveLine(line, { unitPrice });
                                      }
                                    }}
                                    className="num w-24 rounded border border-transparent bg-transparent px-1 py-1 hover:border-[var(--line)] focus:border-[var(--accent)]"
                                  />
                                </td>
                                <td className="num py-2 pr-2 font-medium">
                                  {formatUsd(line.quantity * line.unitPrice)}
                                </td>
                                <td className="py-2">
                                  <button
                                    type="button"
                                    onClick={() => removeLine(line.id)}
                                    className="text-[var(--danger)]"
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <TotalsPanel
          totals={totals}
          laborPercent={project.laborPercent}
          contingencyPercent={project.contingencyPercent}
        />
      </div>
    </div>
  );
}
