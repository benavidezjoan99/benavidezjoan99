import Link from "next/link";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { CatalogImportPanel } from "@/components/CatalogImportPanel";
import { EstimateBanner } from "@/components/EstimateBanner";
import { getCatalog } from "@/lib/projects";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default function CatalogoPage() {
  const items = getCatalog();

  return (
    <div className="fade-in space-y-8">
      <section className="max-w-3xl space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
          {t("catalog.page.eyebrow")}
        </p>
        <h1 className="brand-mark text-4xl leading-tight text-[var(--bg-deep)] sm:text-5xl">
          {t("catalog.page.title")}
        </h1>
        <p className="text-lg text-[var(--ink-muted)]">{t("catalog.page.subtitle")}</p>
        <p className="text-sm text-[var(--ink-muted)]">
          <Link href="/" className="underline-offset-2 hover:underline">
            ← {t("catalog.backHome")}
          </Link>
        </p>
      </section>

      <EstimateBanner />

      <CatalogBrowser
        items={items.map((i) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          unit: i.unit,
          unitPriceUsd: i.unitPriceUsd,
          notes: i.notes,
          isEstimate: i.isEstimate,
          priceSource: i.priceSource,
          pricedAt: i.pricedAt,
        }))}
      />

      <CatalogImportPanel />
    </div>
  );
}
