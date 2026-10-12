import * as THREE from 'three';
import { MechanicalModelDefinition, MechanicalPartConfig, TutorialStep } from '../../types/cad';

const assemblySteps: TutorialStep[] = [
  {
    stepNumber: 1,
    partId: 'damper_body',
    action: 'assemble',
    title: 'Fijación del Cuerpo del Amortiguador',
    instruction: 'Posiciona el cilindro hidráulico monotubo en la base de la bancada como soporte estructural principal.',
    tip: 'El cuerpo de acero sin soldaduras aloja la cámara de aceite presurizado con nitrógeno a 25 bar.',
    targetVectorName: 'Origen [0, 0, 0]',
  },
  {
    stepNumber: 2,
    partId: 'lower_spring_seat',
    action: 'assemble',
    title: 'Instalación del Asiento Inferior de Precarga',
    instruction: 'Enrosca el platillo inferior de aluminio anodizado sobre el cuerpo roscado del amortiguador.',
    tip: 'Las contratuercas dobles permiten calibrar con precisión milimétrica la altura libre y precarga del resorte.',
    targetVectorName: 'Eje Y (Ascenso roscado)',
  },
  {
    stepNumber: 3,
    partId: 'piston_rod',
    action: 'assemble',
    title: 'Inserción del Vástago de Pistón',
    instruction: 'Introduce el vástago cromado de acero templado Ø22mm en la guía de sellado del cilindro.',
    tip: 'El cromado duro microporoso asegura estanqueidad hidráulica y reduce la fricción dinámica a altas velocidades.',
    targetVectorName: 'Eje Y (Descenso axial)',
  },
  {
    stepNumber: 4,
    partId: 'bump_stop',
    action: 'assemble',
    title: 'Colocación del Tope de Rebote de Poliuretano',
    instruction: 'Desliza el elastómero de tope progresivo sobre el vástago cromado.',
    tip: 'Este elastómero de celdas cerradas evita el impacto metal-metal en compresiones violentas de final de carrera.',
    targetVectorName: 'Eje Y (Descenso axial)',
  },
  {
    stepNumber: 5,
    partId: 'coil_spring',
    action: 'assemble',
    title: 'Montaje del Resorte Helicoidal (Muelle)',
    instruction: 'Desciende el resorte helicoidal de alto rendimiento encajándolo sobre el platillo inferior.',
    tip: 'Fabricado en aleación cromo-silicio 55CrSi tratada térmicamente con rigidez lineal constante (80 N/mm).',
    targetVectorName: 'Eje Y (Descenso axial)',
  },
  {
    stepNumber: 6,
    partId: 'top_mount',
    action: 'assemble',
    title: 'Cierre con Copela Superior de Suspensión',
    instruction: 'Coloca la copela de torreta superior comprimiendo ligeramente el resorte y aprieta la tuerca autoblocante central.',
    tip: 'Incorpora una rótula esférica tipo uniball para permitir el ángulo de giro y caída sin deformación elástica.',
    targetVectorName: 'Eje Y (Descenso y bloqueo)',
  },
];

