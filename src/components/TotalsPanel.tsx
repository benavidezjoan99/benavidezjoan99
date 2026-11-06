import { formatUsd } from "@/lib/calculations";
import { t } from "@/lib/i18n";
import type { ProjectTotals } from "@/lib/types";

export function TotalsPanel({
  totals,
  laborPercent,
  contingencyPercent,
}: {
  totals: ProjectTotals;
  laborPercent: number;
  contingencyPercent: number;
}) {
  return (
    <aside className="totals-pulse sticky top-4 rounded-xl bg-[var(--bg-deep)] px-5 py-5 text-[var(--surface)]">
      <h2 className="brand-mark text-xl">{t("totals.title")}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-white/70">{t("totals.materials")}</dt>
          <dd className="num font-medium">{formatUsd(totals.materials)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-white/70">
            {t("totals.labor")} ({laborPercent}%)
          </dt>
          <dd className="num font-medium">{formatUsd(totals.labor)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-white/70">
            {t("totals.contingency")} ({contingencyPercent}%)
          </dt>
          <dd className="num font-medium">{formatUsd(totals.contingency)}</dd>
        </div>
        <div className="mt-2 border-t border-white/20 pt-3">
          <div className="flex justify-between gap-4">
            <dt className="brand-mark text-lg">{t("totals.grandTotal")}</dt>
            <dd className="num text-lg font-semibold">{formatUsd(totals.grandTotal)}</dd>
          </div>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-white/70">{t("totals.costPerM2")}</dt>
          <dd className="num font-medium">
            {totals.costPerM2 != null ? formatUsd(totals.costPerM2) : "—"}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
