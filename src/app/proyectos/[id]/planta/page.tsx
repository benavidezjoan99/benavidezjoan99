import { notFound } from "next/navigation";
import { FloorPlanEditor } from "@/components/floor-plan/FloorPlanEditor";
import {
  ensureRoomPlanGeometry,
  getCatalog,
  getProjectDetail,
} from "@/lib/projects";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PlantaPage({ params }: Props) {
  const { id } = await params;
  const detail = getProjectDetail(id);
  if (!detail) notFound();

  // Ambientes del editor lista sin croquis → auto-colocar en la planta.
  for (const room of detail.rooms) {
    if (
      room.planX == null ||
      room.planY == null ||
      room.planWFt == null ||
      room.planHFt == null
    ) {
      ensureRoomPlanGeometry(id, room.id);
    }
  }

  const refreshed = getProjectDetail(id);
  if (!refreshed) notFound();
  const catalog = getCatalog();

  return <FloorPlanEditor initial={refreshed} catalog={catalog} />;
}
