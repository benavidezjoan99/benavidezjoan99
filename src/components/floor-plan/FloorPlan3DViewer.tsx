"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import {
  FloorPlan3DScene,
  type WalkMode,
} from "./FloorPlan3DScene";
import type { PlanRoom3DInput, CatalogHint3D } from "@/domain/floor-plan";

type Props = {
  rooms: PlanRoom3DInput[];
  catalogById?: Record<string, CatalogHint3D>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function FloorPlan3DViewer({
  rooms,
  catalogById,
  selectedId,
  onSelect,
}: Props) {
  const [mode, setMode] = useState<WalkMode>("orbit");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex rounded-md border border-[var(--line)] bg-white p-0.5 text-sm"
          role="group"
          aria-label={t("plan.cameraMode")}
        >
          <button
            type="button"
            className={`rounded px-3 py-1.5 font-medium transition ${
              mode === "orbit"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--ink-muted)] hover:bg-[var(--surface)]"
            }`}
            onClick={() => setMode("orbit")}
          >
            {t("plan.orbit")}
          </button>
          <button
            type="button"
            className={`rounded px-3 py-1.5 font-medium transition ${
              mode === "walk"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--ink-muted)] hover:bg-[var(--surface)]"
            }`}
            onClick={() => setMode("walk")}
          >
            {t("plan.walk")}
          </button>
        </div>
        <p className="text-xs text-[var(--ink-muted)]">
          {mode === "orbit" ? t("plan.orbitHelp") : t("plan.walkHelp")}
        </p>
      </div>
      <FloorPlan3DScene
        rooms={rooms}
        catalogById={catalogById}
        selectedId={selectedId}
        onSelect={onSelect}
        mode={mode}
      />
      <ul className="flex flex-wrap gap-3 text-xs text-[var(--ink-muted)]">
        <li>{t("plan.legend3dWalls")}</li>
        <li>{t("plan.legend3dFloors")}</li>
        <li>{t("plan.legend3dFurniture")}</li>
      </ul>
    </div>
  );
}
