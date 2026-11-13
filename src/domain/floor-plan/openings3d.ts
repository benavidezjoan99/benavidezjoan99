import type { Vec3, WallMesh3D, Opening3D } from "./scene3d";

/**
 * Entidades explícitas de puerta/ventana para la escena 3D.
 * El croquis 2D aún no modela openings ricos: se derivan de muros + heurística
 * de adyacencia, pero se materializan como piezas (marco, hoja, vidrio, etc.).
 */

export type OpeningPartRole =
  | "frame"
  | "leaf"
  | "glass"
  | "sill"
  | "mullion"
  | "handle"
  | "threshold";

export type OpeningPart3D = {
  id: string;
  role: OpeningPartRole;
  /** Centro local: X a lo largo del muro, Y desde el piso del hueco, Z hacia afuera. */
  localPosition: Vec3;
  /** Ancho (X), alto (Y), profundidad (Z) en pies. */
  size: Vec3;
  color: string;
  opacity: number;
  roughness: number;
  metalness: number;
};

export type OpeningEntity3D = {
  kind: "opening";
  id: string;
  openingKind: "door" | "window";
  roomId: string;
  wallId: string;
  /** Centro mundial del hueco (a mitad de altura del opening, sobre el sill). */
  position: Vec3;
  rotationY: number;
  widthFt: number;
  heightFt: number;
  sillFt: number;
  shared: boolean;
  parts: OpeningPart3D[];
};

const FRAME = "#4a4036";
const LEAF = "#6b5a48";
const LEAF_LIGHT = "#8a7460";
const GLASS = "#b8d4e0";
const SILL = "#5a5048";
const HANDLE = "#c0c4c8";

function part(
  id: string,
  role: OpeningPartRole,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  color: string,
  opts?: Partial<Pick<OpeningPart3D, "opacity" | "roughness" | "metalness">>,
): OpeningPart3D {
  return {
    id,
    role,
    localPosition: { x, y, z },
    size: { x: w, y: h, z: d },
    color,
    opacity: opts?.opacity ?? 1,
    roughness: opts?.roughness ?? 0.55,
    metalness: opts?.metalness ?? 0.05,
  };
}

/**
 * Ensamble de puerta en espacio local del hueco.
 * Origen: centro del hueco en X/Z, Y=0 en el umbral.
 */
export function doorAssemblyParts(
  widthFt: number,
  heightFt: number,
  wallThicknessFt: number,
): OpeningPart3D[] {
  const t = Math.max(0.3, wallThicknessFt);
  const jamb = 0.14;
  const leafT = 0.12;
  const parts: OpeningPart3D[] = [];
  // Jambas
  parts.push(
    part(
      "jamb-l",
      "frame",
      -widthFt / 2,
      heightFt / 2,
      0,
      jamb,
      heightFt,
      t * 1.15,
      FRAME,
    ),
  );
  parts.push(
    part(
      "jamb-r",
      "frame",
      widthFt / 2,
      heightFt / 2,
      0,
      jamb,
      heightFt,
      t * 1.15,
      FRAME,
    ),
  );
  parts.push(
    part(
      "header",
      "frame",
      0,
      heightFt + jamb / 2,
      0,
      widthFt + jamb,
      jamb,
      t * 1.15,
      FRAME,
    ),
  );
  parts.push(
    part(
      "threshold",
      "threshold",
      0,
      0.04,
      0,
      widthFt,
      0.08,
      t * 1.25,
      SILL,
      { roughness: 0.5 },
    ),
  );
  // Hoja (semi-abierta ~18°)
  const leafW = widthFt - jamb * 1.2;
  const leafH = heightFt - 0.1;
  parts.push(
    part(
      "leaf",
      "leaf",
      -widthFt / 2 + jamb + leafW * 0.35,
      leafH / 2 + 0.05,
      t * 0.35,
      leafW * 0.92,
      leafH,
      leafT,
      LEAF,
      { roughness: 0.48, metalness: 0.04 },
    ),
  );
  // Panel inset
  parts.push(
    part(
      "leaf-panel",
      "leaf",
      -widthFt / 2 + jamb + leafW * 0.35,
      leafH * 0.55,
      t * 0.35 + leafT * 0.55,
      leafW * 0.7,
      leafH * 0.55,
      0.03,
      LEAF_LIGHT,
      { roughness: 0.5 },
    ),
  );
  parts.push(
    part(
      "handle",
      "handle",
      -widthFt / 2 + jamb + leafW * 0.7,
      3.2,
      t * 0.35 + leafT,
      0.08,
      0.35,
      0.12,
      HANDLE,
      { roughness: 0.25, metalness: 0.7 },
    ),
  );
  return parts;
}

/**
 * Ensamble de ventana: marco, alféizar, travesaño, vidrio.
 */
