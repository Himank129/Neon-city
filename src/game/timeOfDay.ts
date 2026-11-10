/**
 * PROJECT NEON CITY - Dynamic Day/Night & Time-of-Day System
 * Watch Dogs 2 California-inspired atmospheric lighting, orbital sun/moon movement,
 * horizon fog color blending, and automatic night-time illumination transitions.
 */

import * as THREE from 'three';

export interface DayNightState {
  timeHours: number; // 0.00 to 24.00
  timeString: string;
  phase: 'dawn' | 'day' | 'sunset' | 'night';
  nightFactor: number; // 0.0 (full noon) to 1.0 (full midnight)
  sunAltitude: number;
}

export class TimeOfDayManager {
  // Current time: default 14:00 (bright California afternoon)
  public timeHours = 14.0;
  public timeScale = 1.0; // 1 real sec = 2 game minutes by default
  public isTimePaused = false;

  // Celestial Objects
  public sunLight: THREE.DirectionalLight;
  public moonLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public ambientLight: THREE.AmbientLight;

  // Reusable Colors
  private skyColor = new THREE.Color();
  private fogColor = new THREE.Color();
  private sunColor = new THREE.Color();
  private groundColor = new THREE.Color();

  constructor(scene: THREE.Scene, isSoftwareGl: boolean = false) {
    // 1. Sun Directional Light (Warm California sunlight)
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    this.sunLight.position.set(120, 200, 100);
    if (!isSoftwareGl) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = 2048;
      this.sunLight.shadow.mapSize.height = 2048;
      this.sunLight.shadow.camera.near = 10;
      this.sunLight.shadow.camera.far = 450;
      const d = 160;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.bias = -0.0005;
      this.sunLight.shadow.normalBias = 0.02;
    }
    scene.add(this.sunLight);

    // 2. Moon Directional Light (Cool midnight fill)
    this.moonLight = new THREE.DirectionalLight(0x88aacc, 0.4);
    this.moonLight.position.set(-120, -100, -100);
    scene.add(this.moonLight);

    // 3. Hemisphere Sky / Ground Light
    this.hemiLight = new THREE.HemisphereLight(0x4da6ff, 0x6e7f52, 0.85);
    scene.add(this.hemiLight);

