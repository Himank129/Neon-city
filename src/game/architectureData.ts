/**
 * PROJECT NEON CITY - Unity 6.3 LTS Master Architecture Blueprint
 * Comprehensive architectural specifications, folder structures, scene hierarchies,
 * package manifests, and editor setup guides for Windows PC.
 */

export interface SystemSpec {
  id: number;
  name: string;
  scope: string;
  keyClasses: string[];
  dependencies: string[];
  notes: string;
}

export interface FolderNode {
  name: string;
  path: string;
  description: string;
  children?: FolderNode[];
}

export const ARCHITECTURE_SYSTEMS: SystemSpec[] = [
  {
    id: 1,
    name: 'Core & Game Management',
    scope: 'Bootstrap lifecycle, game states (Boot, Title, FreeRoam, Mission, Paused), global event broker, service locator.',
    keyClasses: ['GameManager.cs', 'GameStateSO.cs', 'GameEventListener.cs', 'SceneLoader.cs'],
    dependencies: ['None (Foundation)'],
    notes: 'Pure ScriptableObject-driven event architecture. Zero hard references to scene objects.',
  },
  {
    id: 2,
    name: 'Player Movement System',
    scope: 'Valorant-inspired crisp ground kinematics, coyote time, jump buffering, sprint, crouch/slide, stance states.',
    keyClasses: ['PlayerController.cs', 'PlayerLocomotionSO.cs', 'CharacterGroundCheck.cs', 'PlayerStanceState.cs'],
    dependencies: ['Input System', 'Unity Physics'],
    notes: 'Decoupled from Camera. Movement operates on CharacterController with kinematic velocity vectors.',
  },
  {
    id: 3,
    name: 'Camera Management',
    scope: 'Cinemachine 3 brain, seamless First-Person to Third-Person POV switching, vehicle chase rig, camera trauma/shake.',
    keyClasses: ['CameraManager.cs', 'PerspectiveSwitcher.cs', 'CameraShakeSO.cs', 'CinemachineTargetProvider.cs'],
    dependencies: ['Cinemachine 3.0', 'Input System'],
    notes: 'Player position never resets on perspective toggle. Uses virtual camera priorities and blending.',
  },
  {
    id: 4,
    name: 'Interaction System',
    scope: 'Watch Dogs-style raycast & spherical scanning, hackable node discovery, contextual HUD prompts, interactable triggers.',
    keyClasses: ['IInteractable.cs', 'IHackable.cs', 'InteractionDetector.cs', 'HackPulseScanner.cs', 'HackActionSO.cs'],
    dependencies: ['Unity Physics', 'UI/HUD'],
    notes: 'Interface-driven (IInteractable, IHackable). No polling; uses spherical overlap queries.',
  },
  {
    id: 5,
    name: 'Vehicle System',
    scope: 'Forza Horizon-inspired arcade-sim driving, WheelColliders/Raycast suspension, drift slip, enter/exit transitions.',
    keyClasses: ['VehicleController.cs', 'VehiclePhysicsSO.cs', 'VehicleSeatManager.cs', 'VehicleAudioBridge.cs'],
    dependencies: ['Unity Physics', 'Camera Management', 'Audio System'],
    notes: 'Seamless transfer of Input context from Character to Vehicle via Input Action Map switching.',
  },
  {
    id: 6,
    name: 'World & District Streaming',
    scope: 'Additive scene loading/unloading based on player spatial bounds, LOD groups, occlusion culling portals.',
    keyClasses: ['DistrictManager.cs', 'DistrictBoundsTrigger.cs', 'DistrictDataSO.cs', 'WorldStreamer.cs'],
    dependencies: ['Core Game Management (SceneLoader)'],
    notes: 'Asynchronous Additive Scene loading (`LoadSceneMode.Additive`). Never unloads Persistent Core scene.',
  },
  {
    id: 7,
    name: 'NPC & Traffic System',
    scope: 'Pedestrian navigation mesh, crowd pooling, traffic spline routes, alert states (Watch Dogs style).',
    keyClasses: ['NPCAgent.cs', 'TrafficSplineFollower.cs', 'CrowdPoolManager.cs', 'NPCBrainSO.cs'],
    dependencies: ['Unity Navigation / Splines', 'Object Pooling'],
    notes: 'LOD updates: distant NPCs evaluate logic at 5Hz; nearby at 60Hz. Zero allocation loops.',
  },
  {
    id: 8,
    name: 'Mission & Quest System',
    scope: 'ScriptableObject quest graphs, dynamic objectives, mission triggers, checkpoint states.',
    keyClasses: ['QuestGraphSO.cs', 'QuestStep.cs', 'QuestManager.cs', 'MissionRewardSO.cs'],
    dependencies: ['Save/Load System', 'UI/HUD', 'Core'],
    notes: 'Quests subscribe to Game Event Channels (e.g. OnVehicleHacked, OnAreaEntered).',
  },
  {
    id: 9,
    name: 'Dialogue System',
    scope: 'Branching cyber-conversations, subtitle feeds, character portraits, audio triggers.',
    keyClasses: ['DialogueGraphSO.cs', 'DialogueNode.cs', 'DialogueRunner.cs'],
    dependencies: ['Audio System', 'UI/HUD'],
    notes: 'Text mesh pro typing animations, localized text tables.',
  },
  {
    id: 10,
    name: 'UI & Modern HUD',
    scope: 'Minimalist perimeter HUD (Valorant health/shield, Watch Dogs hacking brackets, Forza digital speedometer).',
    keyClasses: ['HUDController.cs', 'SpeedometerView.cs', 'HackTargetWidget.cs', 'CrosshairDynamics.cs'],
    dependencies: ['UI Toolkit / Canvas', 'Core Game Events'],
    notes: 'Zero-occlusion design (<15% screen space). Driven by event subscriptions.',
  },
  {
    id: 11,
    name: 'Save & Load System',
    scope: 'Binary / JSON encrypted local save files on Windows PC, player progression, vehicle unlocks, quest flags.',
    keyClasses: ['SaveManager.cs', 'ISaveable.cs', 'SaveDataDto.cs', 'FileEncryption.cs'],
    dependencies: ['Core Game Management'],
    notes: 'Atomic writes with temporary shadow files to prevent corruption on sudden exit.',
  },
  {
    id: 12,
    name: 'Audio System',
    scope: 'FMOD or Unity Audio Mixer routing, dynamic music stems, vehicle engine pitch synthesis, spatial 3D audio.',
    keyClasses: ['AudioManager.cs', 'AudioCueSO.cs', 'SoundEmitter.cs', 'VehicleEngineAudio.cs'],
    dependencies: ['AudioMixer', 'Object Pooling'],
    notes: 'Audio Cues authored as ScriptableObjects. Audio sources pooled to eliminate runtime instantiations.',
  },
];

