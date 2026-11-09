/**
 * PROJECT NEON CITY - Expanded City Builder & Procedural Urban Architecture
 * Vastly expanded multi-block downtown with 36 detailed skyscrapers, skybridge,
 * illuminated window grids, ground storefronts, central public plaza, elevated highway,
 * and procedural cyber vegetation.
 */

import * as THREE from 'three';
import { TextureGenerator } from './textures';
import { VegetationManager } from './vegetation';

export interface HackableNode {
  id: string;
  type: 'billboard' | 'barricade' | 'transformer' | 'camera';
  name: string;
  position: THREE.Vector3;
  mesh: THREE.Group;
  status: 'online' | 'hacked' | 'overloaded';
  onHack: () => void;
  cooldown: number;
}

export class CityBuilder {
  public cityGroup = new THREE.Group();
  public colliders: THREE.Box3[] = [];
  public hackableNodes: HackableNode[] = [];
  public streetLights: THREE.SpotLight[] = [];

  private vegetationManager = new VegetationManager();

  constructor() {
    this.buildExpandedCity();
  }

  private buildExpandedCity() {
    // 1. Massive Ground Foundation (1200m x 1200m)
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x07090f,
      roughness: 0.9,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.cityGroup.add(ground);

    // 2. Comprehensive Multi-Avenue Road Grid
    this.buildRoadNetwork();

    // 3. Central Public Plaza with Holographic Cyber Monument
    this.buildCentralPlaza();

    // 4. 36 Detailed Architectural Skyscrapers (Stepped, Skybridges, HVAC Roofs)
    this.buildSkyscrapers();

    // 5. Ground-Level Commercial Storefronts & Street Furniture
    this.buildCommercialStorefronts();

    // 6. Elevated Highway Network with Ramps
    this.buildElevatedHighway();

    // 7. Procedural Cyber Trees & Street Furniture
    this.buildVegetationAndFurniture();

    // 8. Interactive Hackable City Nodes
    this.buildHackableNodes();
  }

