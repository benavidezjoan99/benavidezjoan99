"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Html,
  OrbitControls,
  PerspectiveCamera,
  SoftShadows,
} from "@react-three/drei";
import * as THREE from "three";
import {
  buildScene3D,
  floorMaterialSpec,
  floorUvRepeat,
  furnitureMaterialSpec,
  wallMaterialSpec,
  wallSolidParts,
  type CatalogHint3D,
  type FloorMesh3D,
  type FurnitureMesh3D,
  type PlanRoom3DInput,
  type Scene3D,
  type WallMesh3D,
} from "@/domain/floor-plan";
import {
  floorTextureForRoom,
  getFabricTexture3D,
  getWallPaintTexture3D,
  getWoodFinishTexture3D,
} from "./textures3d";

export type WalkMode = "orbit" | "walk";

type Props = {
  rooms: PlanRoom3DInput[];
  catalogById?: Record<string, CatalogHint3D>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  mode: WalkMode;
};

function FloorMesh({
  floor,
  selected,
  onSelect,
}: {
  floor: FloorMesh3D;
  selected: boolean;
  onSelect: () => void;
}) {
  const spec = floorMaterialSpec(floor.texture);
  const uv = floorUvRepeat(floor.widthFt, floor.depthFt, spec.tileFt);
  const map = useMemo(
    () => floorTextureForRoom(floor.texture, uv.x, uv.y),
    [floor.texture, uv.x, uv.y],
  );

  useEffect(() => {
    return () => {
      map.dispose();
    };
  }, [map]);

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[floor.position.x, 0.02, floor.position.z]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <planeGeometry args={[floor.widthFt, floor.depthFt]} />
        <meshStandardMaterial
          map={map}
          color="#ffffff"
          roughness={spec.roughness}
          metalness={spec.metalness}
          envMapIntensity={0.35}
        />
      </mesh>
      {/* Grosor de losa sutil */}
      <mesh
        position={[floor.position.x, -0.04, floor.position.z]}
        receiveShadow
      >
        <boxGeometry args={[floor.widthFt, 0.08, floor.depthFt]} />
        <meshStandardMaterial
          color={spec.baseColor}
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>
      {selected && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[floor.position.x, 0.04, floor.position.z]}
        >
          <planeGeometry args={[floor.widthFt + 0.12, floor.depthFt + 0.12]} />
          <meshBasicMaterial color="#1f7a6c" transparent opacity={0.16} />
        </mesh>
      )}
      <Html
        position={[floor.position.x, 0.35, floor.position.z]}
        center
        distanceFactor={28}
        style={{
          pointerEvents: "none",
          color: "#142226",
          fontSize: "11px",
          fontWeight: 600,
          background: "rgba(245,248,249,0.86)",
          padding: "2px 6px",
          borderRadius: "4px",
          whiteSpace: "nowrap",
          border: "1px solid rgba(197,212,216,0.9)",
        }}
      >
        {floor.label}
      </Html>
    </group>
  );
}

