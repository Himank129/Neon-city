/**
 * PROJECT NEON CITY - Pause & Simulation Suspension Modal
 * Focused modal card with session metrics, resume action, and architect drawer.
 */

import React from 'react';
import { Play, RotateCcw, FileCode2, Volume2, VolumeX } from 'lucide-react';
import { GameHUDState } from '../game/gameEngine';
import { sounds } from '../game/audio';

interface PauseModalProps {
  hudState: GameHUDState;
  onResume: () => void;
  onRestartToTitle: () => void;
  onOpenArchitect: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  hudState,
  onResume,
  onRestartToTitle,
  onOpenArchitect,
}) => {
  const [isMuted, setIsMuted] = React.useState(sounds.isMuted());

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 font-mono select-none">
      <div className="w-full max-w-md bg-slate-950 border border-cyan-500/60 p-6 flex flex-col shadow-[0_0_30px_rgba(0,240,255,0.25)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-cyan-400 rotate-45 shadow-[0_0_8px_#00f0ff]" />
            <h3 className="text-base font-bold text-white tracking-widest">SIMULATION PAUSED</h3>
          </div>
          <span className="text-[11px] text-cyan-400 px-2 py-0.5 bg-cyan-950 border border-cyan-800">
            [ESC / P]
          </span>
        </div>

        {/* 3 Tabular-Nums Stat Tiles */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-2.5 bg-black/70 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold mb-1">MODE</span>
            <span className="text-xs font-bold text-cyan-300 truncate">
              {hudState.isInCar ? 'HYPERCAR' : hudState.cameraMode === 'first_person' ? 'FPS' : 'TPS'}
            </span>
          </div>
          <div className="p-2.5 bg-black/70 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold mb-1">SPEED</span>
            <span className="text-xs font-bold text-white tabular-nums">
              {hudState.speedKmH} <span className="text-[10px] text-slate-400">KM/H</span>
            </span>
          </div>
          <div className="p-2.5 bg-black/70 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold mb-1">SHIELD</span>
            <span className="text-xs font-bold text-emerald-400 tabular-nums">
              {hudState.shield}%
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] active:scale-98"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>RESUME SIMULATION [ESC]</span>
          </button>

          <button
            onClick={onOpenArchitect}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs tracking-wider transition-colors cursor-pointer"
          >
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span>OPEN UNITY ARCHITECT BLUEPRINTS</span>
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={toggleSound}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-black/80 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO [M]'}</span>
            </button>

            <button
              onClick={onRestartToTitle}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-black/80 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>TITLE SCREEN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