export const RECOMMENDED_PACKAGES = [
  {
    name: 'Universal RP (com.unity.render-pipelines.universal)',
    version: '17.0.3+ (Unity 6)',
    purpose: 'Core high-fidelity graphics pipeline with Forward+ rendering, volumetric fog, decal projectors, and screen-space ambient occlusion.',
  },
  {
    name: 'Input System (com.unity.inputsystem)',
    version: '1.8.0+',
    purpose: 'Modern multi-action asset mapping (Player, Vehicle, UI, Hacking maps) with edge triggers and analog smoothing.',
  },
  {
    name: 'Cinemachine (com.unity.cinemachine)',
    version: '3.1.0+',
    purpose: 'Seamless multi-camera state machine, virtual camera priority blending, FPS pan/tilt rig, third-person spring follow, car chase rig.',
  },
  {
    name: 'Unity Splines (com.unity.splines)',
    version: '2.6.0+',
    purpose: 'Highway road generation, pedestrian paths, traffic spline movement curves, and train rails.',
  },
  {
    name: 'Unity Mathematics (com.unity.mathematics)',
    version: '1.3.2+',
    purpose: 'Fast SIMD-optimized math structures (float3, quaternion, math functions) for vehicle physics calculations.',
  },
  {
    name: 'Addressables (com.unity.addressables)',
    version: '2.3.0+',
    purpose: 'Asset memory management and async district asset loading to minimize Windows PC memory footprint.',
  },
  {
    name: 'TextMeshPro (com.unity.textmeshpro)',
    version: '3.2.0+',
    purpose: 'SDF vector typography for crisp in-world holographic signs and UI displays at any screen resolution.',
  },
];

