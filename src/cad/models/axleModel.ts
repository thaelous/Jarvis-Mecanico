import * as THREE from 'three';
import { MechanicalModelDefinition, MechanicalPartConfig, TutorialStep } from '../../types/cad';

const assemblySteps: TutorialStep[] = [
  {
    stepNumber: 1,
    partId: 'axle_shaft',
    action: 'assemble',
    title: 'Posicionamiento del Eje Central',
    instruction: 'Ubica el eje motriz estriado en el centro del banco de trabajo. Este servirá como el núcleo estructural del conjunto.',
    tip: 'El eje central soporta las pistas rectificadas para los rodamientos y el asiento de la corona central.',
    targetVectorName: 'Origen [0, 0, 0]',
  },
  {
    stepNumber: 2,
    partId: 'crown_flange',
    action: 'assemble',
    title: 'Montaje de la Corona Dentada',
    instruction: 'Desplaza la corona cónica verticalmente hacia el eje central hasta que encaje con la brida motriz central.',
    tip: 'Alinea los orificios de los pernos de cementación 20MnCr5 con la brida mecanizada.',
    targetVectorName: 'Eje Y (Descenso vertical)',
  },
  {
    stepNumber: 3,
    partId: 'bearing_left',
    action: 'assemble',
    title: 'Instalación de Rodamiento Izquierdo',
    instruction: 'Desliza el rodamiento de soporte SKF 6208 desde la izquierda hacia adentro hasta topar con el hombro del eje.',
    tip: 'Asegúrate de que la pista interior asiente contra el escalón mecanizado de diámetro Ø44mm.',
    targetVectorName: 'Eje X (Hacia la derecha)',
  },
  {
    stepNumber: 4,
    partId: 'bearing_right',
    action: 'assemble',
    title: 'Instalación de Rodamiento Derecho',
    instruction: 'Desliza el segundo rodamiento desde la derecha hacia adentro hasta hacer tope simétrico.',
    tip: 'Ambos rodamientos absorben las cargas radiales combinadas transmitidas por el diferencial.',
    targetVectorName: 'Eje X (Hacia la izquierda)',
  },
  {
    stepNumber: 5,
    partId: 'bevel_gear_left',
    action: 'assemble',
    title: 'Acople de Engranaje Cónico Izquierdo',
    instruction: 'Acopla el piñón cónico izquierdo sobre el estriado mecanizado del semieje hasta su posición final.',
    tip: 'Los dientes cónicos hipoides deben mirar hacia el centro para engranar con los satélites.',
    targetVectorName: 'Eje X (Hacia el centro)',
  },
  {
    stepNumber: 6,
    partId: 'bevel_gear_right',
    action: 'assemble',
    title: 'Acople de Engranaje Cónico Derecho',
    instruction: 'Acopla el engranaje cónico opuesto sobre el estriado derecho completando el sistema de transmisión.',
    tip: 'Comprueba que ambas ruedas dentadas mantengan el juego axial dentro de tolerancia ISO h6.',
    targetVectorName: 'Eje X (Hacia el centro)',
  },
];

