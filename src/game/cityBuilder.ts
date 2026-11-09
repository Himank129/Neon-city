/**
 * PROJECT NEON CITY - City Builder & Procedural Urban Architecture
 * Generates Downtown cyber-district, highway overpasses, interactive hackable nodes,
 * street infrastructure, and neon signage.
 */

import * as THREE from 'three';

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

  // Procedural Textures
  private roadTexture: THREE.CanvasTexture | null = null;
  private neonTextures: Map<string, THREE.CanvasTexture> = new Map();

  constructor() {
    this.createProceduralTextures();
    this.buildCity();
  }

  private createProceduralTextures() {
    // 1. Road Texture with Asphalt Grit & Markings
    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 512;
    roadCanvas.height = 512;
    const ctx = roadCanvas.getContext('2d')!;

    // Dark asphalt base
    ctx.fillStyle = '#111317';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle asphalt noise
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const gray = Math.floor(20 + Math.random() * 25);
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Yellow center divider dashed line
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(250, 40, 12, 100);
    ctx.fillRect(250, 200, 12, 100);
    ctx.fillRect(250, 360, 12, 100);

    // White edge lanes
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(20, 0, 8, 512);
    ctx.fillRect(484, 0, 8, 512);

    this.roadTexture = new THREE.CanvasTexture(roadCanvas);
    this.roadTexture.wrapS = THREE.RepeatWrapping;
    this.roadTexture.wrapT = THREE.RepeatWrapping;
    this.roadTexture.colorSpace = THREE.SRGBColorSpace;
  }

  public createNeonBillboardTexture(text: string, subtext: string, color: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Cyber digital backdrop
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, 512, 256);

    // Digital grid lines
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

    // Glowing border
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 240);

    // Text glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 120);

    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = color;
    ctx.fillText(subtext, 256, 175);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private buildCity() {
    // 1. Ground Plaza / Foundation
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x080a10,
      roughness: 0.85,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.cityGroup.add(ground);

    // 2. Road Network (Main thoroughfare + Cross avenues)
    this.buildRoadNetwork();

    // 3. Downtown Skyscrapers & Megastructures (Composite 3-8 parts each)
    this.buildSkyscrapers();

    // 4. Elevated Highway & Ramps
    this.buildElevatedHighway();

    // 5. Street Furniture & Lighting (Streetlamps, bus stops, cyber trees)
    this.buildStreetInfrastructure();

    // 6. Interactive Hackable City Nodes (Barricades, Billboards, Transformers, Cameras)
    this.buildHackableNodes();
  }

  private buildRoadNetwork() {
    if (!this.roadTexture) return;

    // Main Avenue (North-South, 18m wide, 400m long)
    const mainRoadMat = new THREE.MeshStandardMaterial({
      map: this.roadTexture,
      roughness: 0.6,
      metalness: 0.15,
    });
    this.roadTexture.repeat.set(1, 20);

    const mainRoad = new THREE.Mesh(new THREE.PlaneGeometry(24, 400), mainRoadMat);
    mainRoad.rotation.x = -Math.PI / 2;
    mainRoad.position.set(0, 0.03, 0); // Offset to avoid z-fighting
    mainRoad.receiveShadow = true;
    this.cityGroup.add(mainRoad);

    // Cross Boulevard (East-West, 20m wide, 400m long)
    const crossRoadTexture = this.roadTexture.clone();
    crossRoadTexture.repeat.set(1, 20);
    const crossRoadMat = new THREE.MeshStandardMaterial({
      map: crossRoadTexture,
      roughness: 0.6,
      metalness: 0.15,
    });
    const crossRoad = new THREE.Mesh(new THREE.PlaneGeometry(24, 400), crossRoadMat);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.rotation.z = Math.PI / 2;
    crossRoad.position.set(0, 0.04, 0);
    crossRoad.receiveShadow = true;
    this.cityGroup.add(crossRoad);

    // Sidewalk Curbs along Main Road
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x1e2430, roughness: 0.8 });
    [-14, 14].forEach((x) => {
      const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 400), curbMat);
      sidewalk.position.set(x, 0.1, 0);
      sidewalk.receiveShadow = true;
      this.cityGroup.add(sidewalk);
    });
  }

  private buildSkyscrapers() {
    // City block layout with diverse skyscraper designs
    const buildingPalette = [
      { hull: 0x0f1422, glow: 0x00f0ff, sign: 'QUANTUM CORP' },
      { hull: 0x140e1c, glow: 0xff007f, sign: 'NEON SYNDICATE' },
      { hull: 0x0b181a, glow: 0x00ff88, sign: 'CYBER DYNAMICS' },
      { hull: 0x1a150e, glow: 0xffaa00, sign: 'HYPERION LABS' },
      { hull: 0x111625, glow: 0x7f00ff, sign: 'AURA NETWORKS' },
    ];

    const blockPositions = [
      // Quadrant 1 (North-East)
      { x: 38, z: 40, w: 28, d: 32, h: 90, theme: 0 },
      { x: 74, z: 40, w: 26, d: 24, h: 65, theme: 1 },
      { x: 38, z: 85, w: 28, d: 36, h: 120, theme: 2 },
      { x: 74, z: 85, w: 26, d: 30, h: 80, theme: 3 },
      { x: 115, z: 60, w: 34, d: 38, h: 140, theme: 4 },

      // Quadrant 2 (North-West)
      { x: -38, z: 40, w: 28, d: 32, h: 110, theme: 1 },
      { x: -74, z: 40, w: 26, d: 24, h: 70, theme: 0 },
      { x: -38, z: 85, w: 28, d: 36, h: 85, theme: 4 },
      { x: -74, z: 85, w: 26, d: 30, h: 130, theme: 2 },
      { x: -115, z: 60, w: 34, d: 38, h: 95, theme: 3 },

      // Quadrant 3 (South-East)
      { x: 38, z: -40, w: 28, d: 32, h: 100, theme: 3 },
      { x: 74, z: -40, w: 26, d: 24, h: 75, theme: 4 },
      { x: 38, z: -85, w: 28, d: 36, h: 145, theme: 0 },
      { x: 74, z: -85, w: 26, d: 30, h: 90, theme: 1 },
      { x: 115, z: -60, w: 34, d: 38, h: 115, theme: 2 },

      // Quadrant 4 (South-West)
      { x: -38, z: -40, w: 28, d: 32, h: 85, theme: 2 },
      { x: -74, z: -40, w: 26, d: 24, h: 105, theme: 3 },
      { x: -38, z: -85, w: 28, d: 36, h: 135, theme: 1 },
      { x: -74, z: -85, w: 26, d: 30, h: 70, theme: 4 },
      { x: -115, z: -60, w: 34, d: 38, h: 125, theme: 0 },
    ];

    blockPositions.forEach((b) => {
      const theme = buildingPalette[b.theme % buildingPalette.length];
      const buildingGroup = new THREE.Group();

      // Part 1: Main Tower Hull
      const towerGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const towerMat = new THREE.MeshStandardMaterial({
        color: theme.hull,
        roughness: 0.35,
        metalness: 0.7,
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = b.h / 2;
      tower.castShadow = true;
      tower.receiveShadow = true;
      buildingGroup.add(tower);

      // Part 2: Podium Base (Ground level architectural entrance)
      const podiumGeo = new THREE.BoxGeometry(b.w + 4, 10, b.d + 4);
      const podiumMat = new THREE.MeshStandardMaterial({
        color: 0x090c14,
        roughness: 0.6,
        metalness: 0.4,
      });
      const podium = new THREE.Mesh(podiumGeo, podiumMat);
      podium.position.y = 5;
      podium.castShadow = true;
      podium.receiveShadow = true;
      buildingGroup.add(podium);

      // Part 3: Glowing Window Bands (Emissive stripes)
      const bandCount = Math.floor(b.h / 14);
      for (let i = 1; i <= bandCount; i++) {
        const bandGeo = new THREE.BoxGeometry(b.w + 0.3, 1.2, b.d + 0.3);
        const bandMat = new THREE.MeshStandardMaterial({
          color: 0x050810,
          emissive: theme.glow,
          emissiveIntensity: 0.8,
          roughness: 0.2,
        });
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.position.y = i * 14;
        buildingGroup.add(band);
      }

      // Part 4: Rooftop Spire / Antenna Array
      const spireGeo = new THREE.CylinderGeometry(0.4, 1.2, 16, 6);
      const spireMat = new THREE.MeshStandardMaterial({
        color: 0x222635,
        metalness: 0.9,
        roughness: 0.2,
      });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.y = b.h + 8;
      buildingGroup.add(spire);

      // Spire Red Warning Beacon
      const beaconGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0xff0033,
        emissive: 0xff0033,
        emissiveIntensity: 2.0,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = b.h + 16;
      buildingGroup.add(beacon);

      // Part 5: Side Neon Sign on Select Towers
      if (b.h > 80) {
        const signMat = new THREE.MeshStandardMaterial({
          emissive: theme.glow,
          emissiveIntensity: 1.5,
          color: 0x000000,
        });
        const signGeo = new THREE.BoxGeometry(8, 20, 0.4);
        const signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.set(0, b.h * 0.65, b.d / 2 + 0.3);
        buildingGroup.add(signMesh);
      }

      buildingGroup.position.set(b.x, 0, b.z);
      this.cityGroup.add(buildingGroup);

      // Add Box3 Collider for character & car collision
      const collider = new THREE.Box3();
      collider.setFromCenterAndSize(
        new THREE.Vector3(b.x, b.h / 2, b.z),
        new THREE.Vector3(b.w + 2, b.h, b.d + 2)
      );
      this.colliders.push(collider);
    });
  }

  private buildElevatedHighway() {
    const highwayGroup = new THREE.Group();
    const highwayMat = new THREE.MeshStandardMaterial({
      color: 0x151922,
      roughness: 0.7,
      metalness: 0.3,
    });

    // Elevated Deck (Spanning X: -160 to +160 at Y = 16, Z = 140)
    const deckGeo = new THREE.BoxGeometry(320, 2, 18);
    const deck = new THREE.Mesh(deckGeo, highwayMat);
    deck.position.set(0, 16, 140);
    deck.castShadow = true;
    deck.receiveShadow = true;
    highwayGroup.add(deck);

    // Glowing Cyber Guardrails
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.2,
    });
    [-8.8, 8.8].forEach((offsetZ) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(320, 1.2, 0.4), railMat);
      rail.position.set(0, 17.2, 140 + offsetZ);
      highwayGroup.add(rail);
    });

    // Support Concrete Pillars every 40m
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1f2430, roughness: 0.9 });
    for (let x = -140; x <= 140; x += 40) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.4, 16, 8), pillarMat);
      pillar.position.set(x, 8, 140);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      highwayGroup.add(pillar);

      const collider = new THREE.Box3();
      collider.setFromCenterAndSize(new THREE.Vector3(x, 8, 140), new THREE.Vector3(4.5, 16, 4.5));
      this.colliders.push(collider);
    }

    this.cityGroup.add(highwayGroup);
  }

  private buildStreetInfrastructure() {
    // Cyber Streetlamps with glowing luminaire and real downward spotlight
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x222733, metalness: 0.8, roughness: 0.3 });
    const emissiveMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.2,
    });

    const lampPositions = [
      { x: -15, z: 25 }, { x: 15, z: 25 },
      { x: -15, z: 70 }, { x: 15, z: 70 },
      { x: -15, z: -25 }, { x: 15, z: -25 },
      { x: -15, z: -70 }, { x: 15, z: -70 },
      { x: 30, z: -15 }, { x: 70, z: -15 },
      { x: -30, z: -15 }, { x: -70, z: -15 },
    ];

    lampPositions.forEach((pos, idx) => {
      const lampGroup = new THREE.Group();
      // Pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 9, 8), lampMat);
      pole.position.y = 4.5;
      lampGroup.add(pole);

      // Horizontal arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 0.2), lampMat);
      const armDir = pos.x > 0 ? -1 : 1;
      arm.position.set(armDir * 1.0, 9, 0);
      lampGroup.add(arm);

      // Light Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.4), emissiveMat);
      head.position.set(armDir * 2.0, 8.9, 0);
      lampGroup.add(head);

      lampGroup.position.set(pos.x, 0, pos.z);
      this.cityGroup.add(lampGroup);

      // Add a couple of active spotlights (budget 4-6)
      if (idx < 4) {
        const spot = new THREE.SpotLight(0x70eeff, 18, 25, Math.PI / 4, 0.4, 1.2);
        spot.position.set(pos.x + armDir * 2.0, 8.8, pos.z);
        spot.target.position.set(pos.x + armDir * 2.0, 0, pos.z);
        this.cityGroup.add(spot.target);
        this.cityGroup.add(spot);
        this.streetLights.push(spot);
      }
    });

    // Cybernetic Trees (Prismatic trunks with geometric cyan/magenta leaves)
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x1b1c24, roughness: 0.8 });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x051a24,
      emissive: 0x00f0aa,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    });

    const treePositions = [
      { x: -17, z: 10 }, { x: 17, z: 10 },
      { x: -17, z: -10 }, { x: 17, z: -10 },
      { x: -17, z: 50 }, { x: 17, z: 50 },
      { x: -17, z: -50 }, { x: 17, z: -50 },
    ];

    treePositions.forEach((pos) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 4.5, 6), treeTrunkMat);
      trunk.position.y = 2.25;
      tree.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), leafMat);
      crown.position.y = 4.8;
      tree.add(crown);

      tree.position.set(pos.x, 0, pos.z);
      this.cityGroup.add(tree);
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
    const billboardTexture = this.createNeonBillboardTexture('CTOS OVERRIDE', 'ACCESS GRANTED', '#00f0ff');
    const billboardGroup = new THREE.Group();
    const frameMesh = new THREE.Mesh(
      new THREE.BoxGeometry(16, 8, 1),
      new THREE.MeshStandardMaterial({ color: 0x111622, metalness: 0.8, roughness: 0.3 })
    );
    billboardGroup.add(frameMesh);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(15.6, 7.6),
      new THREE.MeshBasicMaterial({ map: billboardTexture })
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
        const newTex = this.createNeonBillboardTexture(next.text, next.sub, next.color);
        screenMesh.material.map = newTex;
        screenMesh.material.needsUpdate = true;
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

    transformerGroup.position.set(-16, 0, 35);
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
}
