import * as THREE from 'three';
import { MechanicalModelDefinition, MechanicalPartConfig, TutorialStep } from '../../types/cad';

const assemblySteps: TutorialStep[] = [
  {
    stepNumber: 1,
    partId: 'brake_rotor',
    action: 'assemble',
    title: 'Centrado del Disco de Freno Ventilado',
    instruction: 'Ubica el disco bi-metálico perforado Ø340mm en el eje de rotación de la rueda.',
    tip: 'El rotor ventilado canaliza aire frío entre ambas pistas de fricción mediante sus 32 aletas internas.',
    targetVectorName: 'Origen [0, 0, 0]',
  },
  {
    stepNumber: 2,
    partId: 'wheel_hub',
    action: 'assemble',
    title: 'Inserción de la Masa / Buje Central',
    instruction: 'Empuja el buje central hacia adentro en el alojamiento de centrado de la campana del disco.',
    tip: 'El buje aloja los rodamientos sellados de doble hilera y transmite el momento torsor.',
    targetVectorName: 'Eje Z (Hacia adentro)',
  },
  {
    stepNumber: 3,
    partId: 'inner_pad',
    action: 'assemble',
    title: 'Colocación de la Pastilla Interior',
    instruction: 'Desliza la pastilla de freno interior en la guía trasera contra la pista interna del disco.',
    tip: 'Verifica que la lámina amortiguadora antiruido quede orientada hacia los pistones del caliper.',
    targetVectorName: 'Eje +Z (Hacia el disco)',
  },
  {
    stepNumber: 4,
    partId: 'outer_pad',
    action: 'assemble',
    title: 'Colocación de la Pastilla Exterior',
    instruction: 'Acopla la pastilla exterior sobre la cara delantera del disco de freno.',
    tip: 'El compuesto cerámico sinterizado resiste temperaturas operativas continuas de hasta 650°C.',
    targetVectorName: 'Eje -Z (Hacia el disco)',
  },
  {
    stepNumber: 5,
    partId: 'caliper_body',
    action: 'assemble',
    title: 'Montaje del Caliper Monobloque de 4 Pistones',
    instruction: 'Haz descender la pinza de freno en U sobre el conjunto abrazando el rotor y ambas pastillas.',
    tip: 'Alinea los orificios de fijación radial con los soportes de la mangueta de suspensión.',
    targetVectorName: 'Eje Y (Descenso vertical)',
  },
  {
    stepNumber: 6,
    partId: 'wheel_studs',
    action: 'assemble',
    title: 'Fijación de los 5 Birlos y Tuercas Hexagonales',
    instruction: 'Inserta el juego de 5 birlos roscados M12x1.5 y aprieta las tuercas para sellar el conjunto.',
    tip: 'Aplica un par de apriete en cruz de 110 Nm según especificaciones del fabricante.',
    targetVectorName: 'Eje Z (Alineación frontal)',
  },
];

const disassemblySteps: TutorialStep[] = [
  {
    stepNumber: 1,
    partId: 'wheel_studs',
    action: 'disassemble',
    title: 'Desmontaje de Birlos y Tuercas',
    instruction: 'Retira hacia adelante el juego de 5 birlos para liberar la sujeción de la llanta y buje.',
    tip: 'En el taller real, afloja las tuercas en estrella mientras el vehículo aún se apoya en el piso.',
    targetVectorName: 'Eje +Z',
  },
  {
    stepNumber: 2,
    partId: 'wheel_hub',
    action: 'disassemble',
    title: 'Extracción de la Masa / Buje',
    instruction: 'Extrae la masa central hacia afuera retirándola de la campana del disco.',
    tip: 'Revisa el juego axial del rodamiento de maza para verificar que no supere 0.05 mm.',
    targetVectorName: 'Eje +Z',
  },
  {
    stepNumber: 3,
    partId: 'caliper_body',
    action: 'disassemble',
    title: 'Elevación de la Pinza Monobloque',
    instruction: 'Eleva el caliper verticalmente a lo largo del eje Y liberando las pastillas y el disco.',
    tip: 'Cuelga la pinza con un gancho mecánico para no tensionar el flexible hidráulico de líquido de frenos.',
    targetVectorName: 'Eje +Y',
  },
  {
    stepNumber: 4,
    partId: 'outer_pad',
    action: 'disassemble',
    title: 'Retiro de Pastilla Exterior',
    instruction: 'Separa la pastilla exterior hacia adelante.',
    tip: 'Comprueba el grosor residual del material de fricción (mínimo legal: 3 mm).',
    targetVectorName: 'Eje +Z',
  },
  {
    stepNumber: 5,
    partId: 'inner_pad',
    action: 'disassemble',
    title: 'Retiro de Pastilla Interior',
    instruction: 'Desliza la pastilla interior hacia atrás.',
    tip: 'Revisa si existe desgaste irregular entre ambas pastillas (síntoma de pistón atascado).',
    targetVectorName: 'Eje -Z',
  },
];

