import { t } from "@/lib/i18n";

export function EstimateBanner() {
  return (
    <div className="space-y-2">
      <p className="rounded-md bg-[var(--warn-bg)] px-3 py-2 text-sm text-[var(--warn)]">
        {t("banner.estimate")}
      </p>
      <p className="rounded-md border border-dashed border-[var(--line)] bg-white/50 px-3 py-2 text-sm text-[var(--ink-muted)]">
        {t("banner.demo")}
      </p>
    </div>
  );
}