  private buildRoadNetwork() {
    const asphaltTex = TextureGenerator.createAsphaltTexture();
    const sidewalkTex = TextureGenerator.createSidewalkTexture();

    const roadMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.45,
      metalness: 0.25,
    });

    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: sidewalkTex,
      roughness: 0.75,
      metalness: 0.15,
    });

    // 3 Major North-South Avenues (Central X=0, West X=-85, East X=+85)
    [-85, 0, 85].forEach((xPos) => {
      const roadGeo = new THREE.PlaneGeometry(24, 700);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(xPos, 0.03, 0);
      road.receiveShadow = true;
      this.cityGroup.add(road);

      // Flanking Sidewalks
      [-14.5, 14.5].forEach((swOffset) => {
        const sw = new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 700), sidewalkMat);
        sw.position.set(xPos + swOffset, 0.125, 0);
        sw.receiveShadow = true;
        this.cityGroup.add(sw);
      });
    });

    // 3 Major East-West Crossways (South Z=-95, Center Z=0, North Z=+95)
    [-95, 0, 95].forEach((zPos) => {
      const crossRoadMat = roadMat.clone();
      const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(24, 700), crossRoadMat);
      crossRoad.rotation.x = -Math.PI / 2;
      crossRoad.rotation.z = Math.PI / 2;
      crossRoad.position.set(0, 0.04, zPos);
      crossRoad.receiveShadow = true;
      this.cityGroup.add(crossRoad);

      // Sidewalks
      [-14.5, 14.5].forEach((swOffset) => {
        const sw = new THREE.Mesh(new THREE.BoxGeometry(700, 0.25, 5), sidewalkMat);
        sw.position.set(0, 0.125, zPos + swOffset);
        sw.receiveShadow = true;
        this.cityGroup.add(sw);
      });
    });
  }

  private buildCentralPlaza() {
    const plazaTex = TextureGenerator.createPlazaTexture();
    const plazaMat = new THREE.MeshStandardMaterial({
      map: plazaTex,
      roughness: 0.6,
      metalness: 0.3,
    });

    // Plaza Floor (50m x 60m located in Northwest Quadrant)
    const plaza = new THREE.Mesh(new THREE.BoxGeometry(50, 0.35, 60), plazaMat);
    plaza.position.set(-50, 0.175, 45);
    plaza.receiveShadow = true;
    this.cityGroup.add(plaza);

    // Glowing Neon Perimeter Border
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.5,
    });
    const border = new THREE.Mesh(new THREE.BoxGeometry(50.4, 0.1, 60.4), borderMat);
    border.position.set(-50, 0.38, 45);
    this.cityGroup.add(border);

    // Monumental Holographic Cybernetic Sculpture in Center
    const monumentGroup = new THREE.Group();
    const basePylon = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 3.5, 3.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x151922, metalness: 0.9, roughness: 0.2 })
    );
    basePylon.position.y = 1.5;
    monumentGroup.add(basePylon);

    // Intersecting Holographic Rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.2,
      wireframe: true,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.15, 8, 24), ringMat);
    ring1.position.y = 5.5;
    ring1.rotation.x = Math.PI / 4;
    monumentGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.12, 8, 24), ringMat);
    ring2.position.y = 5.5;
    ring2.rotation.y = Math.PI / 3;
    monumentGroup.add(ring2);

    monumentGroup.position.set(-50, 0.35, 45);
    this.cityGroup.add(monumentGroup);

    // Benches surrounding monument
    this.cityGroup.add(this.vegetationManager.createBench(-50, 35, 0));
    this.cityGroup.add(this.vegetationManager.createBench(-50, 55, Math.PI));
    this.cityGroup.add(this.vegetationManager.createBench(-62, 45, Math.PI / 2));
    this.cityGroup.add(this.vegetationManager.createBench(-38, 45, -Math.PI / 2));
  }

  private buildSkyscrapers() {
    // Architectural themes with procedurally generated illuminated window textures
    const themes = [
      { id: 'cyan' as const, glowColor: 0x00f0ff, name: 'QUANTUM TOWER' },
      { id: 'magenta' as const, glowColor: 0xff007f, name: 'SYNTH CORP' },
      { id: 'amber' as const, glowColor: 0xffaa00, name: 'HYPERION PLAZA' },
      { id: 'corporate' as const, glowColor: 0x7099cc, name: 'GLOBAL METRIC' },
      { id: 'emerald' as const, glowColor: 0x00ff88, name: 'AURA BIO-TECH' },
    ];

    // 36 Skyscraper Placements across 6 City Blocks
    const skyscraperBlocks = [
      // Block A (East Core, Z: 20 to 180)
      { x: 38, z: 40, w: 28, d: 34, h: 110, theme: 0, hasHelipad: true },
      { x: 38, z: 85, w: 26, d: 30, h: 145, theme: 1, hasHelipad: false },
      { x: 38, z: 140, w: 28, d: 36, h: 95, theme: 2, hasHelipad: true },
      { x: 38, z: 190, w: 26, d: 28, h: 130, theme: 3, hasHelipad: false },

      // Block B (Far East, X: 115 to 160)
      { x: 125, z: 40, w: 34, d: 34, h: 165, theme: 3, hasHelipad: true },
      { x: 125, z: 90, w: 32, d: 36, h: 120, theme: 4, hasHelipad: false },
      { x: 125, z: 145, w: 30, d: 32, h: 150, theme: 0, hasHelipad: true },
      { x: 125, z: 200, w: 34, d: 38, h: 85, theme: 1, hasHelipad: false },

      // Block C (West Core, Z: -20 to -180)
      { x: -38, z: -40, w: 28, d: 32, h: 125, theme: 2, hasHelipad: true },
      { x: -38, z: -85, w: 26, d: 34, h: 155, theme: 0, hasHelipad: false },
      { x: -38, z: -140, w: 28, d: 30, h: 100, theme: 1, hasHelipad: true },
      { x: -38, z: -190, w: 26, d: 32, h: 140, theme: 4, hasHelipad: false },

      // Block D (Far West, X: -115 to -160)
      { x: -125, z: -40, w: 34, d: 36, h: 175, theme: 1, hasHelipad: true },
      { x: -125, z: -90, w: 32, d: 32, h: 135, theme: 3, hasHelipad: false },
      { x: -125, z: -145, w: 30, d: 38, h: 90, theme: 0, hasHelipad: true },
      { x: -125, z: -200, w: 34, d: 34, h: 160, theme: 2, hasHelipad: false },

      // Block E (Southeast Quadrant)
      { x: 38, z: -40, w: 28, d: 32, h: 135, theme: 4, hasHelipad: false },
      { x: 38, z: -85, w: 26, d: 36, h: 105, theme: 2, hasHelipad: true },
      { x: 38, z: -140, w: 28, d: 30, h: 160, theme: 0, hasHelipad: false },
      { x: 38, z: -190, w: 26, d: 34, h: 95, theme: 3, hasHelipad: true },
      { x: 125, z: -40, w: 32, d: 34, h: 140, theme: 1, hasHelipad: false },
      { x: 125, z: -90, w: 34, d: 36, h: 180, theme: 0, hasHelipad: true },
      { x: 125, z: -145, w: 30, d: 32, h: 115, theme: 2, hasHelipad: false },
      { x: 125, z: -200, w: 32, d: 34, h: 150, theme: 4, hasHelipad: true },

      // Block F (Northwest Quadrant outside plaza)
      { x: -38, z: 85, w: 28, d: 32, h: 140, theme: 0, hasHelipad: false },
      { x: -38, z: 140, w: 26, d: 34, h: 110, theme: 1, hasHelipad: true },
      { x: -38, z: 190, w: 28, d: 30, h: 165, theme: 2, hasHelipad: false },
      { x: -125, z: 40, w: 32, d: 34, h: 130, theme: 4, hasHelipad: true },
      { x: -125, z: 90, w: 34, d: 36, h: 155, theme: 0, hasHelipad: false },
      { x: -125, z: 145, w: 30, d: 32, h: 120, theme: 3, hasHelipad: true },
      { x: -125, z: 200, w: 34, d: 36, h: 170, theme: 1, hasHelipad: false },

      // Perimeter Skyline Towers
      { x: 210, z: 60, w: 38, d: 42, h: 210, theme: 0, hasHelipad: true },
      { x: 210, z: -60, w: 40, d: 40, h: 220, theme: 1, hasHelipad: true },
      { x: -210, z: 60, w: 38, d: 42, h: 195, theme: 2, hasHelipad: true },
      { x: -210, z: -60, w: 40, d: 40, h: 215, theme: 3, hasHelipad: true },
    ];

    skyscraperBlocks.forEach((b, idx) => {
      const theme = themes[b.theme % themes.length];
      const towerGroup = new THREE.Group();

      const facadeTex = TextureGenerator.createBuildingFacadeTexture(theme.id);
      const facadeMat = new THREE.MeshStandardMaterial({
        map: facadeTex,
        roughness: 0.35,
        metalness: 0.65,
      });

      // 1. Podium Base (Ground level architectural entrance with columns)
      const podiumMat = new THREE.MeshStandardMaterial({
        color: 0x0d111a,
        roughness: 0.7,
        metalness: 0.4,
      });
      const podium = new THREE.Mesh(new THREE.BoxGeometry(b.w + 4, 12, b.d + 4), podiumMat);
      podium.position.y = 6;
      podium.castShadow = true;
      podium.receiveShadow = true;
      towerGroup.add(podium);

      // Entrance Canopy
      const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.4, 4),
        new THREE.MeshStandardMaterial({ color: theme.glowColor, emissive: theme.glowColor, emissiveIntensity: 1.5 })
      );
      canopy.position.set(0, 4.5, b.d / 2 + 3.8);
      towerGroup.add(canopy);

      // 2. Main Architectural Tower Body
      const tower = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), facadeMat);
      tower.position.y = b.h / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      towerGroup.add(tower);

      // 3. Setback Crown (Upper architectural taper)
      const crownHeight = 16;
      const crown = new THREE.Mesh(
        new THREE.BoxGeometry(b.w * 0.75, crownHeight, b.d * 0.75),
        podiumMat
      );
      crown.position.y = b.h + crownHeight / 2;
      crown.castShadow = true;
      towerGroup.add(crown);

      // 4. Rooftop Mechanical Elements (HVAC Units & Elevator Housing)
      const hvacMat = new THREE.MeshStandardMaterial({ color: 0x222633, metalness: 0.8, roughness: 0.4 });
      [-b.w * 0.2, b.w * 0.2].forEach((hx) => {
        const hvac = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 5), hvacMat);
        hvac.position.set(hx, b.h + crownHeight + 1.5, 0);
        towerGroup.add(hvac);
      });

      // 5. Helipad or Antenna Spire
      if (b.hasHelipad) {
        const padMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.8 });
        const helipad = new THREE.Mesh(new THREE.CylinderGeometry(b.w * 0.3, b.w * 0.3, 0.4, 16), padMat);
        helipad.position.y = b.h + crownHeight + 0.2;
        towerGroup.add(helipad);

        // Helipad Perimeter Lighting
        const padLightMat = new THREE.MeshStandardMaterial({
          color: 0x00ff88,
          emissive: 0x00ff88,
          emissiveIntensity: 2.0,
        });
        const padRing = new THREE.Mesh(new THREE.TorusGeometry(b.w * 0.29, 0.1, 6, 24), padLightMat);
        padRing.rotation.x = Math.PI / 2;
        padRing.position.y = b.h + crownHeight + 0.45;
        towerGroup.add(padRing);
      } else {
        // High Spire with Warning Beacons
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 1.2, 24, 6),
          new THREE.MeshStandardMaterial({ color: 0x333848, metalness: 0.9, roughness: 0.2 })
        );
        spire.position.y = b.h + crownHeight + 12;
        towerGroup.add(spire);

        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xff0033, emissive: 0xff0033, emissiveIntensity: 2.5 })
        );
        beacon.position.y = b.h + crownHeight + 24;
        towerGroup.add(beacon);
      }

      // 6. External Vertical Neon Ribbon
      const ribbonMat = new THREE.MeshStandardMaterial({
        color: theme.glowColor,
        emissive: theme.glowColor,
        emissiveIntensity: 2.2,
      });
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.6, b.h * 0.85, 0.4), ribbonMat);
      ribbon.position.set(b.w / 2 + 0.3, b.h * 0.45, b.d / 2);
      towerGroup.add(ribbon);

      towerGroup.position.set(b.x, 0, b.z);
      this.cityGroup.add(towerGroup);

      // Register Box3 Collider
      const collider = new THREE.Box3();
      collider.setFromCenterAndSize(
        new THREE.Vector3(b.x, (b.h + crownHeight) / 2, b.z),
        new THREE.Vector3(b.w + 4, b.h + crownHeight, b.d + 4)
      );
      this.colliders.push(collider);
    });

    // 7. Architectural Skybridge connecting Twin Towers (X: 38, Z: 40 to Z: 85)
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: 0x0f1422,
      metalness: 0.8,
      roughness: 0.3,
    });
    const glassBridgeMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.6,
    });

    const skybridge = new THREE.Group();
    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 45), bridgeMat);
    bridgeDeck.position.set(38, 70, 62.5);
    skybridge.add(bridgeDeck);

    const bridgeGlass = new THREE.Mesh(new THREE.BoxGeometry(10.2, 3.5, 45), glassBridgeMat);
    bridgeGlass.position.set(38, 71.5, 62.5);
    skybridge.add(bridgeGlass);

    this.cityGroup.add(skybridge);
  }

  private buildCommercialStorefronts() {
    const stores = [
      { name: 'NEO RAMEN 2099', cat: 'SYNTH NOODLES & SAKE', color: '#ff007f', x: 14.8, z: 25, rot: -Math.PI / 2 },
      { name: 'CYBERDECK CLINIC', cat: 'ICE BREAKERS & NEURAL RIGS', color: '#00f0ff', x: 14.8, z: 45, rot: -Math.PI / 2 },
      { name: 'HYPERION MOTORS', cat: 'SPECTER HYPERCAR DEALERSHIP', color: '#ffaa00', x: -14.8, z: -35, rot: Math.PI / 2 },
      { name: 'AURA BIO-AUGMENTS', cat: 'CYBERNETIC CHROME', color: '#00ff88', x: -14.8, z: 45, rot: Math.PI / 2 },
      { name: 'DEDSEC UNDERGROUND', cat: 'ENCRYPTED DATA COMMERCE', color: '#ff0055', x: 55, z: -83, rot: 0 },
      { name: 'QUANTUM ESPRESSO', cat: 'NOOTROPIC STIMULANTS', color: '#00f0ff', x: -55, z: 83, rot: Math.PI },
    ];

    stores.forEach((store) => {
      const storeTex = TextureGenerator.createStorefrontTexture(store.name, store.cat, store.color);
      const signMat = new THREE.MeshBasicMaterial({ map: storeTex });

      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), signMat);
      signMesh.position.set(store.x, 3.8, store.z);
      signMesh.rotation.y = store.rot;
      this.cityGroup.add(signMesh);

      // Storefront Glass Entrance below
      const entranceMat = new THREE.MeshStandardMaterial({
        color: 0x050c18,
        metalness: 0.95,
        roughness: 0.1,
      });
      const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.4), entranceMat);
      glassMesh.position.set(store.x, 1.7, store.z);
      glassMesh.rotation.y = store.rot;
      this.cityGroup.add(glassMesh);
    });
  }

  private buildElevatedHighway() {
    const highwayGroup = new THREE.Group();
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x141822, roughness: 0.7, metalness: 0.35 });
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.4,
    });

    // Elevated Deck spanning X: -300 to +300 at Y = 16, Z = 140
    const deckGeo = new THREE.BoxGeometry(600, 2.2, 20);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 16, 140);
    deck.castShadow = true;
    deck.receiveShadow = true;
    highwayGroup.add(deck);

    // Guardrails
    [-9.8, 9.8].forEach((offsetZ) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(600, 1.4, 0.4), railMat);
      rail.position.set(0, 17.3, 140 + offsetZ);
      highwayGroup.add(rail);
    });

    // Concrete Support Pillars every 50m
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1f2430, roughness: 0.9 });
    for (let x = -250; x <= 250; x += 50) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 16, 8), pillarMat);
      pillar.position.set(x, 8, 140);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      highwayGroup.add(pillar);

      const collider = new THREE.Box3();
      collider.setFromCenterAndSize(new THREE.Vector3(x, 8, 140), new THREE.Vector3(5, 16, 5));
      this.colliders.push(collider);
    }

    this.cityGroup.add(highwayGroup);
  }

  private buildVegetationAndFurniture() {
    // Cyber Trees along the central avenue sidewalks and plaza
    const treePositions = [
      { x: -16.5, z: -15, theme: 'cyan' as const },
      { x: 16.5, z: -15, theme: 'cyan' as const },
      { x: -16.5, z: 20, theme: 'emerald' as const },
      { x: 16.5, z: 20, theme: 'emerald' as const },
      { x: -16.5, z: 65, theme: 'cyan' as const },
      { x: 16.5, z: 65, theme: 'cyan' as const },
      { x: -16.5, z: -65, theme: 'magenta' as const },
      { x: 16.5, z: -65, theme: 'magenta' as const },
      { x: -65, z: 25, theme: 'emerald' as const },
      { x: -65, z: 65, theme: 'cyan' as const },
      { x: -35, z: 65, theme: 'emerald' as const },
    ];

    treePositions.forEach((pos) => {
      const tree = this.vegetationManager.createCyberTree(pos.x, pos.z, pos.theme);
      this.cityGroup.add(tree);
    });

    // Planter Beds along crossway sidewalks
    this.cityGroup.add(this.vegetationManager.createPlanterBed(40, -14.5, 2.0, 14));
    this.cityGroup.add(this.vegetationManager.createPlanterBed(-40, -14.5, 2.0, 14));
    this.cityGroup.add(this.vegetationManager.createPlanterBed(40, 14.5, 2.0, 14));
    this.cityGroup.add(this.vegetationManager.createPlanterBed(-40, 14.5, 2.0, 14));

    // Sidewalk Benches
    this.cityGroup.add(this.vegetationManager.createBench(16.5, -45, -Math.PI / 2));
    this.cityGroup.add(this.vegetationManager.createBench(-16.5, -45, Math.PI / 2));
    this.cityGroup.add(this.vegetationManager.createBench(16.5, 45, -Math.PI / 2));
    this.cityGroup.add(this.vegetationManager.createBench(-16.5, 45, Math.PI / 2));

    // Streetlamps with Real Spotlights
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x1f232e, metalness: 0.85, roughness: 0.25 });
    const lampGlowMat = new THREE.MeshStandardMaterial({
      color: 0x70eeff,
      emissive: 0x70eeff,
      emissiveIntensity: 2.5,
    });

    const lampPositions = [
      { x: -14.5, z: -40 },
      { x: 14.5, z: -40 },
      { x: -14.5, z: 0 },
      { x: 14.5, z: 0 },
      { x: -14.5, z: 40 },
      { x: 14.5, z: 40 },
      { x: -14.5, z: 80 },
      { x: 14.5, z: 80 },
    ];

    lampPositions.forEach((pos, idx) => {
      const lamp = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 9, 8), lampMat);
      pole.position.y = 4.5;
      lamp.add(pole);

      const armDir = pos.x > 0 ? -1 : 1;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 0.2), lampMat);
      arm.position.set(armDir * 1.0, 9, 0);
      lamp.add(arm);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.4), lampGlowMat);
      head.position.set(armDir * 2.0, 8.9, 0);
      lamp.add(head);

      lamp.position.set(pos.x, 0, pos.z);
      this.cityGroup.add(lamp);

      // Active downward cone spotlight (budget 4 primary street lights)
      if (idx < 4) {
        const spot = new THREE.SpotLight(0x70eeff, 22, 28, Math.PI / 4, 0.4, 1.2);
        spot.position.set(pos.x + armDir * 2.0, 8.8, pos.z);
        spot.target.position.set(pos.x + armDir * 2.0, 0, pos.z);
        this.cityGroup.add(spot.target);
        this.cityGroup.add(spot);
        this.streetLights.push(spot);
      }
    });
  }

  private buildHackableNodes() {
    // Node 1: Retractable Traffic Road Barricade
    const barricadeGroup = new THREE.Group();
    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.4, 2),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 })
    );
    barricadeGroup.add(baseMesh);

    const bollardsMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0055,
      emissiveIntensity: 1.5,
    });
    const bollardMesh = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.8, 0.8), bollardsMat);
    bollardMesh.position.y = 0.9;
    barricadeGroup.add(bollardMesh);
    barricadeGroup.position.set(0, 0.2, 18);
    this.cityGroup.add(barricadeGroup);

    let barricadeRaised = true;
    this.hackableNodes.push({
      id: 'hack_barricade_01',
      type: 'barricade',
      name: 'TRAFFIC INTERCEPTOR #01',
      position: barricadeGroup.position.clone(),
      mesh: barricadeGroup,
      status: 'online',
      cooldown: 0,
      onHack: () => {
        barricadeRaised = !barricadeRaised;
        bollardMesh.position.y = barricadeRaised ? 0.9 : -0.8;
        bollardsMat.emissive.setHex(barricadeRaised ? 0xff0055 : 0x00ff88);
      },
    });

    // Node 2: Giant Holographic Billboard
    const billboardCanvas = document.createElement('canvas');
    billboardCanvas.width = 512;
    billboardCanvas.height = 256;
    const bCtx = billboardCanvas.getContext('2d')!;
    this.drawBillboardGraphic(bCtx, 'CTOS OVERRIDE', 'ACCESS GRANTED', '#00f0ff');
    const billboardTex = new THREE.CanvasTexture(billboardCanvas);
    billboardTex.colorSpace = THREE.SRGBColorSpace;

    const billboardGroup = new THREE.Group();
    const frameMesh = new THREE.Mesh(
      new THREE.BoxGeometry(16, 8, 1),
      new THREE.MeshStandardMaterial({ color: 0x111622, metalness: 0.8, roughness: 0.3 })
    );
    billboardGroup.add(frameMesh);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(15.6, 7.6),
      new THREE.MeshBasicMaterial({ map: billboardTex })
    );
    screenMesh.position.z = 0.52;
    billboardGroup.add(screenMesh);
    billboardGroup.position.set(0, 18, -24);
    this.cityGroup.add(billboardGroup);

    let billboardState = 0;
    this.hackableNodes.push({
      id: 'hack_billboard_01',
      type: 'billboard',
      name: 'CENTRAL HOLOGRAPHIC ARRAY',
      position: billboardGroup.position.clone(),
      mesh: billboardGroup,
      status: 'online',
      cooldown: 0,
      onHack: () => {
        billboardState = (billboardState + 1) % 3;
        const messages = [
          { text: 'SYSTEM COMPROMISED', sub: 'CYBER WATCHDOG PULSE', color: '#ff0055' },
          { text: 'DEDSEC PROTOCOL', sub: 'ENCRYPTED CHANNEL 404', color: '#00ff88' },
          { text: 'PROJECT NEON CITY', sub: 'VALORANT x FORZA ENGINE', color: '#00f0ff' },
        ];
        const next = messages[billboardState];
        this.drawBillboardGraphic(bCtx, next.text, next.sub, next.color);
        billboardTex.needsUpdate = true;
      },
    });

    // Node 3: Power Grid Transformer
    const transformerGroup = new THREE.Group();
    const transMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3, 4, 3),
      new THREE.MeshStandardMaterial({ color: 0x222a38, metalness: 0.7, roughness: 0.3 })
    );
    transMesh.position.y = 2;
    transformerGroup.add(transMesh);

    const coilMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.8,
    });
    const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4.2, 8), coilMat);
    coil.position.y = 2.1;
    transformerGroup.add(coil);

    transformerGroup.position.set(-16.5, 0, 35);
    this.cityGroup.add(transformerGroup);

    this.hackableNodes.push({
      id: 'hack_transformer_01',
      type: 'transformer',
      name: 'GRID SUBSTATION #4',
      position: transformerGroup.position.clone(),
      mesh: transformerGroup,
      status: 'online',
      cooldown: 0,
      onHack: () => {
        coilMat.emissive.setHex(0xffaa00);
        coilMat.emissiveIntensity = 3.5;
        setTimeout(() => {
          coilMat.emissive.setHex(0x00f0ff);
          coilMat.emissiveIntensity = 1.8;
        }, 1200);
      },
    });
  }

  private drawBillboardGraphic(ctx: CanvasRenderingContext2D, text: string, sub: string, color: string) {
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#0e1628';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 240);

    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 120);

    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = color;
    ctx.fillText(sub, 256, 175);
  }
}
