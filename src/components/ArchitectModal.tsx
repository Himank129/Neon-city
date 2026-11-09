/**
 * PROJECT NEON CITY - Unity 6.3 LTS Master Architect Station
 * Interactive technical workspace detailing the 12 systems, folder hierarchy,
 * scene structure, package manifests, communication architecture, Milestone 1, and editor setup.
 */

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  FolderTree,
  Layers,
  Package,
  Network,
  Milestone,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  ARCHITECTURE_SYSTEMS,
  RECOMMENDED_PACKAGES,
  INITIAL_SCENE_HIERARCHY,
  FOLDER_STRUCTURE_TEXT,
  MILESTONE_1_DEFINITION,
  UNITY_EDITOR_SETUP_GUIDE,
} from '../game/architectureData';

interface ArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType =
  | 'systems'
  | 'folders'
  | 'scenes'
  | 'packages'
  | 'communication'
  | 'milestone'
  | 'editor_setup';

export const ArchitectModal: React.FC<ArchitectModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('systems');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const filteredSystems = ARCHITECTURE_SYSTEMS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.keyClasses.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 font-mono">
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-950 border border-cyan-500/50 flex flex-col shadow-[0_0_35px_rgba(0,240,255,0.25)] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-black/80">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-cyan-400 rotate-45 shadow-[0_0_8px_#00f0ff]" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wider flex items-center gap-2">
                <span>PROJECT NEON CITY</span>
                <span className="text-cyan-400 text-xs font-normal px-2 py-0.5 bg-cyan-950 border border-cyan-800">
                  UNITY 6.3 LTS ARCHITECT STATION
                </span>
              </h2>
              <p className="text-xs text-slate-400">Master Engineering Blueprint & System Validation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto select-none">
          {[
            { id: 'systems', label: '1. Architecture Review', icon: Layers },
            { id: 'folders', label: '2. Folder Structure', icon: FolderTree },
            { id: 'scenes', label: '3. Scene Hierarchy', icon: Layers },
            { id: 'packages', label: '4. Unity Packages', icon: Package },
            { id: 'communication', label: '5. System Communication', icon: Network },
            { id: 'milestone', label: '6. Milestone 1', icon: Milestone },
            { id: 'editor_setup', label: '7. Editor Setup Guide', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 p-6 overflow-y-auto text-slate-300 text-sm space-y-6">
          {/* TAB 1: ARCHITECTURE REVIEW */}
          {activeTab === 'systems' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-cyan-400 mb-1">
                    VALIDATION OF PROPOSED 12-SYSTEM ARCHITECTURE
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    The proposed breakdown is <b>fully validated</b> for Unity 6.3 LTS. To avoid circular
                    dependencies in an open-world scope, we enforce a strict <b>ScriptableObject Event Architecture</b>.
                    Systems never reference concrete scene singletons directly.
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Filter systems, scripts, scope..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 bg-black border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-full sm:w-64"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSystems.map((sys) => (
                  <div
                    key={sys.id}
                    className="p-4 bg-black/60 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-cyan-400 font-bold">
                          SYSTEM 0{sys.id} //
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 border border-slate-800">
                          {sys.dependencies.join(', ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1.5">{sys.name}</h4>
                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">{sys.scope}</p>

                      <div className="mb-3">
                        <span className="text-[11px] text-slate-400 font-bold block mb-1">
                          Core C# Classes:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sys.keyClasses.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 bg-slate-900 text-cyan-300 text-[10px] border border-slate-800"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 italic">
                      Rule: {sys.notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FOLDER STRUCTURE */}
          {activeTab === 'folders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cyan-400">
                    RECOMMENDED UNITY 6.3 PROJECT DIRECTORY STRUCTURE
                  </h3>
                  <p className="text-xs text-slate-400">
                    All game assets live under <code className="text-cyan-300 font-bold">Assets/_Project/</code> to
                    prevent collision with third-party asset store packages.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(FOLDER_STRUCTURE_TEXT, 'folders')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
                >
                  {copiedSection === 'folders' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>COPY FOLDER TREE</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-black border border-slate-800 text-xs text-cyan-300 leading-relaxed overflow-x-auto font-mono">
                {FOLDER_STRUCTURE_TEXT}
              </pre>
            </div>
          )}

          {/* TAB 3: SCENE HIERARCHY */}
          {activeTab === 'scenes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cyan-400">
                    MULTI-SCENE ADDITIVE STREAMING HIERARCHY
                  </h3>
                  <p className="text-xs text-slate-400">
                    _Bootstrap is scene index 0 (never unloaded). World districts stream additively in the background.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(INITIAL_SCENE_HIERARCHY, 'scenes')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
                >
                  {copiedSection === 'scenes' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>COPY SCENE TREE</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-black border border-slate-800 text-xs text-slate-300 leading-relaxed overflow-x-auto font-mono">
                {INITIAL_SCENE_HIERARCHY}
              </pre>
            </div>
          )}

          {/* TAB 4: PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-cyan-400 mb-1">
                  OFFICIAL UNITY PACKAGES & SYSTEM PURPOSES
                </h3>
                <p className="text-xs text-slate-400">
                  Targeting Unity 6.3 LTS on Windows PC without deprecated APIs.
                </p>
              </div>

              <div className="border border-slate-800 divide-y divide-slate-800 bg-black/60">
                {RECOMMENDED_PACKAGES.map((pkg) => (
                  <div key={pkg.name} className="p-4 hover:bg-slate-900/40 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-white">{pkg.name}</span>
                      <span className="text-xs text-cyan-400 font-mono bg-cyan-950/80 px-2 py-0.5 border border-cyan-800">
                        {pkg.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{pkg.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM COMMUNICATION */}
          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-cyan-400 mb-1">
                  INTER-SYSTEM COMMUNICATION: SCRIPTABLEOBJECT EVENT ARCHITECTURE
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To keep all 12 systems completely decoupled, we use the <b>ScriptableObject GameEvent Channel</b> pattern.
                  For example: when a car is entered, the PlayerController raises a <code className="text-cyan-300">PlayerEnteredVehicleEventSO</code>.
                  The CameraManager, UI HUD, and AudioSystem listen independently without knowing PlayerController exists!
                </p>
              </div>

              {/* Code Snippet */}
              <div className="p-4 bg-black border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-cyan-400 font-bold border-b border-slate-800 pb-2">
                  <span>SCRIPTABLEOBJECT EVENT CHANNEL PATTERN (C#)</span>
                  <span className="text-slate-500">Assets/_Project/Scripts/Core/Events/</span>
                </div>
                <pre className="text-xs text-slate-300 overflow-x-auto leading-relaxed font-mono">
{`// 1. ScriptableObject Channel Asset
[CreateAssetMenu(menuName = "NeonCity/Events/VehicleEventChannel")]
public class VehicleEventChannelSO : ScriptableObject
{
    public UnityAction<VehicleController> OnPlayerEnteredVehicle;
    public UnityAction OnPlayerExitedVehicle;

    public void RaiseEnteredVehicle(VehicleController vehicle) => OnPlayerEnteredVehicle?.Invoke(vehicle);
    public void RaiseExitedVehicle() => OnPlayerExitedVehicle?.Invoke();
}

// 2. Publisher (PlayerController.cs):
[SerializeField] private VehicleEventChannelSO _vehicleEvents;
void EnterCar(VehicleController car)
{
    _vehicleEvents.RaiseEnteredVehicle(car); // Zero reference to Camera or HUD!
}

// 3. Listener (CameraManager.cs):
[SerializeField] private VehicleEventChannelSO _vehicleEvents;
void OnEnable()  => _vehicleEvents.OnPlayerEnteredVehicle += SwitchToCarCamera;
void OnDisable() => _vehicleEvents.OnPlayerEnteredVehicle -= SwitchToCarCamera;`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-900/60 border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">1. Zero Circular Links</div>
                  <p className="text-slate-400">
                    If the vehicle system is disabled or removed, character movement and cameras still function 100%.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">2. Multi-Scene Safe</div>
                  <p className="text-slate-400">
                    ScriptableObjects live in project assets and bridge additively loaded streaming district scenes without broken scene object references.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-800">
                  <div className="text-cyan-400 font-bold mb-1">3. Automated Unit Testing</div>
                  <p className="text-slate-400">
                    Pure C# domain logic can be tested in PlayMode/EditMode tests without spawning the entire city scene.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MILESTONE 1 */}
          {activeTab === 'milestone' && (
            <div className="space-y-6">
              <div className="p-4 bg-cyan-950/40 border border-cyan-500/40">
                <span className="text-[11px] text-cyan-400 font-bold tracking-widest block mb-1">
                  PHASE 1 IMPLEMENTATION TARGET
                </span>
                <h3 className="text-base font-bold text-white mb-2">{MILESTONE_1_DEFINITION.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Before implementing driving, hacking, or city streaming, we must build a world-class,
                  tactile character locomotion and camera rig that delivers the responsive Valorant feel.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 tracking-wider">CORE DELIVERABLES</h4>
                <div className="space-y-2">
                  {MILESTONE_1_DEFINITION.deliverables.map((d, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 bg-black/60 border border-slate-800 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 tracking-wider">ACCEPTANCE CRITERIA</h4>
                <div className="space-y-2">
                  {MILESTONE_1_DEFINITION.acceptanceCriteria.map((a, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 bg-black/60 border border-slate-800 text-xs">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0 mt-1.5" />
                      <span className="text-slate-300">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: EDITOR SETUP GUIDE */}
          {activeTab === 'editor_setup' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-cyan-400 mb-1">
                  STEP-BY-STEP UNITY 6.3 LTS EDITOR CONFIGURATION
                </h3>
                <p className="text-xs text-slate-400">
                  Follow these exact settings in the Unity Editor before writing any C# gameplay code.
                </p>
              </div>

              <div className="space-y-3">
                {UNITY_EDITOR_SETUP_GUIDE.map((item, idx) => (
                  <div key={idx} className="p-4 bg-black/60 border border-slate-800 hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1.5">
                      <span>{item.step}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Status Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-black/90 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">STATUS:</span>
            <span>TASK 1 COMPLETE & APPROVED</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs tracking-wider transition-colors cursor-pointer"
          >
            RETURN TO 3D SIMULATION [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
