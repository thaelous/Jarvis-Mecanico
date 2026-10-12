import * as THREE from 'three';

// 1. Procedural Fine Concentric Rotor Grooves (Lathe Turned / Brushed Disc)
export function createConcentricBrakeRotorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Draw hundreds of fine concentric micro-grooves
    for (let r = 10; r < size * 0.72; r += 0.8) {
      const noise = (Math.random() - 0.5) * 45;
      const wave = Math.sin(r * 8) * 15;
      const val = Math.min(255, Math.max(0, Math.floor(128 + wave + noise)));
      ctx.strokeStyle = `rgb(${val},${val},${val})`;
      ctx.lineWidth = 0.75 + Math.random() * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 2. Procedural Porous Cast Iron Roughness & Micro-Grain Texture (Caliper & Housing)
export function createCastIronPorousTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(0, 0, size, size);
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Dark micro-grains and porous roughness variation (roughness ~0.65)
      const isGrain = Math.random() < 0.18;
      const val = isGrain
        ? Math.floor(20 + Math.random() * 60)
        : Math.floor(130 + (Math.random() - 0.5) * 50);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 3. Linear Brushed CNC Metal Bump Canvas Texture
export function createBrushedMetalBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y++) {
      const val = Math.floor(115 + Math.random() * 35);
      ctx.fillStyle = `rgb(${val},${val},${val})`;
      ctx.fillRect(0, y, size, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// Complete realistic PBR material library with procedural in-memory CanvasTextures
export function createMaterialLibrary() {
  const materials = new Map<string, THREE.Material>();
  const linearBump = createBrushedMetalBumpTexture();
  const rotorTexture = createConcentricBrakeRotorTexture();
  const porousTexture = createCastIronPorousTexture();

  // 1. Mirror Polished Chrome & Hardened Steel Shafts (metalness: 0.95, roughness: 0.15)
  materials.set(
    'steel_polished',
    new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.15,
      bumpMap: linearBump,
      bumpScale: 0.008,
      envMapIntensity: 1.8,
    })
  );

  materials.set(
    'chrome_rod',
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.10,
      envMapIntensity: 2.2,
    })
  );

  // 2. Ventilated Brake Rotor Disc (Concentric lathe brushed grooves)
  materials.set(
    'cast_iron',
    new THREE.MeshStandardMaterial({
      color: 0xc8d1dc,
      metalness: 0.88,
      roughness: 0.28,
      bumpMap: rotorTexture,
      bumpScale: 0.035,
      envMapIntensity: 1.5,
    })
  );

  // 3. Porous Cast Iron Housing & Caliper (roughness: 0.65, dark micro-grains)
  materials.set(
    'cast_iron_rough',
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.55,
      roughness: 0.65,
      roughnessMap: porousTexture,
      bumpMap: porousTexture,
      bumpScale: 0.025,
      envMapIntensity: 1.0,
    })
  );

  // 4. Anodized / Powder Coated Racing Caliper Red (semi-gloss finish)
  materials.set(
    'anodized_red',
    new THREE.MeshStandardMaterial({
      color: 0xd92323,
      metalness: 0.35,
      roughness: 0.32,
      roughnessMap: porousTexture,
      bumpMap: porousTexture,
      bumpScale: 0.015,
      envMapIntensity: 1.4,
    })
  );

  // 5. Machined Lightweight Aluminum (Piston crown, top mounts, wheel hub)
  materials.set(
    'aluminum_machined',
    new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.82,
      roughness: 0.24,
      bumpMap: linearBump,
      bumpScale: 0.012,
      envMapIntensity: 1.6,
    })
  );

  // 6. Forged H-Beam Steel (Connecting rod body, axle flanges)
  materials.set(
    'forged_steel',
    new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.85,
      roughness: 0.35,
      bumpMap: linearBump,
      bumpScale: 0.02,
      envMapIntensity: 1.2,
    })
  );

  // 7. Phosphor Bronze & Brass (Bushings, synchro rings)
  materials.set(
    'bronze',
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.75,
      roughness: 0.30,
      bumpMap: linearBump,
      bumpScale: 0.015,
      envMapIntensity: 1.4,
    })
  );

  // 8. Ceramic Friction Compound (Brake pads)
  materials.set(
    'friction_compound',
    new THREE.MeshStandardMaterial({
      color: 0x27292e,
      metalness: 0.15,
      roughness: 0.85,
      roughnessMap: porousTexture,
      bumpMap: porousTexture,
      bumpScale: 0.03,
      envMapIntensity: 0.8,
    })
  );

  // 9. Chrome Ball Bearings (Mirror finish)
  materials.set(
    'chrome_bearing',
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.98,
      roughness: 0.08,
      envMapIntensity: 2.2,
    })
  );

  // 10. Black Oxide Treated Bolt Steel
  materials.set(
    'black_oxide',
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.65,
      roughness: 0.38,
      envMapIntensity: 1.1,
    })
  );

  // 11. Titanium Gold Accent (Crown bevel teeth, synchro gears)
  materials.set(
    'titanium_gold',
    new THREE.MeshStandardMaterial({
      color: 0xdfad36,
      metalness: 0.92,
      roughness: 0.22,
      bumpMap: linearBump,
      bumpScale: 0.015,
      envMapIntensity: 1.6,
    })
  );

  // 12. Electrostatic Powder Coat Red (Coil spring)
  materials.set(
    'spring_red',
    new THREE.MeshStandardMaterial({
      color: 0xd92323,
      metalness: 0.28,
      roughness: 0.26,
      envMapIntensity: 1.3,
    })
  );

  return materials;
}

