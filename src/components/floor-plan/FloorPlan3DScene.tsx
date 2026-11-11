"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Html,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import {
  buildScene3D,
  floorColorForTexture,
  wallSolidParts,
  type CatalogHint3D,
  type FloorMesh3D,
  type FurnitureMesh3D,
  type PlanRoom3DInput,
  type Scene3D,
  type WallMesh3D,
} from "@/domain/floor-plan";

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
  const color = floorColorForTexture(floor.texture);
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[floor.position.x, 0.01, floor.position.z]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <planeGeometry args={[floor.widthFt, floor.depthFt]} />
        <meshStandardMaterial
          color={color}
          roughness={floor.texture.startsWith("wood") ? 0.55 : 0.75}
          metalness={floor.texture === "epoxy" ? 0.25 : 0.05}
        />
      </mesh>
      {selected && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[floor.position.x, 0.03, floor.position.z]}
        >
          <planeGeometry args={[floor.widthFt + 0.15, floor.depthFt + 0.15]} />
          <meshBasicMaterial color="#1f7a6c" transparent opacity={0.18} />
        </mesh>
      )}
      <Html
        position={[floor.position.x, 0.2, floor.position.z]}
        center
        distanceFactor={28}
        style={{
          pointerEvents: "none",
          color: "#142226",
          fontSize: "11px",
          fontWeight: 600,
          background: "rgba(245,248,249,0.82)",
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
  const fill = wall.color.fill;
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
              color={fill}
              roughness={0.85}
              metalness={0.02}
            />
          </mesh>
        );
      })}
      {/* Vidrio en ventanas; puertas quedan como hueco */}
      {wall.openings
        .filter((op) => op.kind === "window")
        .map((op, i) => {
          const cx = -wall.lengthFt / 2 + op.alongFt + op.widthFt / 2;
          return (
            <mesh
              key={`glass-${i}`}
              position={[cx, op.sillFt + op.heightFt / 2, 0]}
            >
              <boxGeometry
                args={[op.widthFt, op.heightFt, wall.thicknessFt * 0.15]}
              />
              <meshStandardMaterial
                color="#a8c4d4"
                transparent
                opacity={0.35}
                roughness={0.15}
                metalness={0.1}
              />
            </mesh>
          );
        })}
      {/* Jambas verticales de puerta */}
      {wall.openings
        .filter((op) => op.kind === "door")
        .map((op, i) => {
          const left = -wall.lengthFt / 2 + op.alongFt;
          const right = left + op.widthFt;
          return (
            <group key={`jamb-${i}`}>
              <mesh position={[left, op.heightFt / 2, 0]}>
                <boxGeometry
                  args={[0.12, op.heightFt, wall.thicknessFt * 1.05]}
                />
                <meshStandardMaterial color={stroke} roughness={0.7} />
              </mesh>
              <mesh position={[right, op.heightFt / 2, 0]}>
                <boxGeometry
                  args={[0.12, op.heightFt, wall.thicknessFt * 1.05]}
                />
                <meshStandardMaterial color={stroke} roughness={0.7} />
              </mesh>
              <mesh
                position={[
                  left + op.widthFt / 2,
                  op.heightFt + 0.06,
                  0,
                ]}
              >
                <boxGeometry
                  args={[op.widthFt + 0.12, 0.12, wall.thicknessFt * 1.05]}
                />
                <meshStandardMaterial color={stroke} roughness={0.7} />
              </mesh>
            </group>
          );
        })}
    </group>
  );
}

function FurnitureMesh({ item }: { item: FurnitureMesh3D }) {
  return (
    <mesh
      position={[item.position.x, item.position.y, item.position.z]}
      rotation={[0, item.rotationY, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[item.widthFt, item.heightFt, item.depthFt]} />
      <meshStandardMaterial color={item.color} roughness={0.65} metalness={0.05} />
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
      position={[cx, -0.02, cz]}
      receiveShadow
    >
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color="#d5e0e2" roughness={1} />
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
      <color attach="background" args={["#e8f0f1"]} />
      <fog attach="fog" args={["#e8f0f1", 55, 120]} />
      <ambientLight intensity={0.62} />
      <directionalLight
        castShadow
        intensity={1.05}
        position={[
          scene.center.x + 18,
          28,
          scene.center.z - 14,
        ]}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={90}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <hemisphereLight args={["#f5f8f9", "#9bb0b4", 0.4]} />

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
        position={[scene.center.x, 0.005, scene.center.z]}
        opacity={0.28}
        scale={span + 20}
        blur={2}
        far={16}
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
    <div className="relative h-[560px] overflow-hidden rounded-lg border border-[var(--line)] bg-[#e8f0f1]">
      <Canvas
        key={mode}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
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
