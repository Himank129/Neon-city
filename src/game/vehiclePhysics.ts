/**
 * PROJECT NEON CITY - Forza Horizon-Inspired Vehicle Physics & High-Fidelity 3D Model
 * Upgraded 14-part procedural sports car with detailed cockpit interior, bucket seats,
 * holographic dashboard, active aero wing, quad exhausts, brake calipers, and drift mechanics.
 */

import * as THREE from 'three';
import { sounds } from './audio';

export class VehicleController {
  public mesh: THREE.Group;
  public wheels: THREE.Group[] = [];
  public headlights: THREE.SpotLight[] = [];
  public underglowMat: THREE.MeshBasicMaterial;
  public taillightMat: THREE.MeshStandardMaterial;

  // Transform & Kinematics
  public position = new THREE.Vector3(0, 0, 10);
  public yaw = 0;
  public speed = 0; // m/s (1 m/s = 3.6 km/h)
  public steeringAngle = 0;
  public driftAngle = 0;
  public isPlayerOccupied = false;
  public headlightsOn = true;

  // Vehicle Stats
  public readonly maxSpeed = 55; // ~200 km/h
  public readonly acceleration = 22; // m/s^2
  public readonly brakePower = 40;
  public readonly reverseMaxSpeed = 15;
  public readonly wheelBase = 2.8;

  // Suspension & Visual Physics
  private pitchSquat = 0;
  private rollLean = 0;

