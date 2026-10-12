import * as THREE from 'three';
import { MechanicalModelDefinition, MechanicalPartConfig, TutorialStep } from '../../types/cad';

const assemblySteps: TutorialStep[] = [
  {
    stepNumber: 1,
    partId: 'input_shaft',
    action: 'assemble',
    title: 'Alineación del Eje Primario de Entrada',
    instruction: 'Posiciona el eje primario estriado en la línea central del banco de transmisión.',
    tip: 'El eje de entrada recibe el par directamente desde el disco de embrague a través de sus estrías templadas.',
    targetVectorName: 'Origen [0, 0, 0]',
  },
  {
    stepNumber: 2,
    partId: 'counter_shaft',
    action: 'assemble',
    title: 'Instalación del Eje Secundario (Tren Fijo)',
    instruction: 'Acopla el tren de engranajes secundario en paralelo al eje primario respetando la distancia interaxial.',
    tip: 'Los 4 piñones solidarios proporcionan las diferentes relaciones de transmisión (desmultiplicación).',
    targetVectorName: 'Eje Z (Hacia el centro)',
  },
  {
    stepNumber: 3,
    partId: 'gear_cluster_main',
    action: 'assemble',
    title: 'Montaje de Piñones Locos del Eje Principal',
    instruction: 'Desliza las ruedas dentadas helicoidales con sus jaulas de agujas sobre el eje primario.',
    tip: 'El dentado helicoidal a 25° garantiza un engrane suave y silencioso con mínimo ruido por rozamiento.',
    targetVectorName: 'Eje X (Hacia el eje primario)',
  },
  {
    stepNumber: 4,
    partId: 'synchro_hub',
    action: 'assemble',
    title: 'Inserción del Conjunto Sincronizador',
    instruction: 'Desciende el conjunto de sincronizador de bronce y manguito desplazable entre las marchas.',
    tip: 'Los conos de fricción de bronce igualan las velocidades angulares antes de que las estrías engranen.',
    targetVectorName: 'Eje Y (Descenso vertical)',
  },
  {
    stepNumber: 5,
    partId: 'shift_fork',
    action: 'assemble',
    title: 'Acople de la Horquilla Selectora de Cambio',
    instruction: 'Inserta la horquilla de mando en la ranura perimetral del manguito desplazable sincronizador.',
    tip: 'Las pastillas de bronce en los extremos de la horquilla minimizan el desgaste por fricción axial.',
    targetVectorName: 'Eje Y (Descenso y acople)',
  },
  {
    stepNumber: 6,
    partId: 'casing_cutaway',
    action: 'assemble',
    title: 'Cierre con Carcasa Seccionada de Aluminio',
    instruction: 'Acopla el cárter seccionado de transmisión que protege los rodamientos y contiene el aceite sintético 75W-90.',
    tip: 'El diseño seccionado estilo museo técnico permite inspeccionar la cinemática interior mientras protege los apoyos.',
    targetVectorName: 'Eje Z (Cierre frontal)',
  },
];

const disassemblySteps: TutorialStep[] = [
  {
    stepNumber: 1,
    partId: 'casing_cutaway',
    action: 'disassemble',
    title: 'Extracción de Carcasa Seccionada',
    instruction: 'Retira hacia adelante la semicarcasa protectora de fundición para exponer el tren de engranajes.',
    tip: 'Comprueba el imán del tapón de drenaje en busca de viruta metálica proveniente de los piñones.',
    targetVectorName: 'Eje +Z',
  },
  {
    stepNumber: 2,
    partId: 'shift_fork',
    action: 'disassemble',
    title: 'Desmontaje de Horquilla Selectora',
    instruction: 'Eleva la horquilla selectora liberándola del manguito desplazable del sincronizador.',
    tip: 'Revisa las uñas de la horquilla por si presentan alabeo o holgura excesiva.',
    targetVectorName: 'Eje +Y',
  },
  {
    stepNumber: 3,
    partId: 'synchro_hub',
    action: 'disassemble',
    title: 'Extracción del Sincronizador',
    instruction: 'Eleva el muelle y manguito sincronizador separándolo del eje.',
    tip: 'Mide el entrehierro residual entre el anillo cónico de bronce y el piñón con galgas de espesor.',
    targetVectorName: 'Eje +Y',
  },
  {
    stepNumber: 4,
    partId: 'gear_cluster_main',
    action: 'disassemble',
    title: 'Retiro de Piñones Locos Helicoidales',
    instruction: 'Desplaza los engranajes helicoidales hacia el exterior liberando el eje principal.',
    tip: 'Inspecciona las pistas de las jaulas de agujas en busca de picaduras por fatiga de contacto.',
    targetVectorName: 'Eje +X',
  },
  {
    stepNumber: 5,
    partId: 'counter_shaft',
    action: 'disassemble',
    title: 'Desmontaje del Eje Secundario',
    instruction: 'Desplaza el tren fijo hacia el fondo liberando los rodamientos cónicos de apoyo.',
    tip: 'El tren fijo distribuye las cargas axiales contrarias generadas por los dientes helicoidales.',
    targetVectorName: 'Eje -Z',
  },
];

