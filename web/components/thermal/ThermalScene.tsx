'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { RackTelemetry } from '@/lib/thermalModel';

export type ThermalLayers = {
  coldAir: boolean;
  hotAir: boolean;
  waterPipes: boolean;
  dissipation: boolean;
  heatmap: boolean;
};

type ThermalSceneProps = {
  racks: RackTelemetry[];
  layers: ThermalLayers;
  flowSpeed: number;
  density: number;
  heatmapOpacity: number;
  resetNonce: number;
  selectedRackId: string | null;
  onSelectRack: (rack: RackTelemetry) => void;
};

type RackVisual = {
  body: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  bars: THREE.MeshStandardMaterial[];
};

type SceneObjects = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  coldAir: THREE.Points;
  hotAir: THREE.Points;
  dissipation: THREE.Points;
  waterPipes: THREE.Group;
  heatmap: THREE.Group;
  heatmapMaterials: THREE.MeshBasicMaterial[];
  rackVisuals: Map<string, RackVisual>;
};

const CAMERA_POSITION = new THREE.Vector3(19, 16, 25);
const CAMERA_TARGET = new THREE.Vector3(0, 1.5, 0);

function makeParticles(
  count: number,
  color: number,
  size: number,
  positionFor: (index: number) => [number, number, number],
): THREE.Points {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const [x, y, z] = positionFor(index);
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geometry, material);
}

function cabinetColor(exhaustTemp: number): number {
  if (exhaustTemp >= 35) return 0x7f1d1d;
  if (exhaustTemp >= 32) return 0x78350f;
  return 0x111827;
}

