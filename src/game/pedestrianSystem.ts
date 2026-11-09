/**
 * PROJECT NEON CITY - Pedestrian & Ambient Civilian NPC System
 * Manages walking, idling, and crossing pedestrians along sidewalks.
 * Features articulated walk animations, cyberpunk attire, and waypoint corridors.
 */

import * as THREE from 'three';

export interface PedestrianAgent {
  mesh: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  speed: number;
  walkCycle: number;
  isIdling: boolean;
  idleTimer: number;
  waypoints: THREE.Vector3[];
  currentWaypointIdx: number;
}

export class PedestrianSystem {
  public group = new THREE.Group();
  public pedestrians: PedestrianAgent[] = [];

  constructor() {
    this.spawnPedestrians();
  }

  private createPedestrianMesh(outfitColor: number, visorColor: number) {
    const root = new THREE.Group();

    // Materials
    const coatMat = new THREE.MeshStandardMaterial({
      color: outfitColor,
      roughness: 0.7,
      metalness: 0.2,
    });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x222630, roughness: 0.5 });
    const visorMat = new THREE.MeshStandardMaterial({
      color: visorColor,
      emissive: visorColor,
      emissiveIntensity: 1.8,
    });
    const limbMat = new THREE.MeshStandardMaterial({ color: 0x11141c, roughness: 0.8 });

    // Torso / Jacket
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.3), coatMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    root.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.32), skinMat);
    head.position.y = 1.72;
    head.castShadow = true;
    root.add(head);

    // Visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.08), visorMat);
    visor.position.set(0, 1.73, 0.18);
    root.add(visor);

    // Left & Right Arms (Pivoted from shoulder)
    const armGeo = new THREE.BoxGeometry(0.12, 0.6, 0.14);
    const leftArm = new THREE.Mesh(armGeo, coatMat);
    leftArm.position.set(-0.32, 1.15, 0);
    leftArm.castShadow = true;
    root.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, coatMat);
    rightArm.position.set(0.32, 1.15, 0);
    rightArm.castShadow = true;
    root.add(rightArm);

    // Left & Right Legs
    const legGeo = new THREE.BoxGeometry(0.16, 0.75, 0.18);
    const leftLeg = new THREE.Mesh(legGeo, limbMat);
    leftLeg.position.set(-0.16, 0.4, 0);
    leftLeg.castShadow = true;
    root.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, limbMat);
    rightLeg.position.set(0.16, 0.4, 0);
    rightLeg.castShadow = true;
    root.add(rightLeg);

    return { root, leftLeg, rightLeg, leftArm, rightArm };
  }

  private spawnPedestrians() {
    const palette = [
      { coat: 0x1a233a, visor: 0x00f0ff },
      { coat: 0x2b1424, visor: 0xff007f },
      { coat: 0x242416, visor: 0xffaa00 },
      { coat: 0x12241e, visor: 0x00ff88 },
      { coat: 0x221a30, visor: 0x7f00ff },
      { coat: 0x303038, visor: 0x5ce1e6 },
    ];

    // Sidewalk navigation routes across the expanded city grid
    const routes: THREE.Vector3[][] = [
      // Route 1: Main East Sidewalk North-South
      [
        new THREE.Vector3(16, 0, -180),
        new THREE.Vector3(16, 0, -50),
        new THREE.Vector3(16, 0, 50),
        new THREE.Vector3(16, 0, 180),
      ],
      // Route 2: Main West Sidewalk South-North
      [
        new THREE.Vector3(-16, 0, 180),
        new THREE.Vector3(-16, 0, 50),
        new THREE.Vector3(-16, 0, -50),
        new THREE.Vector3(-16, 0, -180),
      ],
      // Route 3: Crossway South Sidewalk
      [
        new THREE.Vector3(-180, 0, -85),
        new THREE.Vector3(-30, 0, -85),
        new THREE.Vector3(30, 0, -85),
        new THREE.Vector3(180, 0, -85),
      ],
      // Route 4: Crossway North Sidewalk
      [
        new THREE.Vector3(180, 0, 85),
        new THREE.Vector3(30, 0, 85),
        new THREE.Vector3(-30, 0, 85),
        new THREE.Vector3(-180, 0, 85),
      ],
      // Route 5: Central Plaza Walkway
      [
        new THREE.Vector3(-45, 0, -20),
        new THREE.Vector3(-60, 0, 0),
        new THREE.Vector3(-45, 0, 20),
        new THREE.Vector3(-30, 0, 0),
      ],
    ];

    // Spawn 28 walking pedestrians
    for (let i = 0; i < 28; i++) {
      const p = palette[i % palette.length];
      const { root, leftLeg, rightLeg, leftArm, rightArm } = this.createPedestrianMesh(p.coat, p.visor);

      const route = routes[i % routes.length];
      const startWp = i % route.length;
      const startPos = route[startWp].clone().add(
        new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5)
      );

      root.position.copy(startPos);
      this.group.add(root);

      this.pedestrians.push({
        mesh: root,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        speed: 1.2 + Math.random() * 0.7,
        walkCycle: Math.random() * Math.PI * 2,
        isIdling: false,
        idleTimer: 0,
        waypoints: route,
        currentWaypointIdx: (startWp + 1) % route.length,
      });
    }

    // Spawn 8 Idling NPCs (talking, checking holograms outside storefronts)
    const idleLocations = [
      { x: 17.5, z: 25, rot: -Math.PI / 2 },
      { x: 17.5, z: 27, rot: Math.PI / 2 },
      { x: -17.5, z: -35, rot: Math.PI / 2 },
      { x: -17.5, z: 45, rot: -Math.PI / 4 },
      { x: 55, z: -85, rot: 0 },
      { x: -55, z: 85, rot: Math.PI },
      { x: -48, z: 10, rot: Math.PI / 3 },
      { x: -48, z: -10, rot: -Math.PI / 3 },
    ];

    idleLocations.forEach((loc, idx) => {
      const p = palette[(idx + 2) % palette.length];
      const { root, leftLeg, rightLeg, leftArm, rightArm } = this.createPedestrianMesh(p.coat, p.visor);
      root.position.set(loc.x, 0, loc.z);
      root.rotation.y = loc.rot;
      this.group.add(root);

      this.pedestrians.push({
        mesh: root,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        speed: 0,
        walkCycle: 0,
        isIdling: true,
        idleTimer: 99999,
        waypoints: [],
        currentWaypointIdx: 0,
      });
    });
  }

  public update(dt: number) {
    for (const ped of this.pedestrians) {
      if (ped.isIdling) {
        // Subtle breathing / weight shift
        ped.walkCycle += dt * 1.5;
        ped.mesh.position.y = Math.sin(ped.walkCycle) * 0.02;
        continue;
      }

      const targetWp = ped.waypoints[ped.currentWaypointIdx];
      const toTarget = targetWp.clone().sub(ped.mesh.position);
      toTarget.y = 0;
      const dist = toTarget.length();

      if (dist < 1.8) {
        // Next waypoint
        ped.currentWaypointIdx = (ped.currentWaypointIdx + 1) % ped.waypoints.length;
      } else {
        toTarget.normalize();
        ped.mesh.position.addScaledVector(toTarget, ped.speed * dt);

        // Face movement direction
        const targetYaw = Math.atan2(toTarget.x, toTarget.z);
        ped.mesh.rotation.y = targetYaw;

        // Animate legs and arms
        ped.walkCycle += dt * ped.speed * 4.2;
        const swing = Math.sin(ped.walkCycle) * 0.55;

        ped.leftLeg.rotation.x = swing;
        ped.rightLeg.rotation.x = -swing;
        ped.leftArm.rotation.x = -swing * 0.8;
        ped.rightArm.rotation.x = swing * 0.8;

        // Vertical bobbing
        ped.mesh.position.y = Math.abs(Math.sin(ped.walkCycle)) * 0.05;
      }
    }
  }
}
