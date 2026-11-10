/**
 * PROJECT NEON CITY - Master App Shell & Simulation Host
 * Connects the Three.js 3D game engine with the HUD, Title Screen, Pause Modal,
 * and Unity 6.3 LTS Architect Station.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, GameHUDState } from './game/gameEngine';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { ArchitectModal } from './components/ArchitectModal';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused'>('title');
  const [isArchitectOpen, setIsArchitectOpen] = useState(false);
  const [hudState, setHudState] = useState<GameHUDState>({
    state: 'title',
    cameraMode: 'first_person',
    isInCar: false,
    speedKmH: 0,
    gear: 1,
    health: 100,
    shield: 100,
    stamina: 100,
    hackEnergy: 100,
    headlightsOn: true,
    nearCar: false,
    targetedHackNode: null,
    district: 'BAY DISTRICT // MISSION CORE',
    timeString: '14:00',
    timePhase: 'day',
    timeHours: 14.0,
  });

  const handleHUDUpdate = useCallback((newHUD: GameHUDState) => {
    setHudState(newHUD);
    setGameState(newHUD.state);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize 3D Engine once
    const engine = new GameEngine(mountRef.current, handleHUDUpdate);
    engineRef.current = engine;

    // Check ?autostart=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      engine.startGame();
    } else {
      document.body.dataset.state = 'title';
    }

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [handleHUDUpdate]);

  const handleStartGame = () => {
    engineRef.current?.startGame();
    setGameState('playing');
  };

  const handlePause = () => {
    engineRef.current?.pauseGame();
    setGameState('paused');
  };

  const handleResume = () => {
    engineRef.current?.resumeGame();
    setGameState('playing');
  };

  const handleRestartToTitle = () => {
    engineRef.current?.goToTitle();
    setGameState('title');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 1. Isolated 3D WebGL Canvas Container (Never re-renders) */}
      <div
        ref={mountRef}
        data-testid="webgl-canvas-mount"
        className="absolute inset-0 z-0 cursor-crosshair"
      />

      {/* 2. Title Screen (Only shown in 'title' state) */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenArchitect={() => setIsArchitectOpen(true)}
        />
      )}

      {/* 3. In-Game HUD (Only shown in 'playing' state) */}
      {gameState === 'playing' && (
        <GameHUD
          hudState={hudState}
          onPause={handlePause}
          onOpenArchitect={() => {
            handlePause();
            setIsArchitectOpen(true);
          }}
          onAdvanceTime={() => engineRef.current?.advanceTime()}
        />
      )}

      {/* 4. Pause Status Modal */}
      {gameState === 'paused' && (
        <PauseModal
          hudState={hudState}
          onResume={handleResume}
          onRestartToTitle={handleRestartToTitle}
          onOpenArchitect={() => setIsArchitectOpen(true)}
        />
      )}

      {/* 5. Master Architect Station (Unity 6.3 LTS Technical Blueprints) */}
      <ArchitectModal
        isOpen={isArchitectOpen}
        onClose={() => setIsArchitectOpen(false)}
      />
    </div>
  );
}
