import * as THREE from 'three';

export interface StarkPartDefinition {
  id: string;
  name: string;
  technicalCode: string;
  category: string;
  materialName: string;
  materialSpecs: string;
  homePosition: [number, number, number];
  homeRotation: [number, number, number];
  explodeVector: [number, number, number];
  explodeDistance: number;
  snapTolerance: number;
  orbitRestPosition: [number, number, number]; // Position when in reset orbital tray
}

export const STARK_BRAKE_PARTS: StarkPartDefinition[] = [
  {
    id: 'rotor',
    name: 'Rotor de Freno Ventilado',
    technicalCode: 'BREMBO-CC-R355-V',
    category: 'Rotor Térmico Bi-Metálico',
    materialName: 'Fundición Gris GG25 Perlítica Pulida',
    materialSpecs: 'Pistas dobles Ø355x32mm, 32 aletas internas de refrigeración radial curvadas, micro-perforaciones transversales disipadoras.',
    homePosition: [0, 0, 0],
    homeRotation: [0, 0, 0],
    explodeVector: [0, 0, 0],
    explodeDistance: 0,
    snapTolerance: 1.1,
    orbitRestPosition: [0, 0, -2.5],
  },
  {
    id: 'hub',
    name: 'Maza / Buje Central con Birlos',
    technicalCode: 'HUB-5L-42CRMO4',
    category: 'Maza Porta-Rodamientos',
    materialName: 'Acero Aleado Forjado 42CrMo4',
    materialSpecs: '5 birlos M12x1.5 templados clase 10.9, campana de centrado de llanta de aleación ligera y labio de sello antipolvo.',
    homePosition: [0, 0, 0.42],
    homeRotation: [0, 0, 0],
    explodeVector: [0, 0, 1],
    explodeDistance: 3.2,
    snapTolerance: 1.1,
    orbitRestPosition: [3.2, 0, 1.2],
  },
  {
    id: 'bracket',
    name: 'Soporte de Pinza (Caliper Bracket)',
    technicalCode: 'BRK-TRQ-GGG60',
    category: 'Estructura de Reacción de Par',
    materialName: 'Fundición Nodular GGG-60',
    materialSpecs: 'Puente rígido de anclaje a mangueta con pasadores guía de acero inoxidable templado y fuelles antipolvo de caucho EPDM.',
    homePosition: [0, 1.85, -0.62],
    homeRotation: [0, 0, 0],
    explodeVector: [0, 0.35, -1],
    explodeDistance: 2.8,
    snapTolerance: 1.1,
    orbitRestPosition: [-3.2, 0, 1.2],
  },
  {
    id: 'pads',
    name: 'Juego de Balatas / Pastillas Cerámicas',
    technicalCode: 'PAD-CC-DUAL-750',
    category: 'Fricción de Alto Coeficiente',
    materialName: 'Compuesto Carbono-Cerámico Sinterizado',
    materialSpecs: 'Par de pastillas (interior y exterior) con forro sinterizado térmico hasta 750°C, placas de respaldo de acero con láminas antiruido.',
    homePosition: [0, 2.05, 0],
    homeRotation: [0, 0, 0],
    explodeVector: [0, 0.85, 0],
    explodeDistance: 2.5,
    snapTolerance: 1.0,
    orbitRestPosition: [-2.2, 0, 3.0],
  },
  {
    id: 'caliper',
    name: 'Pinza Monobloque de 4 Pistones',
    technicalCode: 'CAL-M4-7075-RACING',
    category: 'Actuador Hidráulico Monobloque',
    materialName: 'Aluminio Aeroespacial 7075-T6 Anodizado',
    materialSpecs: 'Cuerpo monobloque en rojo competición (#c01515), 4 pistones hidráulicos contrapuestos Ø38/Ø44mm, purgador y puente de rigidez estructural.',
    homePosition: [0, 2.15, 0],
    homeRotation: [0, 0, 0],
    explodeVector: [0, 1, 0],
    explodeDistance: 3.6,
    snapTolerance: 1.2,
    orbitRestPosition: [2.2, 0, 3.0],
  },
];