function WallMesh({ wall }: { wall: WallMesh3D }) {
  const parts = useMemo(
    () => wallSolidParts(wall.lengthFt, wall.heightFt, wall.openings),
    [wall],
  );
  const paint = wallMaterialSpec(wall.color);
  const map = useMemo(
    () => getWallPaintTexture3D(paint.fill, paint.variation),
    [paint.fill, paint.variation],
  );
  const stroke = wall.color.stroke;

  return (
    <group
      position={[wall.position.x, 0, wall.position.z]}
      rotation={[0, wall.rotationY, 0]}
    >
      {parts.map((p, i) => {
        const localX = -wall.lengthFt / 2 + p.x + p.w / 2;
        const localY = p.y + p.h / 2;
        return (
          <mesh
            key={`${wall.id}-${i}`}
            position={[localX, localY, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[p.w, p.h, wall.thicknessFt]} />
            <meshStandardMaterial
              map={map}
              color="#ffffff"
              roughness={paint.roughness}
              metalness={paint.metalness}
              envMapIntensity={0.2}
            />
          </mesh>
        );
      })}
      {wall.openings
        .filter((op) => op.kind === "window")
        .map((op, i) => {
          const cx = -wall.lengthFt / 2 + op.alongFt + op.widthFt / 2;
          const cy = op.sillFt + op.heightFt / 2;
          const left = cx - op.widthFt / 2;
          const right = cx + op.widthFt / 2;
          const top = op.sillFt + op.heightFt;
          const t = wall.thicknessFt * 1.05;
          return (
            <group key={`win-${i}`}>
              <mesh position={[cx, cy, 0]}>
                <boxGeometry
                  args={[op.widthFt, op.heightFt, wall.thicknessFt * 0.12]}
                />
                <meshPhysicalMaterial
                  color="#c5dde8"
                  transparent
                  opacity={0.4}
                  roughness={0.08}
                  metalness={0.05}
                  transmission={0.5}
                  thickness={0.15}
                />
              </mesh>
              <mesh position={[left, cy, 0]}>
                <boxGeometry args={[0.12, op.heightFt + 0.12, t]} />
                <meshStandardMaterial
                  color={stroke}
                  roughness={0.55}
                  metalness={0.08}
                />
              </mesh>
              <mesh position={[right, cy, 0]}>
                <boxGeometry args={[0.12, op.heightFt + 0.12, t]} />
                <meshStandardMaterial
                  color={stroke}
                  roughness={0.55}
                  metalness={0.08}
                />
              </mesh>
              <mesh position={[cx, top + 0.06, 0]}>
                <boxGeometry args={[op.widthFt + 0.12, 0.12, t]} />
                <meshStandardMaterial
                  color={stroke}
                  roughness={0.55}
                  metalness={0.08}
                />
              </mesh>
              <mesh position={[cx, op.sillFt - 0.06, 0]}>
                <boxGeometry args={[op.widthFt + 0.12, 0.12, t]} />
                <meshStandardMaterial
                  color={stroke}
                  roughness={0.55}
                  metalness={0.08}
                />
              </mesh>
            </group>
          );
        })}
      {wall.openings
        .filter((op) => op.kind === "door")
        .map((op, i) => {
          const left = -wall.lengthFt / 2 + op.alongFt;
          const right = left + op.widthFt;
          const mid = left + op.widthFt / 2;
          return (
            <group key={`jamb-${i}`}>
              <mesh position={[left, op.heightFt / 2, 0]} castShadow>
                <boxGeometry
                  args={[0.14, op.heightFt, wall.thicknessFt * 1.08]}
                />
                <meshStandardMaterial
                  color={stroke}
                  roughness={0.55}
                  metalness={0.06}
                />
              </mesh>
              <mesh position={[right, op.heightFt / 2, 0]} castShadow>
                <boxGeometry
                  args={[0.14, op.heightFt, wall.thicknessFt * 1.08]}
                />
                <meshStandardMaterial
                  color={stroke}
                  roughness={0.55}
                  metalness={0.06}
                />
              </mesh>
              <mesh position={[mid, op.heightFt + 0.07, 0]} castShadow>
                <boxGeometry
                  args={[op.widthFt + 0.14, 0.14, wall.thicknessFt * 1.08]}
                />
                <meshStandardMaterial
                  color={stroke}
                  roughness={0.55}
                  metalness={0.06}
                />
              </mesh>
              {/* Umbral */}
              <mesh position={[mid, 0.04, 0]}>
                <boxGeometry
                  args={[op.widthFt, 0.08, wall.thicknessFt * 1.2]}
                />
                <meshStandardMaterial
                  color="#6a5a48"
                  roughness={0.5}
                  metalness={0.05}
                />
              </mesh>
            </group>
          );
        })}
    </group>
  );
}

function BedProxy({
  item,
  mat,
}: {
  item: FurnitureMesh3D;
  mat: ReactNode;
}) {
  const { x, z } = item.position;
  const w = item.widthFt;
  const d = item.depthFt;
  const pillowMap = useMemo(() => getFabricTexture3D("#f7f5f0"), []);
  return (
    <group position={[x, 0, z]} rotation={[0, item.rotationY, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.7, d]} />
        <meshStandardMaterial
          color="#c8c0b4"
          roughness={0.55}
          metalness={0.04}
        />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[w * 0.94, 0.45, d * 0.92]} />
        {mat}
      </mesh>
      <mesh position={[0, 1.4, -d * 0.42]} castShadow>
        <boxGeometry args={[w * 0.96, 1.1, 0.18]} />
        <meshStandardMaterial
          color="#5a4a3a"
          roughness={0.5}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, 1.15, -d * 0.22]} castShadow>
        <boxGeometry args={[w * 0.7, 0.35, 0.55]} />
        <meshStandardMaterial
          map={pillowMap}
          color="#ffffff"
          roughness={0.85}
        />
      </mesh>
    </group>
  );
}