// Create Ghost Target Material with theme awareness
// Dark Mode: Cyan Neon (#00e5ff) with opacity 0.35
// Light Mode: Deep Cobalt Blue (#1d4ed8) with reinforced opacity 0.82
export function createGhostMaterial(isLight = false): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: isLight ? 0x1d4ed8 : 0x00e5ff,
    wireframe: true,
    transparent: true,
    opacity: isLight ? 0.82 : 0.35,
    depthWrite: false,
  });
}

// Create Laser Guide Line Material with theme awareness
export function createGuideLineMaterial(isLight = false): THREE.LineDashedMaterial {
  return new THREE.LineDashedMaterial({
    color: isLight ? 0x1d4ed8 : 0x00e5ff,
    dashSize: 0.15,
    gapSize: 0.08,
    transparent: true,
    opacity: isLight ? 0.9 : 0.85,
  });
}

// Vector Edges Outline Material for CAD crispness at distance:
// Dark Mode: bright cyan/steel (#67e8f9 / #38bdf8) with opacity 0.85
// Light Mode: dark navy blue (#0f172a / #1e3a8a) with opacity 0.9
export function createEdgeOutlineMaterial(isLight = false): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: isLight ? 0x0f172a : 0x67e8f9,
    transparent: true,
    opacity: isLight ? 0.90 : 0.85,
    depthTest: true,
  });
}

// Snap Indicator Flash Material
export function createSnapPulseMaterial(): THREE.Material {
  return new THREE.MeshBasicMaterial({
    color: 0x10b981,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
}

// Blueprint Wireframe Material
export function createBlueprintMaterial(): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    wireframe: true,
    transparent: true,
    opacity: 0.8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
  });
}

// Blueprint Holographic Solid
export function createHologramMaterial(): THREE.Material {
  return new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.45,
    roughness: 0.3,
    metalness: 0.2,
    transmission: 0.6,
    ior: 1.2,
    emissive: 0x0891b2,
    emissiveIntensity: 0.4,
    wireframe: false,
  });
}

// X-Ray Mode Material: Semitransparent (opacity 0.35) with internal illumination
export function createXRayMaterial(): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.35,
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}
