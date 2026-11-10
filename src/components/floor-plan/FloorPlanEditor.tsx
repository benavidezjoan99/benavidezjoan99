"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  filterFloorFinishCatalog,
  rectAreaFt2,
  rectAreaM2,
} from "@/domain/floor-plan";
import { formatUsd } from "@/lib/money";
import { t } from "@/lib/i18n";
import {
  ROOM_TYPE_LABELS,
  type ProjectTotals,
  type RoomType,
} from "@/lib/types";
import type { CatalogItem, LineItem, Project, Room } from "@/lib/db/schema";
import type { PlanRoom } from "./FloorPlanCanvas";

const FloorPlanCanvas = dynamic(
  () => import("./FloorPlanCanvas").then((m) => m.FloorPlanCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[560px] items-center justify-center rounded-lg border border-[var(--line)] bg-[#f7f5f0] text-sm text-[var(--ink-muted)]">
        Cargando lienzo 2D…
      </div>
    ),
  },
);

type Props = {
  initial: {
    project: Project;
    rooms: Room[];
    lineItems: LineItem[];
    totals: ProjectTotals;
  };
  catalog: CatalogItem[];
};

function asPlanRoom(room: Room): PlanRoom | null {
  if (
    room.planX == null ||
    room.planY == null ||
    room.planWFt == null ||
    room.planHFt == null
  ) {
    return null;
  }
  return room as PlanRoom;
}