export const INITIAL_SCENE_HIERARCHY = `
[SCENE: _Bootstrap (Build Index 0 - Never Unloaded)]
├── --- CORE SERVICES ---
│   ├── GameManager [GameManager.cs, AppLifetimeManager.cs]
│   ├── InputManager [PlayerInput, InputReaderSO]
│   ├── SceneLoader [AdditiveDistrictLoader.cs]
│   └── EventChannels [GlobalEventBrokerSO]
├── --- AUDIO ---
│   └── AudioService [AudioManager.cs, AudioMixerGroup references]
└── --- UI ROOT ---
    └── MasterCanvas [ScreenOverlay, DebugConsole, TransitionCurtain]

[SCENE: NeonCity_Persistent (Loaded Additively at Boot)]
├── --- LIGHTING & ENVIRONMENT ---
│   ├── Directional Light [URP Additional Light Data: Shadows Soft, Color: #A5C9FF]
│   ├── Global Volume [Bloom, Tonemapping ACES, Motion Blur, Vignette, Fog]
│   └── Reflection Probe Grid [Realtime / Mixed]
├── --- PLAYER RIG ---
│   ├── Player_Neo [CharacterController, PlayerController.cs, GroundCheck]
│   │   ├── StanceRoot [Mesh / Skeleton, WeaponHolder]
│   │   ├── FirstPersonMount [CameraTarget, HeadPivot]
│   │   └── ThirdPersonMount [CameraTarget, OverShoulderPivot]
│   └── Cameras
│       ├── MainCamera [Camera, UniversalAdditionalCameraData, CinemachineBrain]
│       ├── vcam_FirstPerson [CinemachineVirtualCamera: Priority 10]
│       ├── vcam_ThirdPerson [CinemachineVirtualCamera: Priority 0]
│       └── vcam_VehicleChase [CinemachineVirtualCamera: Priority 0]
└── --- VEHICLE HERO PROP ---
    └── CyberCar_Specter [Rigidbody, VehicleController.cs, WheelColliders]

[SCENE: District_Downtown_01 (Additive Streaming Chunk)]
├── --- CHUNK METADATA ---
│   └── DistrictAnchor [DistrictBoundsTrigger: Radius 250m]
├── --- STATIC GEOMETRY (Static Batching + Occlusion Tagged) ---
│   ├── Block_01_Skyscrapers [LODGroup: LOD0 (Mesh), LOD1 (Decimated), LOD2 (BoxProxy)]
│   ├── Elevated_Highway_Deck [MeshCollider, SplineExtrude]
│   └── Roads_Asphalt_Grid [Terrain / MeshGrid]
├── --- DYNAMIC PROPS ---
│   ├── Hackable_Barricades [IHackable, RetractablePiston]
│   ├── Holographic_Billboards [MeshRenderer, MaterialInstance]
│   └── StreetLamps_Group [LODGroup: Mesh + Light]
└── --- NAVIGATION ---
    └── NavMeshSurface [Walkable, HighRiskZones]
`;