export default function ThermalScene({
  racks,
  layers,
  flowSpeed,
  density,
  heatmapOpacity,
  resetNonce,
  selectedRackId,
  onSelectRack,
}: ThermalSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const objectsRef = useRef<SceneObjects | null>(null);
  const racksRef = useRef(racks);
  const flowSpeedRef = useRef(flowSpeed);
  const onSelectRackRef = useRef(onSelectRack);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    racksRef.current = racks;
    const objects = objectsRef.current;
    if (!objects) return;
    racks.forEach((rack) => {
      const visual = objects.rackVisuals.get(rack.id);
      if (!visual) return;
      const selected = rack.id === selectedRackId;
      visual.body.material.color.setHex(selected ? 0x075985 : cabinetColor(rack.exhaustTemp));
      visual.body.material.emissive.setHex(rack.exhaustTemp >= 35 ? 0x450a0a : selected ? 0x083344 : 0x020617);
      visual.body.material.emissiveIntensity = selected ? 0.8 : rack.exhaustTemp >= 35 ? 0.65 : 0.25;
      visual.bars.forEach((material, index) => {
        const active = index / visual.bars.length < rack.loadPct / 100;
        material.color.setHex(
          !active ? 0x1e293b : rack.exhaustTemp >= 35 ? 0xfb7185 : index % 3 === 0 ? 0x67e8f9 : 0xfacc15,
        );
        material.emissive.setHex(active ? material.color.getHex() : 0x000000);
        material.emissiveIntensity = active ? 0.35 : 0;
      });
    });
  }, [racks, selectedRackId]);

  useEffect(() => {
    onSelectRackRef.current = onSelectRack;
  }, [onSelectRack]);

  useEffect(() => {
    flowSpeedRef.current = flowSpeed;
  }, [flowSpeed]);

  useEffect(() => {
    const objects = objectsRef.current;
    if (!objects) return;
    objects.coldAir.visible = layers.coldAir;
    objects.hotAir.visible = layers.hotAir;
    objects.waterPipes.visible = layers.waterPipes;
    objects.dissipation.visible = layers.dissipation;
    objects.heatmap.visible = layers.heatmap;
    const visibleFraction = Math.max(0.2, density / 100);
    for (const points of [objects.coldAir, objects.hotAir, objects.dissipation]) {
      const count = points.geometry.getAttribute('position').count;
      points.geometry.setDrawRange(0, Math.round(count * visibleFraction));
    }
    objects.heatmapMaterials.forEach((material, index) => {
      material.opacity = (heatmapOpacity / 100) * (index === 0 ? 0.18 : 0.11);
    });
  }, [density, heatmapOpacity, layers]);

  useEffect(() => {
    const objects = objectsRef.current;
    if (!objects) return;
    objects.camera.position.copy(CAMERA_POSITION);
    objects.controls.target.copy(CAMERA_TARGET);
    objects.controls.update();
  }, [resetNonce]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.Fog(0x020617, 17, 48);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.copy(CAMERA_POSITION);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 9;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.copy(CAMERA_TARGET);
    controls.update();

    scene.add(new THREE.HemisphereLight(0x67e8f9, 0x020617, 1.15));
    const keyLight = new THREE.DirectionalLight(0xdbeafe, 2.4);
    keyLight.position.set(7, 15, 9);
    scene.add(keyLight);
    const blueLight = new THREE.PointLight(0x0ea5e9, 24, 22);
    blueLight.position.set(-7, 3, -3);
    scene.add(blueLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 22),
      new THREE.MeshStandardMaterial({ color: 0x050b17, roughness: 0.82, metalness: 0.25 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const grid = new THREE.GridHelper(28, 28, 0x164e63, 0x172033);
    grid.position.y = 0.01;
    scene.add(grid);

    const rackVisuals = new Map<string, RackVisual>();
    const interactive: THREE.Object3D[] = [];
    racksRef.current.forEach((rack) => {
      const group = new THREE.Group();
      group.position.set(rack.x, 2.05, rack.z);
      group.userData.rackId = rack.id;

      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: cabinetColor(rack.exhaustTemp),
        roughness: 0.58,
        metalness: 0.62,
        emissive: 0x020617,
        emissiveIntensity: 0.25,
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 4, 1.35), bodyMaterial);
      body.userData.rackId = rack.id;
      group.add(body);
      interactive.push(body);

      const bars: THREE.MeshStandardMaterial[] = [];
      for (let unit = 0; unit < 11; unit += 1) {
        const material = new THREE.MeshStandardMaterial({
          color: unit % 3 === 0 ? 0x67e8f9 : 0xfacc15,
          emissive: unit % 3 === 0 ? 0x164e63 : 0x713f12,
          emissiveIntensity: 0.35,
          roughness: 0.4,
        });
        const bar = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.17, 0.055), material);
        bar.position.set(0, -1.62 + unit * 0.3, 0.705);
        bar.userData.rackId = rack.id;
        bars.push(material);
        group.add(bar);
        interactive.push(bar);
      }

      const status = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x34d399 }),
      );
      status.position.set(0.64, 1.72, 0.72);
      group.add(status);
      rackVisuals.set(rack.id, { body, bars });
      scene.add(group);
    });

    for (const x of [-10.6, 10.6]) {
      for (const z of [-5.2, 5.2]) {
        const crah = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 4.8, 2),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55, metalness: 0.5 }),
        );
        crah.position.set(x, 2.4, z);
        scene.add(crah);
        const vent = new THREE.Mesh(
          new THREE.BoxGeometry(1.75, 0.08, 1.65),
          new THREE.MeshBasicMaterial({ color: 0x22d3ee }),
        );
        vent.position.set(x, 4.84, z);
        scene.add(vent);
      }
    }

    const containmentMaterial = new THREE.MeshStandardMaterial({
      color: 0x07111f,
      transparent: true,
      opacity: 0.72,
      roughness: 0.5,
    });
    for (const z of [-2.5, 2.5]) {
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(19, 0.34, 2.1), containmentMaterial);
      canopy.position.set(0, 4.65, z);
      scene.add(canopy);
    }

    const waterPipes = new THREE.Group();
    const pipePoints = [
      new THREE.Vector3(-11, 0.32, -8),
      new THREE.Vector3(0, 0.32, -9),
      new THREE.Vector3(11, 0.32, -8),
      new THREE.Vector3(12, 0.32, 0),
      new THREE.Vector3(11, 0.32, 8),
      new THREE.Vector3(0, 0.32, 9),
      new THREE.Vector3(-11, 0.32, 8),
      new THREE.Vector3(-12, 0.32, 0),
    ];
    const loop = new THREE.CatmullRomCurve3(pipePoints, true, 'catmullrom', 0.18);
    const coldPipe = new THREE.Mesh(
      new THREE.TubeGeometry(loop, 180, 0.11, 8, true),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x172554, emissiveIntensity: 0.8 }),
    );
    coldPipe.position.y = 0.08;
    waterPipes.add(coldPipe);
    const warmPipe = coldPipe.clone();
    warmPipe.scale.set(0.94, 1, 0.92);
    warmPipe.position.y = 0.22;
    warmPipe.material = new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0x451a03, emissiveIntensity: 0.8 });
    waterPipes.add(warmPipe);
    scene.add(waterPipes);

    const coldAir = makeParticles(560, 0x22d3ee, 0.07, (index) => {
      const aisle = index % 2 === 0 ? -2.5 : 2.5;
      return [-10 + Math.random() * 20, 0.45 + Math.random() * 1.2, aisle + (Math.random() - 0.5) * 1.1];
    });
    scene.add(coldAir);
    const hotAir = makeParticles(420, 0xfb7185, 0.075, () => {
      const rack = racksRef.current[Math.floor(Math.random() * racksRef.current.length)];
      return [rack.x + (Math.random() - 0.5) * 1.2, 2.3 + Math.random() * 3.5, rack.z + (Math.random() - 0.5) * 1.3];
    });
    scene.add(hotAir);
    const dissipation = makeParticles(320, 0xfbbf24, 0.065, () => {
      const rack = racksRef.current[Math.floor(Math.random() * racksRef.current.length)];
      return [rack.x + (Math.random() - 0.5) * 1.5, 0.2 + Math.random() * 2.8, rack.z + (Math.random() - 0.5) * 1.5];
    });
    scene.add(dissipation);

    const heatmap = new THREE.Group();
    const heatmapMaterials: THREE.MeshBasicMaterial[] = [];
    const heatZones = [
      { x: 1.5, z: 0, color: 0xef4444, scale: [4.6, 3.6, 3.8] },
      { x: -4.5, z: 5, color: 0xf59e0b, scale: [3.8, 3.2, 3.4] },
      { x: -1.5, z: -5, color: 0x0ea5e9, scale: [4.2, 2.5, 3.1] },
    ];
    heatZones.forEach((zone, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: zone.color,
        transparent: true,
        opacity: index === 0 ? 0.13 : 0.09,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const volume = new THREE.Mesh(new THREE.SphereGeometry(1, 30, 18), material);
      volume.scale.set(zone.scale[0], zone.scale[1], zone.scale[2]);
      volume.position.set(zone.x, 2.2, zone.z);
      heatmapMaterials.push(material);
      heatmap.add(volume);
    });
    scene.add(heatmap);

    objectsRef.current = {
      camera,
      controls,
      coldAir,
      hotAir,
      dissipation,
      waterPipes,
      heatmap,
      heatmapMaterials,
      rackVisuals,
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    const onPointerDown = (event: PointerEvent) => {
      downX = event.clientX;
      downY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 5) return;
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactive, false)[0];
      const rackId = hit?.object.userData.rackId as string | undefined;
      const rack = racksRef.current.find((candidate) => candidate.id === rackId);
      if (rack) onSelectRackRef.current(rack);
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const resize = new ResizeObserver(() => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resize.observe(container);

    const clock = new THREE.Clock();
    const animateParticles = (points: THREE.Points, axis: 0 | 1 | 2, delta: number, min: number, max: number) => {
      const positions = points.geometry.getAttribute('position') as THREE.BufferAttribute;
      const values = positions.array as Float32Array;
      for (let index = 0; index < positions.count; index += 1) {
        const offset = index * 3 + axis;
        const next = values[offset] + delta;
        values[offset] = next > max ? min : next;
      }
      positions.needsUpdate = true;
    };
    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const speed = Math.max(0.2, flowSpeedRef.current / 10);
      animateParticles(coldAir, 0, delta * 1.8 * speed, -10, 10);
      animateParticles(hotAir, 1, delta * 0.9 * speed, 2.1, 6.2);
      animateParticles(dissipation, 1, delta * 0.55 * speed, 0.2, 4.2);
      heatmap.rotation.y += delta * 0.035;
      controls.update();
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      resize.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      scene.traverse((object) => {
        const renderable = object as THREE.Mesh | THREE.Points;
        if ('geometry' in renderable) renderable.geometry.dispose();
        if ('material' in renderable) {
          const materials = Array.isArray(renderable.material) ? renderable.material : [renderable.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      objectsRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" aria-label="Interactive 3D thermal data center view" />;
}
