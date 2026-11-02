import Link from "next/link";
import { formatUsd } from "@/lib/calculations";
import { EstimateBanner } from "@/components/EstimateBanner";
import { getProjectDetail, listProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const projects = listProjects();

  return (
    <div className="fade-in space-y-8">
      <section className="max-w-2xl space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
          Construir casa nueva
        </p>
        <h1 className="brand-mark text-4xl leading-tight text-[var(--bg-deep)] sm:text-5xl">
          CasaCalc PR
        </h1>
        <p className="text-lg text-[var(--ink-muted)]">
          Estima materiales, mano de obra e imprevistos para una obra nueva en Puerto Rico.
          Remodelar llega después — el modo queda reservado en el modelo de datos.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/proyectos/nuevo"
            className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
          >
            Nuevo proyecto
          </Link>
        </div>
      </section>

      <EstimateBanner />

      <section className="fade-in-delay space-y-4">
        <h2 className="brand-mark text-2xl text-[var(--bg-deep)]">Tus proyectos</h2>
        {projects.length === 0 ? (
          <p className="text-[var(--ink-muted)]">
            Aún no hay proyectos guardados. Crea el primero para armar el presupuesto.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {projects.map((project) => {
              const detail = getProjectDetail(project.id);
              return (
                <li key={project.id}>
                  <Link
                    href={`/proyectos/${project.id}`}
                    className="flex flex-col gap-1 py-4 transition hover:bg-white/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[var(--bg-deep)]">{project.name}</p>
                      <p className="text-sm text-[var(--ink-muted)]">
                        {project.municipality}
                        {project.approxM2 ? ` · ${project.approxM2} m²` : ""} ·{" "}
                        {project.estimateDate}
                      </p>
                    </div>
                    <p className="num text-base font-medium text-[var(--accent-strong)]">
                      {detail ? formatUsd(detail.totals.grandTotal) : "—"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