export function windowAssemblyParts(
  widthFt: number,
  heightFt: number,
  wallThicknessFt: number,
): OpeningPart3D[] {
  const t = Math.max(0.3, wallThicknessFt);
  const jamb = 0.12;
  const parts: OpeningPart3D[] = [];
  parts.push(
    part(
      "jamb-l",
      "frame",
      -widthFt / 2,
      heightFt / 2,
      0,
      jamb,
      heightFt + jamb,
      t * 1.1,
      FRAME,
    ),
  );
  parts.push(
    part(
      "jamb-r",
      "frame",
      widthFt / 2,
      heightFt / 2,
      0,
      jamb,
      heightFt + jamb,
      t * 1.1,
      FRAME,
    ),
  );
  parts.push(
    part(
      "header",
      "frame",
      0,
      heightFt + jamb / 2,
      0,
      widthFt + jamb,
      jamb,
      t * 1.1,
      FRAME,
    ),
  );
  parts.push(
    part(
      "sill",
      "sill",
      0,
      -jamb / 2,
      t * 0.15,
      widthFt + jamb * 1.4,
      jamb,
      t * 1.35,
      SILL,
      { roughness: 0.45 },
    ),
  );
  // Mullion cruz
  parts.push(
    part(
      "mullion-v",
      "mullion",
      0,
      heightFt / 2,
      0,
      0.08,
      heightFt,
      t * 0.35,
      FRAME,
    ),
  );
  parts.push(
    part(
      "mullion-h",
      "mullion",
      0,
      heightFt / 2,
      0,
      widthFt,
      0.08,
      t * 0.35,
      FRAME,
    ),
  );
  // Cuatro paneles de vidrio
  const gw = (widthFt - jamb * 2 - 0.08) / 2;
  const gh = (heightFt - 0.08) / 2;
  const offsets: [number, number][] = [
    [-gw / 2 - 0.04, gh / 2 + 0.04],
    [gw / 2 + 0.04, gh / 2 + 0.04],
    [-gw / 2 - 0.04, gh / 2 - 0.04 + gh * 0],
    [gw / 2 + 0.04, -gh / 2 - 0.04],
  ];
  // Fix glass positions properly
  const glassCenters: [number, number][] = [
    [-(gw / 2 + 0.04), heightFt * 0.75],
    [gw / 2 + 0.04, heightFt * 0.75],
    [-(gw / 2 + 0.04), heightFt * 0.25],
    [gw / 2 + 0.04, heightFt * 0.25],
  ];
  void offsets;
  glassCenters.forEach(([gx, gy], i) => {
    parts.push(
      part(
        `glass-${i}`,
        "glass",
        gx,
        gy,
        0,
        gw,
        gh,
        t * 0.1,
        GLASS,
        { opacity: 0.38, roughness: 0.08, metalness: 0.05 },
      ),
    );
  });
  return parts;
}

/** Mundo: centro del opening a partir del muro + opening relativo. */
export function openingWorldPose(
  wall: WallMesh3D,
  opening: Opening3D,
): { position: Vec3; rotationY: number } {
  // Wall local: X along length centered at 0, Y from 0 at floor… but wall.position.y is mid-height
  const alongCenter =
    -wall.lengthFt / 2 + opening.alongFt + opening.widthFt / 2;
  const cos = Math.cos(wall.rotationY);
  const sin = Math.sin(wall.rotationY);
  // Local X of wall maps to world XZ via rotationY (0 => along world X)
  const worldX = wall.position.x + alongCenter * cos;
  const worldZ = wall.position.z + alongCenter * sin;
  const worldY = opening.sillFt + opening.heightFt / 2;
  return {
    position: { x: worldX, y: worldY, z: worldZ },
    rotationY: wall.rotationY,
  };
}

/**
 * Materializa openings de todos los muros como entidades con piezas.
 */
export function buildOpeningEntities(walls: WallMesh3D[]): OpeningEntity3D[] {
  const entities: OpeningEntity3D[] = [];
  for (const wall of walls) {
    wall.openings.forEach((op, idx) => {
      const pose = openingWorldPose(wall, op);
      const parts =
        op.kind === "door"
          ? doorAssemblyParts(op.widthFt, op.heightFt, wall.thicknessFt)
          : windowAssemblyParts(op.widthFt, op.heightFt, wall.thicknessFt);
      // Parts use Y from threshold (0); entity position is mid-opening — offset parts
      const yShift = -(op.heightFt / 2);
      const shifted = parts.map((p) => ({
        ...p,
        localPosition: {
          x: p.localPosition.x,
          y: p.localPosition.y + yShift,
          z: p.localPosition.z,
        },
      }));
      entities.push({
        kind: "opening",
        id: `${wall.id}-op-${op.kind}-${idx}`,
        openingKind: op.kind,
        roomId: wall.roomId,
        wallId: wall.id,
        position: pose.position,
        rotationY: pose.rotationY,
        widthFt: op.widthFt,
        heightFt: op.heightFt,
        sillFt: op.sillFt,
        shared: wall.shared,
        parts: shifted,
      });
    });
  }
  return entities;
}

/** Conteo de piezas por rol (tests). */
export function countPartsByRole(
  parts: OpeningPart3D[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of parts) {
    out[p.role] = (out[p.role] ?? 0) + 1;
  }
  return out;
}
