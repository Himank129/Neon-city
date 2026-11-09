/**
 * PROJECT NEON CITY - Title Screen & Game Shell Landing
 * Features bespoke inline SVG title lockup, live camera pan background,
 * primary start handshake (data-start="true", Enter/Space keybindings),
 * and flat control hint footer.
 */

import React, { useEffect } from 'react';
import { Play, FileCode2, Volume2, VolumeX, Shield, Eye, Car } from 'lucide-react';
import { sounds } from '../game/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenArchitect: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame, onOpenArchitect }) => {
  const [isMuted, setIsMuted] = React.useState(sounds.isMuted());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-10 select-none z-30 font-sans">
      {/* Top Header Row (District & Architect Status) */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 border border-cyan-500/40 text-cyan-400 text-xs tracking-widest font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>DEV BUILD // UNITY 6.3 LTS ARCHITECTURE</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-black/60 border border-slate-700/60 text-slate-300 text-xs font-mono">
            <span>WINDOWS PC</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/80 hover:bg-slate-900 border border-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="font-mono">{isMuted ? 'UNMUTE [M]' : 'AUDIO ON [M]'}</span>
          </button>

          <button
            onClick={onOpenArchitect}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-300 text-xs font-mono tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span>ARCHITECT BLUEPRINTS</span>
          </button>
        </div>
      </div>

      {/* Hero Center Lockup & Action CTAs */}
      <div className="max-w-2xl my-auto">
        {/* Bespoke Inline SVG Title Emblem */}
        <div className="mb-4">
          <svg className="w-full max-w-[540px] h-auto drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]" viewBox="0 0 540 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 12L12 0H528L540 12V88L528 100H12L0 88V12Z" fill="#04060c" stroke="#00f0ff" strokeWidth="2" strokeOpacity="0.7" />
            <path d="M16 20H80V28H32V46H74V54H32V80H16V20Z" fill="#ffffff" />
            <path d="M96 20H150C162 20 170 28 170 40C170 52 162 60 150 60H112V80H96V20ZM112 28V52H148C154 52 158 48 158 40C158 32 154 28 148 28H112Z" fill="#ffffff" />
            <text x="185" y="58" fontFamily="monospace" fontWeight="900" fontSize="38" fill="#00f0ff" letterSpacing="4">NEON CITY</text>
            <text x="186" y="80" fontFamily="monospace" fontWeight="700" fontSize="12" fill="#ff007f" letterSpacing="6">VALORANT × WATCH DOGS × FORZA</text>
            <circle cx="510" cy="50" r="16" stroke="#00f0ff" strokeWidth="2" />
            <path d="M510 38V62M498 50H522" stroke="#ff007f" strokeWidth="2" />
          </svg>
        </div>

        <p className="text-slate-300 text-sm max-w-lg mb-8 leading-relaxed font-mono">
          Tactical FPS/TPS locomotion, cybernetic pulse hacking, and open-world sports car driving physics set in a sprawling neon metropolis.
        </p>

        {/* Feature Pillars */}
        <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg">
          <div className="bg-black/70 border border-slate-800 p-2.5">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono font-bold mb-1">
              <Eye className="w-3.5 h-3.5" />
              <span>FPS & TPS</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Valorant movement & camera switch</div>
          </div>
          <div className="bg-black/70 border border-slate-800 p-2.5">
            <div className="flex items-center gap-1.5 text-pink-400 text-xs font-mono font-bold mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>CTOS HACK</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Pulse scan & object actuation</div>
          </div>
          <div className="bg-black/70 border border-slate-800 p-2.5">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold mb-1">
              <Car className="w-3.5 h-3.5" />
              <span>HYPERCAR</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Forza drift physics & headlights</div>
          </div>
        </div>

        {/* Primary Start CTA Button */}
        <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
          <button
            data-start="true"
            onClick={onStartGame}
            className="flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-base tracking-widest transition-all cursor-pointer shadow-[0_0_25px_rgba(0,240,255,0.4)] active:scale-95"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>ENTER CITY [SPACE]</span>
          </button>

          <button
            onClick={onOpenArchitect}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-black/80 hover:bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-sm tracking-wider transition-colors cursor-pointer"
          >
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span>INSPECT ARCHITECTURE</span>
          </button>
        </div>
      </div>

      {/* Flat Single Control-Hint Line Footer */}
      <div className="w-full text-center sm:text-left text-xs font-mono text-slate-400 tracking-wider">
        <span>WASD Move · Space Jump/Handbrake · V Toggle Camera · F Enter Car · Q Hack Scan · Esc Pause</span>
      </div>
    </div>
  );
};
