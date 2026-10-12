import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export interface PhysicsBodyConfig {
  partId: string;
  shapeType: 'box' | 'cylinder' | 'sphere';
  size: [number, number, number]; // [width, height, depth] or [radiusTop, radiusBottom, height] or [radius, 0, 0]
  mass: number;
  initialPosition: [number, number, number];
  initialRotation?: [number, number, number];
}

export class PhysicsWorld {
  public world: CANNON.World;
  public bodies: Map<string, CANNON.Body> = new Map();
  public enabled: boolean = false;
  private floorBody: CANNON.Body;
  private defaultMaterial: CANNON.Material;

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    // Solver iterations for stable mechanical resting
    this.world.defaultContactMaterial.contactEquationStiffness = 1e7;
    this.world.defaultContactMaterial.contactEquationRelaxation = 3;
    if ('iterations' in this.world.solver) {
      (this.world.solver as unknown as { iterations: number }).iterations = 10;
    }

    // Materials with realistic metallic friction and slight restitution
    this.defaultMaterial = new CANNON.Material('metal');
    const groundMaterial = new CANNON.Material('floor');

    const contactMaterial = new CANNON.ContactMaterial(this.defaultMaterial, groundMaterial, {
      friction: 0.4,
      restitution: 0.25, // metallic clunk bounce
    });
    this.world.addContactMaterial(contactMaterial);

    const metalContact = new CANNON.ContactMaterial(this.defaultMaterial, this.defaultMaterial, {
      friction: 0.35,
      restitution: 0.2,
    });
    this.world.addContactMaterial(metalContact);

    // Workbench floor plane at y = -3.15
    const floorShape = new CANNON.Plane();
    this.floorBody = new CANNON.Body({
      mass: 0, // static
      material: groundMaterial,
    });
    this.floorBody.addShape(floorShape);
    // In Cannon.js, Plane faces +Z by default; rotate it so it faces +Y
    this.floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.floorBody.position.set(0, -3.15, 0);
    this.world.addBody(this.floorBody);
  }

  // Register a mechanical part with physics bounds
  public registerPart(config: PhysicsBodyConfig) {
    let shape: CANNON.Shape;

    if (config.shapeType === 'sphere') {
      shape = new CANNON.Sphere(config.size[0]);
    } else if (config.shapeType === 'cylinder') {
      // CANNON.Cylinder has radiusTop, radiusBottom, height, numSegments
      shape = new CANNON.Cylinder(config.size[0], config.size[1], config.size[2], 16);
    } else {
      // CANNON.Box expects half-extents
      shape = new CANNON.Box(
        new CANNON.Vec3(config.size[0] / 2, config.size[1] / 2, config.size[2] / 2)
      );
    }

    const body = new CANNON.Body({
      mass: config.mass,
      material: this.defaultMaterial,
      linearDamping: 0.05,
      angularDamping: 0.1,
    });
    body.addShape(shape);
    body.position.set(
      config.initialPosition[0],
      config.initialPosition[1],
      config.initialPosition[2]
    );

    if (config.initialRotation) {
      body.quaternion.setFromEuler(
        config.initialRotation[0],
        config.initialRotation[1],
        config.initialRotation[2]
      );
    }

    // Default to kinematic / sleep when attached
    body.type = CANNON.Body.KINEMATIC;
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);

    this.world.addBody(body);
    this.bodies.set(config.partId, body);
  }

  // Remove all part bodies when model changes
  public clearParts() {
    this.bodies.forEach((body) => {
      this.world.removeBody(body);
    });
    this.bodies.clear();
  }

  // Step physics simulation
  public update(deltaTime: number) {
    if (!this.enabled) return;
    const clampedDelta = Math.min(deltaTime, 0.05);
    this.world.step(1 / 60, clampedDelta, 3);
  }

  // Synchronize body to Three.js mesh when user drags it
  public syncBodyFromMesh(partId: string, meshGroup: THREE.Group) {
    const body = this.bodies.get(partId);
    if (!body) return;

    body.position.set(meshGroup.position.x, meshGroup.position.y, meshGroup.position.z);
    body.quaternion.set(
      meshGroup.quaternion.x,
      meshGroup.quaternion.y,
      meshGroup.quaternion.z,
      meshGroup.quaternion.w
    );
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
    body.type = CANNON.Body.KINEMATIC;
  }

  // Synchronize Three.js mesh from body when falling/colliding
  public syncMeshFromBody(partId: string, meshGroup: THREE.Group): boolean {
    const body = this.bodies.get(partId);
    if (!body || body.type === CANNON.Body.KINEMATIC) return false;

    meshGroup.position.set(body.position.x, body.position.y, body.position.z);
    meshGroup.quaternion.set(
      body.quaternion.x,
      body.quaternion.y,
      body.quaternion.z,
      body.quaternion.w
    );
    return true;
  }

  // Enable gravity and dynamic collisions for a detached part
  public releaseToPhysics(partId: string, meshGroup: THREE.Group) {
    const body = this.bodies.get(partId);
    if (!body) return;

    body.position.set(meshGroup.position.x, meshGroup.position.y, meshGroup.position.z);
    body.quaternion.set(
      meshGroup.quaternion.x,
      meshGroup.quaternion.y,
      meshGroup.quaternion.z,
      meshGroup.quaternion.w
    );
    body.type = CANNON.Body.DYNAMIC;
    body.wakeUp();
  }

  // Lock a part into kinematic solid when snapped
  public lockToKinematic(partId: string, targetPos: [number, number, number], targetRot: [number, number, number]) {
    const body = this.bodies.get(partId);
    if (!body) return;

    body.type = CANNON.Body.KINEMATIC;
    body.position.set(targetPos[0], targetPos[1], targetPos[2]);
    body.quaternion.setFromEuler(targetRot[0], targetRot[1], targetRot[2]);
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
  }
}
