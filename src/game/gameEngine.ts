/**
 * PROJECT NEON CITY - Three.js Game Engine & Render Pipeline
 * Dynamic Time-of-Day (California Day/Night Cycle), PBR materials, traffic,
 * pedestrians, and seamless HUD synchronization.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CityBuilder } from './cityBuilder';
import { VehicleController } from './vehiclePhysics';
import { PlayerController } from './playerController';
import { TrafficSystem } from './trafficSystem';
import { PedestrianSystem } from './pedestrianSystem';
import { TimeOfDayManager, DayNightState } from './timeOfDay';
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
  timeString: string;
  timePhase: 'dawn' | 'day' | 'sunset' | 'night';
  timeHours: number;
}

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public cityBuilder: CityBuilder;
  public vehicle: VehicleController;
  public player: PlayerController;
  public trafficSystem: TrafficSystem;
  public pedestrianSystem: PedestrianSystem;
  public timeOfDay: TimeOfDayManager;

  public state: EngineState = 'title';
  private isSoftwareGl = false;
  private frameId = 0;
  private isDisposed = false;
  private clock = new THREE.Clock();

  // Title Camera Tour Variables
  private titleTourAngle = 0;

  // React State Callback
  private onHUDUpdate: ((state: GameHUDState) => void) | null = null;
  private hudThrottleCounter = 0;
  private latestDayNightState: DayNightState | null = null;

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
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    mountElement.appendChild(this.renderer.domElement);

    // 3. Scene & Horizon Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x4da6ff); // Bright California sky
    this.scene.fog = new THREE.FogExp2(0x72a4d4, 0.0035);

    // 4. Camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      mountElement.clientWidth / mountElement.clientHeight,
      0.1,
      850
    );
    this.camera.position.set(0, 22, 65);

    // 5. Procedural RoomEnvironment
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {}

    // 6. Time of Day Manager & Atmospheric Lighting
    this.timeOfDay = new TimeOfDayManager(this.scene, this.isSoftwareGl);

    // 7. City, Vehicle & Player
    this.cityBuilder = new CityBuilder();
    this.scene.add(this.cityBuilder.cityGroup);

    this.vehicle = new VehicleController();
    this.scene.add(this.vehicle.mesh);

    this.player = new PlayerController();
    this.scene.add(this.player.characterMesh);

    // Spawn player near central avenue
    this.player.position.set(0, 0, 5);

    // 8. Traffic & Pedestrians (Living City)
    this.trafficSystem = new TrafficSystem();
    this.scene.add(this.trafficSystem.group);

    this.pedestrianSystem = new PedestrianSystem();
    this.scene.add(this.pedestrianSystem.group);

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

  public advanceTime() {
    this.timeOfDay.advanceToNextPhase();
    sounds.playUIClick();
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

      // Handle Time of Day toggle ([T])
      if (input.consume('keyt')) {
        this.advanceTime();
      }

      // Update Dynamic Time of Day (Sun orbit, lighting, sky, fog)
      this.latestDayNightState = this.timeOfDay.update(dt, this.scene);
      const isNightTime = this.latestDayNightState.nightFactor > 0.45;

      // Update Streetlights & Headlights based on Day/Night
      for (const light of this.cityBuilder.streetLights) {
        light.visible = isNightTime;
      }

      // Simulation Logic based on Game State
      if (this.state === 'title') {
        // Panoramic flyover tour across California downtown
        this.titleTourAngle += dt * 0.12;
        const radius = 80;
        this.camera.position.x = Math.sin(this.titleTourAngle) * radius;
        this.camera.position.z = Math.cos(this.titleTourAngle) * radius + 15;
        this.camera.position.y = 22 + Math.sin(this.titleTourAngle * 0.5) * 5;
        this.camera.lookAt(0, 12, 15);
      } else if (this.state === 'playing') {
        // Active gameplay simulation
        this.player.update(
          dt,
          this.vehicle,
          this.cityBuilder.hackableNodes,
          this.camera,
          this.cityBuilder.colliders
        );

        // Update Living City (Traffic & Pedestrians)
        this.trafficSystem.update(dt);
        this.pedestrianSystem.update(dt);
      }

      // Render Scene
      this.renderer.render(this.scene, this.camera);

      // Throttle React HUD updates to <= 10Hz
      this.hudThrottleCounter++;
      if (this.hudThrottleCounter % 6 === 0 && this.onHUDUpdate && this.latestDayNightState) {
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
          district: 'BAY DISTRICT // MISSION CORE',
          timeString: this.latestDayNightState.timeString,
          timePhase: this.latestDayNightState.phase,
          timeHours: this.latestDayNightState.timeHours,
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