export function FloorPlanEditor({ initial, catalog }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [project] = useState(initial.project);
  const [rooms, setRooms] = useState(initial.rooms);
  const [lines, setLines] = useState(initial.lineItems);
  const [totals, setTotals] = useState(initial.totals);
  const [selectedId, setSelectedId] = useState<string | null>(
    initial.rooms[0]?.id ?? null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [floorSku, setFloorSku] = useState("");
  const [newRoomType, setNewRoomType] = useState<RoomType>("dormitorio");
  const [newRoomName, setNewRoomName] = useState("");

  const floorOptions = useMemo(
    () => filterFloorFinishCatalog(catalog),
    [catalog],
  );

  const planRooms = useMemo(
    () => rooms.map(asPlanRoom).filter((r): r is PlanRoom => r != null),
    [rooms],
  );

  const selected = rooms.find((r) => r.id === selectedId) ?? null;
  const selectedPlan = selected ? asPlanRoom(selected) : null;

  const selectedFloorLine = useMemo(() => {
    if (!selected?.floorCatalogItemId) return null;
    return (
      lines.find(
        (l) =>
          l.roomId === selected.id &&
          l.catalogItemId === selected.floorCatalogItemId,
      ) ?? null
    );
  }, [lines, selected]);

  async function refresh() {
    const res = await fetch(`/api/projects/${project.id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo refrescar");
    setRooms(data.rooms);
    setLines(data.lineItems);
    setTotals(data.totals);
    startTransition(() => router.refresh());
  }

  async function addRoomOnPlan() {
    setError(null);
    setMessage(null);
    const res = await fetch(`/api/projects/${project.id}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newRoomName.trim() || ROOM_TYPE_LABELS[newRoomType],
        roomType: newRoomType,
        placeOnPlan: true,
        suggestMaterials: false,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "No se pudo agregar ambiente");
      return;
    }
    setNewRoomName("");
    setSelectedId(data.room.id);
    setMessage(t("plan.roomAdded"));
    await refresh();
  }

  async function onGeometryChange(
    roomId: string,
    next: { planX: number; planY: number; planWFt: number; planHFt: number },
  ) {
    setError(null);
    // Optimistic UI
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              ...next,
              areaM2: rectAreaM2(next.planWFt, next.planHFt),
            }
          : r,
      ),
    );
    const res = await fetch(`/api/projects/${project.id}/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo guardar la geometría");
      await refresh();
      return;
    }
    await refresh();
  }

  async function applyFloor() {
    const sku = floorSku || selected?.floorCatalogItemId || "";
    if (!selectedId || !sku) return;
    setError(null);
    setMessage(null);
    const res = await fetch(
      `/api/projects/${project.id}/rooms/${selectedId}/floor`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalogItemId: sku }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "No se pudo aplicar el piso");
      return;
    }
    setFloorSku(sku);
    setMessage(t("plan.floorApplied"));
    if (data.totals) setTotals(data.totals);
    if (data.lineItems) setLines(data.lineItems);
    if (data.room) {
      setRooms((prev) =>
        prev.map((r) => (r.id === data.room.id ? data.room : r)),
      );
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
            {t("plan.eyebrow")}
          </p>
          <h1 className="brand-mark mt-1 text-3xl text-[var(--bg-deep)] sm:text-4xl">
            {project.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {project.municipality} · {t("plan.subtitle")}
          </p>
        </div>
        <Link
          href={`/proyectos/${project.id}`}
          className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--surface)]"
        >
          {t("plan.backToBudget")}
        </Link>
      </div>

      <div
        className="rounded-md border border-[var(--line)] bg-[#fff8e8] px-4 py-3 text-sm text-[#5c4a22]"
        role="note"
      >
        {t("plan.disclaimer")}
      </div>

      {(message || error) && (
        <p
          className={`text-sm ${error ? "text-[var(--danger)]" : "text-[var(--accent-strong)]"}`}
        >
          {error || message}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          <FloorPlanCanvas
            rooms={planRooms}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onGeometryChange={onGeometryChange}
          />
          <form
            className="flex flex-wrap items-end gap-2 rounded-md border border-[var(--line)] bg-white p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void addRoomOnPlan();
            }}
          >
            <label className="text-sm">
              <span className="mb-1 block text-[var(--ink-muted)]">
                {t("plan.roomType")}
              </span>
              <select
                className="rounded border border-[var(--line)] px-2 py-1.5"
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value as RoomType)}
              >
                {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((k) => (
                  <option key={k} value={k}>
                    {ROOM_TYPE_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-[var(--ink-muted)]">
                {t("plan.roomName")}
              </span>
              <input
                className="rounded border border-[var(--line)] px-2 py-1.5"
                value={newRoomName}
                placeholder={ROOM_TYPE_LABELS[newRoomType]}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
            >
              {t("plan.addRoom")}
            </button>
          </form>
        </div>

        <aside className="space-y-4 rounded-lg border border-[var(--line)] bg-white p-4">
          <h2 className="font-semibold text-[var(--bg-deep)]">
            {t("plan.selectedTitle")}
          </h2>
          {!selected || !selectedPlan ? (
            <p className="text-sm text-[var(--ink-muted)]">
              {t("plan.selectHint")}
            </p>
          ) : (
            <>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-[var(--ink-muted)]">{t("plan.roomName")}</dt>
                  <dd className="font-medium">{selected.name}</dd>
                </div>
                <div>
                  <dt className="text-[var(--ink-muted)]">{t("plan.roomType")}</dt>
                  <dd>
                    {ROOM_TYPE_LABELS[selected.roomType as RoomType] ??
                      selected.roomType}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--ink-muted)]">{t("plan.dimensions")}</dt>
                  <dd>
                    {selectedPlan.planWFt} × {selectedPlan.planHFt} ft
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--ink-muted)]">{t("plan.area")}</dt>
                  <dd>
                    {rectAreaFt2(selectedPlan.planWFt, selectedPlan.planHFt)}{" "}
                    ft² ·{" "}
                    {rectAreaM2(selectedPlan.planWFt, selectedPlan.planHFt)} m²
                  </dd>
                </div>
              </dl>

              <div className="border-t border-[var(--line)] pt-3">
                <h3 className="mb-2 text-sm font-semibold">
                  {t("plan.floorFinish")}
                </h3>
                <p className="mb-2 text-xs text-[var(--ink-muted)]">
                  {t("plan.floorHelp")}
                </p>
                <select
                  className="mb-2 w-full rounded border border-[var(--line)] px-2 py-1.5 text-sm"
                  value={floorSku || selected.floorCatalogItemId || ""}
                  onChange={(e) => setFloorSku(e.target.value)}
                >
                  <option value="">{t("plan.pickFloor")}</option>
                  {floorOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {formatUsd(item.unitPriceUsd)}/{item.unit}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!(floorSku || selected.floorCatalogItemId)}
                  onClick={() => void applyFloor()}
                  className="w-full rounded-md bg-[var(--bg-deep)] px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
                >
                  {t("plan.applyFloor")}
                </button>
                {selectedFloorLine && (
                  <p className="mt-2 text-xs text-[var(--ink-muted)]">
                    {t("plan.currentLine")}: {selectedFloorLine.quantity}{" "}
                    {selectedFloorLine.unit} ·{" "}
                    {formatUsd(
                      selectedFloorLine.quantity * selectedFloorLine.unitPrice,
                    )}{" "}
                    ({selectedFloorLine.priceSource || "seed"}
                    {selectedFloorLine.pricedAt
                      ? ` · ${selectedFloorLine.pricedAt}`
                      : ""}
                    )
                  </p>
                )}
              </div>
            </>
          )}

          <div className="border-t border-[var(--line)] pt-3 text-sm">
            <h3 className="mb-2 font-semibold">{t("totals.title")}</h3>
            <ul className="space-y-1 text-[var(--ink-muted)]">
              <li>
                {t("totals.materials")}: {formatUsd(totals.materials)}
              </li>
              <li>
                {t("totals.labor")}: {formatUsd(totals.labor)}
              </li>
              <li>
                {t("totals.contingency")}: {formatUsd(totals.contingency)}
              </li>
              <li className="font-semibold text-[var(--bg-deep)]">
                {t("totals.grandTotal")}: {formatUsd(totals.grandTotal)}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
