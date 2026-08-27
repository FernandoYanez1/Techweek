import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../core/store';
import { playClick, playError } from '../core/audio';
import { Bug, ArrowRight, Play } from 'lucide-react';

const GRAVITY = 0.5;
const JUMP_VELOCITY = -8;
const OBSTACLE_SPEED = 4;
const OBSTACLE_WIDTH = 70;
const GAP_SIZE = 250; 

export default function FlappyBug() {
  const { endGame } = useAppStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const [bugY, setBugY] = useState(300);
  const [obstacles, setObstacles] = useState<{ x: number, topHeight: number }[]>([]);

  const gameAreaRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number>(0);
  
  // Ref para a velocidade vertical do Bug (Física real)
  const bugV = useRef<number>(0);

  const jump = () => {
    if (!isPlaying && !isGameOver) {
      playClick();
      setIsPlaying(true);
      bugV.current = JUMP_VELOCITY;
    } else if (isPlaying && !isGameOver) {
      playClick();
      bugV.current = JUMP_VELOCITY;
    }
  };

  // Suporte a espaço no teclado para testes rápidos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') jump();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver]);

  const gameLoop = () => {
    setBugY(y => {
      // Aplica a gravidade na velocidade, e a velocidade na posição Y
      bugV.current += GRAVITY;
      const newY = y + bugV.current;
      const gameHeight = gameAreaRef.current?.clientHeight || 600;
      
      if (newY > gameHeight - 40 || newY < 0) {
        endRound();
        return Math.min(newY, gameHeight - 40);
      }
      return newY;
    });

    setObstacles(obs => {
      let newObs = obs.map(o => ({ ...o, x: o.x - OBSTACLE_SPEED }));
      
      if (newObs.length > 0 && newObs[0].x < -OBSTACLE_WIDTH) {
        newObs.shift();
        setScore(s => s + 1);
      }

      const gameWidth = gameAreaRef.current?.clientWidth || 800;
      const lastOb = newObs[newObs.length - 1];
      if (!lastOb || gameWidth - lastOb.x > 400) {
        const minHeight = 50;
        const maxHeight = (gameAreaRef.current?.clientHeight || 600) - GAP_SIZE - 50;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        newObs.push({ x: gameWidth, topHeight });
      }

      return newObs;
    });

    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    
    const bugLeft = 100;
    const bugRight = 100 + 35; // Hitbox um pouco menor (perdoável)
    const bugTop = bugY + 5;
    const bugBottom = bugY + 35;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      const obsLeft = obs.x;
      const obsRight = obs.x + OBSTACLE_WIDTH;
      
      if (bugRight > obsLeft && bugLeft < obsRight) {
        if (bugTop < obs.topHeight || bugBottom > obs.topHeight + GAP_SIZE) {
          endRound();
        }
      }
    }
  }, [bugY, obstacles, isPlaying, isGameOver]);

  const endRound = () => {
    playError();
    setIsPlaying(false);
    setIsGameOver(true);
    cancelAnimationFrame(requestRef.current);
  };

  const manualConcludeGame = () => {
    playClick();
    // BLINDAGEM DE PONTOS: Limite forçado de 60 pontos
    const pontos = Math.min(60, score * 3); 
    endGame([pontos]);
  };

  return (
    // onPointerDown é a chave para não ter atraso no touch do tablet
    <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 relative touch-none select-none" onPointerDown={jump}>
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-800 border-2 border-slate-700 px-10 py-3 rounded-full text-3xl font-black text-cyan-400 shadow-xl z-50">
        PONTOS: {score}
      </div>

      <div 
        ref={gameAreaRef}
        className="w-full h-[600px] bg-slate-900 border-4 border-slate-700 rounded-3xl overflow-hidden relative shadow-2xl"
        style={{ backgroundImage: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
      >
        
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-900/50 backdrop-blur-sm">
            <Bug size={80} className="text-cyan-400 mb-6 animate-bounce" />
            <h2 className="text-5xl font-black text-white mb-2">Flappy Bug</h2>
            <p className="text-2xl text-slate-400 mb-8">Toque na tela para voar e desviar do código.</p>
            <button className="flex items-center gap-3 px-8 py-4 bg-cyan-500 text-white font-bold rounded-2xl text-2xl animate-pulse">
              <Play size={28} fill="currentColor" /> COMEÇAR
            </button>
          </div>
        )}

        <div 
          className="absolute left-[100px] w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.8)] z-20"
          style={{ top: bugY, transition: 'none' }}
        >
          <Bug size={24} />
        </div>

        {obstacles.map((obs, i) => (
          <div key={i}>
            <div 
              className="absolute bg-emerald-500/80 border-x-4 border-b-4 border-emerald-400 rounded-b-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10"
              style={{ left: obs.x, top: 0, width: OBSTACLE_WIDTH, height: obs.topHeight }}
            >
              <div className="text-emerald-950 font-mono text-xs overflow-hidden h-full p-1 opacity-50">
                {'<br/>'.repeat(20)}
              </div>
            </div>
            <div 
              className="absolute bg-emerald-500/80 border-x-4 border-t-4 border-emerald-400 rounded-t-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10"
              style={{ left: obs.x, top: obs.topHeight + GAP_SIZE, width: OBSTACLE_WIDTH, height: 600 - (obs.topHeight + GAP_SIZE) }}
            >
              <div className="text-emerald-950 font-mono text-xs overflow-hidden h-full p-1 opacity-50">
                {'<div>'.repeat(20)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-in fade-in rounded-[3rem] touch-auto">
          <div className="text-center flex flex-col items-center">
            <h2 className="text-7xl font-black text-rose-500 mb-4">CRASH!</h2>
            <p className="text-3xl text-white mt-4">Você passou por <strong className="text-cyan-400">{score}</strong> barreiras de código.</p>

            <button 
              onPointerDown={(e) => { e.stopPropagation(); manualConcludeGame(); }}
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