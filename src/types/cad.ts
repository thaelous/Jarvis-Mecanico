import * as THREE from 'three';

export interface PhysicsDef {
  shapeType: 'box' | 'cylinder' | 'sphere';
  size: [number, number, number];
  mass: number;
}

export interface TutorialStep {
  stepNumber: number;
  partId: string;
  action: 'assemble' | 'disassemble';
  title: string;
  instruction: string;
  tip: string;
  targetVectorName: string;
}

export interface MechanicalPartConfig {
  id: string;
  name: string;
  technicalName: string;
  category: string;
  materialName: string;
  materialDescription: string;
  defaultPosition: [number, number, number];
  defaultRotation: [number, number, number];
  explodeVector: [number, number, number];
  explodeDistance: number;
  snapTolerance: number; // distance in world units within which snap activates
  color: number;
  metalness: number;
  roughness: number;
  physics?: PhysicsDef;
}

export interface PartRuntimeState {
  id: string;
  isSnapped: boolean;
  isVisible: boolean;
  currentPosition: THREE.Vector3;
  currentRotation: THREE.Euler;
  distanceToTarget: number;
  meshGroup?: THREE.Group;
  ghostMesh?: THREE.Group;
  guideLine?: THREE.Line;
}

export type RenderMode = 'pbr' | 'hologram' | 'wireframe' | 'xray';
export type TransformToolMode = 'orbit' | 'translate' | 'rotate';
export type ThemeMode = 'dark' | 'light';

export interface MechanicalModelDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  specs: {
    weightKg: string;
    material: string;
    torqueOrPower: string;
    tolerance: string;
  };
  assemblySteps: TutorialStep[];
  disassemblySteps: TutorialStep[];
  createParts: () => {
    parts: MechanicalPartConfig[];
    buildMeshes: (materialsMap: Map<string, THREE.Material>, lodDistance?: number) => Map<string, THREE.Group>;
  };
}