export const gearboxModel: MechanicalModelDefinition = {
  id: 'gearbox_manual',
  name: 'Caja de Transmisión Manual de 4 Velocidades',
  category: 'Transmisión & Cinemática de Engranajes',
  description: 'Mecanismo de caja de cambios manual con eje primario, tren fijo secundario con engranajes helicoidales, sincronizador de bronce, horquilla selectora y carcasa seccionada.',
  specs: {
    weightKg: '34.2 kg',
    material: 'Fundición de Aluminio A380 & Acero 16MnCr5',
    torqueOrPower: 'Par nominal: 350 Nm / Relaciones 3.8:1 a 0.85:1',
    tolerance: 'Juego entre flancos (Backlash): 0.12 - 0.18 mm',
  },
  assemblySteps,
  disassemblySteps,
  createParts: () => {
    const parts: MechanicalPartConfig[] = [
      {
        id: 'input_shaft',
        name: 'Eje Primario de Entrada Estriado',
        technicalName: 'Primary Transmission Input Shaft with Splines',
        category: 'Eje Principal',
        materialName: 'Acero de Cementación 16MnCr5 Templado',
        materialDescription: 'Eje mecanizado con estrías de entrada de embrague y canalizaciones internas de engrase forzado.',
        defaultPosition: [0, 0, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0, 0],
        explodeDistance: 0,
        snapTolerance: 0.8,
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.22,
        physics: {
          shapeType: 'cylinder',
          size: [0.4, 0.4, 7.2],
          mass: 5.6,
        },
      },
      {
        id: 'counter_shaft',
        name: 'Eje Secundario / Tren Fijo de Engranajes',
        technicalName: 'Layshaft Countershaft Cluster with 4 Gears',
        category: 'Tren Secundario',
        materialName: 'Acero Forjado 20MnCr5 Rectificado',
        materialDescription: 'Eje secundario paralelo con 4 piñones forjados integrados de diámetros escalonados para 1ª, 2ª, 3ª y 4ª.',
        defaultPosition: [0, -1.8, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0, -1],
        explodeDistance: 3.2,
        snapTolerance: 0.8,
        color: 0x64748b,
        metalness: 0.88,
        roughness: 0.28,
        physics: {
          shapeType: 'cylinder',
          size: [1.2, 1.2, 6.8],
          mass: 8.4,
        },
      },
      {
        id: 'gear_cluster_main',
        name: 'Piñones Locos Helicoidales Principales',
        technicalName: 'Mainshaft Helical Speed Gears Cluster',
        category: 'Engranajes',
        materialName: 'Acero de Nitruración con Dientes Rectificados',
        materialDescription: 'Ruedas dentadas de gran diámetro con dentado helicoidal para reducción de ruido de rodadura.',
        defaultPosition: [0, 0, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [1, 0, 0],
        explodeDistance: 3.6,
        snapTolerance: 0.8,
        color: 0xdfad36,
        metalness: 0.92,
        roughness: 0.2,
        physics: {
          shapeType: 'cylinder',
          size: [1.4, 1.4, 4.5],
          mass: 6.2,
        },
      },
      {
        id: 'synchro_hub',
        name: 'Conjunto Sincronizador y Manguito',
        technicalName: 'Synchromesh Assembly & Sliding Collar',
        category: 'Sincronización',
        materialName: 'Bronce Fosforado CuSn8 & Acero Estriado',
        materialDescription: 'Anillos de sincronización con cono de fricción y manguito desplazable con dientes de arrastre.',
        defaultPosition: [0, 0.4, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 1, 0],
        explodeDistance: 2.5,
        snapTolerance: 0.7,
        color: 0xcd8032,
        metalness: 0.85,
        roughness: 0.3,
        physics: {
          shapeType: 'cylinder',
          size: [0.95, 0.95, 0.8],
          mass: 1.8,
        },
      },
      {
        id: 'shift_fork',
        name: 'Horquilla Selectora de Cambio',
        technicalName: 'Gear Selector Shift Fork with Rail',
        category: 'Mecanismo de Cambio',
        materialName: 'Aluminio Forjado & Pastillas de Bronce',
        materialDescription: 'Horquilla en arco que engarza en el collar desplazable para conmutar las relaciones de marcha.',
        defaultPosition: [0, 1.4, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 1, 0],
        explodeDistance: 4.0,
        snapTolerance: 0.7,
        color: 0xced6e2,
        metalness: 0.82,
        roughness: 0.35,
        physics: {
          shapeType: 'box',
          size: [1.8, 1.6, 0.6],
          mass: 1.2,
        },
      },
      {
        id: 'casing_cutaway',
        name: 'Carcasa Seccionada de Transmisión',
        technicalName: 'Cutaway Aluminum Transmission Housing Case',
        category: 'Carcasa Estructural',
        materialName: 'Aleación de Aluminio A380 Inyectada',
        materialDescription: 'Cárter de transmisión con nervaduras de refuerzo y ventana seccionada para visualización técnica.',
        defaultPosition: [0, -0.6, 1.5],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0, 1],
        explodeDistance: 4.8,
        snapTolerance: 0.9,
        color: 0x475569,
        metalness: 0.7,
        roughness: 0.45,
        physics: {
          shapeType: 'box',
          size: [3.4, 3.8, 2.2],
          mass: 7.5,
        },
      },
    ];

    const buildMeshes = (matMap: Map<string, THREE.Material>): Map<string, THREE.Group> => {
      const groups = new Map<string, THREE.Group>();

      const steelMat = matMap.get('steel_polished') || new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const forgedMat = matMap.get('forged_steel') || new THREE.MeshStandardMaterial({ color: 0x64748b });
      const goldMat = matMap.get('titanium_gold') || new THREE.MeshStandardMaterial({ color: 0xdfad36 });
      const bronzeMat = matMap.get('bronze') || new THREE.MeshStandardMaterial({ color: 0xcd8032 });
      const aluMat = matMap.get('aluminum_machined') || new THREE.MeshStandardMaterial({ color: 0xced6e2 });
      const blackMat = matMap.get('black_oxide') || new THREE.MeshStandardMaterial({ color: 0x1f2328 });

      const dummy = new THREE.Object3D();

      // 1. INPUT SHAFT
      const shaftGroup = new THREE.Group();
      shaftGroup.name = 'input_shaft';

      const mainShaftGeo = new THREE.CylinderGeometry(0.32, 0.32, 7.2, 64);
      mainShaftGeo.rotateZ(Math.PI / 2);
      const mainShaft = new THREE.Mesh(mainShaftGeo, steelMat);
      mainShaft.castShadow = true;
      shaftGroup.add(mainShaft);

      // Input splines at left end
      const splineGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.4, 32);
      splineGeo.rotateZ(Math.PI / 2);
      splineGeo.translate(-2.8, 0, 0);
      const splineMesh = new THREE.Mesh(splineGeo, blackMat);
      shaftGroup.add(splineMesh);

      // Spline teeth (Instanced)
      const toothGeo = new THREE.BoxGeometry(1.3, 0.05, 0.04);
      const teethInstanced = new THREE.InstancedMesh(toothGeo, steelMat, 10);
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        dummy.position.set(-2.8, Math.cos(angle) * 0.3, Math.sin(angle) * 0.3);
        dummy.rotation.set(angle, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        teethInstanced.setMatrixAt(i, dummy.matrix);
      }
      teethInstanced.instanceMatrix.needsUpdate = true;
      shaftGroup.add(teethInstanced);

      // Bearing collars with 64 segments
      [-1.8, 1.8].forEach((xPos) => {
        const collarGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.5, 64);
        collarGeo.rotateZ(Math.PI / 2);
        collarGeo.translate(xPos, 0, 0);
        const collar = new THREE.Mesh(collarGeo, forgedMat);
        shaftGroup.add(collar);
      });

      groups.set('input_shaft', shaftGroup);

      // 2. COUNTER SHAFT (Tren Fijo con 4 piñones escalonados)
      const counterGroup = new THREE.Group();
      counterGroup.name = 'counter_shaft';
      counterGroup.position.set(0, -1.8, 0);

      const layshaftGeo = new THREE.CylinderGeometry(0.38, 0.38, 6.8, 64);
      layshaftGeo.rotateZ(Math.PI / 2);
      const layshaft = new THREE.Mesh(layshaftGeo, forgedMat);
      layshaft.castShadow = true;
      counterGroup.add(layshaft);

      // 4 Stepped Gears for 1st, 2nd, 3rd, 4th ratio with 64 segments
      const gearSpecs = [
        { x: -1.2, r: 0.75, w: 0.65 }, // 4th
        { x: -0.2, r: 0.95, w: 0.75 }, // 3rd
        { x: 0.9, r: 1.15, w: 0.8 },  // 2nd
        { x: 2.0, r: 1.35, w: 0.9 },  // 1st
      ];

      gearSpecs.forEach((g) => {
        const gearGeo = new THREE.CylinderGeometry(g.r, g.r, g.w, 64);
        gearGeo.rotateZ(Math.PI / 2);
        gearGeo.translate(g.x, 0, 0);
        const gearMesh = new THREE.Mesh(gearGeo, forgedMat);
        gearMesh.castShadow = true;
        counterGroup.add(gearMesh);

        // Chamfer groove
        const grooveGeo = new THREE.TorusGeometry(g.r * 0.98, 0.03, 12, 64);
        grooveGeo.rotateY(Math.PI / 2);
        grooveGeo.translate(g.x, 0, 0);
        const groove = new THREE.Mesh(grooveGeo, blackMat);
        counterGroup.add(groove);
      });

      groups.set('counter_shaft', counterGroup);

      // 3. MAINSHAFT SPEED GEARS (Piñones locos helicoidales dorados)
      const mainGearsGroup = new THREE.Group();
      mainGearsGroup.name = 'gear_cluster_main';

      // Corresponding mating gears on mainshaft (inverse diameters) with 64 segments
      const matingSpecs = [
        { x: -1.2, r: 1.25, w: 0.65 }, // 4th driven
        { x: -0.2, r: 1.05, w: 0.75 }, // 3rd driven
        { x: 0.9, r: 0.85, w: 0.8 },  // 2nd driven
        { x: 2.0, r: 0.65, w: 0.9 },  // 1st driven
      ];

      matingSpecs.forEach((g) => {
        const matingGeo = new THREE.CylinderGeometry(g.r, g.r, g.w, 64);
        matingGeo.rotateZ(Math.PI / 2);
        matingGeo.translate(g.x, 0, 0);
        const matingMesh = new THREE.Mesh(matingGeo, goldMat);
        matingMesh.castShadow = true;
        mainGearsGroup.add(matingMesh);

        // Helical tooth ridge simulation
        const ridgeGeo = new THREE.TorusGeometry(g.r * 0.99, 0.04, 12, 64);
        ridgeGeo.rotateY(Math.PI / 2);
        ridgeGeo.translate(g.x, 0, 0);
        const ridge = new THREE.Mesh(ridgeGeo, steelMat);
        mainGearsGroup.add(ridge);
      });

      groups.set('gear_cluster_main', mainGearsGroup);

      // 4. SYNCHRO HUB & COLLAR (Sincronizador de bronce)
      const synchroGroup = new THREE.Group();
      synchroGroup.name = 'synchro_hub';
      synchroGroup.position.set(0, 0.4, 0);

      // Sliding Shift Sleeve / Collar with 64 segments
      const sleeveCollarGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.75, 64);
      sleeveCollarGeo.rotateZ(Math.PI / 2);
      const sleeveCollar = new THREE.Mesh(sleeveCollarGeo, steelMat);
      sleeveCollar.castShadow = true;
      synchroGroup.add(sleeveCollar);

      // Peripheral fork groove with 64 segments
      const forkGrooveGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.28, 64);
      forkGrooveGeo.rotateZ(Math.PI / 2);
      const forkGroove = new THREE.Mesh(forkGrooveGeo, blackMat);
      synchroGroup.add(forkGroove);

      // Bronze Synchro Rings at both ends with 64 segments
      [-0.45, 0.45].forEach((xSide) => {
        const synchroConeGeo = new THREE.ConeGeometry(0.82, 0.25, 64);
        synchroConeGeo.rotateZ(xSide > 0 ? -Math.PI / 2 : Math.PI / 2);
        synchroConeGeo.translate(xSide, 0, 0);
        const synchroCone = new THREE.Mesh(synchroConeGeo, bronzeMat);
        synchroGroup.add(synchroCone);
      });

      groups.set('synchro_hub', synchroGroup);

      // 5. SHIFT FORK (Horquilla selectora)
      const forkGroup = new THREE.Group();
      forkGroup.name = 'shift_fork';
      forkGroup.position.set(0, 1.4, 0);

      // Shift Rail (Varilla horizontal)
      const railGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.8, 20);
      railGeo.rotateZ(Math.PI / 2);
      railGeo.translate(0, 0.8, 0);
      const railMesh = new THREE.Mesh(railGeo, steelMat);
      railMesh.castShadow = true;
      forkGroup.add(railMesh);

      // Arch Body
      const forkArchGeo = new THREE.TorusGeometry(0.82, 0.14, 14, 28, Math.PI);
      forkArchGeo.rotateZ(Math.PI);
      forkArchGeo.translate(0, 0.1, 0);
      const forkArch = new THREE.Mesh(forkArchGeo, aluMat);
      forkArch.castShadow = true;
      forkGroup.add(forkArch);

      // Bronze wear pads at tips
      [-0.82, 0.82].forEach((xTip) => {
        const padGeo = new THREE.BoxGeometry(0.2, 0.15, 0.25);
        padGeo.translate(xTip, 0.1, 0);
        const pad = new THREE.Mesh(padGeo, bronzeMat);
        forkGroup.add(pad);
      });

      groups.set('shift_fork', forkGroup);

      // 6. CUTAWAY TRANSMISSION CASING (Carcasa seccionada técnica)
      const casingGroup = new THREE.Group();
      casingGroup.name = 'casing_cutaway';
      casingGroup.position.set(0, -0.6, 1.5);

      // U-shaped cutaway shell
      const casingShellGeo = new THREE.BoxGeometry(5.8, 3.6, 0.35);
      const casingShell = new THREE.Mesh(casingShellGeo, forgedMat);
      casingShell.castShadow = true;
      casingGroup.add(casingShell);

      // Reinforcing external ribs
      [-2.0, 0.0, 2.0].forEach((xRib) => {
        const ribGeo = new THREE.BoxGeometry(0.15, 3.4, 0.4);
        ribGeo.translate(xRib, 0, 0.2);
        const rib = new THREE.Mesh(ribGeo, forgedMat);
        casingGroup.add(rib);
      });

      // Inspection window bevel frame
      const frameGeo = new THREE.BoxGeometry(3.6, 2.2, 0.1);
      frameGeo.translate(0, 0, 0.22);
      const frame = new THREE.Mesh(frameGeo, aluMat);
      casingGroup.add(frame);

      // Drain plug bolt at bottom
      const plugGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 6); // Hex bolt
      plugGeo.translate(1.8, -1.6, 0.2);
      const plug = new THREE.Mesh(plugGeo, steelMat);
      casingGroup.add(plug);

      groups.set('casing_cutaway', casingGroup);

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
