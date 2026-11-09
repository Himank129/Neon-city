/**
 * PROJECT NEON CITY - Autonomous Traffic, Traffic Lights & Civilian Vehicles
 * Simulates AI civilian vehicles navigating road networks, stopping at red traffic lights,
 * rotating wheels, parked cars in bays, and aerial patrol drones.
 */

import * as THREE from 'three';

export interface TrafficVehicle {
  mesh: THREE.Group;
  wheels: THREE.Mesh[];
  speed: number;
  targetSpeed: number;
  maxSpeed: number;
  route: THREE.Vector3[];
  currentWaypointIdx: number;
  braking: boolean;
  taillightMat: THREE.MeshStandardMaterial;
}

export interface TrafficLight {
  mesh: THREE.Group;
  position: THREE.Vector3;
  direction: 'north-south' | 'east-west';
  redBulb: THREE.Mesh;
  amberBulb: THREE.Mesh;
  greenBulb: THREE.Mesh;
}

export class TrafficSystem {
  public group = new THREE.Group();
  public vehicles: TrafficVehicle[] = [];
  public trafficLights: TrafficLight[] = [];
  public drones: { mesh: THREE.Group; angle: number; radius: number; height: number; speed: number }[] = [];

  // Traffic Light Timing State Machine
  private lightTimer = 0;
  private isNorthSouthGreen = true;
  private isAmber = false;

  constructor() {
    this.createTrafficLights();
    this.spawnCivilianVehicles();
    this.spawnParkedVehicles();
    this.spawnPatrolDrones();
  }