const disassemblySteps: TutorialStep[] = [
  {
    stepNumber: 1,
    partId: 'top_mount',
    action: 'disassemble',
    title: 'Retiro de Copela Superior',
    instruction: 'Afloja la tuerca central de retención y eleva la copela superior liberando el resorte.',
    tip: 'ADVERTENCIA: Usa siempre compresores de muelles de seguridad antes de soltar la copela superior.',
    targetVectorName: 'Eje +Y',
  },
  {
    stepNumber: 2,
    partId: 'coil_spring',
    action: 'disassemble',
    title: 'Extracción del Resorte Helicoidal',
    instruction: 'Eleva el muelle helicoidal a lo largo del vástago retirándolo del conjunto.',
    tip: 'Inspecciona la pintura epoxi en busca de fisuras que puedan provocar corrosión bajo tensión.',
    targetVectorName: 'Eje +Y',
  },
  {
    stepNumber: 3,
    partId: 'bump_stop',
    action: 'disassemble',
    title: 'Deslizamiento del Tope de Rebote',
    instruction: 'Desliza hacia arriba el tope cónico de poliuretano.',
    tip: 'Revisa si el elastómero presenta degradación por aceites o deformación permanente.',
    targetVectorName: 'Eje +Y',
  },
  {
    stepNumber: 4,
    partId: 'piston_rod',
    action: 'disassemble',
    title: 'Extracción del Vástago de Pistón',
    instruction: 'Tira del vástago cromado hacia arriba para inspeccionar los paquetes de láminas de válvulas interiores.',
    tip: 'Comprueba la rectitud del vástago con reloj comparador centesimal.',
    targetVectorName: 'Eje +Y',
  },
  {
    stepNumber: 5,
    partId: 'lower_spring_seat',
    action: 'disassemble',
    title: 'Desenroscado del Asiento Inferior',
    instruction: 'Desenrosca y baja el platillo inferior liberándolo del cilindro.',
    tip: 'Limpia las roscas trapezoidales mecanizadas en el cuerpo para garantizar un ajuste suave.',
    targetVectorName: 'Eje -Y',
  },
];

