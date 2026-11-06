/** Modo de proyecto. MVP solo implementa "construir"; "remodelar" es el punto de extensión. */
export type ProjectMode = "construir" | "remodelar";

export type CatalogCategory =
  | "cemento_agregados"
  | "bloque_mamposteria"
  | "acero"
  | "madera"
  | "techos"
  | "electrico"
  | "plomeria"
  | "acabados"
  | "pintura"
  | "herramientas_misc";

export type RoomType =
  | "sala"
  | "cocina"
  | "comedor"
  | "bano"
  | "dormitorio"
  | "lavanderia"
  | "garage"
  | "pasillo"
  | "exterior"
  | "otro";

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  sala: "Sala",
  cocina: "Cocina",
  comedor: "Comedor",
  bano: "Baño",
  dormitorio: "Dormitorio",
  lavanderia: "Lavandería",
  garage: "Garaje",
  pasillo: "Pasillo / circulación",
  exterior: "Exterior / terraza",
  otro: "Otro",
};

export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  cemento_agregados: "Cemento y agregados",
  bloque_mamposteria: "Bloque y mampostería",
  acero: "Acero / varilla",
  madera: "Madera",
  techos: "Techos",
  electrico: "Eléctrico",
  plomeria: "Plomería",
  acabados: "Acabados",
  pintura: "Pintura",
  herramientas_misc: "Herramientas / misceláneos",
};

export interface ProjectTotals {
  materials: number;
  labor: number;
  contingency: number;
  grandTotal: number;
  costPerM2: number | null;
}
