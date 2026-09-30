'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type SceneBlock = {
  id: string;
  stringIndex: number;
  rackIndex: number;
  level: number;
  severity: 'ok' | 'warning' | 'critical';
  temp: number;
};

export type SceneViewCommand = {
  kind: 'front' | 'top' | 'string';
  stringIndex?: number;
  nonce: number;
} | null;

type PowerShieldSceneProps = {
  blocks: SceneBlock[];
  selectedBlockId: string | null;
  thermalOverlay: boolean;
  viewCommand: SceneViewCommand;
  onSelectBlock: (block: SceneBlock) => void;
};

type SceneObjects = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  meshes: Map<string, THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>>;
  stop: () => void;
};

const RACK_X = [-2.8, 2.8];
const BLOCK_Y0 = 0.95;
const BLOCK_STEP = 0.82;

const SEVERITY_COLORS: Record<SceneBlock['severity'], { color: number; emissive: number }> = {
  ok: { color: 0x10b981, emissive: 0x052e21 },
  warning: { color: 0xf59e0b, emissive: 0x451a03 },
  critical: { color: 0xef4444, emissive: 0x7f1d1d }
};

function tempColor(temp: number): THREE.Color {
  const clamped = Math.min(Math.max(temp, 20), 46);
  const ratio = (clamped - 20) / 26;
  const cold = new THREE.Color(0x3b82f6);
  const warm = new THREE.Color(0xf59e0b);
  const hot = new THREE.Color(0xef4444);
  if (ratio < 0.5) return cold.clone().lerp(warm, ratio * 2);
  return warm.clone().lerp(hot, (ratio - 0.5) * 2);
}

function disposeScene(objects: SceneObjects) {
  objects.stop();
  objects.controls.dispose();
  objects.scene.traverse((node) => {
    if (node instanceof THREE.Mesh || node instanceof THREE.Points || node instanceof THREE.LineSegments) {
      node.geometry?.dispose?.();
      const material = node.material;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose?.();
    }
  });
  objects.renderer.dispose();
  objects.renderer.domElement.remove();
}

export default function PowerShieldScene({
  blocks,
  selectedBlockId,
  thermalOverlay,
  viewCommand,
  onSelectBlock
}: PowerShieldSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<SceneObjects | null>(null);
  const selectRef = useRef(onSelectBlock);
  const [webglFailed, setWebglFailed] = useState(false);
  useEffect(() => {
    selectRef.current = onSelectBlock;
  }, [onSelectBlock]);

  // Initialisation unique de la scène.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || stateRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.Fog(0x030712, 30, 62);

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 6, 19);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setWebglFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 3, 0);
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 6;
    controls.maxDistance = 45;

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    keyLight.position.set(10, 20, 12);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.35);
    fillLight.position.set(-12, 8, -6);
    scene.add(fillLight);

    const grid = new THREE.GridHelper(36, 36, 0x1e293b, 0x111c2e);
    grid.position.y = 0.001;
    scene.add(grid);

    const frameGeometry = new THREE.BoxGeometry(2.3, 7.2, 2);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.55, metalness: 0.25 });
    const blockGeometry = new THREE.BoxGeometry(1.75, 0.6, 1.55);
    const meshes = new Map<string, THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>>();

    RACK_X.forEach((x) => {
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(x, 3.6, 0);
      scene.add(frame);
    });

    blocks.forEach((block) => {
      const material = new THREE.MeshStandardMaterial({
        color: SEVERITY_COLORS[block.severity].color,
        roughness: 0.35,
        metalness: 0.2
      });
      const mesh = new THREE.Mesh(blockGeometry, material);
      mesh.position.set(RACK_X[block.rackIndex], BLOCK_Y0 + block.level * BLOCK_STEP, 0);
      mesh.userData.blockId = block.id;
      scene.add(mesh);
      meshes.set(block.id, mesh);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const pick = (event: PointerEvent): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(Array.from(meshes.values()))[0];
      return hit ? String(hit.object.userData.blockId) : null;
    };

    const onPointerDown = (event: PointerEvent) => {
      const id = pick(event);
      if (!id) return;
      const block = blocksById(blocks, id);
      if (block) selectRef.current(block);
    };
    const onPointerMove = (event: PointerEvent) => {
      renderer.domElement.style.cursor = pick(event) ? 'pointer' : 'grab';
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    let raf = 0;
    let disposed = false;
    let criticalPulse = 0;
    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      criticalPulse += 0.05;
      meshes.forEach((mesh) => {
        const material = mesh.material;
        if (material.userData.critical) {
          material.emissiveIntensity = 0.55 + Math.sin(criticalPulse) * 0.35;
        }
      });
      controls.update();
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    stateRef.current = {
      scene,
      camera,
      renderer,
      controls,
      meshes,
      stop: () => {
        disposed = true;
        cancelAnimationFrame(raf);
      }
    };

    return () => {
      observer.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      if (stateRef.current) {
        disposeScene(stateRef.current);
        stateRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mise à jour des couleurs / états des blocs.
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    const byId = new Map(blocks.map((b) => [b.id, b]));
    state.meshes.forEach((mesh, id) => {
      const block = byId.get(id);
      if (!block) return;
      const material = mesh.material;
      if (thermalOverlay) {
        material.color.set(tempColor(block.temp));
        material.emissive.set(0x0b1120);
        material.emissiveIntensity = 0;
        material.userData.critical = false;
      } else {
        const palette = SEVERITY_COLORS[block.severity];
        material.color.set(palette.color);
        material.emissive.set(palette.emissive);
        material.userData.critical = block.severity === 'critical';
        material.emissiveIntensity = block.severity === 'critical' ? 0.55 : 0;
      }
      if (selectedBlockId === id) {
        material.emissive.set(0x155e75);
        material.emissiveIntensity = 0.65;
        material.userData.critical = false;
      }
    });
  }, [blocks, selectedBlockId, thermalOverlay]);

  // Commandes de caméra.
  useEffect(() => {
    const state = stateRef.current;
    if (!state || !viewCommand) return;
    const { camera, controls } = state;
    if (viewCommand.kind === 'front') {
      camera.position.set(0, 5.5, 19);
      controls.target.set(0, 3, 0);
    } else if (viewCommand.kind === 'top') {
      camera.position.set(0, 22, 0.01);
      controls.target.set(0, 2, 0);
    } else if (viewCommand.kind === 'string') {
      const x = RACK_X[viewCommand.stringIndex ?? 0];
      camera.position.set(x, 5, 13);
      controls.target.set(x, 3.4, 0);
    }
    controls.update();
  }, [viewCommand]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center bg-[#030712]"
      role="img"
      aria-label="Scène 3D : racks onduleurs et modules de batteries, cliquables pour inspecter les cellules"
    >
      {webglFailed && (
        <p className="max-w-[46ch] p-6 text-center text-[12px] text-slate-400">
          WebGL indisponible dans ce navigateur — la vue 3D est désactivée. Les panneaux d’analyse, les graphes et la
          détection cellule restent opérationnels.
        </p>
      )}
    </div>
  );
}

function blocksById(blocks: SceneBlock[], id: string): SceneBlock | null {
  return blocks.find((b) => b.id === id) ?? null;
}
