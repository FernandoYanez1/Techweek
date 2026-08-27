import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { playClick, playError } from '../core/audio';
import { ShieldAlert, ArrowRight, Play, Server } from 'lucide-react';

const OBSTACLE_SPEED = 12;
const LANES = [0, 1, 2];

export default function TechSurfers() {
  const { endGame, activeDifficulty } = useAppStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<{ y: number, lane: number }[]>([]);

  const gameAreaRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const startGame = () => {
    playClick();
    setIsPlaying(true);
  };

  const movePlayer = (lane: number) => {
    if (isPlaying && !isGameOver) {
      setPlayerLane(lane);
    }
  };

  const gameLoop = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    
    if (deltaTime > 16) {
      setObstacles(obs => {
        let newObs = obs.map(o => ({ ...o, y: o.y + OBSTACLE_SPEED }));
        
        const gameHeight = gameAreaRef.current?.clientHeight || 600;
        
        if (newObs.length > 0 && newObs[0].y > gameHeight) {
          newObs.shift();
          setScore(s => s + 1);
        }

        const lastOb = newObs[newObs.length - 1];
        if (!lastOb || lastOb.y > 250) {
          const lane = LANES[Math.floor(Math.random() * LANES.length)];
          newObs.push({ y: -100, lane });
        }

        return newObs;
      });

      lastTimeRef.current = time;
    }

    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    
    const gameHeight = gameAreaRef.current?.clientHeight || 600;
    const playerY = gameHeight - 100;
    
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (obs.lane === playerLane) {
        if (obs.y + 80 > playerY && obs.y < playerY + 80) {
          endRound();
        }
      }
    }
  }, [obstacles, playerLane, isPlaying, isGameOver]);

  const endRound = () => {
    playError();
    setIsPlaying(false);
    setIsGameOver(true);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const manualConcludeGame = () => {
    playClick();
    const maxPts = MAX_SCORES['tech-surfers'][activeDifficulty || 'INICIANTE'] || 60;
    const pontos = Math.min(maxPts, Math.round((score / 30) * maxPts));
    endGame([pontos]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 relative">
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-800 border-2 border-slate-700 px-10 py-3 rounded-full text-3xl font-black text-cyan-400 shadow-xl z-50">
        PONTOS: {score}
      </div>

      <div 
        ref={gameAreaRef}
        className="w-full max-w-2xl h-[600px] bg-slate-900 border-4 border-slate-700 rounded-3xl overflow-hidden relative shadow-2xl flex"
      >
        {LANES.map(lane => (
          <div 
            key={lane} 
            onClick={() => movePlayer(lane)}
            className="flex-1 border-r-2 last:border-r-0 border-slate-800/50 flex justify-center relative cursor-pointer hover:bg-slate-800/20 active:bg-slate-800/40 transition-colors"
          />
        ))}

        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-900/50 backdrop-blur-sm pointer-events-none">
            <Server size={80} className="text-cyan-400 mb-6" />
            <h2 className="text-5xl font-black text-white mb-2">Tech Surfers</h2>
            <p className="text-xl text-slate-400 mb-8">Clique nas faixas para desviar dos Firewalls.</p>
            <button onClick={startGame} className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-cyan-500 text-white font-bold rounded-2xl text-2xl animate-pulse active:scale-95 transition-transform">
              <Play size={28} fill="currentColor" /> COMEÇAR
            </button>
          </div>
        )}

        {/* JOGADOR */}
        <div 
          className="absolute w-20 h-20 bg-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.8)] z-20 transition-all duration-150"
          style={{ 
            bottom: 20, 
            left: `calc(${(playerLane * 33.333) + 16.666}% - 40px)` 
          }}
        >
          <Server size={40} />
        </div>

        {/* OBSTÁCULOS */}
        {obstacles.map((obs, i) => (
          <div 
            key={i}
            className="absolute w-20 h-20 bg-rose-500 border-4 border-rose-400 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.6)] z-10 flex items-center justify-center text-white"
            style={{ 
              top: obs.y, 
              left: `calc(${(obs.lane * 33.333) + 16.666}% - 40px)` 
            }}
          >
            <ShieldAlert size={32} />
          </div>
        ))}
      </div>

      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-in fade-in rounded-[3rem]">
          <div className="text-center flex flex-col items-center">
            <h2 className="text-7xl font-black text-rose-500 mb-4">BLOQUEADO!</h2>
            <p className="text-3xl text-white mt-4">Você desviou de <strong className="text-cyan-400">{score}</strong> firewalls.</p>

            <button 
              onClick={manualConcludeGame}
              className="mt-12 flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30"
            >
              Ver Pontuação <ArrowRight size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}