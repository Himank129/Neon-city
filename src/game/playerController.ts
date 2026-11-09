/**
 * PROJECT NEON CITY - Valorant x Watch Dogs Dual-Perspective Player Controller
 * Seamlessly toggles First-Person (tactical responsive FPS) and Third-Person (Watch Dogs chase).
 * Features grounded physics, coyote time, distance-synced footstep bob, and car mounting.
 */

import * as THREE from 'three';
import { input } from './input';
import { sounds } from './audio';
import { VehicleController } from './vehiclePhysics';
import { HackableNode } from './cityBuilder';

export type CameraMode = 'first_person' | 'third_person' | 'vehicle';

export class PlayerController {
  public position = new THREE.Vector3(0, 0, 0);
  public velocity = new THREE.Vector3(0, 0, 0);
  public cameraMode: CameraMode = 'first_person';

  // Rotation & Look
  public yaw = 0;
  public pitch = 0;

  // Kinematics & States
  public isGrounded = true;
  public isSprinting = false;
  public health = 100;
  public shield = 100;
  public stamina = 100;
  public hackEnergy = 100;

  // Jump feel (Coyote & Buffering)
  private timeSinceGrounded = 0;
  private jumpBufferTimer = 0;
  private distanceTraveled = 0;
  private footstepCycle = 0;

  // 3D Character Model (Visible in Third-Person mode)
  public characterMesh: THREE.Group;
  private headMesh: THREE.Mesh;
  private coatMesh: THREE.Mesh;

  // Target interaction
  public nearbyCar: VehicleController | null = null;
  public isInCar = false;
  public targetedHackNode: HackableNode | null = null;

  constructor() {
    this.characterMesh = new THREE.Group();
    const { character, head, coat } = this.buildCharacterMesh();
    this.characterMesh = character;
    this.headMesh = head;
    this.coatMesh = coat;
  }