    // 4. Subtle Base Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(this.ambientLight);
  }

  public setTime(hours: number) {
    this.timeHours = ((hours % 24) + 24) % 24;
  }

  public advanceToNextPhase() {
    if (this.timeHours >= 5 && this.timeHours < 12) {
      this.setTime(14.0); // Day
    } else if (this.timeHours >= 12 && this.timeHours < 17) {
      this.setTime(18.5); // Sunset
    } else if (this.timeHours >= 17 && this.timeHours < 21) {
      this.setTime(22.5); // Night
    } else {
      this.setTime(6.5); // Dawn
    }
  }

  public update(dt: number, scene: THREE.Scene): DayNightState {
    if (!this.isTimePaused) {
      // 24 hours in ~12 minutes (0.033 hours/sec)
      this.timeHours = (this.timeHours + dt * 0.04 * this.timeScale) % 24;
    }

    // Solar angle: 0h = midnight (-PI/2), 6h = sunrise (0), 12h = noon (PI/2), 18h = sunset (PI)
    const solarAngle = ((this.timeHours - 6) / 24) * Math.PI * 2;
    const sunDist = 300;
    const sunX = Math.cos(solarAngle) * sunDist;
    const sunY = Math.sin(solarAngle) * sunDist;
    const sunZ = Math.cos(solarAngle * 0.5) * 80;

    this.sunLight.position.set(sunX, Math.max(10, sunY), sunZ);
    this.moonLight.position.set(-sunX, Math.max(10, -sunY), -sunZ);

    // Calculate Night Factor (0.0 at noon, 1.0 at midnight)
    let nightFactor = 0;
    let phase: 'dawn' | 'day' | 'sunset' | 'night' = 'day';

    if (this.timeHours >= 5.5 && this.timeHours < 8.0) {
      // DAWN / SUNRISE
      phase = 'dawn';
      const progress = (this.timeHours - 5.5) / 2.5; // 0 to 1
      nightFactor = 1.0 - progress;

      this.skyColor.setRGB(
        THREE.MathUtils.lerp(0.08, 0.35, progress),
        THREE.MathUtils.lerp(0.12, 0.65, progress),
        THREE.MathUtils.lerp(0.24, 0.98, progress)
      );
      this.fogColor.setRGB(
        THREE.MathUtils.lerp(0.15, 0.95, progress),
        THREE.MathUtils.lerp(0.18, 0.62, progress),
        THREE.MathUtils.lerp(0.28, 0.45, progress)
      );
      this.sunColor.setRGB(1.0, 0.72, 0.45);
      this.groundColor.setRGB(0.4, 0.45, 0.3);
      this.sunLight.intensity = THREE.MathUtils.lerp(0.2, 1.7, progress);
      this.hemiLight.intensity = THREE.MathUtils.lerp(0.3, 0.9, progress);
    } else if (this.timeHours >= 8.0 && this.timeHours < 17.5) {
      // VIBRANT CALIFORNIA DAYTIME
      phase = 'day';
      nightFactor = 0.0;

      this.skyColor.setRGB(0.32, 0.66, 0.98); // Bright San Francisco sky
      this.fogColor.setRGB(0.72, 0.84, 0.96); // Soft coastal atmosphere
      this.sunColor.setRGB(1.0, 0.96, 0.88); // Brilliant warm sunlight
      this.groundColor.setRGB(0.45, 0.52, 0.38); // Earth & foliage ambient

      this.sunLight.intensity = 1.9;
      this.moonLight.intensity = 0.0;
      this.hemiLight.intensity = 0.95;
      this.ambientLight.intensity = 0.35;
    } else if (this.timeHours >= 17.5 && this.timeHours < 20.5) {
      // PACIFIC SUNSET / GOLDEN HOUR
      phase = 'sunset';
      const progress = (this.timeHours - 17.5) / 3.0; // 0 to 1
      nightFactor = progress;

      this.skyColor.setRGB(
        THREE.MathUtils.lerp(0.32, 0.12, progress),
        THREE.MathUtils.lerp(0.66, 0.16, progress),
        THREE.MathUtils.lerp(0.98, 0.32, progress)
      );
      this.fogColor.setRGB(
        THREE.MathUtils.lerp(0.72, 0.92, progress * 0.7),
        THREE.MathUtils.lerp(0.84, 0.42, progress),
        THREE.MathUtils.lerp(0.96, 0.28, progress)
      );
      this.sunColor.setRGB(1.0, 0.55, 0.25); // Fiery orange rays
      this.groundColor.setRGB(0.35, 0.28, 0.3);

      this.sunLight.intensity = THREE.MathUtils.lerp(1.7, 0.1, progress);
      this.hemiLight.intensity = THREE.MathUtils.lerp(0.9, 0.35, progress);
    } else {
      // CALIFORNIA NIGHT / WATCH DOGS NOIR
      phase = 'night';
      nightFactor = 1.0;

      this.skyColor.setRGB(0.04, 0.07, 0.14); // Deep navy night sky
      this.fogColor.setRGB(0.06, 0.09, 0.16); // Soft ambient night haze
      this.sunColor.setRGB(0.1, 0.1, 0.15);
      this.groundColor.setRGB(0.08, 0.09, 0.12);

      this.sunLight.intensity = 0.0;
      this.moonLight.intensity = 0.45;
      this.hemiLight.intensity = 0.25;
      this.ambientLight.intensity = 0.12;
    }

    // Apply colors to scene & lights
    this.sunLight.color.copy(this.sunColor);
    this.hemiLight.color.copy(this.skyColor);
    this.hemiLight.groundColor.copy(this.groundColor);
    scene.background = this.skyColor;

    if (scene.fog) {
      scene.fog.color.copy(this.fogColor);
    }

    // Format human-readable time string (e.g. "14:32")
    const totalMins = Math.floor(this.timeHours * 60);
    const hrs = Math.floor(totalMins / 60)
      .toString()
      .padStart(2, '0');
    const mins = (totalMins % 60).toString().padStart(2, '0');

    return {
      timeHours: this.timeHours,
      timeString: `${hrs}:${mins}`,
      phase,
      nightFactor,
      sunAltitude: sunY / sunDist,
    };
  }
}