  private createTrafficLights() {
    // 4 Main Intersections
    const intersectionCoords = [
      { x: 0, z: -90 },
      { x: 0, z: 90 },
      { x: -85, z: 0 },
      { x: 85, z: 0 },
    ];

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1f232e, roughness: 0.6, metalness: 0.8 });
    const housingMat = new THREE.MeshStandardMaterial({ color: 0x0c0f17, roughness: 0.7 });

    intersectionCoords.forEach((coord) => {
      // Create 2 poles per intersection (one for NS, one for EW)
      const configs = [
        { offsetX: 13, offsetZ: 13, dir: 'north-south' as const, rot: 0 },
        { offsetX: -13, offsetZ: -13, dir: 'east-west' as const, rot: Math.PI / 2 },
      ];

      configs.forEach((cfg) => {
        const lightGroup = new THREE.Group();

        // Vertical Pole
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 7.5, 8), poleMat);
        pole.position.y = 3.75;
        pole.castShadow = true;
        lightGroup.add(pole);

        // Horizontal Arm
        const arm = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 0.2), poleMat);
        arm.position.set(-2.0, 7.2, 0);
        lightGroup.add(arm);

        // Light Housing
        const housing = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.8, 0.5), housingMat);
        housing.position.set(-3.8, 6.8, 0);
        housing.castShadow = true;
        lightGroup.add(housing);

        // Bulbs
        const redMat = new THREE.MeshStandardMaterial({ color: 0x330005, emissive: 0xff0033, emissiveIntensity: 2.5 });
        const amberMat = new THREE.MeshStandardMaterial({ color: 0x221500, emissive: 0x000000, emissiveIntensity: 0 });
        const greenMat = new THREE.MeshStandardMaterial({ color: 0x002211, emissive: 0x000000, emissiveIntensity: 0 });

        const bulbGeo = new THREE.SphereGeometry(0.18, 8, 8);

        const redBulb = new THREE.Mesh(bulbGeo, redMat);
        redBulb.position.set(-3.8, 7.3, 0.26);
        lightGroup.add(redBulb);

        const amberBulb = new THREE.Mesh(bulbGeo, amberMat);
        amberBulb.position.set(-3.8, 6.8, 0.26);
        lightGroup.add(amberBulb);

        const greenBulb = new THREE.Mesh(bulbGeo, greenMat);
        greenBulb.position.set(-3.8, 6.3, 0.26);
        lightGroup.add(greenBulb);

        lightGroup.position.set(coord.x + cfg.offsetX, 0, coord.z + cfg.offsetZ);
        lightGroup.rotation.y = cfg.rot;
        this.group.add(lightGroup);

        this.trafficLights.push({
          mesh: lightGroup,
          position: new THREE.Vector3(coord.x, 0, coord.z),
          direction: cfg.dir,
          redBulb,
          amberBulb,
          greenBulb,
        });
      });
    });
  }

  private createCivilianCarMesh(bodyColor: number, isTaxi: boolean = false) {
    const car = new THREE.Group();

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      metalness: 0.75,
      roughness: 0.3,
    });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 4.2), bodyMat);
    chassis.position.y = 0.55;
    chassis.castShadow = true;
    car.add(chassis);

    // Cabin
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x050a12, metalness: 0.95, roughness: 0.1 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.52, 2.3), glassMat);
    cabin.position.set(0, 1.05, -0.2);
    cabin.castShadow = true;
    car.add(cabin);

    // Taxi Signboard if applicable
    if (isTaxi) {
      const taxiSignMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xffaa00,
        emissiveIntensity: 1.8,
      });
      const taxiSign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.3), taxiSignMat);
      taxiSign.position.set(0, 1.4, -0.2);
      car.add(taxiSign);
    }

    // Headlights
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x99f6ff, emissiveIntensity: 2.5 });
    [-0.7, 0.7].forEach((x) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.1), headMat);
      hl.position.set(x, 0.6, 2.12);
      car.add(hl);
    });

    // Taillights
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0x330005,
      emissive: 0xff0033,
      emissiveIntensity: 1.2,
    });
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.1), tailMat);
    tl.position.set(0, 0.7, -2.12);
    car.add(tl);

    // Wheels
    const wheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    [
      { x: -1.02, z: 1.3 },
      { x: 1.02, z: 1.3 },
      { x: -1.02, z: -1.3 },
      { x: 1.02, z: -1.3 },
    ].forEach((pos) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(pos.x, 0.36, pos.z);
      w.castShadow = true;
      car.add(w);
      wheels.push(w);
    });

    return { car, wheels, tailMat };
  }

  private spawnCivilianVehicles() {
    // 4 Continuous Driving Loops across the multi-block grid
    const routes: THREE.Vector3[][] = [
      // Loop 1: Main North-South Central Corridor (Southbound lane X = -5)
      [
        new THREE.Vector3(-5, 0, -220),
        new THREE.Vector3(-5, 0, -90),
        new THREE.Vector3(-5, 0, 0),
        new THREE.Vector3(-5, 0, 90),
        new THREE.Vector3(-5, 0, 220),
        new THREE.Vector3(5, 0, 220),
        new THREE.Vector3(5, 0, 90),
        new THREE.Vector3(5, 0, 0),
        new THREE.Vector3(5, 0, -90),
        new THREE.Vector3(5, 0, -220),
      ],
      // Loop 2: West Boulevard Corridor (X = -85)
      [
        new THREE.Vector3(-90, 0, -220),
        new THREE.Vector3(-90, 0, 0),
        new THREE.Vector3(-90, 0, 220),
        new THREE.Vector3(-80, 0, 220),
        new THREE.Vector3(-80, 0, 0),
        new THREE.Vector3(-80, 0, -220),
      ],
      // Loop 3: East Boulevard Corridor (X = +85)
      [
        new THREE.Vector3(80, 0, 220),
        new THREE.Vector3(80, 0, 0),
        new THREE.Vector3(80, 0, -220),
        new THREE.Vector3(90, 0, -220),
        new THREE.Vector3(90, 0, 0),
        new THREE.Vector3(90, 0, 220),
      ],
      // Loop 4: East-West Central Crossway (Z = 0)
      [
        new THREE.Vector3(-220, 0, -5),
        new THREE.Vector3(0, 0, -5),
        new THREE.Vector3(220, 0, -5),
        new THREE.Vector3(220, 0, 5),
        new THREE.Vector3(0, 0, 5),
        new THREE.Vector3(-220, 0, 5),
      ],
    ];

    const carStyles = [
      { color: 0x0f1826, isTaxi: false }, // Cyber sedan
      { color: 0xcc8800, isTaxi: true },  // Cyber taxi
      { color: 0x221122, isTaxi: false }, // Dark purple coupe
      { color: 0x1a241e, isTaxi: false }, // Forest metallic sedan
      { color: 0xd9e2ec, isTaxi: false }, // Platinum white sedan
      { color: 0xcc8800, isTaxi: true },  // Cyber taxi
      { color: 0x2d1115, isTaxi: false }, // Crimson sport sedan
      { color: 0x111625, isTaxi: false }, // Midnight executive
    ];

    // Spawn 12 autonomous civilian cars
    for (let i = 0; i < 12; i++) {
      const style = carStyles[i % carStyles.length];
      const { car, wheels, tailMat } = this.createCivilianCarMesh(style.color, style.isTaxi);

      const route = routes[i % routes.length];
      const startWp = (i * 2) % route.length;
      const startPos = route[startWp].clone();

      car.position.copy(startPos);
      this.group.add(car);

      this.vehicles.push({
        mesh: car,
        wheels,
        speed: 0,
        targetSpeed: 14 + Math.random() * 6, // 50-70 km/h
        maxSpeed: 20,
        route,
        currentWaypointIdx: (startWp + 1) % route.length,
        braking: false,
        taillightMat: tailMat,
      });
    }
  }

  private spawnParkedVehicles() {
    const parkedSpots = [
      { x: -13, z: 28, rot: 0, color: 0x1f2937 },
      { x: -13, z: 42, rot: 0, color: 0x00f0ff },
      { x: -13, z: -55, rot: 0, color: 0x475569 },
      { x: 13, z: -70, rot: Math.PI, color: 0xff0055 },
      { x: 13, z: 65, rot: Math.PI, color: 0x1e1b4b },
      { x: -70, z: -13, rot: Math.PI / 2, color: 0x064e3b },
      { x: -110, z: -13, rot: Math.PI / 2, color: 0x78350f },
      { x: 70, z: 13, rot: -Math.PI / 2, color: 0x312e81 },
      { x: 110, z: 13, rot: -Math.PI / 2, color: 0x18181b },
    ];

    parkedSpots.forEach((spot) => {
      const { car } = this.createCivilianCarMesh(spot.color, false);
      car.position.set(spot.x, 0, spot.z);
      car.rotation.y = spot.rot;
      this.group.add(car);
    });
  }

  private spawnPatrolDrones() {
    const droneMat = new THREE.MeshStandardMaterial({ color: 0x1e2430, metalness: 0.9, roughness: 0.2 });
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.0,
    });

    const droneConfigs = [
      { radius: 60, height: 26, speed: 0.25 },
      { radius: 95, height: 32, speed: -0.2 },
    ];

    droneConfigs.forEach((cfg) => {
      const droneGroup = new THREE.Group();

      // Central Pod
      const pod = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 1.8), droneMat);
      droneGroup.add(pod);

      // Glowing Eye Lens
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), glowMat);
      lens.position.set(0, -0.22, 0.6);
      droneGroup.add(lens);

      // 4 Rotor Arms
      [
        { x: -1.2, z: -1.2 },
        { x: 1.2, z: -1.2 },
        { x: -1.2, z: 1.2 },
        { x: 1.2, z: 1.2 },
      ].forEach((pos) => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 1.0), droneMat);
        arm.position.set(pos.x * 0.6, 0.1, pos.z * 0.6);
        droneGroup.add(arm);

        const rotorRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.42, 0.04, 6, 12),
          glowMat
        );
        rotorRing.rotation.x = Math.PI / 2;
        rotorRing.position.set(pos.x, 0.15, pos.z);
        droneGroup.add(rotorRing);
      });

      this.group.add(droneGroup);
      this.drones.push({
        mesh: droneGroup,
        angle: Math.random() * Math.PI * 2,
        radius: cfg.radius,
        height: cfg.height,
        speed: cfg.speed,
      });
    });
  }

  public update(dt: number) {
    // 1. Traffic Light State Cycle
    this.lightTimer += dt;
    if (this.lightTimer > 10) {
      this.lightTimer = 0;
      this.isNorthSouthGreen = !this.isNorthSouthGreen;
    }
    this.isAmber = this.lightTimer > 8; // Amber for last 2 seconds of phase

    for (const tl of this.trafficLights) {
      const isMyGreen =
        (tl.direction === 'north-south' && this.isNorthSouthGreen) ||
        (tl.direction === 'east-west' && !this.isNorthSouthGreen);

      if (this.isAmber) {
        tl.redBulb.material = this.createBulbMat(0x220000, 0x000000, 0);
        tl.amberBulb.material = this.createBulbMat(0xffaa00, 0xffaa00, 2.5);
        tl.greenBulb.material = this.createBulbMat(0x002200, 0x000000, 0);
      } else if (isMyGreen) {
        tl.redBulb.material = this.createBulbMat(0x220000, 0x000000, 0);
        tl.amberBulb.material = this.createBulbMat(0x221100, 0x000000, 0);
        tl.greenBulb.material = this.createBulbMat(0x00ff88, 0x00ff88, 2.5);
      } else {
        tl.redBulb.material = this.createBulbMat(0xff0033, 0xff0033, 2.5);
        tl.amberBulb.material = this.createBulbMat(0x221100, 0x000000, 0);
        tl.greenBulb.material = this.createBulbMat(0x002200, 0x000000, 0);
      }
    }

    // 2. Autonomous Vehicle Movement & Traffic Light Compliance
    for (const veh of this.vehicles) {
      const targetWp = veh.route[veh.currentWaypointIdx];
      const toTarget = targetWp.clone().sub(veh.mesh.position);
      toTarget.y = 0;
      const dist = toTarget.length();

      // Check if near an intersection with red traffic light
      let shouldStop = false;
      for (const tl of this.trafficLights) {
        const distToLight = veh.mesh.position.distanceTo(tl.position);
        if (distToLight < 22 && distToLight > 4) {
          const isRed =
            (tl.direction === 'north-south' && !this.isNorthSouthGreen) ||
            (tl.direction === 'east-west' && this.isNorthSouthGreen) ||
            this.isAmber;
          if (isRed) {
            shouldStop = true;
            break;
          }
        }
      }

      // Smooth acceleration / braking
      if (shouldStop) {
        veh.speed = Math.max(0, veh.speed - 18 * dt);
        veh.braking = true;
      } else {
        veh.speed = Math.min(veh.targetSpeed, veh.speed + 10 * dt);
        veh.braking = false;
      }

      veh.taillightMat.emissiveIntensity = veh.braking ? 3.0 : 1.2;

      if (dist < 4.0) {
        veh.currentWaypointIdx = (veh.currentWaypointIdx + 1) % veh.route.length;
      } else if (veh.speed > 0.1) {
        toTarget.normalize();
        veh.mesh.position.addScaledVector(toTarget, veh.speed * dt);

        const targetYaw = Math.atan2(toTarget.x, toTarget.z);
        veh.mesh.rotation.y += (targetYaw - veh.mesh.rotation.y) * Math.min(1.0, dt * 6);

        // Spin wheels
        const spin = (veh.speed / 0.36) * dt;
        veh.wheels.forEach((w) => (w.rotation.x += spin));
      }
    }

    // 3. Drone Patrols
    for (const drone of this.drones) {
      drone.angle += drone.speed * dt;
      drone.mesh.position.set(
        Math.sin(drone.angle) * drone.radius,
        drone.height + Math.sin(drone.angle * 2) * 1.5,
        Math.cos(drone.angle) * drone.radius
      );
      drone.mesh.rotation.y = drone.angle + Math.PI / 2;
    }
  }

  private createBulbMat(color: number, emissive: number, intensity: number) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: intensity,
    });
  }
}
