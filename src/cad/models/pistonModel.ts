import * as THREE from 'three';
import { MechanicalModelDefinition, MechanicalPartConfig, TutorialStep } from '../../types/cad';

const assemblySteps: TutorialStep[] = [
  {
    stepNumber: 1,
    partId: 'connecting_rod',
    action: 'assemble',
    title: 'Posicionamiento del Cuerpo de Biela (H-Beam)',
    instruction: 'Coloca el cuerpo de la biela forjada en el centro vertical de trabajo.',
    tip: 'La viga en sección H optimiza la resistencia mecánica frente a tensiones de compresión extrema.',
    targetVectorName: 'Origen [0, 0.4, 0]',
  },
  {
    stepNumber: 2,
    partId: 'rod_bearings',
    action: 'assemble',
    title: 'Montaje de Cojinetes Semilunares',
    instruction: 'Desliza los casquillos trimetálicos ranurados dentro de la cabeza grande de la biela.',
    tip: 'Alinea la uña de retención y el orificio de engrase con el conducto de aceite a presión.',
    targetVectorName: 'Eje X (Hacia la biela)',
  },
  {
    stepNumber: 3,
    partId: 'piston_crown',
    action: 'assemble',
    title: 'Alineación de la Cabeza de Pistón',
    instruction: 'Haz descender el pistón forjado sobre el pie pequeño de la biela alineando sus orificios.',
    tip: 'Orienta las huellas de las válvulas de admisión hacia el lado correspondiente del colector.',
    targetVectorName: 'Eje Y (Descenso vertical)',
  },
  {
    stepNumber: 4,
    partId: 'wrist_pin',
    action: 'assemble',
    title: 'Inserción del Perno Pasador (Bulón)',
    instruction: 'Desliza el bulón cilíndrico a través de la falda del pistón y el buje de bronce de la biela.',
    tip: 'El diseño flotante con recubrimiento DLC minimiza la fricción rotacional del pie de biela.',
    targetVectorName: 'Eje Z (Inserción transversal)',
  },
  {
    stepNumber: 5,
    partId: 'piston_rings',
    action: 'assemble',
    title: 'Instalación del Paquete de Segmentos (x3)',
    instruction: 'Desciende los anillos elásticos encajándolos en las 3 ranuras perimetrales del pistón.',
    tip: 'Desfasa los extremos libres de los aros a 120° entre sí para evitar fuga de compresión (blow-by).',
    targetVectorName: 'Eje Y (Descenso vertical)',
  },
  {
    stepNumber: 6,
    partId: 'rod_cap',
    action: 'assemble',
    title: 'Acople de la Tapa Inferior (Sombrerete)',
    instruction: 'Eleva el sombrerete de biela desde abajo abrazando el muñón del cigüeñal.',
    tip: 'La unión por fractura asistida asegura un encaje microscópico perfecto e irrepetible.',
    targetVectorName: 'Eje Y (Ascenso vertical)',
  },
  {
    stepNumber: 7,
    partId: 'rod_bolts',
    action: 'assemble',
    title: 'Apriete de Tornillos ARP de Alta Resistencia',
    instruction: 'Inserta y aprieta los 2 tornillos forjados de sombrerete para fijar el conjunto.',
    tip: 'Mide la elongación del tornillo mediante micrómetro de varilla (0.13 - 0.15 mm de estiramiento).',
    targetVectorName: 'Eje Y (Ascenso vertical)',
  },
];

