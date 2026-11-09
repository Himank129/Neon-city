/**
 * PROJECT NEON CITY - Forza Horizon-Inspired Vehicle Physics & 3D Model
 * Composite 8-part procedural sports car with drift mechanics, suspension squat,
 * dynamic spotlights, speedometer readouts, and enter/exit handling.
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
      opacity: 0.8,
    });
    this.taillightMat = new THREE.MeshStandardMaterial({
      color: 0x330005,
      emissive: 0xff0033,
      emissiveIntensity: 1.2,
      roughness: 0.3,
    });

    this.buildCarModel();
  }

  private buildCarModel() {
    // Part 1: Main Aerodynamic Cyber Chassis
    const chassisGeo = new THREE.BoxGeometry(2.1, 0.65, 4.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f1522,
      metalness: 0.85,
      roughness: 0.25,
    });
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.55;
    chassis.castShadow = true;
    this.mesh.add(chassis);

    // Part 2: Glass Cockpit / Fastback Canopy
    const cabinGeo = new THREE.BoxGeometry(1.65, 0.5, 2.2);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x03060a,
      metalness: 0.95,
      roughness: 0.1,
    });
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.0, -0.3);
    cabin.castShadow = true;
    this.mesh.add(cabin);

    // Part 3: Front Carbon Splitter & Grille
    const splitterMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.6 });
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.15, 0.6), splitterMat);
    splitter.position.set(0, 0.3, 2.2);
    this.mesh.add(splitter);

    // Part 4: High-Downforce Rear GT Wing
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x05070a, metalness: 0.7, roughness: 0.3 });
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.08, 0.45), wingMat);
    wing.position.set(0, 1.35, -2.1);
    this.mesh.add(wing);

    // Wing Struts
    [-0.7, 0.7].forEach((x) => {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.2), wingMat);
      strut.position.set(x, 1.1, -2.1);
      this.mesh.add(strut);
    });

    // Part 5: Taillight Continuous Lightbar
    const taillight = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.1), this.taillightMat);
    taillight.position.set(0, 0.75, -2.22);
    this.mesh.add(taillight);

    // Part 6: Dual Headlights & Forward Spotlights
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x70eeff,
      emissiveIntensity: 3.0,
    });
    [-0.75, 0.75].forEach((x) => {
      const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.1), headlightMat);
      headMesh.position.set(x, 0.62, 2.22);
      this.mesh.add(headMesh);

      const spot = new THREE.SpotLight(0x99f6ff, 25, 45, Math.PI / 5, 0.3, 1.2);
      spot.position.set(x, 0.65, 2.3);
      const spotTarget = new THREE.Object3D();
      spotTarget.position.set(x, 0, 18);
      this.mesh.add(spotTarget);
      spot.target = spotTarget;
      this.mesh.add(spot);
      this.headlights.push(spot);
    });

    // Part 7: Cyber Underglow Neon Plane
    const underglowGeo = new THREE.PlaneGeometry(2.2, 4.2);
    const underglow = new THREE.Mesh(underglowGeo, this.underglowMat);
    underglow.rotation.x = -Math.PI / 2;
    underglow.position.y = 0.08;
    this.mesh.add(underglow);

    // Part 8: 4 Wheels with Alloy Rims
    const wheelPositions = [
      { x: -1.05, z: 1.35 }, // Front-Left
      { x: 1.05, z: 1.35 },  // Front-Right
      { x: -1.05, z: -1.35 }, // Rear-Left
      { x: 1.05, z: -1.35 },  // Rear-Right
    ];

    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.9, roughness: 0.2 });

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.32, 8), rimMat);
      rim.rotateZ(Math.PI / 2);
      wheelGroup.add(rim);

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
      this.taillightMat.emissiveIntensity = 3.0;
      if (Math.abs(this.speed) > 10) {
        sounds.playDriftScreech();
      }
    } else {
      this.driftAngle *= Math.max(0, 1.0 - dt * 5.0);
      this.taillightMat.emissiveIntensity = brake > 0 ? 3.0 : 1.2;
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

    // Boundary containment (Keep inside city grid)
    this.position.x = Math.max(-280, Math.min(280, this.position.x));
    this.position.z = Math.max(-280, Math.min(280, this.position.z));

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
    this.underglowMat.opacity = this.headlightsOn ? 0.8 : 0.05;
    return this.headlightsOn;
  }

  public getSpeedKmH(): number {
    return Math.round(Math.abs(this.speed) * 3.6);
  }
}