// Build High-Fidelity Procedural Three.js Meshes
export function buildStarkBrakeMeshes(): Map<string, THREE.Group> {
  const partsMap = new Map<string, THREE.Group>();

  // Realistic PBR Metallic Materials
  const rotorSteelMat = new THREE.MeshStandardMaterial({
    color: 0xc8d0db,
    metalness: 0.92,
    roughness: 0.18,
    envMapIntensity: 1.4,
  });

  const rotorHatMat = new THREE.MeshStandardMaterial({
    color: 0x22272e,
    metalness: 0.82,
    roughness: 0.32,
    envMapIntensity: 1.0,
  });

  const chromeStudMat = new THREE.MeshStandardMaterial({
    color: 0xeef2f7,
    metalness: 0.96,
    roughness: 0.12,
    envMapIntensity: 1.6,
  });

  const hubSteelMat = new THREE.MeshStandardMaterial({
    color: 0x8a94a6,
    metalness: 0.88,
    roughness: 0.26,
    envMapIntensity: 1.1,
  });

  const bracketIronMat = new THREE.MeshStandardMaterial({
    color: 0x3d4450,
    metalness: 0.78,
    roughness: 0.42,
    envMapIntensity: 0.9,
  });

  const caliperRedMat = new THREE.MeshStandardMaterial({
    color: 0xc01515, // Competition Red
    metalness: 0.68,
    roughness: 0.24,
    envMapIntensity: 1.3,
  });

  const pistonSteelMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.98,
    roughness: 0.1,
    envMapIntensity: 1.5,
  });

  const padFrictionMat = new THREE.MeshStandardMaterial({
    color: 0x1f2226,
    metalness: 0.25,
    roughness: 0.85,
  });

  const padPlateMat = new THREE.MeshStandardMaterial({
    color: 0x565e6d,
    metalness: 0.85,
    roughness: 0.3,
  });

  const darkAccentMat = new THREE.MeshStandardMaterial({
    color: 0x12151a,
    metalness: 0.6,
    roughness: 0.5,
  });

  const dummy = new THREE.Object3D();

  // 1. ROTOR DE FRENO VENTILADO
  const rotorGroup = new THREE.Group();
  rotorGroup.name = 'rotor';

  // Front Friction Disc
  const frontDiscGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.12, 48);
  frontDiscGeo.rotateX(Math.PI / 2);
  frontDiscGeo.translate(0, 0, 0.18);
  const frontDisc = new THREE.Mesh(frontDiscGeo, rotorSteelMat);
  frontDisc.castShadow = true;
  frontDisc.receiveShadow = true;
  rotorGroup.add(frontDisc);

  // Rear Friction Disc
  const rearDiscGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.12, 48);
  rearDiscGeo.rotateX(Math.PI / 2);
  rearDiscGeo.translate(0, 0, -0.18);
  const rearDisc = new THREE.Mesh(rearDiscGeo, rotorSteelMat);
  rearDisc.castShadow = true;
  rearDisc.receiveShadow = true;
  rotorGroup.add(rearDisc);

  // 32 Internal Curved Ventilation Vanes (Turbine air extraction)
  const vaneGeo = new THREE.BoxGeometry(0.72, 0.05, 0.24);
  const vanesInstanced = new THREE.InstancedMesh(vaneGeo, rotorSteelMat, 32);
  for (let v = 0; v < 32; v++) {
    const angle = (v / 32) * Math.PI * 2;
    const rad = 2.05;
    dummy.position.set(Math.cos(angle) * rad, Math.sin(angle) * rad, 0);
    dummy.rotation.set(0, 0, angle + 0.38);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    vanesInstanced.setMatrixAt(v, dummy.matrix);
  }
  vanesInstanced.instanceMatrix.needsUpdate = true;
  rotorGroup.add(vanesInstanced);

  // 24 Cross-Drilled Holes on rotor face
  const holeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.52, 10);
  holeGeo.rotateX(Math.PI / 2);
  const holesInstanced = new THREE.InstancedMesh(holeGeo, darkAccentMat, 24);
  for (let h = 0; h < 24; h++) {
    const angle = (h / 24) * Math.PI * 2;
    const rad = 1.95 + (h % 3) * 0.28;
    dummy.position.set(Math.cos(angle) * rad, Math.sin(angle) * rad, 0);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    holesInstanced.setMatrixAt(h, dummy.matrix);
  }
  holesInstanced.instanceMatrix.needsUpdate = true;
  rotorGroup.add(holesInstanced);

  // Central Aluminum Rotor Hat Bell
  const hatBellGeo = new THREE.CylinderGeometry(1.42, 1.42, 0.45, 36);
  hatBellGeo.rotateX(Math.PI / 2);
  hatBellGeo.translate(0, 0, 0.24);
  const hatBell = new THREE.Mesh(hatBellGeo, rotorHatMat);
  hatBell.castShadow = true;
  rotorGroup.add(hatBell);

  const centerHoleGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.5, 28);
  centerHoleGeo.rotateX(Math.PI / 2);
  centerHoleGeo.translate(0, 0, 0.24);
  const centerHole = new THREE.Mesh(centerHoleGeo, darkAccentMat);
  rotorGroup.add(centerHole);

  partsMap.set('rotor', rotorGroup);

  // 2. MAZA / BUJE CENTRAL CON 5 BIRLOS
  const hubGroup = new THREE.Group();
  hubGroup.name = 'hub';
  hubGroup.position.set(0, 0, 0.42);

  // Spindle Nose
  const hubNoseGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.68, 32);
  hubNoseGeo.rotateX(Math.PI / 2);
  const hubNose = new THREE.Mesh(hubNoseGeo, hubSteelMat);
  hubNose.castShadow = true;
  hubGroup.add(hubNose);

  // Flange Face
  const hubFlangeGeo = new THREE.CylinderGeometry(1.38, 1.38, 0.16, 36);
  hubFlangeGeo.rotateX(Math.PI / 2);
  hubFlangeGeo.translate(0, 0, -0.2);
  const hubFlange = new THREE.Mesh(hubFlangeGeo, hubSteelMat);
  hubFlange.castShadow = true;
  hubGroup.add(hubFlange);

  // Dust Grease Cap
  const greaseCapGeo = new THREE.SphereGeometry(0.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  greaseCapGeo.rotateX(Math.PI / 2);
  greaseCapGeo.translate(0, 0, 0.34);
  const greaseCap = new THREE.Mesh(greaseCapGeo, chromeStudMat);
  hubGroup.add(greaseCap);

  // 5 Threaded Studs & Hex Lug Nuts (Instanced)
  const studGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.72, 14);
  studGeo.rotateX(Math.PI / 2);
  const studsInstanced = new THREE.InstancedMesh(studGeo, chromeStudMat, 5);

  const nutGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.34, 6); // 6-sided hex nut
  nutGeo.rotateX(Math.PI / 2);
  const nutsInstanced = new THREE.InstancedMesh(nutGeo, chromeStudMat, 5);
  nutsInstanced.castShadow = true;

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const rad = 0.96;
    const x = Math.cos(angle) * rad;
    const y = Math.sin(angle) * rad;

    dummy.position.set(x, y, -0.15);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    studsInstanced.setMatrixAt(i, dummy.matrix);

    dummy.position.set(x, y, 0.16);
    dummy.updateMatrix();
    nutsInstanced.setMatrixAt(i, dummy.matrix);
  }
  studsInstanced.instanceMatrix.needsUpdate = true;
  nutsInstanced.instanceMatrix.needsUpdate = true;
  hubGroup.add(studsInstanced);
  hubGroup.add(nutsInstanced);

  partsMap.set('hub', hubGroup);

  // 3. SOPORTE DE PINZA (CALIPER BRACKET)
  const bracketGroup = new THREE.Group();
  bracketGroup.name = 'bracket';
  bracketGroup.position.set(0, 1.85, -0.62);

  // Main Torque Carrier Arch
  const bracketArchGeo = new THREE.BoxGeometry(2.5, 0.55, 0.35);
  bracketArchGeo.translate(0, 0.2, 0);
  const bracketArch = new THREE.Mesh(bracketArchGeo, bracketIronMat);
  bracketArch.castShadow = true;
  bracketGroup.add(bracketArch);

  // Slide guide arms
  [-1.05, 1.05].forEach((xSide) => {
    const armGeo = new THREE.BoxGeometry(0.35, 0.8, 0.45);
    armGeo.translate(xSide, -0.1, 0.15);
    const arm = new THREE.Mesh(armGeo, bracketIronMat);
    bracketGroup.add(arm);

    // Slide Pins with EPDM rubber boots
    const pinGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.55, 14);
    pinGeo.rotateX(Math.PI / 2);
    pinGeo.translate(xSide, -0.15, 0.42);
    const pin = new THREE.Mesh(pinGeo, chromeStudMat);
    bracketGroup.add(pin);

    // Boot ribs
    const bootGeo = new THREE.TorusGeometry(0.12, 0.035, 10, 20);
    const boot = new THREE.Mesh(bootGeo, darkAccentMat);
    boot.position.set(xSide, -0.15, 0.32);
    bracketGroup.add(boot);

    // Upright mount bolt holes
    const boltHoleGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 12);
    const boltHole = new THREE.Mesh(boltHoleGeo, darkAccentMat);
    boltHole.position.set(xSide * 0.75, 0.4, 0);
    bracketGroup.add(boltHole);
  });

  partsMap.set('bracket', bracketGroup);

  // 4. JUEGO DE BALATAS / PASTILLAS (INTERIOR Y EXTERIOR)
  const padsGroup = new THREE.Group();
  padsGroup.name = 'pads';
  padsGroup.position.set(0, 2.05, 0);

  // Helper to build single brake pad
  const buildPad = (zPos: number, isInner: boolean) => {
    const padSubGroup = new THREE.Group();

    // Steel Backing Plate
    const plateGeo = new THREE.BoxGeometry(1.65, 0.68, 0.08);
    const plate = new THREE.Mesh(plateGeo, padPlateMat);
    plate.castShadow = true;
    padSubGroup.add(plate);

    // Friction Compound Block
    const frictionGeo = new THREE.BoxGeometry(1.48, 0.58, 0.13);
    frictionGeo.translate(0, 0, isInner ? 0.1 : -0.1);
    const friction = new THREE.Mesh(frictionGeo, padFrictionMat);
    friction.castShadow = true;
    padSubGroup.add(friction);

    // Anti-squeal damping shim
    const shimGeo = new THREE.BoxGeometry(1.5, 0.6, 0.02);
    shimGeo.translate(0, 0, isInner ? -0.05 : 0.05);
    const shim = new THREE.Mesh(shimGeo, darkAccentMat);
    padSubGroup.add(shim);

    // Retention Ears
    [-0.88, 0.88].forEach((xEar) => {
      const earGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.22, 10);
      earGeo.rotateZ(Math.PI / 2);
      earGeo.translate(xEar, 0.22, 0);
      const ear = new THREE.Mesh(earGeo, chromeStudMat);
      padSubGroup.add(ear);
    });

    padSubGroup.position.z = zPos;
    return padSubGroup;
  };

  padsGroup.add(buildPad(-0.38, true));  // Inner pad
  padsGroup.add(buildPad(0.38, false)); // Outer pad

  partsMap.set('pads', padsGroup);

  // 5. PINZA DE FRENO (CALIPER MONOBLOQUE EN U)
  const caliperGroup = new THREE.Group();
  caliperGroup.name = 'caliper';
  caliperGroup.position.set(0, 2.15, 0);

  // Upper Structural Bridge Arch
  const bridgeGeo = new THREE.BoxGeometry(2.45, 0.78, 1.34);
  bridgeGeo.translate(0, 0.38, 0);
  const bridgeMesh = new THREE.Mesh(bridgeGeo, caliperRedMat);
  bridgeMesh.castShadow = true;
  caliperGroup.add(bridgeMesh);

  // Front and Rear Clamping Banks
  [-0.56, 0.56].forEach((zSide) => {
    const bankGeo = new THREE.BoxGeometry(2.35, 0.95, 0.42);
    bankGeo.translate(0, -0.2, zSide);
    const bank = new THREE.Mesh(bankGeo, caliperRedMat);
    bank.castShadow = true;
    caliperGroup.add(bank);

    // Dual Opposed Hydraulic Pistons (2 front, 2 rear = 4 pistons)
    [-0.62, 0.62].forEach((xPiston) => {
      const pistonGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 24);
      pistonGeo.rotateX(Math.PI / 2);
      const piston = new THREE.Mesh(pistonGeo, pistonSteelMat);
      piston.position.set(xPiston, -0.2, zSide * 0.62);
      caliperGroup.add(piston);

      // Rubber dust seal ring
      const sealGeo = new THREE.TorusGeometry(0.35, 0.03, 10, 24);
      const seal = new THREE.Mesh(sealGeo, darkAccentMat);
      seal.position.set(xPiston, -0.2, zSide * 0.72);
      caliperGroup.add(seal);
    });
  });

  // Fluid Bleeder Nipple
  const bleederGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.36, 12);
  bleederGeo.translate(0.85, 0.88, 0.22);
  const bleeder = new THREE.Mesh(bleederGeo, chromeStudMat);
  caliperGroup.add(bleeder);

  // Central Stiffening Cross-Bridge Bar
  const crossBarGeo = new THREE.BoxGeometry(0.35, 0.3, 1.25);
  crossBarGeo.translate(0, -0.15, 0);
  const crossBar = new THREE.Mesh(crossBarGeo, darkAccentMat);
  caliperGroup.add(crossBar);

  partsMap.set('caliper', caliperGroup);

  // Tag all children meshes with their parent part ID
  partsMap.forEach((group, partId) => {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.InstancedMesh) {
        child.userData.partId = partId;
      }
    });
  });

  return partsMap;
}
