import type { RoomType } from "./types";

/**
 * Materiales sugeridos por tipo de ambiente (IDs del catálogo semilla).
 * Cantidades son puntos de partida editables, no reglas de ingeniería.
 */
export const ROOM_SUGGESTIONS: Record<
  RoomType,
  Array<{ catalogId: string; quantityPerUnit: number }>
> = {
  sala: [
    { catalogId: "bloque-8", quantityPerUnit: 120 },
    { catalogId: "cem-portland-94", quantityPerUnit: 10 },
    { catalogId: "varilla-4", quantityPerUnit: 8 },
    { catalogId: "drywall-1-2", quantityPerUnit: 12 },
    { catalogId: "pintura-interior", quantityPerUnit: 3 },
    { catalogId: "ceramica-piso", quantityPerUnit: 180 },
    { catalogId: "tomacorriente", quantityPerUnit: 6 },
    { catalogId: "cable-12-romex", quantityPerUnit: 80 },
    { catalogId: "ventana-aluminio", quantityPerUnit: 2 },
  ],
  cocina: [
    { catalogId: "bloque-8", quantityPerUnit: 80 },
    { catalogId: "cem-portland-94", quantityPerUnit: 8 },
    { catalogId: "ceramica-piso", quantityPerUnit: 120 },
    { catalogId: "gabinetes-cocina", quantityPerUnit: 12 },
    { catalogId: "fregadero", quantityPerUnit: 1 },
    { catalogId: "pvc-sch40-1-2", quantityPerUnit: 40 },
    { catalogId: "tomacorriente", quantityPerUnit: 8 },
    { catalogId: "cable-12-romex", quantityPerUnit: 100 },
    { catalogId: "pintura-interior", quantityPerUnit: 2 },
    { catalogId: "ventana-aluminio", quantityPerUnit: 1 },
  ],
  comedor: [
    { catalogId: "bloque-8", quantityPerUnit: 90 },
    { catalogId: "cem-portland-94", quantityPerUnit: 8 },
    { catalogId: "ceramica-piso", quantityPerUnit: 140 },
    { catalogId: "pintura-interior", quantityPerUnit: 2 },
    { catalogId: "drywall-1-2", quantityPerUnit: 8 },
    { catalogId: "tomacorriente", quantityPerUnit: 4 },
    { catalogId: "ventana-aluminio", quantityPerUnit: 1 },
  ],
  bano: [
    { catalogId: "bloque-6", quantityPerUnit: 60 },
    { catalogId: "cem-portland-94", quantityPerUnit: 6 },
    { catalogId: "ceramica-piso", quantityPerUnit: 50 },
    { catalogId: "porcelanato", quantityPerUnit: 40 },
    { catalogId: "inodoro", quantityPerUnit: 1 },
    { catalogId: "lavamanos", quantityPerUnit: 1 },
    { catalogId: "griferia-bano", quantityPerUnit: 1 },
    { catalogId: "pvc-dwv-2", quantityPerUnit: 20 },
    { catalogId: "pvc-sch40-1-2", quantityPerUnit: 25 },
    { catalogId: "pintura-interior", quantityPerUnit: 1 },
    { catalogId: "tomacorriente", quantityPerUnit: 2 },
  ],
  dormitorio: [
    { catalogId: "bloque-8", quantityPerUnit: 100 },
    { catalogId: "cem-portland-94", quantityPerUnit: 8 },
    { catalogId: "drywall-1-2", quantityPerUnit: 10 },
    { catalogId: "pintura-interior", quantityPerUnit: 2 },
    { catalogId: "ceramica-piso", quantityPerUnit: 150 },
    { catalogId: "puerta-interior", quantityPerUnit: 1 },
    { catalogId: "ventana-aluminio", quantityPerUnit: 1 },
    { catalogId: "closet-rods", quantityPerUnit: 1 },
    { catalogId: "tomacorriente", quantityPerUnit: 4 },
    { catalogId: "cable-14-romex", quantityPerUnit: 60 },
  ],
  lavanderia: [
    { catalogId: "bloque-6", quantityPerUnit: 40 },
    { catalogId: "ceramica-piso", quantityPerUnit: 60 },
    { catalogId: "pvc-sch40-3-4", quantityPerUnit: 30 },
    { catalogId: "pvc-dwv-2", quantityPerUnit: 15 },
    { catalogId: "tomacorriente", quantityPerUnit: 3 },
    { catalogId: "pintura-interior", quantityPerUnit: 1 },
  ],
  garage: [
    { catalogId: "bloque-8", quantityPerUnit: 140 },
    { catalogId: "cem-portland-94", quantityPerUnit: 15 },
    { catalogId: "hormigon-listo", quantityPerUnit: 4 },
    { catalogId: "varilla-4", quantityPerUnit: 12 },
    { catalogId: "malla-electrosoldada", quantityPerUnit: 6 },
    { catalogId: "tomacorriente", quantityPerUnit: 4 },
    { catalogId: "pintura-exterior", quantityPerUnit: 2 },
  ],
  pasillo: [
    { catalogId: "ceramica-piso", quantityPerUnit: 80 },
    { catalogId: "pintura-interior", quantityPerUnit: 1 },
    { catalogId: "drywall-1-2", quantityPerUnit: 4 },
    { catalogId: "tomacorriente", quantityPerUnit: 2 },
  ],
  exterior: [
    { catalogId: "bloque-8", quantityPerUnit: 80 },
    { catalogId: "cem-portland-94", quantityPerUnit: 10 },
    { catalogId: "pintura-exterior", quantityPerUnit: 3 },
    { catalogId: "impermeabilizante", quantityPerUnit: 4 },
    { catalogId: "zinc-corrugado", quantityPerUnit: 8 },
  ],
  otro: [
    { catalogId: "cem-portland-94", quantityPerUnit: 5 },
    { catalogId: "bloque-8", quantityPerUnit: 40 },
    { catalogId: "pintura-interior", quantityPerUnit: 1 },
  ],
};

export function suggestionsForRoom(roomType: RoomType) {
  return ROOM_SUGGESTIONS[roomType];
}