  private buildCharacterMesh() {
    const character = new THREE.Group();

    // Part 1: Cyber Trenchcoat / Body (Watch Dogs aesthetic)
    const coatMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.65,
      metalness: 0.25,
    });
    const coat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.45), coatMat);
    coat.position.y = 0.85;
    coat.castShadow = true;
    character.add(coat);

    // Part 2: Cybernetic Mask / Visor Head
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x1f2430,
      roughness: 0.3,
      metalness: 0.8,
    });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 0.4), headMat);
    head.position.y = 1.65;
    character.add(head);

    // Glowing Cyan Visor
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.0,
    });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.1), visorMat);
    visor.position.set(0, 1.68, 0.22);
    character.add(visor);

    // Part 3: Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.8 });
    [-0.2, 0.2].forEach((x) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.7, 0.26), legMat);
      leg.position.set(x, 0.35, 0);
      leg.castShadow = true;
      character.add(leg);
    });

    return { character, head, coat };
  }

  public update(
    dt: number,
    vehicle: VehicleController,
    hackableNodes: HackableNode[],
    camera: THREE.PerspectiveCamera,
    colliders: THREE.Box3[]
  ) {
    this.nearbyCar = vehicle;

    // 1. Enter/Exit Vehicle Toggle ([F])
    if (input.consume('keyf')) {
      if (this.isInCar) {
        // Exit car
        this.isInCar = false;
        vehicle.isPlayerOccupied = false;
        sounds.stopCarEngine();
        sounds.playVehicleDoor();
        this.cameraMode = 'first_person';
        // Spawn player to the left of the driver door
        this.position.copy(vehicle.position);
        this.position.x -= Math.cos(vehicle.yaw) * 2.2;
        this.position.z += Math.sin(vehicle.yaw) * 2.2;
        this.position.y = 0;
      } else {
        // Check proximity to car
        const distToCar = this.position.distanceTo(vehicle.position);
        if (distToCar <= 3.8) {
          this.isInCar = true;
          vehicle.isPlayerOccupied = true;
          this.cameraMode = 'vehicle';
          sounds.playVehicleDoor();
          sounds.startCarEngine();
        }
      }
    }

    // 2. Toggle First/Third Person ([V]) when on foot
    if (input.consume('keyv') && !this.isInCar) {
      this.cameraMode = this.cameraMode === 'first_person' ? 'third_person' : 'first_person';
      sounds.playUIClick();
    }

    // 3. If in car, delegate movement to vehicle physics
    if (this.isInCar) {
      let throttle = 0;
      let brake = 0;
      let steer = 0;
      const handbrake = input.isHeld('space');

      if (input.isHeld('keyw') || input.isHeld('arrowup')) throttle = 1;
      if (input.isHeld('keys') || input.isHeld('arrowdown')) brake = 1;
      if (input.isHeld('keya') || input.isHeld('arrowleft')) steer = 1;
      if (input.isHeld('keyd') || input.isHeld('arrowright')) steer = -1;

      if (input.consume('keyl')) {
        vehicle.toggleHeadlights();
      }

      vehicle.update(dt, throttle, brake, steer, handbrake);

      // Camera smoothly follows car from behind and above
      const carBackX = vehicle.position.x - Math.sin(vehicle.yaw) * 7.5;
      const carBackZ = vehicle.position.z - Math.cos(vehicle.yaw) * 7.5;
      const carCamY = vehicle.position.y + 3.2;

      camera.position.x += (carBackX - camera.position.x) * Math.min(1.0, dt * 8);
      camera.position.z += (carBackZ - camera.position.z) * Math.min(1.0, dt * 8);
      camera.position.y += (carCamY - camera.position.y) * Math.min(1.0, dt * 8);

      const lookTarget = vehicle.position.clone().add(new THREE.Vector3(0, 1.2, 0));
      camera.lookAt(lookTarget);

      this.characterMesh.visible = false;
      return;
    }

    // 4. On-Foot Kinematics & Movement
    // Mouse Look / Aim
    const sensitivity = 0.0022;
    this.yaw -= input.mouseDeltaX * sensitivity;
    this.pitch -= input.mouseDeltaY * sensitivity;
    this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch));

    // Sprint & Stamina
    this.isSprinting = input.isHeld('shiftleft') || input.isHeld('shiftright');
    const moveSpeed = this.isSprinting ? 9.5 : 5.0;

    // Movement Vectors in Local Character Space
    let forward = 0;
    let right = 0;
    if (input.isHeld('keyw') || input.isHeld('arrowup')) forward += 1;
    if (input.isHeld('keys') || input.isHeld('arrowdown')) forward -= 1;
    if (input.isHeld('keyd') || input.isHeld('arrowright')) right += 1;
    if (input.isHeld('keya') || input.isHeld('arrowleft')) right -= 1;

    const moveVector = new THREE.Vector3(right, 0, -forward);
    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    }

    // Jump Buffering & Coyote Time
    if (input.consume('space')) {
      this.jumpBufferTimer = 0.12; // 120ms buffer
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    if (this.isGrounded) {
      this.timeSinceGrounded = 0;
    } else {
      this.timeSinceGrounded += dt;
    }

    const canJump = this.isGrounded || this.timeSinceGrounded <= 0.12;
    if (canJump && this.jumpBufferTimer > 0) {
      this.velocity.y = 8.2;
      this.isGrounded = false;
      this.jumpBufferTimer = 0;
      this.timeSinceGrounded = 999;
      sounds.playJump();
    }

    // Variable Jump Cut (Early release lowers peak)
    if (input.wasJustReleased('space') && this.velocity.y > 0) {
      this.velocity.y *= 0.5;
    }

    // Gravity
    this.velocity.y -= 22 * dt;

    // Horizontal Movement
    this.velocity.x = moveVector.x * moveSpeed;
    this.velocity.z = moveVector.z * moveSpeed;

    // Apply Velocity
    const prevPos = this.position.clone();
    this.position.x += this.velocity.x * dt;
    this.position.z += this.velocity.z * dt;
    this.position.y += this.velocity.y * dt;

    // Ground Collision
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // Simple City Obstacle Collisions
    const playerBox = new THREE.Box3();
    playerBox.setFromCenterAndSize(
      new THREE.Vector3(this.position.x, this.position.y + 0.9, this.position.z),
      new THREE.Vector3(0.8, 1.8, 0.8)
    );

    for (const collider of colliders) {
      if (collider.intersectsBox(playerBox)) {
        // Slide back
        this.position.x = prevPos.x;
        this.position.z = prevPos.z;
        break;
      }
    }

    // Footstep Sound Sync (Distance based)
    const horizontalSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    if (this.isGrounded && horizontalSpeed > 0.5) {
      this.distanceTraveled += horizontalSpeed * dt;
      this.footstepCycle += horizontalSpeed * dt * 2.8;
      if (this.distanceTraveled > (this.isSprinting ? 2.8 : 2.0)) {
        this.distanceTraveled = 0;
        sounds.playFootstep();
      }
    }

    // 5. Update Character Mesh Position & Orientation
    this.characterMesh.position.copy(this.position);
    this.characterMesh.rotation.y = this.yaw;

    // 6. Camera Rigging
    if (this.cameraMode === 'first_person') {
      this.characterMesh.visible = false;
      const eyeHeight = 1.68 + (horizontalSpeed > 0.5 ? Math.sin(this.footstepCycle) * 0.04 : 0);
      camera.position.set(this.position.x, this.position.y + eyeHeight, this.position.z);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = this.yaw;
      camera.rotation.x = this.pitch;
      camera.rotation.z = 0;
    } else {
      // Third Person (Over the shoulder)
      this.characterMesh.visible = true;
      const shoulderOffset = new THREE.Vector3(0.8, 1.8, 2.8);
      shoulderOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      const targetCamPos = this.position.clone().add(shoulderOffset);
      camera.position.lerp(targetCamPos, Math.min(1.0, dt * 12));

      const lookTarget = this.position.clone().add(new THREE.Vector3(0, 1.5, 0));
      camera.lookAt(lookTarget);
    }

    // 7. Find Nearest Hackable Node (Watch Dogs Scanner)
    let closestNode: HackableNode | null = null;
    let closestDist = 28; // 28m scan radius
    for (const node of hackableNodes) {
      const dist = this.position.distanceTo(node.position);
      if (dist < closestDist) {
        closestDist = dist;
        closestNode = node;
      }
    }
    this.targetedHackNode = closestNode;

    // Hack Pulse ([Q]) or Actuate Hack ([E])
    if (input.consume('keyq')) {
      sounds.playHackingPulse();
    }
    if (input.consume('keye') && this.targetedHackNode) {
      this.targetedHackNode.onHack();
      sounds.playHackActuated();
    }
  }
}