export const FOLDER_STRUCTURE_TEXT = `
Assets/
├── _Project/
│   ├── Art/
│   │   ├── Animations/
│   │   ├── Materials/ (URP Lit, Emissive Shaders, Decals)
│   │   ├── Models/ (Characters, Vehicles, Buildings, Props)
│   │   ├── Shaders/ (Shader Graph: Holograms, RainGlass, Neon)
│   │   └── Textures/
│   ├── Audio/
│   │   ├── Cues/ (ScriptableObjects)
│   │   ├── Music/
│   │   ├── SFX/ (Engines, Footsteps, Hacking, UI)
│   │   └── Mixers/ (Master, Music, SFX, Ambient, Vehicle)
│   ├── Data/
│   │   ├── Events/ (VoidEventSO, FloatEventSO, Vector3EventSO)
│   │   ├── Inputs/ (NeonCity_InputActions.inputactions)
│   │   ├── Quests/
│   │   ├── Settings/ (URP Assets, GraphicsPresets)
│   │   └── Vehicles/ (Specter_PhysicsConfigSO.asset)
│   ├── Prefabs/
│   │   ├── Cameras/
│   │   ├── Characters/
│   │   ├── Environment/
│   │   ├── UI/
│   │   └── Vehicles/
│   ├── Scenes/
│   │   ├── 00_Bootstrap.unity
│   │   ├── 01_Persistent.unity
│   │   └── Districts/
│   │       ├── District_Downtown_01.unity
│   │       ├── District_Industrial_02.unity
│   │       └── District_Highway_03.unity
│   └── Scripts/
│       ├── Core/ (GameManager, Bootstrapper, StateMachine)
│       ├── Player/ (Locomotion, GroundCheck, Stance)
│       ├── Camera/ (CameraManager, PerspectiveToggle)
│       ├── Interaction/ (IInteractable, IHackable, Scanner)
│       ├── Vehicle/ (VehicleController, WheelPhysics)
│       ├── World/ (DistrictStreamer, SceneLoader)
│       ├── NPC/ (CrowdAgent, TrafficFollower)
│       ├── Quest/ (QuestManager, Objectives)
│       ├── UI/ (HUDController, Speedometer)
│       ├── Audio/ (AudioManager, SoundEmitter)
│       └── Utilities/ (ObjectPool, MathUtils, Singleton)
`;

export const MILESTONE_1_DEFINITION = {
  title: 'Milestone 1: The Core Character & Dual-Perspective Camera Rig',
  deliverables: [
    'Unity Input Actions asset configured with "Player" and "Camera" action maps.',
    'CharacterController-based Player Movement script with Valorant-style snappy velocity, sprinting, and jump buffering/coyote time.',
    'Cinemachine 3 setup with two Virtual Cameras: First-Person (CinemachinePanTilt) and Third-Person (CinemachineFollow).',
    'PerspectiveSwitcher script binding [V] key to smoothly interpolate virtual camera priorities without moving player GameObject.',
    'Greybox testing gym scene with flat floor, steps, obstacles, and distance markers to verify movement speed, jump height, and camera clipping.',
    'Zero console warnings or errors on Windows PC target.',
  ],
  acceptanceCriteria: [
    'Player moves at 5.0 m/s walk, 9.5 m/s sprint with immediate acceleration/deceleration curve.',
    'Jump reaches 1.8m height with coyote time permitting jump 120ms after stepping off ledge.',
    'Pressing [V] swaps camera instantly or blends over 0.25s without position hitching.',
    'Mouse look is silky smooth with vertical clamping at ±80 degrees.',
  ],
};

export const UNITY_EDITOR_SETUP_GUIDE = [
  {
    step: '1. Create New Unity 6.3 LTS Project',
    action: 'Select "3D (URP)" template in Unity Hub. Name the project "ProjectNeonCity". Target Platform: Windows (x86_64).',
  },
  {
    step: '2. Install Required Packages via Package Manager',
    action: 'Window > Package Manager > Unity Registry. Install: "Input System", "Cinemachine", "Splines", "Mathematics", "TextMeshPro".',
  },
  {
    step: '3. Project Settings - Player & Graphics',
    action: 'Edit > Project Settings > Player: Active Input Handling = "Both" or "Input System Package (New)". Color Space = "Linear". Graphics API = Direct3D12 or Direct3D11.',
  },
  {
    step: '4. Setup Custom Layers and Tags',
    action: 'Tags & Layers: Add Layers: [6: Ground], [7: Obstacle], [8: Player], [9: Vehicle], [10: Hackable], [11: CameraIgnore].',
  },
  {
    step: '5. Physics 2D/3D Collision Matrix Configuration',
    action: 'Edit > Project Settings > Physics: Uncheck Player vs CameraIgnore, Vehicle vs CameraIgnore to prevent camera jitter.',
  },
  {
    step: '6. Universal Render Pipeline (URP) Asset Tuning',
    action: 'In URP High-Quality Asset: Rendering Path = Forward+. Depth Priming = Auto. Cast Shadows = Enabled (Distance: 150m, 4 Cascades). Set Volume Profile with ACES Tonemapping.',
  },
  {
    step: '7. Create Folder Structure',
    action: 'Right-click Assets > Create the _Project folder hierarchy as defined in the Folder Structure specification.',
  },
];
