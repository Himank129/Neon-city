/**
 * PROJECT NEON CITY - California Natural Vegetation & Urban Street Furniture
 * Procedural California Coastal Oaks, Palm Trees, flower planter beds,
 * outdoor cafe seating, and authentic urban streetscapes.
 */

import * as THREE from 'three';

export class VegetationManager {
  private oakBarkMat: THREE.MeshStandardMaterial;
  private palmTrunkMat: THREE.MeshStandardMaterial;
  private oakLeavesMat: THREE.MeshStandardMaterial;
  private palmFrondMat: THREE.MeshStandardMaterial;
  private autumnLeavesMat: THREE.MeshStandardMaterial;
  private planterConcreteMat: THREE.MeshStandardMaterial;
  private soilMat: THREE.MeshStandardMaterial;
  private benchWoodMat: THREE.MeshStandardMaterial;
  private benchSteelMat: THREE.MeshStandardMaterial;

  constructor() {
    // Natural wood bark
    this.oakBarkMat = new THREE.MeshStandardMaterial({
      color: 0x4a3b32,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.palmTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x5c4d3c,
      roughness: 0.85,
      metalness: 0.05,
    });

    // Lush California green leaves (chlorophyll rich, non-emissive daylight)
    this.oakLeavesMat = new THREE.MeshStandardMaterial({
      color: 0x2e7535,
      roughness: 0.65,
      metalness: 0.05,
    });

    this.palmFrondMat = new THREE.MeshStandardMaterial({
      color: 0x3b8c42,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    this.autumnLeavesMat = new THREE.MeshStandardMaterial({
      color: 0xc46227,
      roughness: 0.7,
      metalness: 0.05,
    });

    this.planterConcreteMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.75,
      metalness: 0.15,
    });

    this.soilMat = new THREE.MeshStandardMaterial({
      color: 0x2d241e,
      roughness: 0.95,
      metalness: 0.05,
    });

    this.benchWoodMat = new THREE.MeshStandardMaterial({
      color: 0x824927,
      roughness: 0.7,
      metalness: 0.1,
    });

    this.benchSteelMat = new THREE.MeshStandardMaterial({
      color: 0x242a35,
      roughness: 0.35,
      metalness: 0.85,
    });
  }