export const brakeModel: MechanicalModelDefinition = {
  id: 'brake_system',
  name: 'Sistema de Frenos de Disco Ventilado',
  category: 'Frenado & Dinámica Vehicular',
  description: 'Conjunto de freno de alto rendimiento con disco flotante bi-metálico ventilado, pinza monobloque de 4 pistones, pastillas cerámicas y buje con 5 birlos.',
  specs: {
    weightKg: '12.8 kg',
    material: 'Fundición Gris GG25 / Aluminio 7075-T6',
    torqueOrPower: '2,800 Nm Torque de Frenado',
    tolerance: 'Alabeo máx. 0.03 mm',
  },
  assemblySteps,
  disassemblySteps,
  createParts: () => {
    const parts: MechanicalPartConfig[] = [
      {
        id: 'brake_rotor',
        name: 'Disco de Freno Ventilado',
        technicalName: 'Ventilated Bi-Metallic Brake Rotor Ø340mm',
        category: 'Rotor',
        materialName: 'Fundición Gris GG25 Perlítica',
        materialDescription: 'Rotor doble pista con canales internos de flujo de aire radial y perforaciones transversales cruzadas.',
        defaultPosition: [0, 0, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0, 0],
        explodeDistance: 0,
        snapTolerance: 0.8,
        color: 0x8a929e,
        metalness: 0.85,
        roughness: 0.32,
        physics: {
          shapeType: 'cylinder',
          size: [2.7, 2.7, 0.45],
          mass: 7.2,
        },
      },
      {
        id: 'caliper_body',
        name: 'Caliper / Pinza de Freno Monobloque',
        technicalName: 'Monobloc 4-Piston Caliper Assembly',
        category: 'Actuador Hidráulico',
        materialName: 'Aluminio Forjado 7075 Anodizado',
        materialDescription: 'Pinza fija rígida con cilindros hidráulicos dobles contrapuestos, purgador y conducto de líquido DOT 4.',
        defaultPosition: [0, 2.1, 0],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 1, 0],
        explodeDistance: 3.2,
        snapTolerance: 0.8,
        color: 0xd92323,
        metalness: 0.7,
        roughness: 0.28,
        physics: {
          shapeType: 'box',
          size: [2.4, 1.2, 1.4],
          mass: 3.8,
        },
      },
      {
        id: 'inner_pad',
        name: 'Pastilla de Freno Interior',
        technicalName: 'Inner Carbon-Ceramic Brake Pad',
        category: 'Fricción',
        materialName: 'Compuesto Carbono-Cerámico & Acero',
        materialDescription: 'Pastilla con forro sinterizado de alta fricción térmica y chapa amortiguadora antiruido.',
        defaultPosition: [0, 2.1, -0.42],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0.4, -1],
        explodeDistance: 2.2,
        snapTolerance: 0.6,
        color: 0x27292e,
        metalness: 0.2,
        roughness: 0.8,
        physics: {
          shapeType: 'box',
          size: [1.6, 0.65, 0.2],
          mass: 0.45,
        },
      },
      {
        id: 'outer_pad',
        name: 'Pastilla de Freno Exterior',
        technicalName: 'Outer Carbon-Ceramic Brake Pad',
        category: 'Fricción',
        materialName: 'Compuesto Carbono-Cerámico & Acero',
        materialDescription: 'Pastilla exterior con clip de retención elástica y sensor de desgaste.',
        defaultPosition: [0, 2.1, 0.42],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0.4, 1],
        explodeDistance: 2.2,
        snapTolerance: 0.6,
        color: 0x27292e,
        metalness: 0.2,
        roughness: 0.8,
        physics: {
          shapeType: 'box',
          size: [1.6, 0.65, 0.2],
          mass: 0.45,
        },
      },
      {
        id: 'wheel_hub',
        name: 'Masa / Buje Central',
        technicalName: 'Wheel Bearing Hub & Flange Assembly',
        category: 'Maza de Rueda',
        materialName: 'Acero Forjado Microaleado',
        materialDescription: 'Cilindro central porta-rodamientos con campana de anclaje para centrado de llanta.',
        defaultPosition: [0, 0, 0.45],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0, 1],
        explodeDistance: 2.8,
        snapTolerance: 0.7,
        color: 0xced6e2,
        metalness: 0.9,
        roughness: 0.25,
        physics: {
          shapeType: 'cylinder',
          size: [1.35, 1.35, 0.65],
          mass: 2.5,
        },
      },
      {
        id: 'wheel_studs',
        name: 'Juego de Birlos y Tuercas (x5)',
        technicalName: 'M12x1.5 High-Tensile Studs & Lug Nuts',
        category: 'Fijación',
        materialName: 'Acero Grado 10.9 Cromado',
        materialDescription: '5 birlos roscados embutidos con tuercas hexagonales cónicas de sujeción.',
        defaultPosition: [0, 0, 0.8],
        defaultRotation: [0, 0, 0],
        explodeVector: [0, 0, 1],
        explodeDistance: 4.5,
        snapTolerance: 0.8,
        color: 0xf1f5f9,
        metalness: 0.95,
        roughness: 0.15,
        physics: {
          shapeType: 'box',
          size: [1.8, 1.8, 0.6],
          mass: 0.8,
        },
      },
    ];

    const buildMeshes = (matMap: Map<string, THREE.Material>): Map<string, THREE.Group> => {
      const groups = new Map<string, THREE.Group>();

      const ironMat = matMap.get('cast_iron') || new THREE.MeshStandardMaterial({ color: 0x8a929e });
      const steelMat = matMap.get('steel_polished') || new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
      const redMat = matMap.get('anodized_red') || new THREE.MeshStandardMaterial({ color: 0xd92323 });
      const padMat = matMap.get('friction_compound') || new THREE.MeshStandardMaterial({ color: 0x27292e });
      const aluMat = matMap.get('aluminum_machined') || new THREE.MeshStandardMaterial({ color: 0xced6e2 });
      const blackMat = matMap.get('black_oxide') || new THREE.MeshStandardMaterial({ color: 0x1f2328 });

      const dummy = new THREE.Object3D();

      // 1. BRAKE ROTOR (ALWAYS FULL DETAILED WITH 64 RADIAL SEGMENTS)
      const rotorGroup = new THREE.Group();
      rotorGroup.name = 'brake_rotor';

      // Front & Rear Disc Faces with 64 radial segments for ultra-smooth circular profile
      const frontDiscGeo = new THREE.CylinderGeometry(2.7, 2.7, 0.1, 64);
      frontDiscGeo.rotateX(Math.PI / 2);
      frontDiscGeo.translate(0, 0, 0.18);
      const frontDisc = new THREE.Mesh(frontDiscGeo, ironMat);
      frontDisc.castShadow = true;
      rotorGroup.add(frontDisc);

      const rearDiscGeo = new THREE.CylinderGeometry(2.7, 2.7, 0.1, 64);
      rearDiscGeo.rotateX(Math.PI / 2);
      rearDiscGeo.translate(0, 0, -0.18);
      const rearDisc = new THREE.Mesh(rearDiscGeo, ironMat);
      rearDisc.castShadow = true;
      rotorGroup.add(rearDisc);

      // InstancedMesh for 32 Internal Radial Ventilation Vanes (Always visible)
      const vaneGeo = new THREE.BoxGeometry(0.7, 0.05, 0.26);
      const vanesInstanced = new THREE.InstancedMesh(vaneGeo, ironMat, 32);
      for (let v = 0; v < 32; v++) {
        const angle = (v / 32) * Math.PI * 2;
        const rad = 2.0;
        dummy.position.set(Math.cos(angle) * rad, Math.sin(angle) * rad, 0);
        dummy.rotation.set(0, 0, angle + 0.35);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        vanesInstanced.setMatrixAt(v, dummy.matrix);
      }
      vanesInstanced.instanceMatrix.needsUpdate = true;
      rotorGroup.add(vanesInstanced);

      // InstancedMesh for 24 Cross-Drilled Holes (Always visible at any distance)
      const holeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.5, 12);
      holeGeo.rotateX(Math.PI / 2);
      const holesInstanced = new THREE.InstancedMesh(holeGeo, blackMat, 24);
      for (let h = 0; h < 24; h++) {
        const angle = (h / 24) * Math.PI * 2;
        const r1 = 1.9 + (h % 3) * 0.28;
        dummy.position.set(Math.cos(angle) * r1, Math.sin(angle) * r1, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        holesInstanced.setMatrixAt(h, dummy.matrix);
      }
      holesInstanced.instanceMatrix.needsUpdate = true;
      rotorGroup.add(holesInstanced);

      // Center Rotor Hat Bell with 64 segments
      const hatBellGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.45, 64);
      hatBellGeo.rotateX(Math.PI / 2);
      hatBellGeo.translate(0, 0, 0.25);
      const hatBell = new THREE.Mesh(hatBellGeo, aluMat);
      hatBell.castShadow = true;
      rotorGroup.add(hatBell);

      const centerHoleGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 64);
      centerHoleGeo.rotateX(Math.PI / 2);
      centerHoleGeo.translate(0, 0, 0.25);
      const centerHole = new THREE.Mesh(centerHoleGeo, blackMat);
      rotorGroup.add(centerHole);

      groups.set('brake_rotor', rotorGroup);

      // 2. CALIPER MONOBLOC
      const caliperGroup = new THREE.Group();
      caliperGroup.name = 'caliper_body';
      caliperGroup.position.set(0, 2.1, 0);

      const archGeo = new THREE.BoxGeometry(2.4, 0.8, 1.3);
      archGeo.translate(0, 0.35, 0);
      const archMesh = new THREE.Mesh(archGeo, redMat);
      archMesh.castShadow = true;
      caliperGroup.add(archMesh);

      [-0.55, 0.55].forEach((zSide) => {
        const bankGeo = new THREE.BoxGeometry(2.2, 0.9, 0.4);
        bankGeo.translate(0, -0.2, zSide);
        const bankMesh = new THREE.Mesh(bankGeo, redMat);
        bankMesh.castShadow = true;
        caliperGroup.add(bankMesh);

        [-0.6, 0.6].forEach((xPiston) => {
          const pistonGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 20);
          pistonGeo.rotateX(Math.PI / 2);
          const pistonMesh = new THREE.Mesh(pistonGeo, steelMat);
          pistonMesh.position.set(xPiston, -0.2, zSide * 0.65);
          caliperGroup.add(pistonMesh);
        });
      });

      const bleederGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 10);
      bleederGeo.translate(0.8, 0.85, 0.2);
      const bleeder = new THREE.Mesh(bleederGeo, steelMat);
      caliperGroup.add(bleeder);

      groups.set('caliper_body', caliperGroup);

      // 3. BRAKE PADS
      const createPadGroup = (id: string, zPos: number, isInner: boolean) => {
        const padGroup = new THREE.Group();
        padGroup.name = id;
        padGroup.position.set(0, 2.1, zPos);

        const plateGeo = new THREE.BoxGeometry(1.6, 0.65, 0.08);
        const plate = new THREE.Mesh(plateGeo, steelMat);
        plate.castShadow = true;
        padGroup.add(plate);

        const liningGeo = new THREE.BoxGeometry(1.4, 0.55, 0.12);
        liningGeo.translate(0, 0, isInner ? 0.09 : -0.09);
        const lining = new THREE.Mesh(liningGeo, padMat);
        lining.castShadow = true;
        padGroup.add(lining);

        return padGroup;
      };

      groups.set('inner_pad', createPadGroup('inner_pad', -0.42, true));
      groups.set('outer_pad', createPadGroup('outer_pad', 0.42, false));

      // 4. WHEEL HUB
      const hubGroup = new THREE.Group();
      hubGroup.name = 'wheel_hub';
      hubGroup.position.set(0, 0, 0.45);

      const hubNoseGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.65, 28);
      hubNoseGeo.rotateX(Math.PI / 2);
      const hubNose = new THREE.Mesh(hubNoseGeo, aluMat);
      hubNose.castShadow = true;
      hubGroup.add(hubNose);

      const hubFlangeGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.14, 32);
      hubFlangeGeo.rotateX(Math.PI / 2);
      hubFlangeGeo.translate(0, 0, -0.2);
      const hubFlange = new THREE.Mesh(hubFlangeGeo, aluMat);
      hubFlange.castShadow = true;
      hubGroup.add(hubFlange);

      groups.set('wheel_hub', hubGroup);

      // 5. WHEEL STUDS & LUG NUTS (INSTANCED FOR 5 STUDS & 5 HEX NUTS)
      const studsGroup = new THREE.Group();
      studsGroup.name = 'wheel_studs';
      studsGroup.position.set(0, 0, 0.8);

      const studGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 14);
      studGeo.rotateX(Math.PI / 2);
      const studsInstanced = new THREE.InstancedMesh(studGeo, steelMat, 5);

      const nutGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.32, 6); // 6-sided hex nut
      nutGeo.rotateX(Math.PI / 2);
      const nutsInstanced = new THREE.InstancedMesh(nutGeo, steelMat, 5);
      nutsInstanced.castShadow = true;

      for (let s = 0; s < 5; s++) {
        const angle = (s / 5) * Math.PI * 2 - Math.PI / 2;
        const rad = 0.95;
        const x = Math.cos(angle) * rad;
        const y = Math.sin(angle) * rad;

        // Stud
        dummy.position.set(x, y, -0.15);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        studsInstanced.setMatrixAt(s, dummy.matrix);

        // Nut
        dummy.position.set(x, y, 0.15);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        nutsInstanced.setMatrixAt(s, dummy.matrix);
      }

      studsInstanced.instanceMatrix.needsUpdate = true;
      nutsInstanced.instanceMatrix.needsUpdate = true;
      studsGroup.add(studsInstanced);
      studsGroup.add(nutsInstanced);

      groups.set('wheel_studs', studsGroup);

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
