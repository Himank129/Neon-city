/**
 * PROJECT NEON CITY - Watch Dogs 2 California Architectural Texture Generator
 * Procedural generation for realistic California asphalt, poured concrete sidewalks,
 * red brick, sandstone, glass curtain walls, and lively commercial storefronts.
 */

import * as THREE from 'three';

export class TextureGenerator {
  private static cachedTextures: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Realistic California Asphalt Road Texture
   * Matte aggregate asphalt with tar seam lines, clean lane stripes, and zebra crossings.
   */
  public static createAsphaltTexture(): THREE.CanvasTexture {
    const key = 'ca_asphalt_v2';
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Natural grey asphalt base (not pitch black)
    ctx.fillStyle = '#2b2e36';
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Concrete aggregate and fine gravel noise
    for (let i = 0; i < 22000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const shade = Math.floor(40 + Math.random() * 32);
      ctx.fillStyle = `rgb(${shade}, ${shade + 1}, ${shade + 3})`;
      ctx.fillRect(x, y, Math.random() > 0.85 ? 2.5 : 1.2, Math.random() > 0.85 ? 2.5 : 1.2);
    }

    // 3. Subtle longitudinal traffic tire wear paths
    const laneWear1 = ctx.createLinearGradient(200, 0, 360, 0);
    laneWear1.addColorStop(0, 'rgba(32, 35, 42, 0.4)');
    laneWear1.addColorStop(0.5, 'rgba(28, 30, 36, 0.6)');
    laneWear1.addColorStop(1, 'rgba(32, 35, 42, 0.4)');
    ctx.fillStyle = laneWear1;
    ctx.fillRect(200, 0, 160, 1024);

    const laneWear2 = ctx.createLinearGradient(664, 0, 824, 0);
    laneWear2.addColorStop(0, 'rgba(32, 35, 42, 0.4)');
    laneWear2.addColorStop(0.5, 'rgba(28, 30, 36, 0.6)');
    laneWear2.addColorStop(1, 'rgba(32, 35, 42, 0.4)');
    ctx.fillStyle = laneWear2;
    ctx.fillRect(664, 0, 160, 1024);

    // 4. Double Yellow Median Line (California Highway Standard #ffb81c)
    ctx.fillStyle = '#f5a623';
    ctx.fillRect(505, 0, 6, 1024);
    ctx.fillRect(515, 0, 6, 1024);

    // 5. White Edge Lines
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(36, 0, 10, 1024);
    ctx.fillRect(978, 0, 10, 1024);

    // Green Painted Dedicated Bicycle Lane on right shoulder
    ctx.fillStyle = 'rgba(46, 133, 64, 0.55)';
    ctx.fillRect(860, 0, 100, 1024);
    ctx.fillStyle = '#ffffff';
    // Bicycle lane symbol dashes
    for (let by = 100; by < 1024; by += 300) {
      ctx.fillRect(900, by, 20, 45);
    }

    // 6. Continental Pedestrian Crosswalk (Thick White Bars)
    ctx.fillStyle = '#ffffff';
    for (let x = 60; x < 964; x += 60) {
      ctx.fillRect(x, 40, 36, 150);
    }

    // Solid Stop Line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 215, 944, 22);

    // 7. Cast Iron Storm Drain Grate
    ctx.fillStyle = '#1e2026';
    ctx.fillRect(48, 520, 32, 80);
    ctx.fillStyle = '#2f3440';
    for (let gy = 526; gy < 594; gy += 8) {
      ctx.fillRect(50, gy, 28, 3.5);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Poured Architectural Concrete Sidewalk
   */
  public static createSidewalkTexture(): THREE.CanvasTexture {
    const key = 'ca_sidewalk_v2';
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Warm sun-bleached concrete
    ctx.fillStyle = '#b8bec8';
    ctx.fillRect(0, 0, 512, 512);

    // Concrete fine aggregate
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const c = Math.floor(165 + Math.random() * 30);
      ctx.fillStyle = `rgb(${c}, ${c}, ${c - 2})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Saw-cut Expansion Joints (128px square pavers)
    ctx.strokeStyle = '#8c94a2';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 512; i += 128) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Yellow ADA Detectable Warning Tiles near curb
    ctx.fillStyle = '#e5a110';
    ctx.fillRect(0, 0, 512, 45);
    ctx.fillStyle = '#c48508';
    for (let bx = 12; bx < 512; bx += 20) {
      for (let by = 10; by < 40; by += 15) {
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Watch Dogs 2 Realistic Architectural Building Facades
   * Variants: Modern Glass & Steel, San Francisco Red Brick, Warm Sandstone, Precast Concrete.
   */
  public static createBuildingFacadeTexture(
    theme: 'brick' | 'glass' | 'sandstone' | 'concrete' | 'terracotta'
  ): THREE.CanvasTexture {
    const key = `wd2_facade_${theme}`;
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Facade Base Wall Finish
    const wallStyles = {
      brick: { base: '#7c3a27', secondary: '#944430', joint: '#b8a698' },
      glass: { base: '#1e2c3d', secondary: '#2a3d54', joint: '#111722' },
      sandstone: { base: '#d8c4a0', secondary: '#c9b48e', joint: '#a89472' },
      concrete: { base: '#9aa0aa', secondary: '#89909c', joint: '#68707c' },
      terracotta: { base: '#a85838', secondary: '#b86642', joint: '#e0c8b2' },
    };

    const style = wallStyles[theme];
    ctx.fillStyle = style.base;
    ctx.fillRect(0, 0, 512, 1024);

    // Brick pattern or panel joints
    if (theme === 'brick') {
      ctx.strokeStyle = style.joint;
      ctx.lineWidth = 1.5;
      for (let y = 0; y < 1024; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();

        const offset = (y / 16) % 2 === 0 ? 0 : 16;
        for (let x = offset; x < 512; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 16);
          ctx.stroke();
        }
      }
    } else {
      // Architectural precast panel seams
      ctx.strokeStyle = style.joint;
      ctx.lineWidth = 2.5;
      for (let y = 0; y < 1024; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      for (let x = 0; x < 512; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }
    }

    // 2. Realistic Architectural Windows & Balconies
    const cols = 8;
    const floors = 28;
    const winWidth = 38;
    const winHeight = 24;
    const colSpacing = 64;
    const floorSpacing = 36;

    for (let f = 0; f < floors; f++) {
      const y = f * floorSpacing + 8;

      // Floor horizontal decorative cornice sill
      ctx.fillStyle = style.joint;
      ctx.fillRect(0, y + winHeight + 1, 512, 4);

      for (let c = 0; c < cols; c++) {
        const x = c * colSpacing + 13;

        // Window Frame (White or Dark Bronze)
        ctx.fillStyle = theme === 'glass' ? '#182433' : '#ffffff';
        ctx.fillRect(x - 2, y - 2, winWidth + 4, winHeight + 4);

        // Glass pane (Reflective blue sky / interior shade)
        if (theme === 'glass') {
          // Reflective high-rise curtain glass
          const grad = ctx.createLinearGradient(x, y, x, y + winHeight);
          grad.addColorStop(0, '#5ca3e6');
          grad.addColorStop(0.6, '#326bb3');
          grad.addColorStop(1, '#1e4882');
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, winWidth, winHeight);
        } else {
          // Residential / Commercial office windows with natural daylight reflection
          const isWarmLit = Math.random() < 0.35;
          if (isWarmLit) {
            ctx.fillStyle = '#ffeed6'; // Warm interior lighting
          } else {
            ctx.fillStyle = '#263d58'; // Daytime sky reflection
          }
          ctx.fillRect(x, y, winWidth, winHeight);

          // Curtains / blinds variation
          if (Math.random() > 0.4) {
            ctx.fillStyle = '#e8ebf0';
            ctx.fillRect(x, y, winWidth, Math.random() * 12);
          }
        }

        // Window glass mullion divider
        ctx.strokeStyle = '#222933';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, winWidth, winHeight);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * California Commercial Storefront Awning & Fascia Signs
   */
  public static createStorefrontTexture(
    name: string,
    category: string,
    accentColor: string,
    awningColor: string
  ): THREE.CanvasTexture {
    const key = `ca_store_${name}`;
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 200;
    const ctx = canvas.getContext('2d')!;

    // 1. Striped Fabric Awning (Classic California retail)
    const stripeWidth = 24;
    for (let x = 0; x < 512; x += stripeWidth) {
      ctx.fillStyle = (x / stripeWidth) % 2 === 0 ? awningColor : '#ffffff';
      ctx.fillRect(x, 0, stripeWidth, 70);
    }
    // Awning bottom shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 65, 512, 8);

    // 2. Modern Architectural Signboard Panel
    ctx.fillStyle = '#1f242d';
    ctx.fillRect(0, 75, 512, 125);

    // Gold / colored border frame
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 82, 492, 110);

    // Store Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 256, 128);

    // Subtitle
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.fillText(category, 256, 165);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * California Plaza Interlocking Paving Stones
   */
  public static createPlazaTexture(): THREE.CanvasTexture {
    const key = 'ca_plaza_tiles_v2';
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Warm terracotta and grey pavers
    ctx.fillStyle = '#c5a085';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? '#b89479' : '#d2ae94';
      ctx.fillRect(x, y, 2, 2);
    }

    // Interlocking diamond / herringbone joints
    ctx.strokeStyle = '#8a6e59';
    ctx.lineWidth = 2.5;
    for (let x = 0; x <= 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cachedTextures.set(key, texture);
    return texture;
  }
}