const disassemblySteps: TutorialStep[] = [
  {
    stepNumber: 1,
    partId: 'rod_bolts',
    action: 'disassemble',
    title: 'Retirada de Tornillos ARP',
    instruction: 'Afloja y retira verticalmente los dos pernos inferiores del sombrerete.',
    tip: 'Libera primero la tensión en ambos pernos de manera simétrica para evitar torsiones.',
    targetVectorName: 'Eje -Y',
  },
  {
    stepNumber: 2,
    partId: 'rod_cap',
    action: 'disassemble',
    title: 'Extracción del Sombrerete Inferior',
    instruction: 'Separa la tapa inferior de la biela desplazándola hacia abajo.',
    tip: 'Golpea suavemente con un mazo de bronce si el machihembrado fracturado está ceñido.',
    targetVectorName: 'Eje -Y',
  },
  {
    stepNumber: 3,
    partId: 'rod_bearings',
    action: 'disassemble',
    title: 'Extracción de Cojinetes Semilunares',
    instruction: 'Retira los dos semicasquillos trimetálicos deslizándolos lateralmente.',
    tip: 'Revisa la capa blanda antifricción en busca de arañazos causados por micropartículas de aceite.',
    targetVectorName: 'Eje +X',
  },
  {
    stepNumber: 4,
    partId: 'piston_rings',
    action: 'disassemble',
    title: 'Desmontaje de Segmentos / Anillos',
    instruction: 'Eleva el conjunto de segmentos separándolos de las ranuras del pistón.',
    tip: 'Usa unos alicates expansores de aros para no quebrar el hierro dúctil nitrurado.',
    targetVectorName: 'Eje +Y',
  },
  {
    stepNumber: 5,
    partId: 'wrist_pin',
    action: 'disassemble',
    title: 'Extracción del Bulón Flotante',
    instruction: 'Empuja el perno pasador hacia adelante a lo largo del eje Z.',
    tip: 'El bulón une cinemáticamente el pistón con el ojo pequeño de la biela.',
    targetVectorName: 'Eje +Z',
  },
  {
    stepNumber: 6,
    partId: 'piston_crown',
    action: 'disassemble',
    title: 'Separación de la Cabeza de Pistón',
    instruction: 'Eleva el pistón separándolo del cuerpo de la biela.',
    tip: 'Inspecciona la falda del pistón en busca de marcas de fricción o agarrotamiento térmico.',
    targetVectorName: 'Eje +Y',
  },
];

