import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { playClick, playSuccess, playError } from '../core/audio';
import { ShieldAlert, Zap, Server, ShieldPlus, ArrowRight, Play } from 'lucide-react';

const PATH = [
  { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 },
  { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 },
  { x: 6, y: 1 }, { x: 7, y: 1 }
];

interface Enemy { id: number; pathIndex: number; hp: number; maxHp: number; speed: number; }
interface Tower { id: number; x: number; y: number; level: number; damage: number; }

export default function TowerDefense() {
  const { endGame, activeDifficulty } = useAppStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const [money, setMoney] = useState(150);
  const [baseHp, setBaseHp] = useState(100);
  const [wave, setWave] = useState(0); 
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);

  // CORREÇÃO: Inicializando os refs com 0 para o TypeScript não reclamar
  const gameLoopRef = useRef<number>(0);
  const enemyIdCounter = useRef<number>(0);
  const spawnTimer = useRef<number>(0);

  const buildTower = (x: number, y: number) => {
    if (!isPlaying || isGameOver || money < 50) return;
    
    const onPath = PATH.some(p => p.x === x && p.y === y);
    const hasTower = towers.some(t => t.x === x && t.y === y);
    
    if (!onPath && !hasTower) {
      playClick();
      setMoney(m => m - 50);
      setTowers([...towers, { id: Date.now(), x, y, level: 1, damage: 20 }]);
    }
  };

  const gameLoop = () => {
    if (!isPlaying || isGameOver) return;

    spawnTimer.current += 1;

    if (spawnTimer.current % 60 === 0 && wave < 3) {
      const enemiesPerWave = [5, 8, 12];
      const enemiesSpawned = enemies.length + enemiesPerWave.slice(0, wave).reduce((a, b) => a + b, 0);
      const totalToSpawn = enemiesPerWave.slice(0, wave + 1).reduce((a, b) => a + b, 0);

      if (enemiesSpawned < totalToSpawn) {
        setEnemies(prev => [
          ...prev, 
          { id: enemyIdCounter.current++, pathIndex: 0, hp: 50 + (wave * 30), maxHp: 50 + (wave * 30), speed: 0.05 + (wave * 0.01) }
        ]);
      } else if (enemies.length === 0) {
        setWave(w => w + 1);
      }
    }

    setEnemies(prev => {
      let currentEnemies = [...prev];
      let damageToBase = 0;

      currentEnemies = currentEnemies.map(e => ({ ...e, pathIndex: e.pathIndex + e.speed }));

      currentEnemies = currentEnemies.filter(e => {
        if (e.pathIndex >= PATH.length - 1) {
          damageToBase += 20;
          return false;
        }
        return e.hp > 0;
      });

      if (damageToBase > 0) {
        playError();
        setBaseHp(hp => {
          const newHp = hp - damageToBase;
          if (newHp <= 0) endRound(false);
          return newHp;
        });
      }

      if (spawnTimer.current % 30 === 0) {
        towers.forEach(t => {
          const target = currentEnemies.find(e => {
            const enemyPos = PATH[Math.floor(e.pathIndex)];
            if (!enemyPos) return false;
            return Math.abs(t.x - enemyPos.x) + Math.abs(t.y - enemyPos.y) <= 2;
          });

          if (target) {
            target.hp -= t.damage;
            if (target.hp <= 0) setMoney(m => m + 15);
          }
        });
      }

      return currentEnemies;
    });

    if (wave === 3 && enemies.length === 0) {
      endRound(true);
    }

    requestLoop();
  };

  const requestLoop = () => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestLoop();
    }
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [isPlaying, isGameOver, wave, towers]);

  const startWave = () => {
    playClick();
    setIsPlaying(true);
  };

  const endRound = (playerWon: boolean) => {
    if (playerWon) playSuccess();
    else playError();
    setIsPlaying(false);
    setIsGameOver(true);
    setWon(playerWon);
    cancelAnimationFrame(gameLoopRef.current);
  };

  const manualConcludeGame = () => {
    playClick();
    const maxPts = MAX_SCORES['tower-defense'][activeDifficulty || 'AVANCADO'] || 350;
    const pontos = won ? maxPts : Math.round((wave / 3) * maxPts * 0.5);
    endGame([pontos]);
  };

  const GRID_W = 8;
  const GRID_H = 5;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 relative">
      <div className="text-center mb-6">
        <h1 className="text-5xl font-black text-white mb-2 flex items-center justify-center gap-4">
          <ShieldAlert size={40} className="text-rose-500" /> Tower Defense
        </h1>
        <p className="text-xl text-slate-400">Construa Firewalls (50$) para proteger o Servidor Central.</p>
      </div>

      <div className="flex gap-4 w-full mb-6">
        <div className="flex-1 bg-slate-800 border-2 border-slate-700 px-6 py-4 rounded-full flex items-center justify-between shadow-lg">
          <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Saúde do Servidor</span>
          <div className="flex items-center gap-2 text-2xl font-black text-emerald-400">
            <Server size={24} /> {baseHp}%
          </div>
        </div>
        <div className="flex-1 bg-slate-800 border-2 border-slate-700 px-6 py-4 rounded-full flex items-center justify-between shadow-lg">
          <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Orçamento</span>
          <div className="flex items-center gap-2 text-2xl font-black text-amber-400">
            <Zap size={24} /> ${money}
          </div>
        </div>
        <div className="flex-1 bg-slate-800 border-2 border-slate-700 px-6 py-4 rounded-full flex items-center justify-between shadow-lg">
          <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Onda de Ataque</span>
          <div className="flex items-center gap-2 text-2xl font-black text-rose-500">
            <ShieldAlert size={24} /> {wave} / 3
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border-4 border-slate-700 rounded-3xl p-6 shadow-2xl relative w-full aspect-[16/10]">
        {!isPlaying && !isGameOver && wave === 0 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-3xl">
            <button onClick={startWave} className="flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-black rounded-2xl text-3xl animate-pulse active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.6)]">
              <Play size={36} fill="currentColor" /> INICIAR DEFESA
            </button>
          </div>
        )}

        <div className="grid w-full h-full gap-1 relative" style={{ gridTemplateColumns: `repeat(${GRID_W}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${GRID_H}, minmax(0, 1fr))` }}>
          {Array.from({ length: GRID_W * GRID_H }).map((_, idx) => {
            const x = idx % GRID_W;
            const y = Math.floor(idx / GRID_W);
            const isPath = PATH.some(p => p.x === x && p.y === y);
            const hasTower = towers.find(t => t.x === x && t.y === y);
            const isBase = x === 7 && y === 1;

            return (
              <button
                key={idx}
                disabled={isPath || hasTower !== undefined || money < 50 || isGameOver}
                onClick={() => buildTower(x, y)}
                className={`relative w-full h-full rounded-xl transition-all border-2 flex items-center justify-center
                  ${isPath ? 'bg-slate-800 border-slate-700 shadow-inner' : 'bg-slate-900 border-transparent hover:border-cyan-500/50'}
                  ${isBase ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}
                  ${hasTower ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-default scale-105' : ''}
                `}
              >
                {isBase && <Server size={40} className="text-emerald-400" />}
                {hasTower && <ShieldPlus size={36} className="text-cyan-400" />}
              </button>
            );
          })}

          {enemies.map(e => {
            const pIndex = Math.floor(e.pathIndex);
            const pos = PATH[pIndex];
            if (!pos) return null;

            const cellWidth = 100 / GRID_W;
            const cellHeight = 100 / GRID_H;
            
            return (
              <div 
                key={e.id}
                className="absolute w-8 h-8 md:w-12 md:h-12 bg-rose-500 rounded-lg border-2 border-white shadow-[0_0_15px_rgba(244,63,94,0.8)] z-20 flex items-center justify-center font-bold text-white text-xs md:text-sm transition-all duration-75"
                style={{ 
                  left: `calc(${pos.x * cellWidth}% + ${(cellWidth / 2)}% - 1.5rem)`, 
                  top: `calc(${pos.y * cellHeight}% + ${(cellHeight / 2)}% - 1.5rem)` 
                }}
              >
                {Math.floor(e.hp)}
              </div>
            );
          })}
        </div>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in rounded-[3rem]">
          <div className="text-center flex flex-col items-center">
            <h2 className={`text-7xl font-black mb-4 ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
              {won ? 'SISTEMA PROTEGIDO!' : 'SERVIDOR INVADIDO!'}
            </h2>
            <p className="text-3xl text-white mt-4">
              Você sobreviveu a <strong className="text-cyan-400">{wave}</strong> ondas de ataque.
            </p>

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