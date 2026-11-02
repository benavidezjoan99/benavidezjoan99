import type { ProjectMode } from "./types";

/**
 * Punto de extensión para modos de proyecto.
 *
 * MVP: solo "construir" tiene UI y flujos.
 * "remodelar" se guarda en el esquema (`projects.mode`) para la fase siguiente
 * (zonas existentes + tipos de intervención), sin implementar pantallas aquí.
 */
export const IMPLEMENTED_MODES: readonly ProjectMode[] = ["construir"] as const;

export const FUTURE_MODES: readonly ProjectMode[] = ["remodelar"] as const;

export function isModeImplemented(mode: ProjectMode): boolean {
  return (IMPLEMENTED_MODES as readonly string[]).includes(mode);
}

export function modeLabel(mode: ProjectMode): string {
  switch (mode) {
    case "construir":
      return "Construir casa nueva";
    case "remodelar":
      return "Remodelar (próximamente)";
    default:
      return mode;
  }
}
