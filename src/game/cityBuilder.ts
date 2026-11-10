/**
 * PROJECT NEON CITY - Watch Dogs 2 California Urban Architecture & City Builder
 * Vibrant San Francisco / Bay Area inspired city with sandstone, red brick, glass curtain
 * towers, commercial storefronts with awnings, palm trees, coastal oaks, and public plazas.
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
  public nightMeshes: THREE.Mesh[] = [];

  private vegetationManager = new VegetationManager();

  constructor() {
    this.buildCaliforniaCity();
  }

  private buildCaliforniaCity() {
    // 1. Natural Ground Foundation (Warm concrete and soil beneath city)
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x484e5a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.cityGroup.add(ground);

    // 2. Comprehensive Multi-Avenue Road Grid with Bicycle Lanes
    this.buildRoadNetwork();

    // 3. Embarcadero / Mission-Style Public Plaza
    this.buildCentralPlaza();

    // 4. 36 Detailed Architectural Buildings (Brick, Sandstone, Glass, Concrete)
    this.buildSkyscrapers();

    // 5. Commercial Retail Storefronts with Striped Fabric Awnings & Cafe Seating
    this.buildCommercialStorefronts();

    // 6. Elevated Bay Highway Deck with Support Pillars
    this.buildElevatedHighway();

    // 7. Lush California Vegetation (Palms, Coastal Oaks, Planters)
    this.buildVegetationAndFurniture();

    // 8. Interactive Hackable City Nodes
    this.buildHackableNodes();
  }

  private buildRoadNetwork() {
    const asphaltTex = TextureGenerator.createAsphaltTexture();
    const sidewalkTex = TextureGenerator.createSidewalkTexture();

    const roadMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.65,
      metalness: 0.15,
    });

    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: sidewalkTex,
      roughness: 0.7,
      metalness: 0.1,
    });

    // 3 Major North-South Avenues (Central X=0, West X=-85, East X=+85)
    [-85, 0, 85].forEach((xPos) => {
      const roadGeo = new THREE.PlaneGeometry(24, 700);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(xPos, 0.03, 0);
      road.receiveShadow = true;
      this.cityGroup.add(road);

      // Flanking Poured Concrete Sidewalks
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
      roughness: 0.65,
      metalness: 0.15,
    });

    // Sunlit Terracotta & Stone Plaza Floor (50m x 60m)
    const plaza = new THREE.Mesh(new THREE.BoxGeometry(50, 0.35, 60), plazaMat);
    plaza.position.set(-50, 0.175, 45);
    plaza.receiveShadow = true;
    this.cityGroup.add(plaza);

    // Granite Edge Curb
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x828894, roughness: 0.7 });
    const curb = new THREE.Mesh(new THREE.BoxGeometry(50.4, 0.1, 60.4), curbMat);
    curb.position.set(-50, 0.38, 45);
    this.cityGroup.add(curb);

    // Central Public Water Fountain
    const fountainGroup = new THREE.Group();
    const poolMat = new THREE.MeshStandardMaterial({ color: 0x4a5260, roughness: 0.5 });
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.0, 0.8, 24), poolMat);
    pool.position.y = 0.4;
    pool.castShadow = true;
    fountainGroup.add(pool);

    // Water Surface
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x247ba0,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const water = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.0, 0.1, 24), waterMat);
    water.position.y = 0.75;
    fountainGroup.add(water);

    // Tiered Fountain Spout
    const spout = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.8, 2.5, 12),
      new THREE.MeshStandardMaterial({ color: 0xc4c8d0, metalness: 0.8, roughness: 0.2 })
    );
    spout.position.y = 1.65;
    spout.castShadow = true;
    fountainGroup.add(spout);

    fountainGroup.position.set(-50, 0.35, 45);
    this.cityGroup.add(fountainGroup);

    // Surrounding Plaza Teak Benches
    this.cityGroup.add(this.vegetationManager.createBench(-50, 34, 0));
    this.cityGroup.add(this.vegetationManager.createBench(-50, 56, Math.PI));
    this.cityGroup.add(this.vegetationManager.createBench(-63, 45, Math.PI / 2));
    this.cityGroup.add(this.vegetationManager.createBench(-37, 45, -Math.PI / 2));

    // Outdoor Cafe Dining on North Plaza Edge
    this.cityGroup.add(this.vegetationManager.createCafeTable(-58, 62));
    this.cityGroup.add(this.vegetationManager.createCafeTable(-52, 62));
    this.cityGroup.add(this.vegetationManager.createCafeTable(-42, 62));
  }

  private buildSkyscrapers() {
    const architecturalThemes = [
      { id: 'sandstone' as const, baseColor: 0xd8c4a0, name: 'SUTRO TOWER' },
      { id: 'brick' as const, baseColor: 0x7c3a27, name: 'MISSION LOFTS' },
      { id: 'glass' as const, baseColor: 0x2a3d54, name: 'TRANSBAY SPIRE' },
      { id: 'concrete' as const, baseColor: 0x9aa0aa, name: 'FINANCIAL PLAZA' },
      { id: 'terracotta' as const, baseColor: 0xa85838, name: 'PACIFIC HEIGHTS' },
    ];

    // 36 Architectural Buildings across 6 City Blocks
    const skyscraperBlocks = [
      // Block A (East Downtown Core)
      { x: 38, z: 40, w: 28, d: 34, h: 110, theme: 0, hasHelipad: true },
      { x: 38, z: 85, w: 26, d: 30, h: 145, theme: 2, hasHelipad: false },
      { x: 38, z: 140, w: 28, d: 36, h: 95, theme: 1, hasHelipad: true },
      { x: 38, z: 190, w: 26, d: 28, h: 130, theme: 3, hasHelipad: false },

      // Block B (Financial District)
      { x: 125, z: 40, w: 34, d: 34, h: 165, theme: 2, hasHelipad: true },
      { x: 125, z: 90, w: 32, d: 36, h: 120, theme: 4, hasHelipad: false },
      { x: 125, z: 145, w: 30, d: 32, h: 150, theme: 0, hasHelipad: true },
      { x: 125, z: 200, w: 34, d: 38, h: 85, theme: 1, hasHelipad: false },

      // Block C (West Urban District)
      { x: -38, z: -40, w: 28, d: 32, h: 125, theme: 1, hasHelipad: true },
      { x: -38, z: -85, w: 26, d: 34, h: 155, theme: 2, hasHelipad: false },
      { x: -38, z: -140, w: 28, d: 30, h: 100, theme: 0, hasHelipad: true },
      { x: -38, z: -190, w: 26, d: 32, h: 140, theme: 4, hasHelipad: false },

      // Block D (Southwest Commercial Strip)
      { x: -125, z: -40, w: 34, d: 36, h: 175, theme: 2, hasHelipad: true },
      { x: -125, z: -90, w: 32, d: 32, h: 135, theme: 3, hasHelipad: false },
      { x: -125, z: -145, w: 30, d: 38, h: 90, theme: 1, hasHelipad: true },
      { x: -125, z: -200, w: 34, d: 34, h: 160, theme: 0, hasHelipad: false },

      // Block E (Southeast Bayfront)
      { x: 38, z: -40, w: 28, d: 32, h: 135, theme: 4, hasHelipad: false },
      { x: 38, z: -85, w: 26, d: 36, h: 105, theme: 1, hasHelipad: true },
      { x: 38, z: -140, w: 28, d: 30, h: 160, theme: 2, hasHelipad: false },
      { x: 38, z: -190, w: 26, d: 34, h: 95, theme: 0, hasHelipad: true },
      { x: 125, z: -40, w: 32, d: 34, h: 140, theme: 3, hasHelipad: false },
      { x: 125, z: -90, w: 34, d: 36, h: 180, theme: 2, hasHelipad: true },
      { x: 125, z: -145, w: 30, d: 32, h: 115, theme: 1, hasHelipad: false },
      { x: 125, z: -200, w: 32, d: 34, h: 150, theme: 4, hasHelipad: true },

      // Block F (Northwest Civic Zone)
      { x: -38, z: 85, w: 28, d: 32, h: 140, theme: 0, hasHelipad: false },
      { x: -38, z: 140, w: 26, d: 34, h: 110, theme: 1, hasHelipad: true },
      { x: -38, z: 190, w: 28, d: 30, h: 165, theme: 2, hasHelipad: false },
      { x: -125, z: 40, w: 32, d: 34, h: 130, theme: 3, hasHelipad: true },
      { x: -125, z: 90, w: 34, d: 36, h: 155, theme: 0, hasHelipad: false },
      { x: -125, z: 145, w: 30, d: 32, h: 120, theme: 4, hasHelipad: true },
      { x: -125, z: 200, w: 34, d: 36, h: 170, theme: 2, hasHelipad: false },

      // Perimeter Skyline Towers
      { x: 210, z: 60, w: 38, d: 42, h: 210, theme: 2, hasHelipad: true },
      { x: 210, z: -60, w: 40, d: 40, h: 220, theme: 0, hasHelipad: true },
      { x: -210, z: 60, w: 38, d: 42, h: 195, theme: 3, hasHelipad: true },
      { x: -210, z: -60, w: 40, d: 40, h: 215, theme: 1, hasHelipad: true },
    ];

    skyscraperBlocks.forEach((b) => {
      const theme = architecturalThemes[b.theme % architecturalThemes.length];
      const towerGroup = new THREE.Group();

      const facadeTex = TextureGenerator.createBuildingFacadeTexture(theme.id);
      const facadeMat = new THREE.MeshStandardMaterial({
        map: facadeTex,
        roughness: theme.id === 'glass' ? 0.2 : 0.65,
        metalness: theme.id === 'glass' ? 0.85 : 0.15,
      });

      // 1. Classical Ground Podium Base (Sandstone & Granite)
      const podiumMat = new THREE.MeshStandardMaterial({
        color: 0x484f5c,
        roughness: 0.6,
        metalness: 0.2,
      });
      const podium = new THREE.Mesh(new THREE.BoxGeometry(b.w + 4, 12, b.d + 4), podiumMat);
      podium.position.y = 6;
      podium.castShadow = true;
      podium.receiveShadow = true;
      towerGroup.add(podium);

      // Classical Architectural Entrance Pediment & Columns
      const pedimentMat = new THREE.MeshStandardMaterial({ color: 0xd2d6dc, roughness: 0.5 });
      const pediment = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 3), pedimentMat);
      pediment.position.set(0, 5.5, b.d / 2 + 3.2);
      towerGroup.add(pediment);

      // 2. Main Tower Shaft
      const tower = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), facadeMat);
      tower.position.y = b.h / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      towerGroup.add(tower);

      // 3. Decorative Balconies on Select Floors
      if (b.h > 100) {
        [-b.w * 0.25, b.w * 0.25].forEach((bx) => {
          for (let by = 25; by < b.h * 0.7; by += 20) {
            const balcony = new THREE.Mesh(
              new THREE.BoxGeometry(5, 0.8, 1.8),
              new THREE.MeshStandardMaterial({ color: 0x333b47, metalness: 0.8, roughness: 0.3 })
            );
            balcony.position.set(bx, by, b.d / 2 + 0.9);
            towerGroup.add(balcony);
          }
        });
      }

      // 4. Stepped Rooftop Crown
      const crownHeight = 16;
      const crown = new THREE.Mesh(
        new THREE.BoxGeometry(b.w * 0.75, crownHeight, b.d * 0.75),
        podiumMat
      );
      crown.position.y = b.h + crownHeight / 2;
      crown.castShadow = true;
      towerGroup.add(crown);

      // 5. Rooftop Mechanical Elements (HVAC Units & Elevator Housing)
      const hvacMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.4 });
      [-b.w * 0.2, b.w * 0.2].forEach((hx) => {
        const hvac = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 5), hvacMat);
        hvac.position.set(hx, b.h + crownHeight + 1.5, 0);
        towerGroup.add(hvac);
      });

      // 6. Helipad or Communications Spire
      if (b.hasHelipad) {
        const padMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
        const helipad = new THREE.Mesh(new THREE.CylinderGeometry(b.w * 0.3, b.w * 0.3, 0.4, 16), padMat);
        helipad.position.y = b.h + crownHeight + 0.2;
        towerGroup.add(helipad);
      } else {
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 1.2, 24, 6),
          new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 })
        );
        spire.position.y = b.h + crownHeight + 12;
        towerGroup.add(spire);

        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0xff0033, emissive: 0xff0033, emissiveIntensity: 2.0 })
        );
        beacon.position.y = b.h + crownHeight + 24;
        towerGroup.add(beacon);
      }

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

    // 7. Glass Architectural Skybridge (Connecting Twin Towers at X: 38, Z: 40 to Z: 85)
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x222a36, metalness: 0.8, roughness: 0.3 });
    const bridgeGlassMat = new THREE.MeshStandardMaterial({
      color: 0x5599dd,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75,
    });

    const skybridge = new THREE.Group();
    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 45), bridgeMat);
    bridgeDeck.position.set(38, 70, 62.5);
    skybridge.add(bridgeDeck);

    const bridgeGlass = new THREE.Mesh(new THREE.BoxGeometry(10.2, 3.5, 45), bridgeGlassMat);
    bridgeGlass.position.set(38, 71.5, 62.5);
    skybridge.add(bridgeGlass);

    this.cityGroup.add(skybridge);
  }

  private buildCommercialStorefronts() {
    const stores = [
      {
        name: 'MISSION STREET CANTINA',
        cat: 'CALIFORNIA TACOS & SODA',
        accent: '#f59e0b',
        awning: '#b91c1c',
        x: 14.8,
        z: 25,
        rot: -Math.PI / 2,
      },
      {
        name: 'BAY VIEW ROASTERS',
        cat: 'ARTISAN COFFEE & PASTRIES',
        accent: '#38bdf8',
        awning: '#0284c7',
        x: 14.8,
        z: 45,
        rot: -Math.PI / 2,
      },
      {
        name: 'GOLDEN GATE CYCLERY',
        cat: 'COMMUTER BIKES & GEAR',
        accent: '#10b981',
        awning: '#047857',
        x: -14.8,
        z: -35,
        rot: Math.PI / 2,
      },
      {
        name: 'PACIFIC SURF & SUPPLY',
        cat: 'COASTAL APPAREL & BOARDS',
        accent: '#f43f5e',
        awning: '#be123c',
        x: -14.8,
        z: 45,
        rot: Math.PI / 2,
      },
      {
        name: 'ALCATRAZ BREWERY',
        cat: 'CRAFT ALES & TAPROOM',
        accent: '#f59e0b',
        awning: '#78350f',
        x: 55,
        z: -83,
        rot: 0,
      },
      {
        name: 'TRANSBAY TECH COWORK',
        cat: 'INNOVATION HUB & LABS',
        accent: '#6366f1',
        awning: '#4338ca',
        x: -55,
        z: 83,
        rot: Math.PI,
      },
    ];

    stores.forEach((store) => {
      const storeTex = TextureGenerator.createStorefrontTexture(
        store.name,
        store.cat,
        store.accent,
        store.awning
      );
      const signMat = new THREE.MeshBasicMaterial({ map: storeTex });

      // Striped Awning & Signboard
      const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.8), signMat);
      signMesh.position.set(store.x, 3.8, store.z);
      signMesh.rotation.y = store.rot;
      this.cityGroup.add(signMesh);

      // Storefront Clear Glass Entrance
      const entranceMat = new THREE.MeshStandardMaterial({
        color: 0x1c2b3d,
        metalness: 0.9,
        roughness: 0.1,
      });
      const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), entranceMat);
      glassMesh.position.set(store.x, 1.6, store.z);
      glassMesh.rotation.y = store.rot;
      this.cityGroup.add(glassMesh);
    });
  }

  private buildElevatedHighway() {
    const highwayGroup = new THREE.Group();
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x333b47, roughness: 0.65, metalness: 0.2 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 });

    // Elevated Highway Deck spanning X: -300 to +300 at Y = 16, Z = 140
    const deckGeo = new THREE.BoxGeometry(600, 2.2, 20);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 16, 140);
    deck.castShadow = true;
    deck.receiveShadow = true;
    highwayGroup.add(deck);

    // Highway Concrete Guardrails
    [-9.8, 9.8].forEach((offsetZ) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(600, 1.2, 0.4), railMat);
      rail.position.set(0, 17.2, 140 + offsetZ);
      highwayGroup.add(rail);
    });

    // Highway Support Pillars every 50m
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
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
    // California Coastal Oaks along Central Boulevard Sidewalks
    const oakPositions = [
      { x: -16.5, z: -40, isAutumn: false },
      { x: 16.5, z: -40, isAutumn: false },
      { x: -16.5, z: 20, isAutumn: false },
      { x: 16.5, z: 20, isAutumn: false },
      { x: -16.5, z: 80, isAutumn: true },
      { x: 16.5, z: 80, isAutumn: true },
    ];

    oakPositions.forEach((pos) => {
      const tree = this.vegetationManager.createOakTree(pos.x, pos.z, pos.isAutumn);
      this.cityGroup.add(tree);
    });

    // California Palm Trees along East-West Crossways & Plaza
    const palmPositions = [
      { x: -16.5, z: -80 },
      { x: 16.5, z: -80 },
      { x: -16.5, z: -15 },
      { x: 16.5, z: -15 },
      { x: -65, z: 25 },
      { x: -65, z: 65 },
      { x: -35, z: 65 },
      { x: -35, z: 25 },
    ];

    palmPositions.forEach((pos) => {
      const palm = this.vegetationManager.createPalmTree(pos.x, pos.z);
      this.cityGroup.add(palm);
    });

    // Sidewalk Planter Beds
    this.cityGroup.add(this.vegetationManager.createPlanterBed(40, -14.5, 2.0, 14));
    this.cityGroup.add(this.vegetationManager.createPlanterBed(-40, -14.5, 2.0, 14));
    this.cityGroup.add(this.vegetationManager.createPlanterBed(40, 14.5, 2.0, 14));
    this.cityGroup.add(this.vegetationManager.createPlanterBed(-40, 14.5, 2.0, 14));

    // Sidewalk Teak Benches
    this.cityGroup.add(this.vegetationManager.createBench(16.5, -45, -Math.PI / 2));
    this.cityGroup.add(this.vegetationManager.createBench(-16.5, -45, Math.PI / 2));
    this.cityGroup.add(this.vegetationManager.createBench(16.5, 45, -Math.PI / 2));
    this.cityGroup.add(this.vegetationManager.createBench(-16.5, 45, Math.PI / 2));

    // Realistic Modern California Streetlamps
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 });
    const lampGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfff0dd,
      emissive: 0xffd28e,
      emissiveIntensity: 0.2, // Will dynamically brighten at night via TimeOfDay
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

      // Downward street spotlights (active at night)
      if (idx < 6) {
        const spot = new THREE.SpotLight(0xffecd1, 24, 30, Math.PI / 4, 0.4, 1.2);
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
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
    );
    barricadeGroup.add(baseMesh);

    const bollardsMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
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
        bollardsMat.emissive.setHex(barricadeRaised ? 0xef4444 : 0x22c55e);
      },
    });

    // Node 2: Giant Digital Billboard (Watch Dogs 2 Style)
    const billboardCanvas = document.createElement('canvas');
    billboardCanvas.width = 512;
    billboardCanvas.height = 256;
    const bCtx = billboardCanvas.getContext('2d')!;
    this.drawBillboardGraphic(bCtx, 'BLUME CTOS 2.0', 'CONNECTING THE BAY AREA', '#0284c7');
    const billboardTex = new THREE.CanvasTexture(billboardCanvas);
    billboardTex.colorSpace = THREE.SRGBColorSpace;

    const billboardGroup = new THREE.Group();
    const frameMesh = new THREE.Mesh(
      new THREE.BoxGeometry(16, 8, 1),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
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
      name: 'CENTRAL METRO BILLBOARD',
      position: billboardGroup.position.clone(),
      mesh: billboardGroup,
      status: 'online',
      cooldown: 0,
      onHack: () => {
        billboardState = (billboardState + 1) % 3;
        const messages = [
          { text: 'DEDSEC IS WATCHING', sub: 'JOIN THE RESISTANCE // SF', color: '#ec4899' },
          { text: 'BLUME SMART CITY', sub: 'PRIVACY IS A PRIVILEGE', color: '#06b6d4' },
          { text: 'PROJECT NEON CITY', sub: 'CALIFORNIA EXPANSION ONLINE', color: '#3b82f6' },
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
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
    );
    transMesh.position.y = 2;
    transformerGroup.add(transMesh);

    const coilMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
    });
    const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4.2, 8), coilMat);
    coil.position.y = 2.1;
    transformerGroup.add(coil);

    transformerGroup.position.set(-16.5, 0, 35);
    this.cityGroup.add(transformerGroup);

    this.hackableNodes.push({
      id: 'hack_transformer_01',
      type: 'transformer',
      name: 'PACIFIC POWER GRID #04',
      position: transformerGroup.position.clone(),
      mesh: transformerGroup,
      status: 'online',
      cooldown: 0,
      onHack: () => {
        coilMat.emissive.setHex(0xf59e0b);
        coilMat.emissiveIntensity = 3.5;
        setTimeout(() => {
          coilMat.emissive.setHex(0x0284c7);
          coilMat.emissiveIntensity = 1.5;
        }, 1200);
      },
    });
  }

  private drawBillboardGraphic(ctx: CanvasRenderingContext2D, text: string, sub: string, color: string) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#1e293b';
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
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 120);

    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(sub, 256, 175);
  }
}
