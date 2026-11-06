import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/ProjectEditor";
import { getCatalog, getProjectDetail } from "@/lib/projects";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ProyectoPage({ params }: Props) {
  const { id } = await params;
  const detail = getProjectDetail(id);
  if (!detail) notFound();
  const catalog = getCatalog();

  return <ProjectEditor initial={detail} catalog={catalog} />;
}