export const pistonModel: MechanicalModelDefinition = {
  id: 'piston_rod',
  name: 'Pistón y Biela (Motor de Combustión)',
  category: 'Motor Térmico & Cinemática',
  description: 'Conjunto de potencia de motor de carreras con pistón forjado aligerado, bulón flotante, biela en H de alta resistencia, cojinetes trimetálicos y tornillos ARP.',
  specs: {
    weightKg: '1.24 kg',
    material: 'Aluminio 2618-T6 / Acero 300M Forjado',
    torqueOrPower: '8,500 RPM / 240 CV por cilindro',
    tolerance: 'Juego de falda: 0.045 mm',
  },
  assemblySteps,
  disassemblySteps,
  createParts: () => {
    const parts: MechanicalPartConfig[] = [
      {
        id: 'piston_crown',
        name: 'Cabeza de Pistón Cilíndrica',
        technicalName: 'Forged Racing Piston Crown Ø85mm',
        category: 'Pistón',
        materialName: 'Aleación Al-Cu-Mg 2618 Forjada',
        materialDescription: 'Cuerpo de pistón de alta compresión con cavidades para válvulas, falda antifricción y alojamiento de bulón.',
        defaultPosition: [0, 2.8, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 1, 0],
        explodeDistance: 3.4,
        snapTolerance: 0.8,
        color: 0xced6e2,
        metalness: 0.85,
        roughness: 0.28,
        physics: {
          shapeType: 'cylinder',
          size: [1.4, 1.4, 1.6],
          mass: 0.42,
        },
      },
      {
        id: 'piston_rings',
        name: 'Juego de Segmentos / Anillos (x3)',
        technicalName: 'Piston Ring Pack (Compression & Oil)',
        category: 'Sellado',
        materialName: 'Hierro Dúctil Nitrurado & Cromo',
        materialDescription: 'Tres aros de estanqueidad elásticos: primer aro de fuego, segundo rascador y aro rasca-aceite de 3 piezas.',
        defaultPosition: [0, 3.4, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 1, 0],
        explodeDistance: 5.0,
        snapTolerance: 0.7,
        color: 0x475569,
        metalness: 0.9,
        roughness: 0.25,
        physics: {
          shapeType: 'cylinder',
          size: [1.45, 1.45, 0.4],
          mass: 0.08,
        },
      },
      {
        id: 'wrist_pin',
        name: 'Perno Pasador / Bulón del Pistón',
        technicalName: 'Full-Floating Hollow Wrist Pin',
        category: 'Articulación',
        materialName: 'Acero Cementado DLC (Diamond-Like Carbon)',
        materialDescription: 'Bulón tubular hueco de ultra-precisión para articular el ojo pequeño de la biela dentro del pistón.',
        defaultPosition: [0, 2.5, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0, 1],
        explodeDistance: 3.0,
        snapTolerance: 0.7,
        color: 0xf1f5f9,
        metalness: 0.98,
        roughness: 0.1,
        physics: {
          shapeType: 'cylinder',
          size: [0.38, 0.38, 2.4],
          mass: 0.16,
        },
      },
      {
        id: 'connecting_rod',
        name: 'Cuerpo de Biela Articulada (H-Beam)',
        technicalName: 'H-Beam Forged Connecting Rod',
        category: 'Biela',
        materialName: 'Acero Forjado al Vacío 300M',
        materialDescription: 'Viga estructural en perfil H para máxima rigidez a flexión con buje de bronce fósforo en cabeza pequeña.',
        defaultPosition: [0, 0.4, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0, 0],
        explodeDistance: 0,
        snapTolerance: 0.8,
        color: 0x5a6372,
        metalness: 0.88,
        roughness: 0.35,
        physics: {
          shapeType: 'box',
          size: [1.8, 3.2, 0.8],
          mass: 0.52,
        },
      },
      {
        id: 'rod_bearings',
        name: 'Cojinetes de Biela Semilunares (x2)',
        technicalName: 'Tri-Metal High Performance Shell Bearings',
        category: 'Cojinetes',
        materialName: 'Trimetálico (Cobre-Plomo-Indio)',
        materialDescription: 'Semicasquillos de antifricción ranurados con orificio de lubricación para el cuello del cigüeñal.',
        defaultPosition: [0, -1.0, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [1, 0, 0],
        explodeDistance: 2.2,
        snapTolerance: 0.6,
        color: 0xcd8032,
        metalness: 0.85,
        roughness: 0.28,
        physics: {
          shapeType: 'cylinder',
          size: [0.78, 0.78, 0.72],
          mass: 0.05,
        },
      },
      {
        id: 'rod_cap',
        name: 'Tapa Inferior de Biela (Sombrerete)',
        technicalName: 'Fracture-Split Connecting Rod Cap',
        category: 'Biela',
        materialName: 'Acero Forjado 300M Machihembrado',
        materialDescription: 'Semiluna inferior que cierra el ojo grande de biela alrededor del muñón de biela.',
        defaultPosition: [0, -1.6, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, -1, 0],
        explodeDistance: 2.8,
        snapTolerance: 0.8,
        color: 0x5a6372,
        metalness: 0.88,
        roughness: 0.35,
        physics: {
          shapeType: 'box',
          size: [1.8, 1.2, 0.8],
          mass: 0.28,
        },
      },
      {
        id: 'rod_bolts',
        name: 'Tornillos de Biela de Alta Resistencia (x2)',
        technicalName: 'ARP 2000 M9 Heavy Duty Cap Screws',
        category: 'Fijación',
        materialName: 'Aleación ARP Custom Age 625+',
        materialDescription: 'Par de pernos roscados de alta tensión con cabeza estriada de 12 puntas para fijación de sombrerete.',
        defaultPosition: [0, -2.4, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, -1, 0],
        explodeDistance: 4.5,
        snapTolerance: 0.8,
        color: 0x1f2328,
        metalness: 0.8,
        roughness: 0.4,
        physics: {
          shapeType: 'box',
          size: [1.8, 1.8, 0.4],
          mass: 0.12,
        },
      },
    ];

    const buildMeshes = (matMap: Map<string, THREE.Material>): Map<string, THREE.Group> => {
      const groups = new Map<string, THREE.Group>();

      const aluMat = matMap.get('aluminum_machined') || new THREE.MeshStandardMaterial({ color: 0xced6e2 });
      const steelMat = matMap.get('steel_polished') || new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const forgedMat = matMap.get('forged_steel') || new THREE.MeshStandardMaterial({ color: 0x5a6372 });
      const bronzeMat = matMap.get('bronze') || new THREE.MeshStandardMaterial({ color: 0xcd8032 });
      const blackMat = matMap.get('black_oxide') || new THREE.MeshStandardMaterial({ color: 0x1f2328 });
      const chromeMat = matMap.get('chrome_bearing') || new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });

      const dummy = new THREE.Object3D();

      // 1. PISTON CROWN (ALWAYS FULL DETAILED WITH 64 RADIAL SEGMENTS)
      const crownGroup = new THREE.Group();
      crownGroup.name = 'piston_crown';
      crownGroup.position.set(0, 2.8, 0);

      const crownBodyGeo = new THREE.CylinderGeometry(1.4, 1.4, 1.6, 64);
      const crownBody = new THREE.Mesh(crownBodyGeo, aluMat);
      crownBody.castShadow = true;
      crownGroup.add(crownBody);

      const domeGeo = new THREE.CylinderGeometry(1.36, 1.4, 0.15, 64);
      domeGeo.translate(0, 0.85, 0);
      const dome = new THREE.Mesh(domeGeo, aluMat);
      crownGroup.add(dome);

      [-0.45, 0.45].forEach((xVal) => {
        const valveCutGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 32);
        valveCutGeo.translate(xVal, 0.9, 0.2);
        const valveCut = new THREE.Mesh(valveCutGeo, forgedMat);
        crownGroup.add(valveCut);
      });

      [0.35, 0.5, 0.65].forEach((yPos) => {
        const grooveGeo = new THREE.CylinderGeometry(1.41, 1.41, 0.04, 64);
        grooveGeo.translate(0, yPos, 0);
        const grooveMesh = new THREE.Mesh(grooveGeo, blackMat);
        crownGroup.add(grooveMesh);
      });

      const pinHoleGeo = new THREE.CylinderGeometry(0.42, 0.42, 2.9, 64);
      pinHoleGeo.rotateX(Math.PI / 2);
      pinHoleGeo.translate(0, -0.3, 0);
      const pinHole = new THREE.Mesh(pinHoleGeo, blackMat);
      crownGroup.add(pinHole);

      groups.set('piston_crown', crownGroup);

      // 2. PISTON RINGS
      const ringsGroup = new THREE.Group();
      ringsGroup.name = 'piston_rings';
      ringsGroup.position.set(0, 3.4, 0);

      [0.0, 0.25, 0.5].forEach((yOff, idx) => {
        const ringGeo = new THREE.TorusGeometry(1.43, 0.035, 12, 64);
        ringGeo.rotateX(Math.PI / 2);
        ringGeo.translate(0, yOff, 0);
        const ringMesh = new THREE.Mesh(ringGeo, idx === 2 ? bronzeMat : blackMat);
        ringMesh.castShadow = true;
        ringsGroup.add(ringMesh);
      });

      groups.set('piston_rings', ringsGroup);

      // 3. WRIST PIN
      const pinGroup = new THREE.Group();
      pinGroup.name = 'wrist_pin';
      pinGroup.position.set(0, 2.5, 0);

      const pinGeo = new THREE.CylinderGeometry(0.38, 0.38, 2.4, 64);
      pinGeo.rotateX(Math.PI / 2);
      const pinMesh = new THREE.Mesh(pinGeo, chromeMat);
      pinMesh.castShadow = true;
      pinGroup.add(pinMesh);

      const hollowGeo = new THREE.CylinderGeometry(0.24, 0.24, 2.45, 32);
      hollowGeo.rotateX(Math.PI / 2);
      const hollowMesh = new THREE.Mesh(hollowGeo, blackMat);
      pinGroup.add(hollowMesh);

      [-1.15, 1.15].forEach((zPos) => {
        const circlipGeo = new THREE.TorusGeometry(0.39, 0.02, 12, 32);
        const circlip = new THREE.Mesh(circlipGeo, blackMat);
        circlip.position.z = zPos;
        pinGroup.add(circlip);
      });

      groups.set('wrist_pin', pinGroup);

      // 4. CONNECTING ROD BODY (H-BEAM ALWAYS FULL DETAIL)
      const rodGroup = new THREE.Group();
      rodGroup.name = 'connecting_rod';
      rodGroup.position.set(0, 0.4, 0);

      const smallEndGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.7, 64);
      smallEndGeo.rotateX(Math.PI / 2);
      smallEndGeo.translate(0, 2.1, 0);
      const smallEnd = new THREE.Mesh(smallEndGeo, forgedMat);
      smallEnd.castShadow = true;
      rodGroup.add(smallEnd);

      const bronzeBushingGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.72, 64);
      bronzeBushingGeo.rotateX(Math.PI / 2);
      bronzeBushingGeo.translate(0, 2.1, 0);
      const bronzeBushing = new THREE.Mesh(bronzeBushingGeo, bronzeMat);
      rodGroup.add(bronzeBushing);

      const stemWebGeo = new THREE.BoxGeometry(0.2, 2.6, 0.5);
      stemWebGeo.translate(0, 0.3, 0);
      const stemWeb = new THREE.Mesh(stemWebGeo, forgedMat);
      stemWeb.castShadow = true;
      rodGroup.add(stemWeb);

      [-0.2, 0.2].forEach((xSide) => {
        const flangeGeo = new THREE.BoxGeometry(0.12, 2.5, 0.75);
        flangeGeo.translate(xSide, 0.3, 0);
        const flange = new THREE.Mesh(flangeGeo, forgedMat);
        flange.castShadow = true;
        rodGroup.add(flange);
      });

      const bigEndUpperGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 64, 1, false, 0, Math.PI);
      bigEndUpperGeo.rotateX(Math.PI / 2);
      bigEndUpperGeo.rotateZ(Math.PI / 2);
      bigEndUpperGeo.translate(0, -1.4, 0);
      const bigEndUpper = new THREE.Mesh(bigEndUpperGeo, forgedMat);
      bigEndUpper.castShadow = true;
      rodGroup.add(bigEndUpper);

      [-0.88, 0.88].forEach((xBoltShoulder) => {
        const shoulderGeo = new THREE.BoxGeometry(0.48, 0.7, 0.75);
        shoulderGeo.translate(xBoltShoulder, -1.35, 0);
        const shoulder = new THREE.Mesh(shoulderGeo, forgedMat);
        rodGroup.add(shoulder);
      });

      groups.set('connecting_rod', rodGroup);

      // 5. ROD BEARINGS
      const bearingsGroup = new THREE.Group();
      bearingsGroup.name = 'rod_bearings';
      bearingsGroup.position.set(0, -1.0, 0);

      const upperShellGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.72, 28, 1, true, 0, Math.PI);
      upperShellGeo.rotateX(Math.PI / 2);
      upperShellGeo.rotateZ(Math.PI / 2);
      const upperShell = new THREE.Mesh(upperShellGeo, bronzeMat);
      upperShell.castShadow = true;
      bearingsGroup.add(upperShell);

      const lowerShellGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.72, 28, 1, true, Math.PI, Math.PI);
      lowerShellGeo.rotateX(Math.PI / 2);
      lowerShellGeo.rotateZ(Math.PI / 2);
      const lowerShell = new THREE.Mesh(lowerShellGeo, bronzeMat);
      lowerShell.castShadow = true;
      bearingsGroup.add(lowerShell);

      const oilHoleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10);
      const oilHole = new THREE.Mesh(oilHoleGeo, blackMat);
      oilHole.position.set(0, 0.78, 0);
      bearingsGroup.add(oilHole);

      groups.set('rod_bearings', bearingsGroup);

      // 6. ROD CAP
      const capGroup = new THREE.Group();
      capGroup.name = 'rod_cap';
      capGroup.position.set(0, -1.6, 0);

      const capArchGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 32, 1, false, Math.PI, Math.PI);
      capArchGeo.rotateX(Math.PI / 2);
      capArchGeo.rotateZ(Math.PI / 2);
      capArchGeo.translate(0, 0.6, 0);
      const capArch = new THREE.Mesh(capArchGeo, forgedMat);
      capArch.castShadow = true;
      capGroup.add(capArch);

      [-0.88, 0.88].forEach((xSide) => {
        const earGeo = new THREE.BoxGeometry(0.48, 0.65, 0.75);
        earGeo.translate(xSide, 0.6, 0);
        const ear = new THREE.Mesh(earGeo, forgedMat);
        capGroup.add(ear);
      });

      groups.set('rod_cap', capGroup);

      // 7. ROD BOLTS (INSTANCED FOR 2 HIGH-TENSILE ARP BOLTS)
      const boltsGroup = new THREE.Group();
      boltsGroup.name = 'rod_bolts';
      boltsGroup.position.set(0, -2.4, 0);

      const shankGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 14);
      shankGeo.translate(0, 0.8, 0);
      const shanksInstanced = new THREE.InstancedMesh(shankGeo, blackMat, 2);

      const boltHeadGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 12);
      boltHeadGeo.translate(0, -0.15, 0);
      const headsInstanced = new THREE.InstancedMesh(boltHeadGeo, blackMat, 2);
      headsInstanced.castShadow = true;

      [-0.88, 0.88].forEach((xPos, idx) => {
        dummy.position.set(xPos, 0, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        shanksInstanced.setMatrixAt(idx, dummy.matrix);
        headsInstanced.setMatrixAt(idx, dummy.matrix);
      });

      shanksInstanced.instanceMatrix.needsUpdate = true;
      headsInstanced.instanceMatrix.needsUpdate = true;
      boltsGroup.add(shanksInstanced);
      boltsGroup.add(headsInstanced);

      groups.set('rod_bolts', boltsGroup);

      // Tag all meshes with partId
      groups.forEach((group, partId) => {
        group.traverse((child) => {
          if (child instanceof THREE.Mesh || child instanceof THREE.InstancedMesh) {
            child.userData.partId = partId;
          }
        });
      });

      return groups;
    };

    return { parts, buildMeshes };
  },
};