  constructor() {
    this.mesh = new THREE.Group();
    this.underglowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85,
    });
    this.taillightMat = new THREE.MeshStandardMaterial({
      color: 0x330005,
      emissive: 0xff0033,
      emissiveIntensity: 1.4,
      roughness: 0.25,
    });

    this.buildHighDetailCarModel();
  }

  private buildHighDetailCarModel() {
    // Material definitions
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      metalness: 0.9,
      roughness: 0.2,
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.5,
      metalness: 0.6,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x020509,
      metalness: 0.95,
      roughness: 0.08,
      transparent: true,
      opacity: 0.85,
    });
    const interiorMat = new THREE.MeshStandardMaterial({
      color: 0x151821,
      roughness: 0.8,
    });
    const dashGlowMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.2,
    });
    const caliperMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.8,
    });

    // 1. Lower Chassis & Aerodynamic Floor Pan
    const chassisGeo = new THREE.BoxGeometry(2.1, 0.45, 4.5);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.48;
    chassis.castShadow = true;
    this.mesh.add(chassis);

    // Flared Wheel Arches (Front & Rear)
    [-1.08, 1.08].forEach((x) => {
      const frontArch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.48, 1.3), bodyMat);
      frontArch.position.set(x, 0.55, 1.35);
      frontArch.castShadow = true;
      this.mesh.add(frontArch);

      const rearArch = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.52, 1.4), bodyMat);
      rearArch.position.set(x, 0.57, -1.35);
      rearArch.castShadow = true;
      this.mesh.add(rearArch);
    });

    // 2. Sculpted Cabin Cockpit Canopy
    const cabinGeo = new THREE.BoxGeometry(1.65, 0.48, 2.3);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.96, -0.25);
    cabin.castShadow = true;
    this.mesh.add(cabin);

    // Windshield Roof Rails / A-Pillars
    [-0.8, 0.8].forEach((x) => {
      const aPillar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 2.32), carbonMat);
      aPillar.position.set(x, 0.96, -0.25);
      this.mesh.add(aPillar);
    });

    // 3. Interior Cockpit: Bucket Seats & Steering Wheel
    // Dual Racing Seats
    [-0.38, 0.38].forEach((sx) => {
      const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.2, 0.55), interiorMat);
      seatBase.position.set(sx, 0.6, -0.15);
      this.mesh.add(seatBase);

      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.55, 0.12), interiorMat);
      seatBack.position.set(sx, 0.9, -0.42);
      seatBack.rotation.x = -0.15;
      this.mesh.add(seatBack);
    });

    // Dashboard & Glowing Holographic Gauge Cluster
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 0.4), interiorMat);
    dash.position.set(0, 0.85, 0.65);
    this.mesh.add(dash);

    const holoCluster = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.15), dashGlowMat);
    holoCluster.position.set(-0.38, 0.96, 0.62);
    holoCluster.rotation.x = -0.3;
    this.mesh.add(holoCluster);

    // Sports Steering Wheel
    const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 6, 12), carbonMat);
    wheelRing.position.set(-0.38, 0.92, 0.45);
    wheelRing.rotation.x = 0.35;
    this.mesh.add(wheelRing);

    // 4. Front Carbon Splitter & Air Intake Canards
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.1, 0.7), carbonMat);
    splitter.position.set(0, 0.26, 2.3);
    splitter.castShadow = true;
    this.mesh.add(splitter);

    // Aggressive Front Air Grille
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.1), carbonMat);
    grille.position.set(0, 0.45, 2.26);
    this.mesh.add(grille);

    // 5. High-Downforce Rear GT Wing with Dual Endplates
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.06, 0.48), carbonMat);
    wing.position.set(0, 1.36, -2.15);
    wing.castShadow = true;
    this.mesh.add(wing);

    // Wing Endplates
    [-1.17, 1.17].forEach((wx) => {
      const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.52), carbonMat);
      endplate.position.set(wx, 1.36, -2.15);
      this.mesh.add(endplate);
    });

    // Wing Swan-Neck Uprights
    [-0.65, 0.65].forEach((sx) => {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.22), carbonMat);
      strut.position.set(sx, 1.1, -2.15);
      this.mesh.add(strut);
    });

    // 6. Rear Diffuser & Quad Exhaust Tips
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.16, 0.5), carbonMat);
    diffuser.position.set(0, 0.32, -2.25);
    this.mesh.add(diffuser);

    const exhaustGlowMat = new THREE.MeshStandardMaterial({
      color: 0x3366ff,
      emissive: 0x3366ff,
      emissiveIntensity: 2.0,
    });
    [-0.6, -0.45, 0.45, 0.6].forEach((ex) => {
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.25, 8), carbonMat);
      tip.rotateX(Math.PI / 2);
      tip.position.set(ex, 0.38, -2.32);
      this.mesh.add(tip);

      const glowCore = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8), exhaustGlowMat);
      glowCore.rotateX(Math.PI / 2);
      glowCore.position.set(ex, 0.38, -2.42);
      this.mesh.add(glowCore);
    });

    // 7. Continuous 3D Taillight Lightbar
    const taillight = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.1, 0.08), this.taillightMat);
    taillight.position.set(0, 0.76, -2.26);
    this.mesh.add(taillight);

    // 8. Front Headlights & Spotlights
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x99f6ff,
      emissiveIntensity: 3.5,
    });
    [-0.78, 0.78].forEach((x) => {
      const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.12), headlightMat);
      headMesh.position.set(x, 0.62, 2.25);
      this.mesh.add(headMesh);

      // Real forward Spotlight
      const spot = new THREE.SpotLight(0x99f6ff, 32, 55, Math.PI / 4.5, 0.35, 1.2);
      spot.position.set(x, 0.65, 2.35);
      const spotTarget = new THREE.Object3D();
      spotTarget.position.set(x, 0, 24);
      this.mesh.add(spotTarget);
      spot.target = spotTarget;
      this.mesh.add(spot);
      this.headlights.push(spot);
    });

    // 9. Cyber Neon Underglow
    const underglowGeo = new THREE.PlaneGeometry(2.2, 4.4);
    const underglow = new THREE.Mesh(underglowGeo, this.underglowMat);
    underglow.rotation.x = -Math.PI / 2;
    underglow.position.y = 0.08;
    this.mesh.add(underglow);

    // 10. Four High-Detail Alloy Wheels with Calipers
    const wheelPositions = [
      { x: -1.06, z: 1.35 }, // Front-Left
      { x: 1.06, z: 1.35 },  // Front-Right
      { x: -1.06, z: -1.35 }, // Rear-Left
      { x: 1.06, z: -1.35 },  // Rear-Right
    ];

    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.95, roughness: 0.15 });

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();

      // Tire Outer Ring
      const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      // Deep Dish Rim
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.32, 10), rimMat);
      rim.rotateZ(Math.PI / 2);
      wheelGroup.add(rim);

      // Glowing Cyan Brake Caliper
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.14), caliperMat);
      caliper.position.set(0, 0.18, 0);
      wheelGroup.add(caliper);

      wheelGroup.position.set(pos.x, 0.38, pos.z);
      this.mesh.add(wheelGroup);
      this.wheels.push(wheelGroup);
    });

    this.mesh.position.copy(this.position);
  }

  public update(dt: number, throttle: number, brake: number, steer: number, handbrake: boolean) {
    // 1. Steering Dynamics (Speed-sensitive reduction)
    const speedRatio = Math.abs(this.speed) / this.maxSpeed;
    const maxSteerLimit = Math.max(0.18, 0.65 - speedRatio * 0.42);
    const targetSteer = steer * maxSteerLimit;
    this.steeringAngle += (targetSteer - this.steeringAngle) * Math.min(1.0, dt * 10);

    // Steer front wheels visually
    this.wheels[0].rotation.y = this.steeringAngle;
    this.wheels[1].rotation.y = this.steeringAngle;

    // 2. Acceleration & Braking
    if (throttle > 0) {
      this.speed += throttle * this.acceleration * dt;
      if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
    }

    if (brake > 0) {
      if (this.speed > 0) {
        this.speed -= brake * this.brakePower * dt;
        if (this.speed < 0) this.speed = 0;
      } else {
        // Reverse
        this.speed -= brake * (this.acceleration * 0.6) * dt;
        if (this.speed < -this.reverseMaxSpeed) this.speed = -this.reverseMaxSpeed;
      }
    }

    // 3. Handbrake & Drift Mechanics (Forza style)
    if (handbrake) {
      this.speed *= Math.max(0, 1.0 - dt * 1.8);
      this.driftAngle += this.steeringAngle * 3.5 * dt;
      this.taillightMat.emissiveIntensity = 3.2;
      if (Math.abs(this.speed) > 10) {
        sounds.playDriftScreech();
      }
    } else {
      this.driftAngle *= Math.max(0, 1.0 - dt * 5.0);
      this.taillightMat.emissiveIntensity = brake > 0 ? 3.2 : 1.4;
    }

    // Passive rolling friction
    this.speed *= Math.max(0, 1.0 - dt * 0.25);

    // 4. Yaw Rotation from Steering & Drift
    if (Math.abs(this.speed) > 0.1) {
      const turnRadius = this.wheelBase / Math.sin(Math.max(0.001, Math.abs(this.steeringAngle)));
      const angularVel = (this.speed / turnRadius) * Math.sign(this.steeringAngle);
      this.yaw += (angularVel + this.driftAngle * 0.5) * dt;
    }

    // 5. Update Position in World Space
    const moveAngle = this.yaw + this.driftAngle * 0.2;
    this.position.x += Math.sin(moveAngle) * this.speed * dt;
    this.position.z += Math.cos(moveAngle) * this.speed * dt;

    // Boundary containment (Keep inside expanded city grid)
    this.position.x = Math.max(-550, Math.min(550, this.position.x));
    this.position.z = Math.max(-550, Math.min(550, this.position.z));

    // 6. Suspension Pitch & Roll Dynamics
    const targetPitch = (throttle - brake) * 0.06;
    this.pitchSquat += (targetPitch - this.pitchSquat) * Math.min(1.0, dt * 8);

    const targetRoll = -this.steeringAngle * speedRatio * 0.12;
    this.rollLean += (targetRoll - this.rollLean) * Math.min(1.0, dt * 8);

    // 7. Apply to Mesh
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.yaw;
    this.mesh.rotation.x = this.pitchSquat;
    this.mesh.rotation.z = this.rollLean;

    // Spin wheels according to speed
    const wheelSpin = (this.speed / 0.38) * dt;
    this.wheels.forEach((w) => {
      w.children[0].rotation.x += wheelSpin;
    });

    // Sound Engine Update
    if (this.isPlayerOccupied) {
      sounds.updateCarEngine(Math.abs(this.speed) * 3.6, throttle);
    }
  }

  public toggleHeadlights(): boolean {
    this.headlightsOn = !this.headlightsOn;
    this.headlights.forEach((h) => (h.visible = this.headlightsOn));
    this.underglowMat.opacity = this.headlightsOn ? 0.85 : 0.05;
    return this.headlightsOn;
  }

  public getSpeedKmH(): number {
    return Math.round(Math.abs(this.speed) * 3.6);
  }
}