export const shockModel: MechanicalModelDefinition = {
  id: 'shock_coilover',
  name: 'Amortiguador / Conjunto Coilover',
  category: 'Suspensión & Dinámica de Chasis',
  description: 'Sistema de suspensión roscada deportiva monotubo con muelle helicoidal concéntrico, vástago rectificado, tope de rebote de poliuretano y copela superior ajustable.',
  specs: {
    weightKg: '5.85 kg',
    material: 'Aluminio Aeronáutico 6061-T6 & Acero 55CrSi',
    torqueOrPower: 'Carrera: 140 mm / Carga máx.: 7,800 N',
    tolerance: 'Sellado de vástago: 0.015 mm',
  },
  assemblySteps,
  disassemblySteps,
  createParts: () => {
    const parts: MechanicalPartConfig[] = [
      {
        id: 'damper_body',
        name: 'Cuerpo del Cilindro Hidráulico',
        technicalName: 'Monotube Damper Body with Lower Eye Mount',
        category: 'Cilindro Hidráulico',
        materialName: 'Acero Estirado en Frío ST52 Anodizado',
        materialDescription: 'Cilindro roscado exteriormente para ajuste de precarga con ojo de anclaje inferior y silentblock de poliuretano.',
        defaultPosition: [0, -1.6, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0, 0],
        explodeDistance: 0,
        snapTolerance: 0.8,
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.35,
        physics: {
          shapeType: 'cylinder',
          size: [0.65, 0.65, 3.6],
          mass: 3.1,
        },
      },
      {
        id: 'lower_spring_seat',
        name: 'Asiento Inferior de Muelle (Platillo)',
        technicalName: 'Threaded Lower Spring Perch & Locking Collar',
        category: 'Ajuste de Altura',
        materialName: 'Aluminio Forjado 6061-T6 Dorado',
        materialDescription: 'Doble platillo roscado para regulación de precarga y bloqueo contra vibraciones.',
        defaultPosition: [0, -0.6, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, -1, 0],
        explodeDistance: 2.2,
        snapTolerance: 0.7,
        color: 0xdfad36,
        metalness: 0.92,
        roughness: 0.22,
        physics: {
          shapeType: 'cylinder',
          size: [1.1, 1.1, 0.4],
          mass: 0.45,
        },
      },
      {
        id: 'piston_rod',
        name: 'Vástago de Pistón Cromado',
        technicalName: 'Hard-Chromed Precision Piston Rod Ø22mm',
        category: 'Cinemática Interior',
        materialName: 'Acero Templado por Inducción C45E',
        materialDescription: 'Vástago rectificado con baño de cromo duro de 25 micras y rosca superior M14x1.5.',
        defaultPosition: [0, 0.9, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 1, 0],
        explodeDistance: 2.5,
        snapTolerance: 0.7,
        color: 0xf1f5f9,
        metalness: 0.98,
        roughness: 0.08,
        physics: {
          shapeType: 'cylinder',
          size: [0.22, 0.22, 3.4],
          mass: 0.95,
        },
      },
      {
        id: 'bump_stop',
        name: 'Tope de Rebote de Poliuretano',
        technicalName: 'Microcellular Polyurethane Bump Stop',
        category: 'Amortiguación Secundaria',
        materialName: 'Elastómero MCU (Microcellular Polyurethane)',
        materialDescription: 'Tope cónico estriado de rigidez progresiva para absorber impactos al final del recorrido.',
        defaultPosition: [0, 1.6, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 1, 0],
        explodeDistance: 3.8,
        snapTolerance: 0.6,
        color: 0xf59e0b,
        metalness: 0.15,
        roughness: 0.75,
        physics: {
          shapeType: 'cylinder',
          size: [0.45, 0.45, 0.9],
          mass: 0.12,
        },
      },
      {
        id: 'coil_spring',
        name: 'Resorte Helicoidal (Muelle 80 N/mm)',
        technicalName: 'Linear Cold-Coiled Suspension Spring 55CrSi',
        category: 'Elástico',
        materialName: 'Acero Aleado Cromo-Silicio 55CrSi',
        materialDescription: 'Muelle helicoidal de 6 espiras con extremos planos amolados y recubrimiento electrostático rojo.',
        defaultPosition: [0, 0.8, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 1, 0],
        explodeDistance: 4.8,
        snapTolerance: 0.8,
        color: 0xd92323,
        metalness: 0.65,
        roughness: 0.28,
        physics: {
          shapeType: 'cylinder',
          size: [1.05, 1.05, 3.2],
          mass: 1.85,
        },
      },
      {
        id: 'top_mount',
        name: 'Copela Superior / Placa de Torreta',
        technicalName: 'Adjustable Pillow-Ball Top Mount Camber Plate',
        category: 'Fijación Chasis',
        materialName: 'Aluminio 7075-T6 & Rótula Esférica Uniball',
        materialDescription: 'Copela superior mecanizada por CNC con 3 pernos prisioneros y rótula esférica para regulación de caída.',
        defaultPosition: [0, 2.7, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 1, 0],
        explodeDistance: 6.2,
        snapTolerance: 0.8,
        color: 0x334155,
        metalness: 0.88,
        roughness: 0.3,
        physics: {
          shapeType: 'cylinder',
          size: [1.3, 1.3, 0.55],
          mass: 0.95,
        },
      },
    ];

    const buildMeshes = (matMap: Map<string, THREE.Material>): Map<string, THREE.Group> => {
      const groups = new Map<string, THREE.Group>();

      const steelMat = matMap.get('steel_polished') || new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const goldMat = matMap.get('titanium_gold') || new THREE.MeshStandardMaterial({ color: 0xdfad36 });
      const chromeMat = matMap.get('chrome_bearing') || new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
      const forgedMat = matMap.get('forged_steel') || new THREE.MeshStandardMaterial({ color: 0x334155 });
      const springRedMat = matMap.get('anodized_red') || new THREE.MeshStandardMaterial({ color: 0xd92323 });
      const blackMat = matMap.get('black_oxide') || new THREE.MeshStandardMaterial({ color: 0x1f2328 });

      const bumperMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.75,
        metalness: 0.15,
      });

      const dummy = new THREE.Object3D();

      // 1. DAMPER BODY (Cilindro con rosca y ojo inferior con 64 segmentos)
      const bodyGroup = new THREE.Group();
      bodyGroup.name = 'damper_body';
      bodyGroup.position.set(0, -1.6, 0);

      // Main Outer Cylinder with 64 segments
      const cylGeo = new THREE.CylinderGeometry(0.55, 0.55, 2.8, 64);
      const cylMesh = new THREE.Mesh(cylGeo, forgedMat);
      cylMesh.castShadow = true;
      bodyGroup.add(cylMesh);

      // Thread grooves simulation on cylinder upper half with 64 segments
      for (let r = 0; r < 14; r++) {
        const ringGeo = new THREE.TorusGeometry(0.56, 0.015, 8, 64);
        ringGeo.rotateX(Math.PI / 2);
        ringGeo.translate(0, -0.4 + r * 0.12, 0);
        const ringMesh = new THREE.Mesh(ringGeo, steelMat);
        bodyGroup.add(ringMesh);
      }

      // Rod seal gland collar at top of cylinder
      const glandGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 64);
      glandGeo.translate(0, 1.4, 0);
      const glandMesh = new THREE.Mesh(glandGeo, steelMat);
      bodyGroup.add(glandMesh);

      // Lower Mount Eyelet Ring (Silentblock eye)
      const eyeRingGeo = new THREE.TorusGeometry(0.52, 0.18, 16, 64);
      eyeRingGeo.rotateY(Math.PI / 2);
      eyeRingGeo.translate(0, -1.6, 0);
      const eyeRing = new THREE.Mesh(eyeRingGeo, forgedMat);
      eyeRing.castShadow = true;
      bodyGroup.add(eyeRing);

      // Rubber Bushing sleeve inside lower eye
      const bushingGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.7, 64);
      bushingGeo.rotateZ(Math.PI / 2);
      bushingGeo.translate(0, -1.6, 0);
      const bushing = new THREE.Mesh(bushingGeo, blackMat);
      bodyGroup.add(bushing);

      // Steel inner sleeve for bolt
      const sleeveGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.82, 64);
      sleeveGeo.rotateZ(Math.PI / 2);
      sleeveGeo.translate(0, -1.6, 0);
      const sleeve = new THREE.Mesh(sleeveGeo, steelMat);
      bodyGroup.add(sleeve);

      groups.set('damper_body', bodyGroup);

      // 2. LOWER SPRING SEAT (Doble platillo roscado dorado)
      const seatGroup = new THREE.Group();
      seatGroup.name = 'lower_spring_seat';
      seatGroup.position.set(0, -0.6, 0);

      // Main perch flange with 64 segments
      const perchGeo = new THREE.CylinderGeometry(1.08, 0.72, 0.35, 64);
      const perchMesh = new THREE.Mesh(perchGeo, goldMat);
      perchMesh.castShadow = true;
      seatGroup.add(perchMesh);

      // Inner threaded collar with 64 segments
      const collarGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.25, 64);
      collarGeo.translate(0, -0.22, 0);
      const collar = new THREE.Mesh(collarGeo, goldMat);
      seatGroup.add(collar);

      // Locknut ring beneath perch
      const lockNutGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.18, 64);
      lockNutGeo.translate(0, -0.42, 0);
      const lockNut = new THREE.Mesh(lockNutGeo, blackMat);
      seatGroup.add(lockNut);

      groups.set('lower_spring_seat', seatGroup);

      // 3. PISTON ROD (Vástago cromado de ultra precisión)
      const rodGroup = new THREE.Group();
      rodGroup.name = 'piston_rod';
      rodGroup.position.set(0, 0.9, 0);

      const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 3.2, 64);
      const shaftMesh = new THREE.Mesh(shaftGeo, chromeMat);
      shaftMesh.castShadow = true;
      rodGroup.add(shaftMesh);

      // Top threaded pin for strut mount
      const topPinGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 32);
      topPinGeo.translate(0, 1.8, 0);
      const topPin = new THREE.Mesh(topPinGeo, steelMat);
      rodGroup.add(topPin);

      groups.set('piston_rod', rodGroup);

      // 4. BUMP STOP (Tope elástico cónico de poliuretano)
      const bumpGroup = new THREE.Group();
      bumpGroup.name = 'bump_stop';
      bumpGroup.position.set(0, 1.6, 0);

      // Multi-bellow conical shape with 64 segments
      [0, 0.26, 0.52].forEach((yOff, i) => {
        const rad = 0.44 - i * 0.06;
        const bellowGeo = new THREE.TorusGeometry(rad, 0.12, 12, 64);
        bellowGeo.rotateX(Math.PI / 2);
        bellowGeo.translate(0, yOff - 0.25, 0);
        const bellowMesh = new THREE.Mesh(bellowGeo, bumperMat);
        bellowMesh.castShadow = true;
        bumpGroup.add(bellowMesh);
      });

      // Internal guide sleeve
      const innerSleeveGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.8, 64);
      const innerSleeve = new THREE.Mesh(innerSleeveGeo, blackMat);
      bumpGroup.add(innerSleeve);

      groups.set('bump_stop', bumpGroup);

      // 5. COIL SPRING (Muelle helicoidal 3D suave con torus segments encadenados)
      const springGroup = new THREE.Group();
      springGroup.name = 'coil_spring';
      springGroup.position.set(0, 0.8, 0);

      // Construct realistic helical spring curve
      const numCoils = 6.2;
      const height = 3.2;
      const radius = 0.95;
      const wireRadius = 0.11;

      // Generate realistic helical spring points
      const helixPoints: THREE.Vector3[] = [];
      const numSamples = 160;
      for (let i = 0; i <= numSamples; i++) {
        const t = i / numSamples;
        const angle = t * numCoils * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (t - 0.5) * height;
        helixPoints.push(new THREE.Vector3(x, y, z));
      }

      const helixPath = new THREE.CatmullRomCurve3(helixPoints);
      const springGeo = new THREE.TubeGeometry(helixPath, 160, wireRadius, 16, false);
      const springMesh = new THREE.Mesh(springGeo, springRedMat);
      springMesh.castShadow = true;
      springGroup.add(springMesh);

      // Ground end rings at top & bottom with 64 segments
      [-height / 2, height / 2].forEach((yEnd) => {
        const endRingGeo = new THREE.TorusGeometry(radius, wireRadius * 0.95, 12, 64);
        endRingGeo.rotateX(Math.PI / 2);
        endRingGeo.translate(0, yEnd, 0);
        const endRing = new THREE.Mesh(endRingGeo, springRedMat);
        springGroup.add(endRing);
      });

      groups.set('coil_spring', springGroup);

      // 6. TOP MOUNT (Copela superior de torreta)
      const topMountGroup = new THREE.Group();
      topMountGroup.name = 'top_mount';
      topMountGroup.position.set(0, 2.7, 0);

      // Upper spring hat perch with 64 segments
      const topHatGeo = new THREE.CylinderGeometry(0.85, 1.15, 0.3, 64);
      topHatGeo.translate(0, -0.2, 0);
      const topHat = new THREE.Mesh(topHatGeo, goldMat);
      topHat.castShadow = true;
      topMountGroup.add(topHat);

      // Camber Plate Main Flange with 64 segments
      const plateGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.22, 64);
      const plateMesh = new THREE.Mesh(plateGeo, forgedMat);
      plateMesh.castShadow = true;
      topMountGroup.add(plateMesh);

      // Center Pillow-Ball Uniball Bearing housing
      const uniballGeo = new THREE.SphereGeometry(0.42, 32, 32);
      const uniballMesh = new THREE.Mesh(uniballGeo, chromeMat);
      topMountGroup.add(uniballMesh);

      // Central retention locknut
      const nutGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 6); // Hex nut
      nutGeo.translate(0, 0.32, 0);
      const nutMesh = new THREE.Mesh(nutGeo, steelMat);
      topMountGroup.add(nutMesh);

      // 3 Chassis Studs (Instanced)
      const studGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.55, 12);
      const studsInstanced = new THREE.InstancedMesh(studGeo, blackMat, 3);
      for (let s = 0; s < 3; s++) {
        const angle = (s / 3) * Math.PI * 2;
        dummy.position.set(Math.cos(angle) * 1.1, 0.25, Math.sin(angle) * 1.1);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        studsInstanced.setMatrixAt(s, dummy.matrix);
      }
      studsInstanced.instanceMatrix.needsUpdate = true;
      topMountGroup.add(studsInstanced);

      groups.set('top_mount', topMountGroup);

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
