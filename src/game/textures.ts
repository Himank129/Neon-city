/**
 * PROJECT NEON CITY - High-Fidelity Procedural Texture & Material Generators
 * Generates realistic asphalt with road markings, paving slabs, illuminated building
 * facades with individualized window states, and commercial neon storefronts.
 */

import * as THREE from 'three';

export class TextureGenerator {
  private static cachedTextures: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * High-Resolution Asphalt Texture with lane lines, road grit, oil sheens, and cracks
   */
  public static createAsphaltTexture(): THREE.CanvasTexture {
    const key = 'asphalt_main';
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // 1. Dark wet asphalt base
    ctx.fillStyle = '#0c0f14';
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Grain and asphalt gravel noise
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const shade = Math.floor(16 + Math.random() * 28);
      ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 5})`;
      ctx.fillRect(x, y, Math.random() > 0.8 ? 3 : 1.5, Math.random() > 0.8 ? 3 : 1.5);
    }

    // 3. Subtle wet tire track sheens (darker reflective bands)
    const trackGrad1 = ctx.createLinearGradient(200, 0, 360, 0);
    trackGrad1.addColorStop(0, 'rgba(8, 10, 14, 0.4)');
    trackGrad1.addColorStop(0.5, 'rgba(5, 7, 10, 0.7)');
    trackGrad1.addColorStop(1, 'rgba(8, 10, 14, 0.4)');
    ctx.fillStyle = trackGrad1;
    ctx.fillRect(200, 0, 160, 1024);

    const trackGrad2 = ctx.createLinearGradient(664, 0, 824, 0);
    trackGrad2.addColorStop(0, 'rgba(8, 10, 14, 0.4)');
    trackGrad2.addColorStop(0.5, 'rgba(5, 7, 10, 0.7)');
    trackGrad2.addColorStop(1, 'rgba(8, 10, 14, 0.4)');
    ctx.fillStyle = trackGrad2;
    ctx.fillRect(664, 0, 160, 1024);

    // 4. Yellow Center Median (Double dashed with reflector pips)
    ctx.fillStyle = '#ffaa00';
    for (let y = 30; y < 1024; y += 220) {
      // Dual dashed yellow stripes
      ctx.fillRect(504, y, 6, 130);
      ctx.fillRect(514, y, 6, 130);
      // Reflective cat-eye markers
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(509, y + 60, 2, 8);
      ctx.fillStyle = '#ffaa00';
    }

    // 5. White Solid Edge Lines
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(36, 0, 12, 1024);
    ctx.fillRect(976, 0, 12, 1024);

    // 6. Pedestrian Crosswalk Hatching near top
    ctx.fillStyle = '#f8fafc';
    for (let x = 60; x < 964; x += 55) {
      ctx.fillRect(x, 40, 32, 140);
    }

    // Stop Line
    ctx.fillRect(40, 200, 944, 20);

    // 7. Road Drain Grate (near edge)
    ctx.fillStyle = '#05070a';
    ctx.fillRect(52, 500, 30, 80);
    ctx.fillStyle = '#1e2430';
    for (let gy = 506; gy < 576; gy += 8) {
      ctx.fillRect(54, gy, 26, 3);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Sidewalk Concrete Paving Texture with expansion joints, tactile paving, and drain grates
   */
  public static createSidewalkTexture(): THREE.CanvasTexture {
    const key = 'sidewalk_main';
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Concrete base
    ctx.fillStyle = '#181d26';
    ctx.fillRect(0, 0, 512, 512);

    // Concrete noise
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const c = Math.floor(22 + Math.random() * 18);
      ctx.fillStyle = `rgb(${c}, ${c + 2}, ${c + 4})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Modular Paver Grid Seams (128x128 tiles)
    ctx.strokeStyle = '#0d1017';
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

    // Tactile warning bumps near curb edge
    ctx.fillStyle = '#2a3242';
    for (let bx = 16; bx < 512; bx += 24) {
      for (let by = 16; by < 72; by += 24) {
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
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
   * Architectural Building Facade with illuminated randomized office/residential window grids
   */
  public static createBuildingFacadeTexture(
    theme: 'cyan' | 'magenta' | 'amber' | 'corporate' | 'emerald'
  ): THREE.CanvasTexture {
    const key = `facade_${theme}`;
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Hull backdrop (brushed architectural metallic / dark composite)
    const hullColors = {
      cyan: '#0a0e17',
      magenta: '#120b17',
      amber: '#14100c',
      corporate: '#0b101c',
      emerald: '#081412',
    };
    ctx.fillStyle = hullColors[theme];
    ctx.fillRect(0, 0, 512, 1024);

    // Metallic panel seams
    ctx.strokeStyle = '#04060a';
    ctx.lineWidth = 2;
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

    // Window Grids: 8 columns x 32 floors
    const cols = 8;
    const floors = 32;
    const winWidth = 40;
    const winHeight = 22;
    const colSpacing = 64;
    const floorSpacing = 32;

    const palette = {
      cyan: ['#00f0ff', '#5ce1e6', '#ffffff', '#007799', '#ffaa00'],
      magenta: ['#ff007f', '#ff55aa', '#ffffff', '#770044', '#00f0ff'],
      amber: ['#ffaa00', '#ffd166', '#ffffff', '#995500', '#00f0ff'],
      corporate: ['#a0c4ff', '#ffffff', '#7099cc', '#00f0ff', '#ffaa00'],
      emerald: ['#00ff88', '#55ffaa', '#ffffff', '#008855', '#ffaa00'],
    };

    const colors = palette[theme];

    for (let f = 0; f < floors; f++) {
      const y = f * floorSpacing + 5;
      for (let c = 0; c < cols; c++) {
        const x = c * colSpacing + 12;

        // 65% of windows are illuminated, 35% are dark/unlit
        const isLit = Math.random() < 0.65;
        if (isLit) {
          const winColor = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillStyle = winColor;
          ctx.fillRect(x, y, winWidth, winHeight);

          // Window frame mullion
          ctx.strokeStyle = '#05070a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, winWidth, winHeight);

          // Horizontal blind or interior partition line
          if (Math.random() > 0.4) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(x, y, winWidth, Math.random() * 10);
          }
        } else {
          // Dark glass reflecting sky
          ctx.fillStyle = '#060a12';
          ctx.fillRect(x, y, winWidth, winHeight);
          ctx.strokeStyle = '#040609';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, winWidth, winHeight);
        }
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
   * Commercial Storefront Signboard Texture for ground-level retail
   */
  public static createStorefrontTexture(
    name: string,
    category: string,
    neonColor: string
  ): THREE.CanvasTexture {
    const key = `store_${name}`;
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    // Dark sleek fascia panel
    ctx.fillStyle = '#070a10';
    ctx.fillRect(0, 0, 512, 160);

    // Glowing border frame
    ctx.strokeStyle = neonColor;
    ctx.lineWidth = 5;
    ctx.strokeRect(6, 6, 500, 148);

    // Background micro-grid
    ctx.strokeStyle = '#0e1624';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 512; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 160);
      ctx.stroke();
    }

    // Glowing Neon Name
    ctx.shadowColor = neonColor;
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(name, 256, 75);

    // Category Subtitle
    ctx.shadowBlur = 8;
    ctx.fillStyle = neonColor;
    ctx.font = 'bold 16px monospace';
    ctx.fillText(category, 256, 120);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Plaza Concrete Tiles with embedded cyan cyber circuitry
   */
  public static createPlazaTexture(): THREE.CanvasTexture {
    const key = 'plaza_tiles';
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#121620';
    ctx.fillRect(0, 0, 512, 512);

    // Hexagonal / grid paving
    ctx.strokeStyle = '#080b12';
    ctx.lineWidth = 3;
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

    // Embedded neon circuit lines
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.strokeRect(64, 64, 128, 128);
    ctx.strokeRect(320, 320, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cachedTextures.set(key, texture);
    return texture;
  }
}