function FurnitureMesh({ item }: { item: FurnitureMesh3D }) {
  const spec = furnitureMaterialSpec(item.furnitureKind, item.color);
  const map = useMemo(() => {
    if (spec.finish === "fabric") return getFabricTexture3D(item.color);
    if (spec.finish === "wood") return getWoodFinishTexture3D(item.color);
    return null;
  }, [spec.finish, item.color]);

  const { x, y, z } = item.position;
  const w = item.widthFt;
  const h = item.heightFt;
  const d = item.depthFt;

  const mat = (
    <meshStandardMaterial
      map={map ?? undefined}
      color={map ? "#ffffff" : item.color}
      roughness={spec.roughness}
      metalness={spec.metalness}
      envMapIntensity={0.4}
    />
  );

  // Proxies con piezas (no una sola caja flat)
  if (item.furnitureKind === "sofa") {
    return (
      <group position={[x, 0, z]} rotation={[0, item.rotationY, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.9, d]} />
          {mat}
        </mesh>
        <mesh position={[0, 1.35, -d * 0.32]} castShadow>
          <boxGeometry args={[w * 0.96, 1.4, d * 0.28]} />
          {mat}
        </mesh>
        <mesh position={[-w * 0.42, 1.05, 0.05]} castShadow>
          <boxGeometry args={[w * 0.12, 0.9, d * 0.85]} />
          {mat}
        </mesh>
        <mesh position={[w * 0.42, 1.05, 0.05]} castShadow>
          <boxGeometry args={[w * 0.12, 0.9, d * 0.85]} />
          {mat}
        </mesh>
      </group>
    );
  }

  if (item.furnitureKind === "table") {
    const topH = Math.min(0.18, h * 0.12);
    const leg = 0.14;
    const inset = 0.25;
    return (
      <group position={[x, 0, z]} rotation={[0, item.rotationY, 0]}>
        <mesh position={[0, h - topH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, topH, d]} />
          {mat}
        </mesh>
        {(
          [
            [-w / 2 + inset, -d / 2 + inset],
            [w / 2 - inset, -d / 2 + inset],
            [-w / 2 + inset, d / 2 - inset],
            [w / 2 - inset, d / 2 - inset],
          ] as const
        ).map(([lx, lz], i) => (
          <mesh key={i} position={[lx, (h - topH) / 2, lz]} castShadow>
            <boxGeometry args={[leg, h - topH, leg]} />
            <meshStandardMaterial
              color="#5a4634"
              roughness={0.55}
              metalness={0.05}
            />
          </mesh>
        ))}
      </group>
    );
  }

  if (item.furnitureKind === "bed") {
    return <BedProxy item={item} mat={mat} />;
  }

  if (item.furnitureKind === "cabinet" || item.furnitureKind === "island") {
    return (
      <group position={[x, 0, z]} rotation={[0, item.rotationY, 0]}>
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h * 0.92, d]} />
          {mat}
        </mesh>
        <mesh position={[0, h - 0.06, 0]} castShadow>
          <boxGeometry args={[w + 0.08, 0.12, d + 0.08]} />
          <meshStandardMaterial
            color="#9a9a96"
            roughness={0.35}
            metalness={0.15}
          />
        </mesh>
      </group>
    );
  }

  if (item.furnitureKind === "chair") {
    return (
      <group position={[x, 0, z]} rotation={[0, item.rotationY, 0]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.35, d]} />
          {mat}
        </mesh>
        <mesh position={[0, 2.0, -d * 0.35]} castShadow>
          <boxGeometry args={[w * 0.9, 1.4, 0.18]} />
          {mat}
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.12, 1.1, 0.12]} />
          <meshStandardMaterial color="#4a4038" roughness={0.5} />
        </mesh>
      </group>
    );
  }

  // Fallback: caja con material rico
  return (
    <mesh
      position={[x, y, z]}
      rotation={[0, item.rotationY, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[w, h, d]} />
      {mat}
    </mesh>
  );
}

function Ground({ bounds }: { bounds: Scene3D["bounds"] }) {
  const w = Math.max(40, bounds.maxX - bounds.minX + 16);
  const d = Math.max(40, bounds.maxZ - bounds.minZ + 16);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[cx, -0.06, cz]}
      receiveShadow
    >
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color="#cfd8da" roughness={0.95} metalness={0} />
    </mesh>
  );
}

