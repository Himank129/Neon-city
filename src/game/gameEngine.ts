/**
 * PROJECT NEON CITY - Three.js Game Engine & Render Pipeline
 * Implements software-WebGL guards, RoomEnvironment PBR pipeline, clamped dt,
 * Title Screen live flyover tour, and zero-GC particle systems.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CityBuilder } from './cityBuilder';
import { VehicleController } from './vehiclePhysics';
import { PlayerController } from './playerController';
import { input } from './input';
import { sounds } from './audio';

export type EngineState = 'title' | 'playing' | 'paused';

export interface GameHUDState {
  state: EngineState;
  cameraMode: 'first_person' | 'third_person' | 'vehicle';
  isInCar: boolean;
  speedKmH: number;
  gear: number;
  health: number;
  shield: number;
  stamina: number;
  hackEnergy: number;
  headlightsOn: boolean;
  nearCar: boolean;
  targetedHackNode: { id: string; name: string; type: string } | null;
  district: string;
}

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public cityBuilder: CityBuilder;
  public vehicle: VehicleController;
  public player: PlayerController;

  public state: EngineState = 'title';
  private isSoftwareGl = false;
  private frameId = 0;
  private isDisposed = false;
  private clock = new THREE.Clock();

  // Title Camera Tour Variables
  private titleTourAngle = 0;

  // Particle Buffer
  private particleGeo: THREE.BufferGeometry | null = null;
  private particleMat: THREE.PointsMaterial | null = null;
  private particlePoints: THREE.Points | null = null;

  // React State Callback
  private onHUDUpdate: ((state: GameHUDState) => void) | null = null;
  private hudThrottleCounter = 0;

  constructor(mountElement: HTMLElement, onHUDUpdate: (state: GameHUDState) => void) {
    this.onHUDUpdate = onHUDUpdate;

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    mountElement.appendChild(this.renderer.domElement);

    // 3. Scene & Horizon Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060812);
    this.scene.fog = new THREE.FogExp2(0x060812, 0.0075);

    // 4. Camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      mountElement.clientWidth / mountElement.clientHeight,
      0.1,
      600
    );
    this.camera.position.set(0, 18, 55);

    // 5. Procedural RoomEnvironment
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {}

    // 6. Lighting Rig
    this.setupLighting();

    // 7. City, Vehicle & Player
    this.cityBuilder = new CityBuilder();
    this.scene.add(this.cityBuilder.cityGroup);

    this.vehicle = new VehicleController();
    this.scene.add(this.vehicle.mesh);

    this.player = new PlayerController();
    this.scene.add(this.player.characterMesh);

    // Spawn player near start crossroad
    this.player.position.set(0, 0, 5);

    // 8. Ambient Particles
    this.setupParticles();

    // 9. Input & Pointer Lock Setup
    input.setPointerLockTarget(this.renderer.domElement);
    this.renderer.domElement.addEventListener('click', () => {
      if (this.state === 'playing') {
        input.requestPointerLock();
      }
    });

    // 10. Handle Resizing
    window.addEventListener('resize', this.onResize);

    // Start Animation Loop
    this.startLoop();
  }

  private setupLighting() {
    // Warm key directional light (Moonlight / High Neon glow)
    const keyLight = new THREE.DirectionalLight(0xa5c9ff, 1.4);
    keyLight.position.set(80, 120, 60);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 10;
      keyLight.shadow.camera.far = 300;
      const d = 100;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
    }
    this.scene.add(keyLight);

    // Cool Hemisphere Sky/Ground Fill (Cyberpunk violet/cyan tone)
    const hemiLight = new THREE.HemisphereLight(0x00f0ff, 0x330044, 0.65);
    this.scene.add(hemiLight);
  }

  private setupParticles() {
    // Cyber rain / atmospheric dust motes
    const count = 1200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 250;
      pos[i * 3 + 1] = Math.random() * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 250;
    }

    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    this.particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.35,
      transparent: true,
      opacity: 0.5,
    });

    this.particlePoints = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particlePoints);
  }

  public startGame() {
    this.state = 'playing';
    document.body.dataset.state = 'playing';
    sounds.startAmbientCity();
    input.requestPointerLock();
  }

  public pauseGame() {
    this.state = 'paused';
    document.body.dataset.state = 'paused';
    input.exitPointerLock();
  }

  public resumeGame() {
    this.state = 'playing';
    document.body.dataset.state = 'playing';
    input.requestPointerLock();
  }

  public goToTitle() {
    this.state = 'title';
    document.body.dataset.state = 'title';
    input.exitPointerLock();
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private startLoop() {
    const tick = () => {
      if (this.isDisposed) return;

      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // Clamped delta time

      // Handle Pause toggle ([Escape] or [P])
      if (input.consume('escape') || input.consume('keyp')) {
        if (this.state === 'playing') {
          this.pauseGame();
        } else if (this.state === 'paused') {
          this.resumeGame();
        }
      }

      // Handle Mute toggle ([M])
      if (input.consume('keym')) {
        sounds.toggleMute();
      }

      // Simulation Logic based on Game State
      if (this.state === 'title') {
        // Dramatic live panoramic orbit around Neon City skyline
        this.titleTourAngle += dt * 0.18;
        const radius = 65;
        this.camera.position.x = Math.sin(this.titleTourAngle) * radius;
        this.camera.position.z = Math.cos(this.titleTourAngle) * radius + 10;
        this.camera.position.y = 16 + Math.sin(this.titleTourAngle * 0.5) * 4;
        this.camera.lookAt(0, 8, 10);
      } else if (this.state === 'playing') {
        // Active gameplay simulation
        this.player.update(
          dt,
          this.vehicle,
          this.cityBuilder.hackableNodes,
          this.camera,
          this.cityBuilder.colliders
        );
      }

      // Animate Particles (rain drifting down)
      if (this.particleGeo) {
        const positions = this.particleGeo.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= dt * 25;
          if (positions[i] < 0) positions[i] = 60;
        }
        this.particleGeo.attributes.position.needsUpdate = true;
      }

      // Render Scene
      this.renderer.render(this.scene, this.camera);

      // Throttle React HUD updates to <= 10Hz to prevent React thrashing
      this.hudThrottleCounter++;
      if (this.hudThrottleCounter % 6 === 0 && this.onHUDUpdate) {
        const distToCar = this.player.position.distanceTo(this.vehicle.position);
        const nearCar = distToCar <= 3.8 && !this.player.isInCar;
        const speed = this.player.isInCar ? this.vehicle.getSpeedKmH() : 0;
        const gear = speed === 0 ? 1 : Math.min(6, Math.floor(speed / 30) + 1);

        this.onHUDUpdate({
          state: this.state,
          cameraMode: this.player.cameraMode,
          isInCar: this.player.isInCar,
          speedKmH: speed,
          gear: gear,
          health: this.player.health,
          shield: this.player.shield,
          stamina: this.player.stamina,
          hackEnergy: this.player.hackEnergy,
          headlightsOn: this.vehicle.headlightsOn,
          nearCar: nearCar,
          targetedHackNode: this.player.targetedHackNode
            ? {
                id: this.player.targetedHackNode.id,
                name: this.player.targetedHackNode.name,
                type: this.player.targetedHackNode.type,
              }
            : null,
          district: 'DISTRICT 01 // DOWNTOWN CORE',
        });
      }

      // End-of-frame Input Reset
      input.endFrame();

      // Loop scheduling
      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private onResize = () => {
    const parent = this.renderer.domElement.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    this.isDisposed = true;
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    sounds.stopCarEngine();
    this.renderer.dispose();
  }
}