  /**
   * Builds a natural California Coastal Oak Tree
   */
  public createOakTree(x: number, z: number, isAutumn: boolean = false): THREE.Group {
    const treeGroup = new THREE.Group();

    // 1. Concrete Planter Box & Dark Mulch (2.6m x 2.6m)
    const planter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 2.6), this.planterConcreteMat);
    planter.position.y = 0.225;
    planter.castShadow = true;
    planter.receiveShadow = true;
    treeGroup.add(planter);

    const soil = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.1, 2.3), this.soilMat);
    soil.position.y = 0.46;
    treeGroup.add(soil);

    // 2. Natural Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.38, 0.52, 4.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.oakBarkMat);
    trunk.position.y = 2.35;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // 3. Three Organic Branches
    const leavesMat = isAutumn ? this.autumnLeavesMat : this.oakLeavesMat;
    const branches = [
      { angle: 0.3, pitch: 0.5, len: 2.4, y: 3.6 },
      { angle: 2.2, pitch: 0.55, len: 2.2, y: 3.9 },
      { angle: 4.3, pitch: 0.45, len: 2.5, y: 3.7 },
    ];

    branches.forEach((b) => {
      const bGeo = new THREE.CylinderGeometry(0.16, 0.25, b.len, 6);
      const bMesh = new THREE.Mesh(bGeo, this.oakBarkMat);
      bMesh.position.y = b.y;
      bMesh.rotation.order = 'YXZ';
      bMesh.rotation.y = b.angle;
      bMesh.rotation.z = b.pitch;
      bMesh.position.x = Math.sin(b.angle) * 0.7;
      bMesh.position.z = Math.cos(b.angle) * 0.7;
      bMesh.castShadow = true;
      treeGroup.add(bMesh);

      // Organic Foliage Canopy Cluster
      const tipDist = b.len * 0.9;
      const canopyGeo = new THREE.DodecahedronGeometry(1.5, 1);
      const canopy = new THREE.Mesh(canopyGeo, leavesMat);
      canopy.position.set(
        Math.sin(b.angle) * (0.7 + tipDist * Math.sin(b.pitch)),
        b.y + tipDist * Math.cos(b.pitch),
        Math.cos(b.angle) * (0.7 + tipDist * Math.sin(b.pitch))
      );
      canopy.castShadow = true;
      canopy.receiveShadow = true;
      treeGroup.add(canopy);
    });

    // Central Main Canopy
    const topCanopy = new THREE.Mesh(new THREE.IcosahedronGeometry(2.0, 1), leavesMat);
    topCanopy.position.y = 5.8;
    topCanopy.castShadow = true;
    treeGroup.add(topCanopy);

    treeGroup.position.set(x, 0, z);
    return treeGroup;
  }

  /**
   * Builds an iconic California Fan Palm Tree
   */
  public createPalmTree(x: number, z: number): THREE.Group {
    const palmGroup = new THREE.Group();

    // Circular Planter Curb
    const planterGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.4, 16);
    const planter = new THREE.Mesh(planterGeo, this.planterConcreteMat);
    planter.position.y = 0.2;
    planter.receiveShadow = true;
    palmGroup.add(planter);

    const soil = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.1, 16), this.soilMat);
    soil.position.y = 0.42;
    palmGroup.add(soil);

    // Tall Curved Trunk (8.5m high)
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.38, 8.5, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.palmTrunkMat);
    trunk.position.set(0.15, 4.4, 0);
    trunk.rotation.z = 0.04;
    trunk.castShadow = true;
    palmGroup.add(trunk);

    // Palm Fronds Crown (8 radiating curved fan blades)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const frondGeo = new THREE.BoxGeometry(0.5, 0.04, 3.2);
      const frond = new THREE.Mesh(frondGeo, this.palmFrondMat);
      frond.position.set(Math.sin(angle) * 1.5, 8.6, Math.cos(angle) * 1.5);
      frond.rotation.y = angle;
      frond.rotation.x = 0.45;
      frond.castShadow = true;
      palmGroup.add(frond);
    }

    palmGroup.position.set(x, 0, z);
    return palmGroup;
  }

  /**
   * Modern California City Bench with Teak Slats & Powder-Coated Steel Frame
   */
  public createBench(x: number, z: number, rotationY: number): THREE.Group {
    const benchGroup = new THREE.Group();

    // Steel Legs
    [-1.0, 1.0].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.6), this.benchSteelMat);
      leg.position.set(lx, 0.25, 0);
      leg.castShadow = true;
      benchGroup.add(leg);

      const backSupport = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.08), this.benchSteelMat);
      backSupport.position.set(lx, 0.62, -0.26);
      backSupport.castShadow = true;
      benchGroup.add(backSupport);
    });

    // Teak Wood Seat Slats
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.55), this.benchWoodMat);
    seat.position.set(0, 0.52, 0);
    seat.castShadow = true;
    benchGroup.add(seat);

    // Backrest Slat
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.32, 0.06), this.benchWoodMat);
    back.position.set(0, 0.78, -0.26);
    back.castShadow = true;
    benchGroup.add(back);

    benchGroup.position.set(x, 0, z);
    benchGroup.rotation.y = rotationY;
    return benchGroup;
  }

  /**
   * Sidewalk Planter Bed with Green Boxwood Shrubs & Flowers
   */
  public createPlanterBed(x: number, z: number, width: number, length: number): THREE.Group {
    const bedGroup = new THREE.Group();

    const box = new THREE.Mesh(new THREE.BoxGeometry(width, 0.4, length), this.planterConcreteMat);
    box.position.y = 0.2;
    box.castShadow = true;
    bedGroup.add(box);

    const soil = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 0.1, length - 0.2), this.soilMat);
    soil.position.y = 0.42;
    bedGroup.add(soil);

    // Natural Boxwood Shrub Spheres
    const count = Math.max(2, Math.floor(length / 2.2));
    const shrubGeo = new THREE.DodecahedronGeometry(0.48, 1);
    for (let i = 0; i < count; i++) {
      const shrub = new THREE.Mesh(shrubGeo, this.oakLeavesMat);
      shrub.position.set(0, 0.52, -length / 2 + 1.1 + i * (length / count));
      shrub.castShadow = true;
      bedGroup.add(shrub);
    }

    bedGroup.position.set(x, 0, z);
    return bedGroup;
  }

  /**
   * Outdoor Cafe Dining Table with Umbrella
   */
  public createCafeTable(x: number, z: number): THREE.Group {
    const cafeGroup = new THREE.Group();

    // Table Post & Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12), this.benchSteelMat);
    base.position.y = 0.025;
    cafeGroup.add(base);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8), this.benchSteelMat);
    post.position.y = 0.42;
    cafeGroup.add(post);

    const tabletop = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.05, 16), this.benchWoodMat);
    tabletop.position.y = 0.82;
    tabletop.castShadow = true;
    cafeGroup.add(tabletop);

    // Umbrella Canopy (Red or Navy)
    const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), this.benchSteelMat);
    umbrellaPole.position.y = 1.3;
    cafeGroup.add(umbrellaPole);

    const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xd93829, roughness: 0.6 });
    const umbrellaCone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 8), umbrellaMat);
    umbrellaCone.position.y = 2.4;
    umbrellaCone.castShadow = true;
    cafeGroup.add(umbrellaCone);

    cafeGroup.position.set(x, 0, z);
    return cafeGroup;
  }
}