function WalkController({
  enabled,
  center,
}: {
  enabled: boolean;
  center: { x: number; z: number };
}) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0);
  const locked = useRef(false);

  useEffect(() => {
    if (!enabled) {
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
      locked.current = false;
      return;
    }
    const onKey = (e: KeyboardEvent, down: boolean) => {
      keys.current[e.code] = down;
    };
    const down = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    const onClick = () => {
      void gl.domElement.requestPointerLock();
    };
    const onLock = () => {
      locked.current = document.pointerLockElement === gl.domElement;
    };
    const onMove = (e: MouseEvent) => {
      if (!locked.current) return;
      yaw.current -= e.movementX * 0.0025;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    gl.domElement.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onLock);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      gl.domElement.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLock);
      window.removeEventListener("mousemove", onMove);
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
    };
  }, [enabled, gl]);

  useFrame((_, dt) => {
    if (!enabled) return;
    if (camera.position.y < 4.8 || camera.position.y > 5.4) {
      camera.position.y = 5.2;
    }
    const speed = (keys.current.ShiftLeft ? 14 : 7) * dt;
    const forward = new THREE.Vector3(
      -Math.sin(yaw.current),
      0,
      -Math.cos(yaw.current),
    );
    const right = new THREE.Vector3(
      Math.cos(yaw.current),
      0,
      -Math.sin(yaw.current),
    );
    if (keys.current.KeyW || keys.current.ArrowUp) {
      camera.position.addScaledVector(forward, speed);
    }
    if (keys.current.KeyS || keys.current.ArrowDown) {
      camera.position.addScaledVector(forward, -speed);
    }
    if (keys.current.KeyA || keys.current.ArrowLeft) {
      camera.position.addScaledVector(right, -speed);
    }
    if (keys.current.KeyD || keys.current.ArrowRight) {
      camera.position.addScaledVector(right, speed);
    }
    const look = new THREE.Vector3(
      camera.position.x - Math.sin(yaw.current),
      camera.position.y,
      camera.position.z - Math.cos(yaw.current),
    );
    camera.lookAt(look);
    void center;
  });

  return null;
}

function SceneContent({
  scene,
  selectedId,
  onSelect,
  mode,
}: {
  scene: Scene3D;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  mode: WalkMode;
}) {
  const span = Math.max(
    scene.bounds.maxX - scene.bounds.minX,
    scene.bounds.maxZ - scene.bounds.minZ,
    20,
  );
  const camDist = span * 0.95 + 12;

  return (
    <>
      <color attach="background" args={["#e4eef0"]} />
      <fog attach="fog" args={["#e4eef0", 48, 110]} />
      <SoftShadows size={18} samples={12} focus={0.85} />

      <ambientLight intensity={0.38} color="#f4f7f8" />
      <hemisphereLight args={["#f7fafb", "#8fa3a8", 0.55]} />
      <directionalLight
        castShadow
        intensity={1.25}
        color="#fff6ea"
        position={[
          scene.center.x + 16,
          26,
          scene.center.z - 12,
        ]}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
        shadow-camera-far={100}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
      />
      {/* Fill suave opuesto */}
      <directionalLight
        intensity={0.35}
        color="#d8e8f0"
        position={[
          scene.center.x - 14,
          18,
          scene.center.z + 10,
        ]}
      />
      <pointLight
        intensity={0.28}
        color="#ffe8c8"
        distance={50}
        position={[scene.center.x, 10, scene.center.z]}
      />

      <PerspectiveCamera
        makeDefault
        position={[
          scene.center.x + camDist * 0.55,
          mode === "walk" ? 5.2 : camDist * 0.55,
          scene.center.z + camDist * 0.7,
        ]}
        fov={48}
        near={0.1}
        far={250}
      />

      {mode === "orbit" && (
        <OrbitControls
          target={[scene.center.x, 2.5, scene.center.z]}
          maxPolarAngle={Math.PI * 0.48}
          minDistance={8}
          maxDistance={90}
          enableDamping
        />
      )}
      <WalkController
        enabled={mode === "walk"}
        center={{ x: scene.center.x, z: scene.center.z }}
      />

      <Ground bounds={scene.bounds} />
      {scene.floors.map((f) => (
        <FloorMesh
          key={f.id}
          floor={f}
          selected={selectedId === f.roomId}
          onSelect={() => onSelect(f.roomId)}
        />
      ))}
      {scene.walls.map((w) => (
        <WallMesh key={w.id} wall={w} />
      ))}
      {scene.furniture.map((item) => (
        <FurnitureMesh key={item.id} item={item} />
      ))}

      <ContactShadows
        position={[scene.center.x, 0.01, scene.center.z]}
        opacity={0.42}
        scale={span + 22}
        blur={2.6}
        far={20}
        color="#2a383c"
      />
    </>
  );
}

export function FloorPlan3DScene({
  rooms,
  catalogById = {},
  selectedId,
  onSelect,
  mode,
}: Props) {
  const scene = useMemo(
    () => buildScene3D(rooms, { catalogById }),
    [rooms, catalogById],
  );

  return (
    <div className="relative h-[560px] overflow-hidden rounded-lg border border-[var(--line)] bg-[#e4eef0]">
      <Canvas
        key={mode}
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.05;
        }}
        onPointerMissed={() => {
          if (selectedId) onSelect(null);
        }}
      >
        <SceneContent
          scene={scene}
          selectedId={selectedId}
          onSelect={onSelect}
          mode={mode}
        />
      </Canvas>
    </div>
  );
}