const disassemblySteps: TutorialStep[] = [
  {
    stepNumber: 1,
    partId: 'bevel_gear_right',
    action: 'disassemble',
    title: 'Extracción del Piñón Cónico Derecho',
    instruction: 'Tira del engranaje cónico derecho hacia afuera a lo largo del eje X para liberarlo del estriado.',
    tip: 'Desengancha primero los piñones exteriores antes de intentar desmontar los rodamientos.',
    targetVectorName: 'Eje +X',
  },
  {
    stepNumber: 2,
    partId: 'bevel_gear_left',
    action: 'disassemble',
    title: 'Extracción del Piñón Cónico Izquierdo',
    instruction: 'Desplaza el piñón cónico izquierdo hacia el extremo exterior liberándolo de sus estrías.',
    tip: 'Revisa el desgaste de los dientes nitrurados 41CrAlMo7 durante la inspección.',
    targetVectorName: 'Eje -X',
  },
  {
    stepNumber: 3,
    partId: 'bearing_right',
    action: 'disassemble',
    title: 'Desmontaje de Rodamiento Derecho',
    instruction: 'Desliza el rodamiento derecho hacia afuera retirándolo del eje cilíndrico.',
    tip: 'Usa un extractor de garras en aplicaciones reales para evitar dañar las pistas rectificadas.',
    targetVectorName: 'Eje +X',
  },
  {
    stepNumber: 4,
    partId: 'bearing_left',
    action: 'disassemble',
    title: 'Desmontaje de Rodamiento Izquierdo',
    instruction: 'Desliza el rodamiento izquierdo hacia el exterior para liberar la sección del hombro.',
    tip: 'Inspecciona las 10 esferas de rodamiento en busca de fatiga o picadura (spalling).',
    targetVectorName: 'Eje -X',
  },
  {
    stepNumber: 5,
    partId: 'crown_flange',
    action: 'disassemble',
    title: 'Separación de Corona Dentada',
    instruction: 'Eleva la corona dentada hacia arriba a lo largo del eje Y separándola de la brida central.',
    tip: 'Esta pieza transfiere el par motriz principal desde el piñón de ataque de la transmisión.',
    targetVectorName: 'Eje +Y',
  },
];

