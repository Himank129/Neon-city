/**
 * PROJECT NEON CITY - In-Game Low-Occlusion World HUD
 * Preserves >85% clear playfield with perimeter corner clusters,
 * Valorant-style shield/health bars, Watch Dogs hack reticle, and Forza digital speedometer.
 */

import React from 'react';
import { GameHUDState } from '../game/gameEngine';
import { sounds } from '../game/audio';
import {
  Shield,
  Activity,
  Zap,
  Volume2,
  VolumeX,
  Gauge,
  Eye,
  Radio,
  FileCode2,
  Pause,
  Lightbulb,
} from 'lucide-react';

interface GameHUDProps {
  hudState: GameHUDState;
  onPause: () => void;
  onOpenArchitect: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ hudState, onPause, onOpenArchitect }) => {
  const [isMuted, setIsMuted] = React.useState(sounds.isMuted());

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-4 sm:p-6 font-mono">
      {/* Top Bar Perimeter Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: District & System Info */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-3 py-1 bg-black/80 border-l-2 border-cyan-400 text-xs">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-bold tracking-wider">{hudState.district}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 px-3 py-0.5 bg-black/60 border border-slate-800">
            <span>NET: ENCRYPTED // 60 FPS SIM</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
        </div>

        {/* Top-Right: Camera Mode & Action Utilities */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Camera Perspective Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 border border-slate-700 text-slate-200 text-xs">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold">
              {hudState.isInCar
                ? 'VEHICLE CHASE'
                : hudState.cameraMode === 'first_person'
                ? 'FPS [V]'
                : 'TPS [V]'}
            </span>
          </div>

          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 bg-black/80 hover:bg-slate-900 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={onOpenArchitect}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-300 text-xs transition-colors cursor-pointer"
            title="Inspect Unity 6 Architecture"
          >
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">ARCHITECT</span>
          </button>

          <button
            onClick={onPause}
            className="p-1.5 bg-black/80 hover:bg-slate-900 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Pause Simulation"
          >
            <Pause className="w-4 h-4 text-slate-200" />
          </button>
        </div>
      </div>

      {/* Center Screen: Dynamic Reticle & Hacking Brackets */}
      {!hudState.isInCar && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          {hudState.targetedHackNode ? (
            /* Watch Dogs-style lock bracket */
            <div className="flex flex-col items-center gap-2 transition-all scale-110">
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* Crosshair corners */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
              </div>
              <div className="px-2.5 py-1 bg-black/90 border border-cyan-500/80 text-cyan-300 text-xs shadow-[0_0_12px_rgba(0,240,255,0.4)] flex items-center gap-2">
                <span className="font-bold text-white">[E]</span>
                <span>HACK {hudState.targetedHackNode.name}</span>
              </div>
            </div>
          ) : (
            /* Tactical Valorant Reticle */
            <div className="relative w-4 h-4 flex items-center justify-center">
              <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              <div className="absolute w-3 h-0.5 bg-cyan-400/60 -left-3" />
              <div className="absolute w-3 h-0.5 bg-cyan-400/60 -right-3" />
              <div className="absolute h-3 w-0.5 bg-cyan-400/60 -top-3" />
              <div className="absolute h-3 w-0.5 bg-cyan-400/60 -bottom-3" />
            </div>
          )}
        </div>
      )}

      {/* Context Action Banner (Near Car prompt) */}
      {hudState.nearCar && !hudState.isInCar && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/90 border-2 border-cyan-400 text-white text-sm font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <span className="px-1.5 py-0.5 bg-cyan-400 text-black text-xs font-mono">F</span>
            <span>ENTER SPECTER HYPERCAR</span>
          </div>
        </div>
      )}

      {/* Bottom Perimeter Clusters */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom-Left: Vitality (Health & Shield & Hack Battery) */}
        <div className="flex flex-col gap-2 max-w-xs">
          {/* Shield & Health Bars */}
          <div className="bg-black/80 border border-slate-800 p-2.5 space-y-2">
            {/* Shield Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-cyan-400">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">SHIELD</span>
                </div>
                <span className="tabular-nums font-bold text-cyan-300">{hudState.shield}</span>
              </div>
              <div className="w-48 h-1.5 bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150"
                  style={{ width: `${hudState.shield}%` }}
                />
              </div>
            </div>

            {/* Health Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">HEALTH</span>
                </div>
                <span className="tabular-nums font-bold text-emerald-300">{hudState.health}</span>
              </div>
              <div className="w-48 h-1.5 bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-150"
                  style={{ width: `${hudState.health}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cybernetic Hack Cell Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-black/80 border border-slate-800 text-[11px] text-pink-400">
            <Zap className="w-3 h-3 text-pink-400" />
            <span className="text-slate-400">CTOS CELL:</span>
            <span className="text-pink-300 font-bold">READY [Q PULSE]</span>
          </div>
        </div>

        {/* Bottom-Right: Forza Speedometer OR On-Foot Controls */}
        <div className="flex flex-col items-end gap-2">
          {hudState.isInCar ? (
            /* Forza Horizon Style Digital Speedometer Cluster */
            <div className="bg-black/90 border border-cyan-500/60 p-4 min-w-[200px] flex flex-col items-end shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-mono font-black text-cyan-400 tabular-nums tracking-tighter">
                  {hudState.speedKmH}
                </span>
                <span className="text-xs text-slate-400 font-bold">KM/H</span>
              </div>

              {/* Gear and RPM Gauge */}
              <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-1 text-slate-400">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>GEAR</span>
                  <span className="text-white font-bold text-sm ml-1">{hudState.gear}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">[L] LIGHTS</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      hudState.headlightsOn ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]' : 'bg-slate-700'
                    }`}
                  />
                </div>
              </div>

              {/* Vehicle Action Bar */}
              <div className="w-full mt-2 text-right text-[10px] text-slate-400">
                <span>[SPACE] HANDBRAKE / DRIFT · [F] EXIT CAR</span>
              </div>
            </div>
          ) : (
            /* On-Foot Quick Controls Cluster */
            <div className="bg-black/80 border border-slate-800 p-2.5 text-right text-xs text-slate-300 space-y-1">
              <div className="text-[10px] text-cyan-400 font-bold tracking-wider mb-1">
                LOCOMOTION MATRIX
              </div>
              <div className="flex items-center justify-end gap-3 text-[11px] text-slate-400">
                <span><b className="text-white">WASD</b> Move</span>
                <span><b className="text-white">Shift</b> Sprint</span>
                <span><b className="text-white">Space</b> Jump</span>
                <span><b className="text-white">V</b> POV</span>
              </div>
              <div className="flex items-center justify-end gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span><b className="text-cyan-400">Q</b> Cyber Pulse</span>
                <span><b className="text-cyan-400">E</b> Hack Object</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
