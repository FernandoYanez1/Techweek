import { useState, useEffect } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { playClick, playSuccess, playError } from '../core/audio';
import { Network, Server, Database, Cloud, Cpu, Play, ArrowRight } from 'lucide-react';

const NODES = [
  { id: 0, icon: <Server size={48} />, color: 'bg-cyan-500', glow: 'shadow-[0_0_40px_rgba(6,182,212,1)]', text: 'text-cyan-500' },
  { id: 1, icon: <Database size={48} />, color: 'bg-rose-500', glow: 'shadow-[0_0_40px_rgba(244,63,94,1)]', text: 'text-rose-500' },
  { id: 2, icon: <Cloud size={48} />, color: 'bg-emerald-500', glow: 'shadow-[0_0_40px_rgba(16,185,129,1)]', text: 'text-emerald-500' },
  { id: 3, icon: <Cpu size={48} />, color: 'bg-amber-500', glow: 'shadow-[0_0_40px_rgba(245,158,11,1)]', text: 'text-amber-500' }
];

const MAX_ROUNDS = 6; // De 3 até 10 = 8 rodadas

export default function Decodificador() {
  const { endGame, activeDifficulty } = useAppStore();

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const [isFinished, setIsFinished] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    // Gera uma sequência mestra de 10 passos 
    const seq = Array.from({ length: 10 }, () => Math.floor(Math.random() * NODES.length));
    setSequence(seq);
  }, []);

  useEffect(() => {
    if (gameStarted && !isFinished && playerSeq.length === 0) {
      playSequence(round);
    }
  }, [gameStarted, round, isFinished]);

  const playSequence = async (currentRound: number) => {
    setIsPlayerTurn(false);
    await new Promise(r => setTimeout(r, 1000));
    
    // A rodada 1 começa tocando 3 notas. A rodada 8 toca 10 notas.
    const stepsToPlay = currentRound + 2; 
    
    for (let i = 0; i < stepsToPlay; i++) {
      setActiveNode(sequence[i]);
      playClick(); 
      await new Promise(r => setTimeout(r, 500)); // Tempo ligeiramente mais rápido para dar fluidez
      
      setActiveNode(null);
      await new Promise(r => setTimeout(r, 250)); 
    }
    
    setIsPlayerTurn(true);
  };

  const handleNodeClick = (nodeId: number) => {
    if (!isPlayerTurn || isFinished) return;
    
    playClick();
    setActiveNode(nodeId);
    setTimeout(() => setActiveNode(null), 200);

    const newSeq = [...playerSeq, nodeId];
    setPlayerSeq(newSeq);

    if (sequence[newSeq.length - 1] !== nodeId) {
      playError();
      setIsFinished(true);
      setWon(false);
      return;
    }

    const stepsRequired = round + 2;
    if (newSeq.length === stepsRequired) {
      setIsPlayerTurn(false);
      
      if (round === MAX_ROUNDS) {
        playSuccess();
        setIsFinished(true);
        setWon(true);
      } else {
        playSuccess();
        setTimeout(() => {
          setPlayerSeq([]);
          setRound(r => r + 1);
        }, 1000);
      }
    }
  };

  const manualConcludeGame = () => {
    playClick();
    const maxPts = MAX_SCORES['decodificador'][activeDifficulty || 'INTERMEDIARIO'] || 180;
    const pontos = won ? maxPts : Math.round(maxPts * ((round - 1) / MAX_ROUNDS));
    endGame([pontos]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 relative">
      
      <div className="text-center mb-10 flex flex-col items-center">
        <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-4">
          <Network size={40} className="text-cyan-400" /> Decodificador de Rede
        </h1>
        <p className="text-xl text-slate-400">Repita a sequência exata de nós para quebrar as camadas da senha.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12 bg-slate-800 p-12 rounded-[3rem] border-2 border-slate-700 shadow-2xl w-full max-w-4xl">
        
        <div className="flex flex-col items-center w-full md:w-1/3">
          
          <div className="w-full bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center mb-8">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2 block">Camada de Segurança</span>
            <div className="text-6xl font-black text-cyan-400">{round} / {MAX_ROUNDS}</div>
          </div>

          <div className="w-full bg-slate-900 p-6 rounded-2xl border border-slate-700 text-center flex flex-col items-center">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-4 block">Complexidade Atual</span>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: round + 2 }).map((_, i) => (
                <div key={i} className={`w-4 h-6 border-b-4 flex items-center justify-center font-black transition-colors ${i < playerSeq.length ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-600'}`}>
                  {i < playerSeq.length ? '*' : '?'}
                </div>
              ))}
            </div>
          </div>

          {!gameStarted && (
            <button 
              onClick={() => { playClick(); setGameStarted(true); }}
              className="mt-8 w-full flex items-center justify-center gap-3 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30"
            >
              <Play fill="currentColor" size={24} /> INICIAR
            </button>
          )}

        </div>

        <div className="relative w-80 h-80 flex items-center justify-center flex-1">
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
             <div className="w-48 h-48 border-4 border-dashed border-slate-400 rounded-full animate-spin-slow" />
             <div className="absolute w-64 h-64 border-2 border-slate-500 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-10 z-10 relative">
            {NODES.map((node) => {
              const isActive = activeNode === node.id;
              
              return (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  disabled={!isPlayerTurn || isFinished || !gameStarted}
                  className={`w-32 h-32 rounded-3xl flex items-center justify-center border-4 transition-all duration-200
                    ${isActive ? `${node.color} border-white text-white ${node.glow} scale-110` : `bg-slate-900 border-slate-700 ${node.text} hover:bg-slate-700 hover:border-slate-500`}
                    ${(!isPlayerTurn && gameStarted) ? 'cursor-default' : 'active:scale-95'}
                  `}
                >
                  <div className={isActive ? 'animate-pulse' : ''}>
                    {node.icon}
                  </div>
                </button>
              );
            })}
          </div>

          {gameStarted && !isFinished && (
             <div className={`absolute -bottom-16 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm transition-all ${isPlayerTurn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-amber-500/20 text-amber-400 border border-amber-500/50 animate-pulse'}`}>
               {isPlayerTurn ? 'SUA VEZ: REPITA A SEQUÊNCIA' : 'MEMORIZE A SEQUÊNCIA...'}
             </div>
          )}

        </div>
      </div>

      {isFinished && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in rounded-[3rem]">
          <div className="text-center flex flex-col items-center">
            <h2 className={`text-6xl font-black mb-4 ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
              {won ? 'SENHA DECODIFICADA!' : 'SEQUÊNCIA INCORRETA!'}
            </h2>
            
            <p className="text-2xl text-slate-300 mt-4">
              Você chegou até a complexidade <strong className="text-white">{round + 2}</strong>.
            </p>

            <button 
              onClick={manualConcludeGame}
              className="mt-10 flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30"
            >
              Continuar <ArrowRight size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}