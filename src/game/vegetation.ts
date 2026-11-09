/**
 * PROJECT NEON CITY - Procedural Vegetation & Street Furniture
 * Multi-branched architectural cyber trees, planter boxes, urban benches,
 * and sidewalk amenities replacing primitive spheres.
 */

import * as THREE from 'three';

export class VegetationManager {
  private treeBarkMat: THREE.MeshStandardMaterial;
  private cyanFoliageMat: THREE.MeshStandardMaterial;
  private emeraldFoliageMat: THREE.MeshStandardMaterial;
  private magentaFoliageMat: THREE.MeshStandardMaterial;
  private planterMat: THREE.MeshStandardMaterial;
  private planterCurbMat: THREE.MeshStandardMaterial;
  private benchMat: THREE.MeshStandardMaterial;
  private benchWoodMat: THREE.MeshStandardMaterial;

  constructor() {
    this.treeBarkMat = new THREE.MeshStandardMaterial({
      color: 0x181a22,
      roughness: 0.85,
      metalness: 0.2,
    });

    this.cyanFoliageMat = new THREE.MeshStandardMaterial({
      color: 0x051b24,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.85,
      roughness: 0.35,
      metalness: 0.1,
    });

    this.emeraldFoliageMat = new THREE.MeshStandardMaterial({
      color: 0x052014,
      emissive: 0x00ff88,
      emissiveIntensity: 0.75,
      roughness: 0.35,
      metalness: 0.1,
    });

    this.magentaFoliageMat = new THREE.MeshStandardMaterial({
      color: 0x1f0717,
      emissive: 0xff007f,
      emissiveIntensity: 0.8,
      roughness: 0.35,
      metalness: 0.1,
    });

    this.planterMat = new THREE.MeshStandardMaterial({
      color: 0x12151e,
      roughness: 0.7,
      metalness: 0.3,
    });

    this.planterCurbMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.2,
    });

    this.benchMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      metalness: 0.8,
      roughness: 0.3,
    });

    this.benchWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3d271d,
      roughness: 0.7,
      metalness: 0.1,
    });
  }

  /**
   * Builds an intricate multi-part procedural cyber tree with trunk, 3 branches,
   * 4 foliage clusters, and a curb-lit planter box.
   */
  public createCyberTree(x: number, z: number, theme: 'cyan' | 'emerald' | 'magenta' = 'cyan'): THREE.Group {
    const treeGroup = new THREE.Group();

    // 1. Planter Box Foundation (2.4m x 2.4m square with soil)
    const planterBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 2.4), this.planterMat);
    planterBox.position.y = 0.225;
    planterBox.castShadow = true;
    planterBox.receiveShadow = true;
    treeGroup.add(planterBox);

    // Glowing Planter Rim Strip
    const planterRim = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.08, 2.44), this.planterCurbMat);
    planterRim.position.y = 0.45;
    treeGroup.add(planterRim);

    // Soil
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x0a0d0a, roughness: 0.95 });
    const soil = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 2.1), soilMat);
    soil.position.y = 0.46;
    treeGroup.add(soil);

    // 2. Sculpted Main Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.32, 0.48, 4.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.treeBarkMat);
    trunk.position.y = 2.4;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // 3. Three Articulated Asymmetric Branches
    const branchConfigs = [
      { angle: 0, pitch: 0.45, length: 2.2, height: 3.6 },
      { angle: (Math.PI * 2) / 3, pitch: 0.5, length: 2.0, height: 4.1 },
      { angle: (Math.PI * 4) / 3, pitch: 0.4, length: 2.3, height: 3.8 },
    ];

    const foliageMat =
      theme === 'emerald'
        ? this.emeraldFoliageMat
        : theme === 'magenta'
        ? this.magentaFoliageMat
        : this.cyanFoliageMat;

    branchConfigs.forEach((cfg) => {
      const branchGeo = new THREE.CylinderGeometry(0.14, 0.22, cfg.length, 6);
      const branch = new THREE.Mesh(branchGeo, this.treeBarkMat);

      branch.position.y = cfg.height;
      branch.rotation.order = 'YXZ';
      branch.rotation.y = cfg.angle;
      branch.rotation.z = cfg.pitch;
      branch.position.x = Math.sin(cfg.angle) * 0.6;
      branch.position.z = Math.cos(cfg.angle) * 0.6;
      branch.castShadow = true;
      treeGroup.add(branch);

      // Foliage Cluster at Branch Tip
      const tipDist = cfg.length * 0.85;
      const foliageGeo = new THREE.DodecahedronGeometry(1.2, 1);
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.set(
        Math.sin(cfg.angle) * (0.6 + tipDist * Math.sin(cfg.pitch)),
        cfg.height + tipDist * Math.cos(cfg.pitch),
        Math.cos(cfg.angle) * (0.6 + tipDist * Math.sin(cfg.pitch))
      );
      foliage.castShadow = true;
      treeGroup.add(foliage);
    });

    // 4. Central Top Foliage Crown
    const crownGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const crown = new THREE.Mesh(crownGeo, foliageMat);
    crown.position.y = 5.6;
    crown.castShadow = true;
    treeGroup.add(crown);

    treeGroup.position.set(x, 0, z);
    return treeGroup;
  }

  /**
   * Modern Cyberpunk Sidewalk Bench with metallic frame and wooden slats
   */
  public createBench(x: number, z: number, rotationY: number): THREE.Group {
    const benchGroup = new THREE.Group();

    // Steel Legs
    [-1.0, 1.0].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.6), this.benchMat);
      leg.position.set(lx, 0.25, 0);
      leg.castShadow = true;
      benchGroup.add(leg);

      const backSupport = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), this.benchMat);
      backSupport.position.set(lx, 0.6, -0.26);
      backSupport.castShadow = true;
      benchGroup.add(backSupport);
    });

    // Seat Slats
    const seatSlat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.5), this.benchWoodMat);
    seatSlat.position.set(0, 0.52, 0);
    seatSlat.castShadow = true;
    benchGroup.add(seatSlat);

    // Backrest Slat
    const backSlat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 0.06), this.benchWoodMat);
    backSlat.position.set(0, 0.75, -0.26);
    backSlat.castShadow = true;
    benchGroup.add(backSlat);

    // Glowing Under-bench Neon Accent
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 });
    const underGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.4), glowMat);
    underGlow.rotation.x = -Math.PI / 2;
    underGlow.position.y = 0.05;
    benchGroup.add(underGlow);

    benchGroup.position.set(x, 0, z);
    benchGroup.rotation.y = rotationY;
    return benchGroup;
  }

  /**
   * Sidewalk Planter Bed with ground shrubs
   */
  public createPlanterBed(x: number, z: number, width: number, length: number): THREE.Group {
    const bedGroup = new THREE.Group();

    const box = new THREE.Mesh(new THREE.BoxGeometry(width, 0.35, length), this.planterMat);
    box.position.y = 0.175;
    box.castShadow = true;
    bedGroup.add(box);

    const rim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.05, 0.06, length + 0.05), this.planterCurbMat);
    rim.position.y = 0.35;
    bedGroup.add(rim);

    // Shrub Spheres inside
    const shrubCount = Math.max(2, Math.floor(length / 2));
    const shrubGeo = new THREE.DodecahedronGeometry(0.45, 1);
    for (let i = 0; i < shrubCount; i++) {
      const shrub = new THREE.Mesh(shrubGeo, this.emeraldFoliageMat);
      shrub.position.set(0, 0.48, -length / 2 + 1.0 + i * (length / shrubCount));
      bedGroup.add(shrub);
    }

    bedGroup.position.set(x, 0, z);
    return bedGroup;
  }
}
