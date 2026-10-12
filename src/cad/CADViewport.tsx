import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import {
  MechanicalModelDefinition,
  PartRuntimeState,
  RenderMode,
  ThemeMode,
  TransformToolMode,
} from '../types/cad';
import {
  createMaterialLibrary,
  createGhostMaterial,
  createGuideLineMaterial,
  createEdgeOutlineMaterial,
  createSnapPulseMaterial,
  createBlueprintMaterial,
  createHologramMaterial,
  createXRayMaterial,
} from './materials';
import { PhysicsWorld } from './physics';
import { sound } from '../utils/audio';

export interface ViewportTelemetry {
  fps: number;
  drawCalls: number;
  triangles: number;
  lodActive: string;
  physicsBodiesCount: number;
}

interface PartScreenTag {
  id: string;
  name: string;
  isSnapped: boolean;
  x: number;
  y: number;
  visible: boolean;
}

// Native Vanilla JS Animation Item (Pure render-loop driven)
export interface ActiveAnimation {
  object: THREE.Object3D;
  partId?: string;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  startRot?: THREE.Euler;
  targetRot?: THREE.Euler;
  startTime: number;
  duration: number;
  onComplete?: () => void;
}

interface CameraTween {
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  startTarget: THREE.Vector3;
  targetTarget: THREE.Vector3;
  startTime: number;
  duration: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutElastic = (t: number) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  const p = 0.3;
  const s = p / 4;
  return Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / p) + 1;
};

// Step-by-Step CAD Lock easing: Cubic.InOut with subtle metallic overshoot settle (micro-amortiguación)
const easeCadLockOvershoot = (t: number) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  // First 85%: smooth cubic acceleration and deceleration
  if (t < 0.85) {
    const u = t / 0.85;
    const c = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    return c * 0.98;
  }
  // Final 15%: subtle metallic micro-impact (overshoot to 1.018 then settle to 1.0)
  const p = (t - 0.85) / 0.15;
  const overshoot = Math.sin(p * Math.PI) * 0.032 * Math.exp(-3 * p);
  return 0.98 + 0.02 * p + overshoot;
};

interface CADViewportProps {
  modelDef: MechanicalModelDefinition;
  selectedPartId: string | null;
  onSelectPart: (partId: string | null) => void;
  explodeProgress: number; // 0.0 to 1.0
  renderMode: RenderMode;
  themeMode: ThemeMode;
  toolMode: TransformToolMode;
  showGizmo: boolean;
  showLabels: boolean;
  showGhostSilhouette: boolean;
  physicsEnabled: boolean;
  tutorialTargetPartId?: string | null;
  partStates: Map<string, PartRuntimeState>;
  onUpdatePartStates: (states: Map<string, PartRuntimeState>) => void;
  onSnapPart: (partId: string) => void;
  onUpdateTelemetry?: (telemetry: ViewportTelemetry) => void;
  cameraPresetTrigger?: string | null;
  isSimulating?: boolean;
  onSetSimulating?: (sim: boolean) => void;
  resetViewTrigger?: number;
  snapAllTrigger?: number;
  onExplodeChange?: (val: number) => void;
}