export const axleModel: MechanicalModelDefinition = {
  id: 'axle_differential',
  name: 'Eje Automotriz / Semieje de Transmisión',
  category: 'Transmisión & Tren Motriz',
  description: 'Conjunto de eje motriz estriado con engranajes cónicos hipoides de diferencial, rodamientos de rodillos cónicos y brida motriz central.',
  specs: {
    weightKg: '18.4 kg',
    material: 'Acero Forjado AISI 4340 + Ni-Cr-Mo',
    torqueOrPower: '1,250 Nm Torque Máx.',
    tolerance: 'ISO h6 / ±0.008 mm',
  },
  assemblySteps,
  disassemblySteps,
  createParts: () => {
    const parts: MechanicalPartConfig[] = [
      {
        id: 'axle_shaft',
        name: 'Flecha / Eje Central Estriado',
        technicalName: 'Drive Shaft Axle Core (AISI 4340)',
        category: 'Eje Primario',
        materialName: 'Acero Forjado Templado',
        materialDescription: 'Eje estriado mecanizado por CNC con chaveteros y asiento para pista de rodamientos.',
        defaultPosition: [0, 0, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0, 0],
        explodeDistance: 0,
        snapTolerance: 0.8,
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.25,
        physics: {
          shapeType: 'cylinder',
          size: [0.4, 0.4, 8.4],
          mass: 8.5,
        },
      },
      {
        id: 'crown_flange',
        name: 'Corona Dentada / Brida Central',
        technicalName: 'Center Ring Bevel Gear Flange',
        category: 'Engranajes',
        materialName: 'Acero de Cementación 20MnCr5',
        materialDescription: 'Corona cónica de gran diámetro para transferencia de par motor desde piñón de ataque.',
        defaultPosition: [0, 0, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 1, 0],
        explodeDistance: 2.5,
        snapTolerance: 0.8,
        color: 0xdfad36,
        metalness: 0.92,
        roughness: 0.22,
        physics: {
          shapeType: 'cylinder',
          size: [1.6, 1.6, 0.45],
          mass: 4.2,
        },
      },
      {
        id: 'bearing_left',
        name: 'Rodamiento de Soporte Izquierdo',
        technicalName: 'Deep Groove Ball Bearing (SKF 6208-L)',
        category: 'Rodamientos',
        materialName: 'Acero al Cromo 100Cr6',
        materialDescription: 'Rodamiento de precisión con 10 esferas de rodadura en jaula y pistas rectificadas.',
        defaultPosition: [-2.2, 0, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [-1, 0, 0],
        explodeDistance: 2.2,
        snapTolerance: 0.7,
        color: 0xf1f5f9,
        metalness: 0.96,
        roughness: 0.12,
        physics: {
          shapeType: 'cylinder',
          size: [0.95, 0.95, 0.45],
          mass: 1.2,
        },
      },
      {
        id: 'bearing_right',
        name: 'Rodamiento de Soporte Derecho',
        technicalName: 'Deep Groove Ball Bearing (SKF 6208-R)',
        category: 'Rodamientos',
        materialName: 'Acero al Cromo 100Cr6',
        materialDescription: 'Rodamiento de precisión lado derecho para absorción de cargas radiales y axiales.',
        defaultPosition: [2.2, 0, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [1, 0, 0],
        explodeDistance: 2.2,
        snapTolerance: 0.7,
        color: 0xf1f5f9,
        metalness: 0.96,
        roughness: 0.12,
        physics: {
          shapeType: 'cylinder',
          size: [0.95, 0.95, 0.45],
          mass: 1.2,
        },
      },
      {
        id: 'bevel_gear_left',
        name: 'Engranaje Cónico Izquierdo',
        technicalName: 'Left Bevel Side Pinion Gear',
        category: 'Engranajes',
        materialName: 'Acero Nitrurado 41CrAlMo7',
        materialDescription: 'Engranaje cónico dentado para acople con planetarios del diferencial.',
        defaultPosition: [-4.2, 0, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [-1, 0, 0],
        explodeDistance: 4.0,
        snapTolerance: 0.8,
        color: 0x64748b,
        metalness: 0.88,
        roughness: 0.28,
        physics: {
          shapeType: 'cylinder',
          size: [1.1, 1.1, 0.8],
          mass: 1.8,
        },
      },
      {
        id: 'bevel_gear_right',
        name: 'Engranaje Cónico Derecho',
        technicalName: 'Right Bevel Side Pinion Gear',
        category: 'Engranajes',
        materialName: 'Acero Nitrurado 41CrAlMo7',
        materialDescription: 'Engranaje cónico dentado simétrico para diferencial lado rueda derecha.',
        defaultPosition: [4.2, 0, 0],
        defaultRotation: [0, 0, Math.PI],
        explodeVector: [1, 0, 0],
        explodeDistance: 4.0,
        snapTolerance: 0.8,
        color: 0x64748b,
        metalness: 0.88,
        roughness: 0.28,
        physics: {
          shapeType: 'cylinder',
          size: [1.1, 1.1, 0.8],
          mass: 1.8,
        },
      },
    ];

    const buildMeshes = (matMap: Map<string, THREE.Material>): Map<string, THREE.Group> => {
      const groups = new Map<string, THREE.Group>();

      const steelMat = matMap.get('steel_polished') || new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const forgedMat = matMap.get('forged_steel') || new THREE.MeshStandardMaterial({ color: 0x64748b });
      const bearingMat = matMap.get('chrome_bearing') || new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
      const goldMat = matMap.get('titanium_gold') || new THREE.MeshStandardMaterial({ color: 0xdfad36 });
      const blackMat = matMap.get('black_oxide') || new THREE.MeshStandardMaterial({ color: 0x1f2328 });

      // 1. AXLE SHAFT (ALWAYS FULL DETAILED WITH 64 RADIAL SEGMENTS)
      const shaftGroup = new THREE.Group();
      shaftGroup.name = 'axle_shaft';

      const mainShaftGeo = new THREE.CylinderGeometry(0.38, 0.38, 8.4, 64);
      mainShaftGeo.rotateZ(Math.PI / 2);
      const mainShaftMesh = new THREE.Mesh(mainShaftGeo, steelMat);
      mainShaftMesh.castShadow = true;
      mainShaftMesh.receiveShadow = true;
      shaftGroup.add(mainShaftMesh);

      const centerCollarGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.6, 64);
      centerCollarGeo.rotateZ(Math.PI / 2);
      const centerCollar = new THREE.Mesh(centerCollarGeo, forgedMat);
      centerCollar.castShadow = true;
      shaftGroup.add(centerCollar);

      [-2.2, 2.2].forEach((xPos) => {
        const stepGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.8, 64);
        stepGeo.rotateZ(Math.PI / 2);
        const stepMesh = new THREE.Mesh(stepGeo, steelMat);
        stepMesh.position.x = xPos;
        shaftGroup.add(stepMesh);
      });

      // Spline teeth with InstancedMesh optimization (24 teeth total: 12 on each side)
      const splineToothGeo = new THREE.BoxGeometry(0.9, 0.06, 0.05);
      const splineInstanced = new THREE.InstancedMesh(splineToothGeo, steelMat, 24);
      splineInstanced.castShadow = true;

      const dummy = new THREE.Object3D();
      let toothIdx = 0;
      [-3.8, 3.8].forEach((xPos) => {
        const splineBaseGeo = new THREE.CylinderGeometry(0.32, 0.32, 1.0, 64);
        splineBaseGeo.rotateZ(Math.PI / 2);
        const splineBase = new THREE.Mesh(splineBaseGeo, blackMat);
        splineBase.position.x = xPos;
        shaftGroup.add(splineBase);

        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          dummy.position.set(xPos, Math.cos(angle) * 0.34, Math.sin(angle) * 0.34);
          dummy.rotation.set(angle, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          splineInstanced.setMatrixAt(toothIdx++, dummy.matrix);
        }
      });
      splineInstanced.instanceMatrix.needsUpdate = true;
      shaftGroup.add(splineInstanced);

      groups.set('axle_shaft', shaftGroup);

      // 2. CROWN FLANGE (ALWAYS FULL DETAILED WITH 64 RADIAL SEGMENTS)
      const crownGroup = new THREE.Group();
      crownGroup.name = 'crown_flange';

      const crownBaseGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.4, 64);
      crownBaseGeo.rotateZ(Math.PI / 2);
      const crownBase = new THREE.Mesh(crownBaseGeo, goldMat);
      crownBase.castShadow = true;
      crownGroup.add(crownBase);

      const innerRingGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.42, 64);
      innerRingGeo.rotateZ(Math.PI / 2);
      const innerRing = new THREE.Mesh(innerRingGeo, blackMat);
      crownGroup.add(innerRing);

      // Instanced Mesh for 8 Crown Bolts
      const crownBoltGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.46, 16);
      crownBoltGeo.rotateZ(Math.PI / 2);
      const crownBoltsInstanced = new THREE.InstancedMesh(crownBoltGeo, blackMat, 8);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        dummy.position.set(0, Math.cos(angle) * 1.05, Math.sin(angle) * 1.05);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        crownBoltsInstanced.setMatrixAt(i, dummy.matrix);
      }
      crownBoltsInstanced.instanceMatrix.needsUpdate = true;
      crownGroup.add(crownBoltsInstanced);

      // Instanced Mesh for 28 Bevel Hypoid Teeth
      const crownToothGeo = new THREE.BoxGeometry(0.38, 0.14, 0.2);
      const crownTeethInstanced = new THREE.InstancedMesh(crownToothGeo, goldMat, 28);
      crownTeethInstanced.castShadow = true;
      for (let i = 0; i < 28; i++) {
        const angle = (i / 28) * Math.PI * 2;
        dummy.position.set(0, Math.cos(angle) * 1.55, Math.sin(angle) * 1.55);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        crownTeethInstanced.setMatrixAt(i, dummy.matrix);
      }
      crownTeethInstanced.instanceMatrix.needsUpdate = true;
      crownGroup.add(crownTeethInstanced);

      groups.set('crown_flange', crownGroup);

      // Helper for Instanced Bearing with 10 Ball Bearings
      const createBearingGroup = (id: string, xPos: number) => {
        const bearingGroup = new THREE.Group();
        bearingGroup.name = id;
        bearingGroup.position.set(xPos, 0, 0);

        const outerRaceGeo = new THREE.TorusGeometry(0.85, 0.12, 14, 32);
        outerRaceGeo.rotateY(Math.PI / 2);
        const outerRace = new THREE.Mesh(outerRaceGeo, bearingMat);
        outerRace.castShadow = true;
        bearingGroup.add(outerRace);

        const outerWallGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.42, 24, 1, true);
        outerWallGeo.rotateZ(Math.PI / 2);
        const outerWall = new THREE.Mesh(outerWallGeo, steelMat);
        bearingGroup.add(outerWall);

        const innerRaceGeo = new THREE.TorusGeometry(0.52, 0.09, 14, 32);
        innerRaceGeo.rotateY(Math.PI / 2);
        const innerRace = new THREE.Mesh(innerRaceGeo, bearingMat);
        bearingGroup.add(innerRace);

        // InstancedMesh for 10 Bearing Balls
        const ballGeo = new THREE.SphereGeometry(0.12, 14, 14);
        const ballsInstanced = new THREE.InstancedMesh(ballGeo, bearingMat, 10);
        ballsInstanced.castShadow = true;

        for (let b = 0; b < 10; b++) {
          const angle = (b / 10) * Math.PI * 2;
          dummy.position.set(0, Math.cos(angle) * 0.68, Math.sin(angle) * 0.68);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          ballsInstanced.setMatrixAt(b, dummy.matrix);
        }
        ballsInstanced.instanceMatrix.needsUpdate = true;
        bearingGroup.add(ballsInstanced);

        return bearingGroup;
      };

      groups.set('bearing_left', createBearingGroup('bearing_left', -2.2));
      groups.set('bearing_right', createBearingGroup('bearing_right', 2.2));

      // Helper for Bevel Gears with Instanced Teeth
      const createBevelGearGroup = (id: string, xPos: number, isRight: boolean) => {
        const gearGroup = new THREE.Group();
        gearGroup.name = id;
        gearGroup.position.set(xPos, 0, 0);
        if (isRight) gearGroup.rotation.z = Math.PI;

        const coneHubGeo = new THREE.ConeGeometry(1.1, 0.8, 28);
        coneHubGeo.rotateZ(Math.PI / 2);
        const coneHub = new THREE.Mesh(coneHubGeo, forgedMat);
        coneHub.castShadow = true;
        gearGroup.add(coneHub);

        const innerCollarGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.6, 20);
        innerCollarGeo.rotateZ(Math.PI / 2);
        innerCollarGeo.translate(-0.35, 0, 0);
        const innerCollar = new THREE.Mesh(innerCollarGeo, steelMat);
        gearGroup.add(innerCollar);

        // Instanced Mesh for 16 Conical Teeth
        const toothGeo = new THREE.BoxGeometry(0.5, 0.12, 0.14);
        toothGeo.rotateY(0.35);
        const teethInstanced = new THREE.InstancedMesh(toothGeo, forgedMat, 16);
        teethInstanced.castShadow = true;

        for (let t = 0; t < 16; t++) {
          const angle = (t / 16) * Math.PI * 2;
          dummy.position.set(0.1, Math.cos(angle) * 0.85, Math.sin(angle) * 0.85);
          dummy.rotation.set(angle, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          teethInstanced.setMatrixAt(t, dummy.matrix);
        }
        teethInstanced.instanceMatrix.needsUpdate = true;
        gearGroup.add(teethInstanced);

        return gearGroup;
      };

      groups.set('bevel_gear_left', createBevelGearGroup('bevel_gear_left', -4.2, false));
      groups.set('bevel_gear_right', createBevelGearGroup('bevel_gear_right', 4.2, true));

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