export const CADViewport: React.FC<CADViewportProps> = ({
  modelDef,
  selectedPartId,
  onSelectPart,
  explodeProgress,
  renderMode,
  themeMode,
  toolMode,
  showGizmo,
  showLabels,
  showGhostSilhouette,
  physicsEnabled,
  tutorialTargetPartId,
  partStates,
  onUpdatePartStates,
  onSnapPart,
  onUpdateTelemetry,
  cameraPresetTrigger,
  isSimulating = false,
  onSetSimulating,
  resetViewTrigger,
  snapAllTrigger,
  onExplodeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);

  // Native In-Engine Animation Manager (No external libraries, 100% sync with rAF)
  const activeAnimationsRef = useRef<ActiveAnimation[]>([]);
  const activePartsRef = useRef<THREE.Group[]>([]);
  const cameraTweenRef = useRef<CameraTween | null>(null);

  // Assembled Ghost Twin Group ("Sombra" holográfica del modelo ya acoplado)
  const assembledGhostGroupRef = useRef<THREE.Group | null>(null);
  const assembledGhostMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Physics engine reference
  const physicsWorldRef = useRef<PhysicsWorld | null>(null);

  // Material and mesh references
  const materialsMapRef = useRef<Map<string, THREE.Material>>(new Map());
  const ghostMaterialRef = useRef<THREE.Material | null>(null);
  const guideLineMaterialRef = useRef<THREE.LineDashedMaterial | null>(null);
  const edgeMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const snapPulseMaterialRef = useRef<THREE.Material | null>(null);
  const blueprintMatRef = useRef<THREE.Material | null>(null);
  const hologramMatRef = useRef<THREE.Material | null>(null);
  const xrayMatRef = useRef<THREE.Material | null>(null);

  const modelGroupRef = useRef<THREE.Group | null>(null);
  const ghostsGroupRef = useRef<THREE.Group | null>(null);
  const guideLinesGroupRef = useRef<THREE.Group | null>(null);
  const snapFlashMeshRef = useRef<THREE.Mesh | null>(null);

  const majorGridRef = useRef<THREE.GridHelper | null>(null);
  const minorGridRef = useRef<THREE.GridHelper | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  const partMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const ghostMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const guideLinesMapRef = useRef<Map<string, THREE.Line>>(new Map());

  // Screen 3D Labels
  const [screenTags, setScreenTags] = useState<PartScreenTag[]>([]);

  // State refs
  const currentThemeRef = useRef<ThemeMode>(themeMode);
  currentThemeRef.current = themeMode;

  const isDraggingGizmoRef = useRef(false);
  const explodeProgressRef = useRef(explodeProgress);
  explodeProgressRef.current = explodeProgress;

  const isSimulatingRef = useRef(isSimulating);
  isSimulatingRef.current = isSimulating;

  const onSetSimulatingRef = useRef(onSetSimulating);
  onSetSimulatingRef.current = onSetSimulating;

  const physicsEnabledRef = useRef(physicsEnabled);
  physicsEnabledRef.current = physicsEnabled;

  const selectedPartIdRef = useRef(selectedPartId);
  selectedPartIdRef.current = selectedPartId;

  const tutorialTargetPartIdRef = useRef(tutorialTargetPartId);
  tutorialTargetPartIdRef.current = tutorialTargetPartId;

  const showLabelsRef = useRef(showLabels);
  showLabelsRef.current = showLabels;

  const partStatesRef = useRef(partStates);
  partStatesRef.current = partStates;

  const isManualTransformedRef = useRef<Map<string, boolean>>(new Map());
  const snapPulseTimeRef = useRef<number>(0);
  const crankAngleRef = useRef<number>(0);

  // Direct touch/pointer part drag state (prevents OrbitControls conflict - Requirement 3)
  const directDragStateRef = useRef<{
    isDragging: boolean;
    partId: string;
    plane: THREE.Plane;
    offset: THREE.Vector3;
    pointerId: number;
  } | null>(null);

  // 120ms Touch-Hold Threshold Ref (Strict Requirement: Touch Orbit vs Piece Drag)
  const touchHoldTimerRef = useRef<number | null>(null);
  const pendingTouchRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startTime: number;
    partId: string;
    dragPlane: THREE.Plane;
    offset: THREE.Vector3;
  } | null>(null);

  // Telemetry frame tracking
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const currentFpsRef = useRef(60);

  // ⚡ Acoplar Todo Animation State
  const snapAllAnimRef = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
    initialSliderVal: number;
    parts: {
      group: THREE.Group;
      partId: string;
      startPos: THREE.Vector3;
      targetPos: THREE.Vector3;
      startRot: THREE.Euler;
      targetRot: THREE.Euler;
      flashed: boolean;
    }[];
  } | null>(null);

  const onExplodeChangeRef = useRef(onExplodeChange);
  onExplodeChangeRef.current = onExplodeChange;

  // Native In-Engine Animation Manager (Cancel previous animation on same object)
  const startAnimation = useCallback((
    object: THREE.Object3D,
    targetPos: THREE.Vector3,
    duration: number,
    onComplete?: () => void,
    targetRot?: THREE.Euler,
    partId?: string
  ) => {
    // Cancel previous active animation on this exact same object or partId
    const existingIdx = activeAnimationsRef.current.findIndex(
      (a) => a.object === object || (partId && a.partId === partId)
    );
    if (existingIdx !== -1) {
      activeAnimationsRef.current.splice(existingIdx, 1);
    }

    activeAnimationsRef.current.push({
      object,
      partId,
      startPos: object.position.clone(),
      targetPos: targetPos.clone(),
      startRot: object.rotation.clone(),
      targetRot: targetRot ? targetRot.clone() : undefined,
      startTime: performance.now(),
      duration,
      onComplete,
    });
  }, []);

  // 1. ATOMIC THEME APPLIER (Ensures persistent theme across model switches & fixes lighting)
  const applyTheme = useCallback((theme: ThemeMode) => {
    const isLight = theme === 'light';
    const scene = sceneRef.current;
    if (!scene) return;

    // A. Scene background: Dark #07090e vs Light technical gray #e2e8f0
    const bgColor = new THREE.Color(isLight ? 0xe2e8f0 : 0x07090e);
    scene.background = bgColor;

    // B. Scene Fog: ELIMINATED COMPLETELY per specification so distant contrast is crystal clear
    scene.fog = null;

    // C. Floor GridHelper colors:
    // Dark: cyan #00e5ff / dark blue #1e293b
    // Light: navy blue #1d4ed8 / dark steel #64748b
    if (majorGridRef.current) {
      const mat = majorGridRef.current.material as THREE.LineBasicMaterial;
      mat.color.setHex(isLight ? 0x1d4ed8 : 0x00e5ff);
      mat.opacity = isLight ? 0.75 : 0.65;
      mat.transparent = true;
    }
    if (minorGridRef.current) {
      const mat = minorGridRef.current.material as THREE.LineBasicMaterial;
      mat.color.setHex(isLight ? 0x64748b : 0x1e293b);
      mat.opacity = isLight ? 0.45 : 0.40;
      mat.transparent = true;
    }

    // D. Calibrated Lighting for Dark Mode & Light Mode:
    // Hemisphere Light: (sky #94a3b8, ground #1e293b, intensity 1.4 in dark; sky #ffffff, ground #cbd5e1 in light)
    if (hemiLightRef.current) {
      if (isLight) {
        hemiLightRef.current.color.setHex(0xffffff);
        hemiLightRef.current.groundColor.setHex(0xcbd5e1);
        hemiLightRef.current.intensity = 1.2;
      } else {
        hemiLightRef.current.color.setHex(0x94a3b8);
        hemiLightRef.current.groundColor.setHex(0x1e293b);
        hemiLightRef.current.intensity = 1.4; // Prevents any metallic face from being pitch black
      }
    }

    // Key Light: neutral white (15, 25, 20) with intensity 2.0
    if (keyLightRef.current) {
      keyLightRef.current.color.setHex(0xffffff);
      keyLightRef.current.intensity = isLight ? 1.8 : 2.0;
    }

    // Rim/Backlight: positioned at (-15, 10, -20) with cyan #38bdf8 and intensity 1.5
    if (rimLightRef.current) {
      rimLightRef.current.color.setHex(isLight ? 0x1d4ed8 : 0x38bdf8);
      rimLightRef.current.intensity = isLight ? 1.2 : 1.5;
    }

    // E. Ghost Meshes and Laser Guide Lines:
    // Dark: glowing neon cyan #00e5ff (opacity 0.35)
    // Light: intense deep cobalt blue #1d4ed8 with reinforced opacity 0.82
    const ghostMat = createGhostMaterial(isLight);
    ghostMaterialRef.current = ghostMat;

    ghostMeshesRef.current.forEach((ghostGroup) => {
      ghostGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = ghostMat;
        }
      });
    });

    const guideMat = createGuideLineMaterial(isLight);
    guideLineMaterialRef.current = guideMat;

    guideLinesMapRef.current.forEach((line) => {
      line.material = guideMat;
    });

    // F. Edge Outlines for distant visibility (threshold 25°)
    const edgeMat = createEdgeOutlineMaterial(isLight);
    edgeMaterialRef.current = edgeMat;

    modelGroupRef.current?.traverse((child) => {
      if (child instanceof THREE.LineSegments && child.userData.isCadEdge) {
        child.material = edgeMat;
      }
    });

    // G. Assembled Ghost Silhouette ("Sombra" holográfica del modelo ya acoplado)
    // Dark: cyan #00e5ff (opacity 0.20) / Light: slate #475569 (opacity 0.22)
    if (assembledGhostGroupRef.current) {
      const ghostColor = isLight ? 0x475569 : 0x00e5ff;
      const ghostOpacity = isLight ? 0.22 : 0.20;
      assembledGhostGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.color.setHex(ghostColor);
          child.material.opacity = ghostOpacity;
        }
      });
    }

    // H. Synchronize body CSS class
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('light-mode', isLight);
    }
  }, []);

  // Initialize Scene, Camera, Lights, Grid
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const isInitLight = currentThemeRef.current === 'light';
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isInitLight ? 0xe2e8f0 : 0x07090e);
    sceneRef.current = scene;

    // 2. Camera with near: 0.1 and far: 2000 (Cero pérdida de detalle por distancia)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(5.5, 4.0, 7.5);
    cameraRef.current = camera;

    // 3. Renderer with high-fidelity soft shadows (PCFSoftShadowMap)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Procedural PBR Studio Environment (PMREMGenerator + RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnvironment = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnvironment, 0.04).texture;

    // 4. Physics World (Cannon.js)
    const physicsWorld = new PhysicsWorld();
    physicsWorldRef.current = physicsWorld;

    // 5. OrbitControls with smooth touch controls for mobile (Mobile-First)
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 2.0;
    orbitControls.maxDistance = 35.0;
    orbitControls.maxPolarAngle = Math.PI / 2 + 0.1;
    orbitControls.target.set(0, 0, 0);
    orbitControls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    orbitControlsRef.current = orbitControls;

    // 6. TransformControls
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.size = 0.75;
    transformControls.space = 'world';
    scene.add(transformControls.getHelper());
    transformControlsRef.current = transformControls;

    transformControls.addEventListener('dragging-changed', (event) => {
      const isDragging = Boolean(event.value);
      isDraggingGizmoRef.current = isDragging;
      orbitControls.enabled = !isDragging;

      if (selectedPartIdRef.current) {
        const partId = selectedPartIdRef.current;
        const group = partMeshesRef.current.get(partId);
        const partDef = modelDef.createParts().parts.find((p) => p.id === partId);

        if (group && partDef) {
          if (isDragging) {
            if (isSimulatingRef.current) {
              isSimulatingRef.current = false;
              onSetSimulatingRef.current?.(false);
            }
            physicsWorld.syncBodyFromMesh(partId, group);
          } else {
            const targetPos = new THREE.Vector3(...partDef.defaultPosition);
            const currentPos = group.position;
            const dist = currentPos.distanceTo(targetPos);

            const snapRadius = Math.max(partDef.snapTolerance || 1.2, 1.2);

            if (dist <= snapRadius) {
              const targetRot = new THREE.Euler(...partDef.defaultRotation);

              startAnimation(
                group,
                targetPos,
                380,
                () => {
                  group.position.copy(targetPos);
                  group.rotation.set(...partDef.defaultRotation);
                  isManualTransformedRef.current.set(partId, false);
                  physicsWorld.lockToKinematic(partId, partDef.defaultPosition, partDef.defaultRotation);

                  sound.playLockSound();
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    try { navigator.vibrate(15); } catch {}
                  }
                  onSnapPart(partId);

                  if (snapFlashMeshRef.current) {
                    snapFlashMeshRef.current.position.copy(targetPos);
                    snapFlashMeshRef.current.visible = true;
                    snapPulseTimeRef.current = 1.0;
                  }
                },
                targetRot,
                partId
              );
            } else {
              isManualTransformedRef.current.set(partId, true);
              if (physicsEnabledRef.current) {
                physicsWorld.releaseToPhysics(partId, group);
              }
            }
          }
        }
      }
    });

    // 7. Calibrated Lighting Setup:
    // A. Hemisphere Light (prevents any metallic surface from falling into pitch black)
    const hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 1.4);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // B. Key Light: Directional white (#ffffff, 2.0) placed at (15, 25, 20) with PCFSoftShadowMap
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(15, 25, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 45;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // C. Fill / Rim Light: Directional cyan (#38bdf8, 1.5) placed at (-15, 10, -20)
    // Casts subtle counter-shadow for deep groove depth
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-15, 10, -20);
    rimLight.castShadow = true;
    rimLight.shadow.mapSize.width = 1024;
    rimLight.shadow.mapSize.height = 1024;
    rimLight.shadow.bias = -0.0005;
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // D. Soft low frontal bounce fill
    const fillLight = new THREE.DirectionalLight(0xfff1e6, 0.55);
    fillLight.position.set(0, -6, 8);
    scene.add(fillLight);

    // 8. Ground Grid
    const floorY = -3.15;
    const majorGrid = new THREE.GridHelper(
      30,
      30,
      isInitLight ? 0x1d4ed8 : 0x00e5ff,
      isInitLight ? 0x64748b : 0x1e293b
    );
    majorGrid.position.y = floorY;
    scene.add(majorGrid);
    majorGridRef.current = majorGrid;

    const minorGrid = new THREE.GridHelper(
      30,
      120,
      isInitLight ? 0x64748b : 0x1e293b,
      isInitLight ? 0x94a3b8 : 0x0f172a
    );
    minorGrid.position.y = floorY + 0.002;
    scene.add(minorGrid);
    minorGridRef.current = minorGrid;

    // Snap Flash Hologram Sphere
    const snapFlashGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const snapPulseMat = createSnapPulseMaterial();
    snapPulseMaterialRef.current = snapPulseMat;
    const snapFlash = new THREE.Mesh(snapFlashGeo, snapPulseMat);
    snapFlash.visible = false;
    scene.add(snapFlash);
    snapFlashMeshRef.current = snapFlash;

    // Groups
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    const ghostsGroup = new THREE.Group();
    scene.add(ghostsGroup);
    ghostsGroupRef.current = ghostsGroup;

    const guideLinesGroup = new THREE.Group();
    scene.add(guideLinesGroup);
    guideLinesGroupRef.current = guideLinesGroup;

    materialsMapRef.current = createMaterialLibrary();
    blueprintMatRef.current = createBlueprintMaterial();
    hologramMatRef.current = createHologramMaterial();
    xrayMatRef.current = createXRayMaterial();

    // Apply active theme immediately
    applyTheme(currentThemeRef.current);

    // 9. Animation loop
    let reqId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Native In-Engine Animation Manager: Update all active animations synchronously
      const now = performance.now();
      for (let i = activeAnimationsRef.current.length - 1; i >= 0; i--) {
        const anim = activeAnimationsRef.current[i];
        const elapsed = now - anim.startTime;
        const progress = Math.min(elapsed / anim.duration, 1.0);

        // Curva suave Cubic.Out: 1 - Math.pow(1 - progress, 3)
        const ease = 1 - Math.pow(1 - progress, 3);
        anim.object.position.lerpVectors(anim.startPos, anim.targetPos, ease);

        if (anim.startRot && anim.targetRot) {
          anim.object.rotation.x = THREE.MathUtils.lerp(anim.startRot.x, anim.targetRot.x, ease);
          anim.object.rotation.y = THREE.MathUtils.lerp(anim.startRot.y, anim.targetRot.y, ease);
          anim.object.rotation.z = THREE.MathUtils.lerp(anim.startRot.z, anim.targetRot.z, ease);
        }

        if (progress >= 1.0) {
          anim.object.position.copy(anim.targetPos);
          if (anim.targetRot) {
            anim.object.rotation.copy(anim.targetRot);
          }
          if (anim.onComplete) {
            anim.onComplete();
          }
          activeAnimationsRef.current.splice(i, 1);
        }
      }

      frameCountRef.current++;
      if (now - lastFpsTimeRef.current >= 500) {
        currentFpsRef.current = Math.round((frameCountRef.current * 1000) / (now - lastFpsTimeRef.current));
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;

        if (onUpdateTelemetry && rendererRef.current) {
          onUpdateTelemetry({
            fps: currentFpsRef.current,
            drawCalls: rendererRef.current.info.render.calls,
            triangles: rendererRef.current.info.render.triangles,
            lodActive: 'MÁXIMO FORZADO (100% Sin LOD)',
            physicsBodiesCount: physicsWorldRef.current?.bodies.size || 0,
          });
        }
      }

      orbitControls.update();

      // LOD traverse removed: all meshes, holes, teeth and grooves remain at 100% detail at any distance

      physicsWorld.enabled = physicsEnabledRef.current;
      if (physicsEnabledRef.current) {
        physicsWorld.update(delta);
      }

      // Flash pulse decay
      if (snapPulseTimeRef.current > 0 && snapFlashMeshRef.current) {
        snapPulseTimeRef.current -= delta * 3.0;
        if (snapPulseTimeRef.current <= 0) {
          snapFlashMeshRef.current.visible = false;
        } else {
          const s = 1.0 + (1.0 - snapPulseTimeRef.current) * 1.5;
          snapFlashMeshRef.current.scale.set(s, s, s);
          if (snapPulseMaterialRef.current instanceof THREE.MeshBasicMaterial) {
            snapPulseMaterialRef.current.opacity = snapPulseTimeRef.current * 0.9;
          }
        }
      }

      // Smooth camera interpolation (e.g. Reiniciar Vista)
      if (cameraTweenRef.current && cameraRef.current && orbitControlsRef.current) {
        const ct = cameraTweenRef.current;
        const elapsed = now - ct.startTime;
        const progress = Math.min(1.0, elapsed / ct.duration);
        const eased = easeOutCubic(progress);

        cameraRef.current.position.lerpVectors(ct.startPos, ct.targetPos, eased);
        orbitControlsRef.current.target.lerpVectors(ct.startTarget, ct.targetTarget, eased);
        orbitControlsRef.current.update();

        if (progress >= 1.0) {
          cameraRef.current.position.copy(ct.targetPos);
          orbitControlsRef.current.target.copy(ct.targetTarget);
          orbitControlsRef.current.update();
          cameraTweenRef.current = null;
        }
      }

      // ⚡ Acoplar Todo Animation (Pure Vanilla JS in render loop: 500ms Cubic Ease-Out)
      if (snapAllAnimRef.current?.active) {
        const anim = snapAllAnimRef.current;
        const elapsed = now - anim.startTime;
        const progress = Math.min(1.0, elapsed / anim.duration);
        // Curva de desaceleración cúbica estricta: 1 - Math.pow(1 - progress, 3)
        const ease = 1 - Math.pow(1 - progress, 3);

        // Interpolar el valor del slider de explosión hacia 0 y actualizar etiqueta
        const currentSlider = anim.initialSliderVal * (1 - ease);
        explodeProgressRef.current = currentSlider;
        onExplodeChangeRef.current?.(currentSlider);
        const sliderInput = document.getElementById('slider-explosion') as HTMLInputElement | null;
        const sliderLabel = document.getElementById('label-explosion');
        if (sliderInput) sliderInput.value = String(Math.round(currentSlider * 100));
        if (sliderLabel) sliderLabel.textContent = Math.round(currentSlider * 100) + '%';

        anim.parts.forEach((p) => {
          p.group.position.lerpVectors(p.startPos, p.targetPos, ease);
          p.group.rotation.x = THREE.MathUtils.lerp(p.startRot.x, p.targetRot.x, ease);
          p.group.rotation.y = THREE.MathUtils.lerp(p.startRot.y, p.targetRot.y, ease);
          p.group.rotation.z = THREE.MathUtils.lerp(p.startRot.z, p.targetRot.z, ease);

          // Al encajar en posición de ensamble, dispara destello luminoso (Lock Flash) y audio metálico
          if (progress >= 0.90 && !p.flashed) {
            p.flashed = true;
            sound.playLockSound();
            if (snapFlashMeshRef.current) {
              snapFlashMeshRef.current.position.copy(p.targetPos);
              snapFlashMeshRef.current.visible = true;
              snapPulseTimeRef.current = 1.0;
            }
            onSnapPart(p.partId);
          }
        });

        if (progress >= 1.0) {
          anim.parts.forEach((p) => {
            p.group.position.copy(p.targetPos);
            p.group.rotation.copy(p.targetRot);
            p.group.userData.isAssembled = true;
            isManualTransformedRef.current.set(p.partId, false);
          });
          anim.active = false;
          explodeProgressRef.current = 0;
          onExplodeChangeRef.current?.(0);
          if (sliderInput) sliderInput.value = '0';
          if (sliderLabel) sliderLabel.textContent = '0%';
          sound.playAssemblyComplete();
          try {
            confetti({
              particleCount: 65,
              spread: 70,
              origin: { y: 0.8 },
              colors: ['#06b6d4', '#10b981', '#f59e0b', '#38bdf8'],
            });
          } catch {}
        }
      }

      // Safety Rule & Kinematic Engine Pause State:
      // Apply a 'paused' state if the explode slider > 0 or manual transform is active
      const hasManualTransform =
        isDraggingGizmoRef.current ||
        Boolean(directDragStateRef.current?.isDragging) ||
        Array.from(isManualTransformedRef.current.values()).some(Boolean);
      const isKinematicPaused = explodeProgressRef.current > 0 || hasManualTransform;

      if (isKinematicPaused && isSimulatingRef.current) {
        isSimulatingRef.current = false;
        onSetSimulatingRef.current?.(false);
      }

      // Mechanical Physical Kinematic Simulation (Active when isSimulating === true and NOT paused)
      if (!isKinematicPaused && isSimulatingRef.current && !snapAllAnimRef.current?.active) {
        const time = performance.now();
        const modelId = modelDef.id;

        // 1. Conjunto Pistón y Biela (Mecanismo Biela-Manivela)
        if (modelId === 'piston_assembly' || modelId === 'piston' || modelId === 'piston_rod') {
          const crown = partMeshesRef.current.get('piston_crown');
          const pin = partMeshesRef.current.get('wrist_pin');
          const rings = partMeshesRef.current.get('piston_rings');
          const rod = partMeshesRef.current.get('connecting_rod');
          const cap = partMeshesRef.current.get('rod_cap');
          const bearings = partMeshesRef.current.get('rod_bearings');
          const bolts = partMeshesRef.current.get('rod_bolts');

          // Cigüeñal/Manivela inferior rota continuamente sobre su eje central horizontal (eje Z): crankAngle += 0.04
          const R = 0.72; // Radio de manivela del cigüeñal
          const L = 3.5; // Longitud de biela entre centros
          crankAngleRef.current += 0.04;
          const crankAngle = crankAngleRef.current;

          // El perno inferior de la biela sigue la trayectoria circular del muñón del cigüeñal: (x = R * Math.cos(crankAngle), y = R * Math.sin(crankAngle))
          const crankX = R * Math.cos(crankAngle);
          const crankY = R * Math.sin(crankAngle);

          // El pistón está confinado a un movimiento estrictamente lineal vertical (eje Y)
          const pistonDeltaY = crankY + Math.sqrt(L * L - Math.pow(crankX, 2)) - L;

          // El cuerpo de la biela bascula angularmente conectando el muñón con el pistón
          const rodAngleZ = Math.asin(-crankX / L);

          // Pistón, aros y bulón: movimiento estrictamente lineal vertical (eje Y)
          if (crown && crown.userData.homePos) {
            crown.position.set(crown.userData.homePos.x, crown.userData.homePos.y + pistonDeltaY, crown.userData.homePos.z);
            crown.rotation.set(0, 0, 0);
          }
          if (rings && rings.userData.homePos) {
            rings.position.set(rings.userData.homePos.x, rings.userData.homePos.y + pistonDeltaY, rings.userData.homePos.z);
            rings.rotation.set(0, 0, 0);
          }
          if (pin && pin.userData.homePos) {
            pin.position.set(pin.userData.homePos.x, pin.userData.homePos.y + pistonDeltaY, pin.userData.homePos.z);
            pin.rotation.set(0, 0, 0);
          }

          // Biela bascula angularmente conectando el muñón con el pistón
          if (rod && rod.userData.homePos) {
            rod.position.set(
              rod.userData.homePos.x + crankX * 0.6,
              rod.userData.homePos.y + pistonDeltaY * 0.4 + crankY * 0.6,
              rod.userData.homePos.z
            );
            rod.rotation.set(0, 0, rodAngleZ);
          }

          // Sombrerete de biela, cojinetes y tornillos ARP siguen la órbita del muñón con la inclinación de biela
          if (cap && cap.userData.homePos) {
            cap.position.set(cap.userData.homePos.x + crankX, cap.userData.homePos.y + crankY, cap.userData.homePos.z);
            cap.rotation.set(0, 0, rodAngleZ);
          }
          if (bearings && bearings.userData.homePos) {
            bearings.position.set(bearings.userData.homePos.x + crankX, bearings.userData.homePos.y + crankY, bearings.userData.homePos.z);
            bearings.rotation.set(0, 0, rodAngleZ);
          }
          if (bolts && bolts.userData.homePos) {
            bolts.position.set(bolts.userData.homePos.x + crankX, bolts.userData.homePos.y + crankY, bolts.userData.homePos.z);
            bolts.rotation.set(0, 0, rodAngleZ);
          }
        }

        // 2. Sistema de Frenos de Disco
        else if (modelId === 'brake_system' || modelId === 'brake' || modelId === 'stark_brake') {
          // El disco ventilado, la maza central y los 5 birlos giran de forma solidaria sobre el eje de rotación de la rueda
          const rotor = partMeshesRef.current.get('brake_rotor') || partMeshesRef.current.get('rotor');
          const hub = partMeshesRef.current.get('wheel_hub') || partMeshesRef.current.get('hub');
          const studs = partMeshesRef.current.get('wheel_studs') || partMeshesRef.current.get('studs');

          const angularVelocity = 0.04;
          if (rotor) rotor.rotation.z += angularVelocity;
          if (hub) hub.rotation.z += angularVelocity;
          if (studs) studs.rotation.z += angularVelocity;

          // El caliper monobloque, el soporte de fijación y las balatas cerámicas se mantienen 100% fijos y estáticos
          const caliper = partMeshesRef.current.get('caliper_body') || partMeshesRef.current.get('caliper');
          const bracket = partMeshesRef.current.get('bracket') || partMeshesRef.current.get('caliper_bracket');
          const innerPad = partMeshesRef.current.get('inner_pad');
          const outerPad = partMeshesRef.current.get('outer_pad');
          const pads = partMeshesRef.current.get('pads');

          [caliper, bracket, innerPad, outerPad, pads].forEach((part) => {
            if (part && part.userData.homePos) {
              part.position.copy(part.userData.homePos);
              if (part.userData.homeRot) {
                part.rotation.copy(part.userData.homeRot);
              }
            }
          });
        }

        // 3. Eje y Diferencial Trasero (Engranaje Cónico a 90° con relación 4:1)
        else if (modelId === 'axle_differential' || modelId === 'axle') {
          // La corona dentada y el semieje giran sobre el eje transversal (eje X).
          // El piñón de ataque está posicionado a 90° en el eje longitudinal (eje Z).
          // Relación de transmisión 4:1: el piñón de ataque rota 4 veces más rápido que la corona en sentido horario.
          const shaft = partMeshesRef.current.get('axle_shaft') || partMeshesRef.current.get('shaft');
          const crown = partMeshesRef.current.get('crown_flange') || partMeshesRef.current.get('crown') || partMeshesRef.current.get('gear');
          const bLeft = partMeshesRef.current.get('bearing_left');
          const bRight = partMeshesRef.current.get('bearing_right');
          const pinion = partMeshesRef.current.get('pinion') || partMeshesRef.current.get('drive_pinion');
          const bevelLeft = partMeshesRef.current.get('bevel_gear_left');
          const bevelRight = partMeshesRef.current.get('bevel_gear_right');

          const crownSpeed = 0.02;
          const diffRatio = 4.0; // Relación 4:1
          const pinionSpeed = crownSpeed * diffRatio; // 4 veces más rápido

          if (shaft) shaft.rotation.x += crownSpeed;
          if (crown) crown.rotation.x += crownSpeed;
          if (bLeft) bLeft.rotation.x += crownSpeed;
          if (bRight) bRight.rotation.x += crownSpeed;

          // Piñón de ataque sincronizado a 4:1 engranando a 90°
          if (pinion) pinion.rotation.z += pinionSpeed;
          if (bevelLeft) bevelLeft.rotation.x += crownSpeed;
          if (bevelRight) bevelRight.rotation.x += crownSpeed;
        }

        // 4. Caja de Transmisión Manual (Engranes Coordinados: w2 = -w1 * (r1 / r2))
        else if (modelId === 'gearbox_manual' || modelId === 'gearbox') {
          // El eje de entrada (primario) transmite rotación al árbol intermediario en sentido inverso
          const shaft1 = partMeshesRef.current.get('input_shaft') || partMeshesRef.current.get('shaft1');
          const shaft2 = partMeshesRef.current.get('counter_shaft') || partMeshesRef.current.get('shaft2');
          const gearCluster = partMeshesRef.current.get('gear_cluster_main') || partMeshesRef.current.get('gear1');
          const synchro = partMeshesRef.current.get('synchro_hub') || partMeshesRef.current.get('gear2');
          const fork = partMeshesRef.current.get('shift_fork');
          const casing = partMeshesRef.current.get('casing_cutaway');

          const w1 = 0.035;
          const r1 = 0.95; // Radio engrane primario
          const r2 = 0.75; // Radio engrane secundario
          const w2 = -w1 * (r1 / r2); // Sentido opuesto y relación de transmisión rigurosa

          if (shaft1) shaft1.rotation.x += w1;
          if (gearCluster) gearCluster.rotation.x += w1;
          if (synchro) synchro.rotation.x += w1;
          if (shaft2) shaft2.rotation.x += w2;

          // Carcasa y horquilla de cambio fijas
          [fork, casing].forEach((part) => {
            if (part && part.userData.homePos) {
              part.position.copy(part.userData.homePos);
              if (part.userData.homeRot) {
                part.rotation.copy(part.userData.homeRot);
              }
            }
          });
        }

        // 5. Suspensión MacPherson
        else if (modelId === 'shock_coilover' || modelId === 'shock') {
          // Movimiento sinusoidal de compresión vertical suave: el vástago entra en el cilindro hidráulico
          // mientras resorte y fuelle se comprimen en scale.y manteniendo copela y base fijas como topes.
          const rod = partMeshesRef.current.get('piston_rod') || partMeshesRef.current.get('rod');
          const spring = partMeshesRef.current.get('coil_spring') || partMeshesRef.current.get('spring');
          const boot = partMeshesRef.current.get('bump_stop') || partMeshesRef.current.get('boot');
          const damper = partMeshesRef.current.get('damper_body');
          const lowerSeat = partMeshesRef.current.get('lower_spring_seat');
          const topMount = partMeshesRef.current.get('top_mount');

          const cycle = Math.sin(time * 0.003) * 0.35;
          if (rod && rod.userData.homePos) {
            rod.position.y = rod.userData.homePos.y - Math.abs(cycle * 0.5);
          }
          if (spring) {
            spring.scale.y = 1.0 - Math.abs(cycle * 0.22);
          }
          if (boot) {
            if (boot.userData.homePos) {
              boot.position.y = boot.userData.homePos.y - Math.abs(cycle * 0.35);
            }
            boot.scale.y = 1.0 - Math.abs(cycle * 0.25);
          }

          // Copela superior, asiento inferior y cuerpo del amortiguador fijos como topes
          [damper, lowerSeat, topMount].forEach((part) => {
            if (part && part.userData.homePos) {
              part.position.copy(part.userData.homePos);
              if (part.userData.homeRot) {
                part.rotation.copy(part.userData.homeRot);
              }
            }
          });
        }
      }

      // Parts synchronization
      const parts = modelDef.createParts().parts;
      const states = new Map(partStatesRef.current);
      let hasStateChanges = false;

      const currentTags: PartScreenTag[] = [];
      const cont = containerRef.current;
      const contW = cont ? cont.clientWidth : width;
      const contH = cont ? cont.clientHeight : height;

      parts.forEach((part) => {
        const meshGroup = partMeshesRef.current.get(part.id);
        if (!meshGroup) return;

        const defaultPos = new THREE.Vector3(...part.defaultPosition);

        if (isDraggingGizmoRef.current && selectedPartIdRef.current === part.id) {
          physicsWorld.syncBodyFromMesh(part.id, meshGroup);
        } else if (physicsEnabledRef.current) {
          const isPhysicallySimulated = physicsWorld.syncMeshFromBody(part.id, meshGroup);
          if (isPhysicallySimulated) {
            isManualTransformedRef.current.set(part.id, true);
          }
        }

        const isManual = isManualTransformedRef.current.get(part.id);
        const isAnimating = activeAnimationsRef.current.some((a) => a.object === meshGroup || a.partId === part.id);
        const isSnapAlling = Boolean(snapAllAnimRef.current?.active);
        const isDirectDragging = directDragStateRef.current?.partId === part.id;
        if (!isManual && !isDraggingGizmoRef.current && !isDirectDragging && !isAnimating && !isSnapAlling && !isSimulatingRef.current) {
          const expVec = new THREE.Vector3(...part.explodeVector);
          const expTarget = defaultPos.clone().add(
            expVec.multiplyScalar(part.explodeDistance * explodeProgressRef.current)
          );
          meshGroup.position.lerp(expTarget, 0.2);
        }

        const currentDist = meshGroup.position.distanceTo(defaultPos);
        const isSnapped = currentDist < 0.12;

        const prev = states.get(part.id);
        if (prev && (prev.isSnapped !== isSnapped || Math.abs(prev.distanceToTarget - currentDist) > 0.02)) {
          states.set(part.id, {
            ...prev,
            isSnapped,
            distanceToTarget: currentDist,
            currentPosition: meshGroup.position.clone(),
            currentRotation: meshGroup.rotation.clone(),
          });
          hasStateChanges = true;
        }

        // Screen 3D Labels
        if (showLabelsRef.current && meshGroup.visible) {
          const worldPos = new THREE.Vector3();
          meshGroup.getWorldPosition(worldPos);
          worldPos.y += 0.35;
          worldPos.project(camera);

          if (worldPos.z < 1) {
            const screenX = ((worldPos.x + 1) * contW) / 2;
            const screenY = ((-worldPos.y + 1) * contH) / 2;
            currentTags.push({
              id: part.id,
              name: part.name,
              isSnapped,
              x: screenX,
              y: screenY,
              visible: true,
            });
          }
        }

        // Ghost & Guide lines
        const ghost = ghostMeshesRef.current.get(part.id);
        const guideLine = guideLinesMapRef.current.get(part.id);

        const isDetached = currentDist > 0.2;
        const isSelected = selectedPartIdRef.current === part.id;
        const isTutorialTarget = tutorialTargetPartIdRef.current === part.id;

        if (ghost) {
          ghost.visible = isDetached && (isSelected || isTutorialTarget || explodeProgressRef.current > 0.05);
        }

        if (guideLine) {
          if (isDetached && (isSelected || isTutorialTarget)) {
            guideLine.visible = true;
            const positions = guideLine.geometry.attributes.position.array as Float32Array;
            positions[0] = meshGroup.position.x;
            positions[1] = meshGroup.position.y;
            positions[2] = meshGroup.position.z;
            positions[3] = defaultPos.x;
            positions[4] = defaultPos.y;
            positions[5] = defaultPos.z;
            guideLine.geometry.attributes.position.needsUpdate = true;
          } else {
            guideLine.visible = false;
          }
        }
      });

      if (hasStateChanges) {
        onUpdatePartStates(states);
      }

      if (showLabelsRef.current) {
        setScreenTags(currentTags);
      } else {
        setScreenTags([]);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
        rendererRef.current.dispose();
      }
    };
  }, [modelDef.id]);

  // Handle explicit themeMode prop changes
  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode, applyTheme]);

  // 2. DISPOSE OLD GPU MEMORY & BUILD NEW MODEL WITH 25-DEGREE EDGESGEOMETRY & CALL applyTheme()
  useEffect(() => {
    if (!sceneRef.current || !modelGroupRef.current || !ghostsGroupRef.current || !guideLinesGroupRef.current) return;

    // A. Thorough GPU cleanup of previous geometries, lines and materials
    const disposeHierarchy = (parent: THREE.Group) => {
      while (parent.children.length > 0) {
        const obj = parent.children[0];
        parent.remove(obj);
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Line) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else if (child.material) {
              child.material.dispose();
            }
          }
        });
      }
    };

    disposeHierarchy(modelGroupRef.current);
    disposeHierarchy(ghostsGroupRef.current);
    disposeHierarchy(guideLinesGroupRef.current);

    partMeshesRef.current.clear();
    ghostMeshesRef.current.clear();
    guideLinesMapRef.current.clear();
    isManualTransformedRef.current.clear();
    physicsWorldRef.current?.clearParts();

    // Reset OrbitControls camera target centered to origin
    if (orbitControlsRef.current) {
      orbitControlsRef.current.target.set(0, 0, 0);
      orbitControlsRef.current.update();
    }

    // B. Build Meshes with CAD Vector Edges (threshold angle = 25 degrees as requested)
    const isLight = currentThemeRef.current === 'light';
    const edgeMaterial = createEdgeOutlineMaterial(isLight);
    edgeMaterialRef.current = edgeMaterial;

    const { parts, buildMeshes } = modelDef.createParts();
    const meshesMap = buildMeshes(materialsMapRef.current);

    const initialStates = new Map<string, PartRuntimeState>();
    const activePartsList: THREE.Group[] = [];

    parts.forEach((part) => {
      const meshGroup = meshesMap.get(part.id);
      if (!meshGroup) return;

      meshGroup.position.set(...part.defaultPosition);
      meshGroup.rotation.set(...part.defaultRotation);

      // Attach technical metadata to meshGroup userData
      meshGroup.userData.partId = part.id;
      meshGroup.userData.homePos = new THREE.Vector3(...part.defaultPosition);
      meshGroup.userData.homeRot = new THREE.Euler(...part.defaultRotation);
      meshGroup.userData.explodeVec = new THREE.Vector3(...part.explodeVector).multiplyScalar(part.explodeDistance || 2.5);
      meshGroup.userData.explodeDistance = part.explodeDistance || 2.5;

      // Generate sharp EdgesGeometry(geometry, 25) for crisp technical outlines on gears, slots, and bevels
      meshGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const edgesGeo = new THREE.EdgesGeometry(child.geometry, 25);
          const edgeLines = new THREE.LineSegments(edgesGeo, edgeMaterial);
          edgeLines.userData.isCadEdge = true;
          child.add(edgeLines);
        }
      });

      modelGroupRef.current?.add(meshGroup);
      partMeshesRef.current.set(part.id, meshGroup);
      activePartsList.push(meshGroup);

      // Register Physics
      if (physicsWorldRef.current && part.physics) {
        physicsWorldRef.current.registerPart({
          partId: part.id,
          shapeType: part.physics.shapeType,
          size: part.physics.size,
          mass: part.physics.mass,
          initialPosition: part.defaultPosition,
          initialRotation: part.defaultRotation,
        });
      }

      // Ghost Target Mesh with theme-aware material
      const ghostMat = createGhostMaterial(isLight);
      const ghostGroup = meshGroup.clone(true);
      ghostGroup.position.set(...part.defaultPosition);
      ghostGroup.rotation.set(...part.defaultRotation);
      ghostGroup.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.InstancedMesh) {
          child.material = ghostMat;
          child.castShadow = false;
          child.receiveShadow = false;
        } else if (child instanceof THREE.LineSegments && child.userData.isCadEdge) {
          child.visible = false;
        }
      });
      ghostGroup.visible = false;
      ghostsGroupRef.current?.add(ghostGroup);
      ghostMeshesRef.current.set(part.id, ghostGroup);

      // Laser Guide Line with theme-aware material
      const guideMat = createGuideLineMaterial(isLight);
      const lineGeo = new THREE.BufferGeometry();
      const linePoints = new Float32Array([
        part.defaultPosition[0], part.defaultPosition[1], part.defaultPosition[2],
        part.defaultPosition[0], part.defaultPosition[1], part.defaultPosition[2],
      ]);
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePoints, 3));
      const guideLine = new THREE.Line(lineGeo, guideMat);
      guideLine.computeLineDistances();
      guideLine.visible = false;
      guideLinesGroupRef.current?.add(guideLine);
      guideLinesMapRef.current.set(part.id, guideLine);

      initialStates.set(part.id, {
        id: part.id,
        isSnapped: true,
        isVisible: true,
        currentPosition: new THREE.Vector3(...part.defaultPosition),
        currentRotation: new THREE.Euler(...part.defaultRotation),
        distanceToTarget: 0,
        meshGroup,
      ghostMesh: ghostGroup,
        guideLine,
      });

      isManualTransformedRef.current.set(part.id, false);
    });

    activePartsRef.current = activePartsList;

    // C. Build Assembled Ghost Twin Group ("Sombra" holográfica del modelo ya acoplado)
    if (assembledGhostGroupRef.current && sceneRef.current) {
      disposeHierarchy(assembledGhostGroupRef.current);
      sceneRef.current.remove(assembledGhostGroupRef.current);
      assembledGhostGroupRef.current = null;
    }

    const ghostColor = isLight ? 0x475569 : 0x00e5ff;
    const ghostOpacity = isLight ? 0.22 : 0.20;
    const fullGhostMat = new THREE.MeshBasicMaterial({
      color: ghostColor,
      transparent: true,
      opacity: ghostOpacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    assembledGhostMatRef.current = fullGhostMat;

    const assembledGhostGroup = new THREE.Group();
    assembledGhostGroup.name = 'assembled_ghost_group';

    parts.forEach((part) => {
      const meshGroup = meshesMap.get(part.id);
      if (!meshGroup) return;

      const clone = meshGroup.clone(true);
      clone.position.set(...part.defaultPosition);
      clone.rotation.set(...part.defaultRotation);

      clone.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.InstancedMesh) {
          child.material = fullGhostMat;
          child.castShadow = false;
          child.receiveShadow = false;
          // CRITICAL: Disable raycast so it NEVER blocks clicks on real parts
          child.raycast = () => {};
        } else if (child instanceof THREE.LineSegments || child instanceof THREE.Line) {
          child.visible = false;
        }
      });

      assembledGhostGroup.add(clone);
    });

    assembledGhostGroup.visible = showGhostSilhouette;
    sceneRef.current.add(assembledGhostGroup);
    assembledGhostGroupRef.current = assembledGhostGroup;

    onUpdatePartStates(initialStates);

    // CRITICAL: CALL applyTheme(currentTheme) AT THE END OF LOADING TO GUARANTEE CALIBRATED LIGHTING & COLORS!
    applyTheme(currentThemeRef.current);
  }, [modelDef, applyTheme]);

  // Sync ghost silhouette visibility
  useEffect(() => {
    if (assembledGhostGroupRef.current) {
      assembledGhostGroupRef.current.visible = showGhostSilhouette;
    }
  }, [showGhostSilhouette]);



  // 1. Lógica Matemática Directa del Slider Continuo de Explosión (Sin librerías externas de animación)
  useEffect(() => {
    // Si el slider de explosión se mueve a un valor mayor a 0, desactivar simulación cinemática
    if (explodeProgress > 0 && isSimulatingRef.current) {
      isSimulatingRef.current = false;
      onSetSimulatingRef.current?.(false);
    }

    const parts = activePartsRef.current.length > 0
      ? activePartsRef.current
      : Array.from(partMeshesRef.current.values());

    parts.forEach((part) => {
      if (part.userData.homePos && part.userData.explodeVec) {
        // Posición actual = homePos + (explodeVec * factor)
        const targetExplodePos = part.userData.homePos.clone().add(part.userData.explodeVec);
        part.position.lerpVectors(
          part.userData.homePos,
          targetExplodePos,
          explodeProgress
        );
        part.userData.isAssembled = (explodeProgress === 0);

        if (explodeProgress === 0) {
          if (part.userData.homeRot) {
            part.rotation.copy(part.userData.homeRot);
          }
          isManualTransformedRef.current.set(part.userData.partId, false);
        }
      }
    });
  }, [explodeProgress]);

  // Restablecer alineaciones y rotaciones nominales al detener marcha real o regresar a 0
  useEffect(() => {
    if (!isSimulating && explodeProgress === 0) {
      activePartsRef.current.forEach((part) => {
        if (part.userData.homePos && !isManualTransformedRef.current.get(part.userData.partId)) {
          part.position.copy(part.userData.homePos);
        }
        if (part.userData.homeRot) {
          part.rotation.copy(part.userData.homeRot);
        }
        if (part.scale) {
          part.scale.set(1, 1, 1);
        }
      });
    }
  }, [isSimulating, explodeProgress]);

  // 2. ⚡ Acoplar Todo Animated (Vanilla JS in render loop: 500 ms Cubic Ease-Out)
  useEffect(() => {
    if (!snapAllTrigger) return;

    // Desactivar cualquier simulación en curso
    if (isSimulatingRef.current) {
      isSimulatingRef.current = false;
      onSetSimulatingRef.current?.(false);
    }

    // Cancelar arrastre o gizmo activo
    if (directDragStateRef.current) {
      directDragStateRef.current = null;
    }

    const parts = activePartsRef.current.length > 0
      ? activePartsRef.current
      : Array.from(partMeshesRef.current.values());

    const animParts = parts
      .filter((g) => g.userData.homePos)
      .map((g) => ({
        group: g,
        partId: g.userData.partId || g.name,
        startPos: g.position.clone(),
        targetPos: g.userData.homePos.clone(),
        startRot: g.rotation.clone(),
        targetRot: g.userData.homeRot ? g.userData.homeRot.clone() : new THREE.Euler(0, 0, 0),
        flashed: false,
      }));

    if (animParts.length === 0) return;

    sound.playWhoosh(false);

    snapAllAnimRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 500, // Exact 500 ms desaceleración cúbica
      initialSliderVal: explodeProgressRef.current,
      parts: animParts,
    };
  }, [snapAllTrigger]);

  // 3. Reiniciar Vista Tween (~450ms smooth camera & target reset)
  useEffect(() => {
    if (!resetViewTrigger || !cameraRef.current || !orbitControlsRef.current) return;

    cameraTweenRef.current = {
      startPos: cameraRef.current.position.clone(),
      targetPos: new THREE.Vector3(5.5, 4.0, 7.5),
      startTarget: orbitControlsRef.current.target.clone(),
      targetTarget: new THREE.Vector3(0, 0, 0),
      startTime: performance.now(),
      duration: 450,
    };
  }, [resetViewTrigger]);

  // Handle Render Modes (PBR, Hologram, Wireframe, X-Ray)
  useEffect(() => {
    partMeshesRef.current.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh && !child.userData.isCadEdge) {
          if (renderMode === 'wireframe') {
            child.material = blueprintMatRef.current!;
          } else if (renderMode === 'hologram') {
            child.material = hologramMatRef.current!;
          } else if (renderMode === 'xray') {
            child.material = xrayMatRef.current!;
          } else {
            const originalMat = materialsMapRef.current.get(child.material.name) ||
              materialsMapRef.current.get('steel_polished');
            if (originalMat) {
              child.material = originalMat;
            }
          }
        }
      });
    });
  }, [renderMode]);

  // Handle Transform Controls attachment
  useEffect(() => {
    if (!transformControlsRef.current) return;

    if (!selectedPartId || !showGizmo || toolMode === 'orbit') {
      transformControlsRef.current.detach();
      return;
    }

    const meshGroup = partMeshesRef.current.get(selectedPartId);
    if (meshGroup) {
      transformControlsRef.current.attach(meshGroup);
      transformControlsRef.current.setMode(toolMode === 'rotate' ? 'rotate' : 'translate');
    } else {
      transformControlsRef.current.detach();
    }
  }, [selectedPartId, showGizmo, toolMode]);

  // Selection & Tutorial Highlights
  useEffect(() => {
    partMeshesRef.current.forEach((group, partId) => {
      const isSelected = partId === selectedPartId;
      const isTutorialTarget = partId === tutorialTargetPartId;

      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (isSelected) {
            child.material.emissive = new THREE.Color(0x0284c7);
            child.material.emissiveIntensity = 0.45;
          } else if (isTutorialTarget) {
            child.material.emissive = new THREE.Color(0xf59e0b);
            child.material.emissiveIntensity = 0.55;
          } else {
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0.0;
          }
        }
      });
    });
  }, [selectedPartId, tutorialTargetPartId]);

  // Part Visibility
  useEffect(() => {
    partStates.forEach((state, partId) => {
      const group = partMeshesRef.current.get(partId);
      if (group) {
        group.visible = state.isVisible;
      }
    });
  }, [partStates]);

  // Conflict-Free Pointer Interaction: Native OrbitControls vs Manual Piece Dragging (>120ms Hold)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDraggingGizmoRef.current) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !cameraRef.current || !sceneRef.current) return;

      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

      const interactableMeshes: THREE.Object3D[] = [];
      partMeshesRef.current.forEach((group) => {
        if (group.visible) {
          group.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.userData.isCadEdge) {
              interactableMeshes.push(child);
            }
          });
        }
      });

      const intersects = raycaster.intersectObjects(interactableMeshes, false);

      // Limpiar temporizador previo
      if (touchHoldTimerRef.current) {
        window.clearTimeout(touchHoldTimerRef.current);
        touchHoldTimerRef.current = null;
      }

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const partId = hitMesh.userData.partId;
        if (partId) {
          const group = partMeshesRef.current.get(partId);
          if (group && cameraRef.current) {
            // Plano de arrastre 3D perpendicular a la vista de cámara
            const camDir = new THREE.Vector3();
            cameraRef.current.getWorldDirection(camDir);
            const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
              camDir.negate(),
              group.position
            );

            const intersectionPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(dragPlane, intersectionPoint);
            const offset = group.position.clone().sub(intersectionPoint);

            // Si es toque en pantalla táctil (móvil): NO bloquear OrbitControls para permitir rotar con 1 dedo
            if (e.pointerType === 'touch') {
              if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = true;
              }

              pendingTouchRef.current = {
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                startTime: performance.now(),
                partId,
                dragPlane,
                offset,
              };

              // Temporizador estricto de 120ms: Solo si se mantiene quieto sobre la pieza se activa el arrastre
              touchHoldTimerRef.current = window.setTimeout(() => {
                if (pendingTouchRef.current && pendingTouchRef.current.pointerId === e.pointerId) {
                  if (orbitControlsRef.current) {
                    orbitControlsRef.current.enabled = false;
                  }

                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    try { navigator.vibrate(20); } catch {}
                  }

                  sound.playSelect();
                  onSelectPart(partId);

                  const animIdx = activeAnimationsRef.current.findIndex((a) => a.object === group || a.partId === partId);
                  if (animIdx !== -1) {
                    activeAnimationsRef.current.splice(animIdx, 1);
                  }

                  if (isSimulatingRef.current) {
                    isSimulatingRef.current = false;
                    onSetSimulatingRef.current?.(false);
                  }

                  directDragStateRef.current = {
                    isDragging: true,
                    partId,
                    plane: dragPlane,
                    offset,
                    pointerId: e.pointerId,
                  };

                  isManualTransformedRef.current.set(partId, true);
                  sound.startGrabDrone();
                  pendingTouchRef.current = null;
                }
              }, 120);
            } else {
              // Ratón (escritorio): selección y manipulación directa
              sound.playSelect();
              onSelectPart(partId);

              const animIdx = activeAnimationsRef.current.findIndex((a) => a.object === group || a.partId === partId);
              if (animIdx !== -1) {
                activeAnimationsRef.current.splice(animIdx, 1);
              }

              if (isSimulatingRef.current) {
                isSimulatingRef.current = false;
                onSetSimulatingRef.current?.(false);
              }

              if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = false;
              }

              try {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              } catch {}

              directDragStateRef.current = {
                isDragging: true,
                partId,
                plane: dragPlane,
                offset,
                pointerId: e.pointerId,
              };

              isManualTransformedRef.current.set(partId, true);
              sound.startGrabDrone();
            }
          }
        }
      } else {
        // Fondo vacío: mantener rotación y deseleccionar
        pendingTouchRef.current = null;
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
        }
        if (selectedPartIdRef.current) {
          sound.playClick(600);
          onSelectPart(null);
        }
      }
    },
    [onSelectPart]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // 1. Arrastre de pieza activo
      const drag = directDragStateRef.current;
      if (drag && drag.isDragging) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || !cameraRef.current) return;

        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

        const intersectionPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(drag.plane, intersectionPoint)) {
          const group = partMeshesRef.current.get(drag.partId);
          const partDef = modelDef.createParts().parts.find((p) => p.id === drag.partId);
          if (group && partDef) {
            const prevPos = group.position.clone();
            const newPos = intersectionPoint.add(drag.offset);
            group.position.copy(newPos);

            const speed = prevPos.distanceTo(newPos) * 60;
            sound.updateGrabDrone(speed);

            if (physicsWorldRef.current) {
              physicsWorldRef.current.syncBodyFromMesh(drag.partId, group);
            }

            const defaultPos = new THREE.Vector3(...partDef.defaultPosition);
            const dist = group.position.distanceTo(defaultPos);
            const snapRadius = Math.max(partDef.snapTolerance || 1.2, 1.2);
            if (dist < snapRadius) {
              const ratio = Math.max(0, 1 - dist / snapRadius);
              sound.playSnapProximity(ratio);
            }
          }
        }
        return;
      }

      // 2. Si hay toque pendiente: cancelar si el dedo se desplazó más de 8px (el usuario está rotando la vista)
      if (pendingTouchRef.current && pendingTouchRef.current.pointerId === e.pointerId) {
        const dist = Math.hypot(
          e.clientX - pendingTouchRef.current.startX,
          e.clientY - pendingTouchRef.current.startY
        );
        if (dist > 8) {
          if (touchHoldTimerRef.current) {
            window.clearTimeout(touchHoldTimerRef.current);
            touchHoldTimerRef.current = null;
          }
          pendingTouchRef.current = null;
          if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = true;
          }
        }
      }
    },
    [modelDef]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // 1. Limpiar temporizador de 120ms
      if (touchHoldTimerRef.current) {
        window.clearTimeout(touchHoldTimerRef.current);
        touchHoldTimerRef.current = null;
      }

      // 2. Si se soltó antes de 120ms sin moverse: toque rápido para seleccionar la pieza
      if (pendingTouchRef.current && pendingTouchRef.current.pointerId === e.pointerId) {
        const partId = pendingTouchRef.current.partId;
        sound.playSelect();
        onSelectPart(partId);
        pendingTouchRef.current = null;
      }

      const drag = directDragStateRef.current;

      try {
        if (containerRef.current?.hasPointerCapture(e.pointerId)) {
          containerRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {}

      // Restaurar OrbitControls incondicionalmente
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
      }

      sound.stopGrabDrone();

      if (drag && drag.isDragging) {
        const partId = drag.partId;
        const group = partMeshesRef.current.get(partId);
        const partDef = modelDef.createParts().parts.find((p) => p.id === partId);

        directDragStateRef.current = null;

        if (group && partDef) {
          const targetPos = new THREE.Vector3(...partDef.defaultPosition);
          const currentPos = group.position;
          const dist = currentPos.distanceTo(targetPos);
          const snapRadius = Math.max(partDef.snapTolerance || 1.2, 1.2);

          // Criterio estricto: Solo auto-acopla si la distancia es MENOR o IGUAL al radio de snap
          if (dist <= snapRadius) {
            const targetRot = new THREE.Euler(...partDef.defaultRotation);

            startAnimation(
              group,
              targetPos,
              380,
              () => {
                group.position.copy(targetPos);
                group.rotation.set(...partDef.defaultRotation);
                isManualTransformedRef.current.set(partId, false);
                physicsWorldRef.current?.lockToKinematic(partId, partDef.defaultPosition, partDef.defaultRotation);

                sound.playLockSound();
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  try { navigator.vibrate(15); } catch {}
                }
                onSnapPart(partId);

                if (snapFlashMeshRef.current) {
                  snapFlashMeshRef.current.position.copy(targetPos);
                  snapFlashMeshRef.current.visible = true;
                  snapPulseTimeRef.current = 1.0;
                }
              },
              targetRot,
              partId
            );
          } else {
            // Si la distancia es MAYOR: la pieza se queda EXACTAMENTE en sus coordenadas actuales
            isManualTransformedRef.current.set(partId, true);
            if (physicsEnabledRef.current && physicsWorldRef.current) {
              physicsWorldRef.current.releaseToPhysics(partId, group);
            }
          }
        }
      }
    },
    [modelDef, onSelectPart, onSnapPart, startAnimation]
  );

  // Camera Presets
  useEffect(() => {
    if (!cameraPresetTrigger || !cameraRef.current || !orbitControlsRef.current) return;

    const camera = cameraRef.current;
    const controls = orbitControlsRef.current;

    switch (cameraPresetTrigger) {
      case 'iso':
        camera.position.set(5.5, 4.0, 7.5);
        controls.target.set(0, 0, 0);
        break;
      case 'front':
        camera.position.set(0, 0, 9.5);
        controls.target.set(0, 0, 0);
        break;
      case 'side':
        camera.position.set(9.5, 0, 0);
        controls.target.set(0, 0, 0);
        break;
      case 'top':
        camera.position.set(0, 10.0, 0.01);
        controls.target.set(0, 0, 0);
        break;
      case 'reset':
      default:
        camera.position.set(5.5, 4.0, 7.5);
        controls.target.set(0, 0, 0);
        break;
    }
    controls.update();
  }, [cameraPresetTrigger]);

  const isLight = themeMode === 'light';

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
      className="relative w-full h-full cursor-grab active:cursor-grabbing outline-none overflow-hidden select-none touch-none touch-none-viewport"
    >
      {/* 3D Floating Interactive Technical Labels */}
      {showLabels &&
        screenTags.map((tag) => (
          <div
            key={tag.id}
            onClick={(e) => {
              e.stopPropagation();
              sound.playSelect();
              onSelectPart(tag.id);
            }}
            style={{
              left: `${tag.x}px`,
              top: `${tag.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
            className={`absolute pointer-events-auto cursor-pointer transition-all duration-75 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1.5 shadow-md border whitespace-nowrap ${
              selectedPartId === tag.id
                ? 'bg-cyan-950/95 border-cyan-400 text-cyan-200 scale-105 z-30 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : isLight
                ? 'bg-white/95 border-slate-300 text-slate-800 hover:border-blue-600'
                : 'bg-slate-950/85 border-slate-700 text-slate-300 hover:border-cyan-500'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                tag.isSnapped ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="font-semibold truncate max-w-[140px]">{tag.name}</span>
          </div>
        ))}

      {/* CAD Corner Crosshairs & Status */}
      <div
        className={`absolute top-4 left-4 pointer-events-none font-mono text-[10px] tracking-widest flex items-center gap-2 ${
          isLight ? 'text-slate-500' : 'text-cyan-500/50'
        }`}
      >
        <span className={`w-2.5 h-2.5 border-t-2 border-l-2 ${isLight ? 'border-blue-700' : 'border-cyan-400'}`}></span>
        <span>CAD // SHADING: {renderMode.toUpperCase()}</span>
      </div>

      <div
        className={`absolute top-4 right-4 pointer-events-none font-mono text-[10px] tracking-widest flex items-center gap-2 ${
          isLight ? 'text-slate-500' : 'text-cyan-500/50'
        }`}
      >
        <span>EDGES: 25° CAD // LIGHTING: HEMI_CALIBRATED</span>
        <span className={`w-2.5 h-2.5 border-t-2 border-r-2 ${isLight ? 'border-blue-700' : 'border-cyan-400'}`}></span>
      </div>
    </div>
  );
};
