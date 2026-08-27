import { useState } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { playClick, playSuccess, playError } from '../core/audio';
import { Router, EyeOff, SwitchCamera, Bug, ArrowRight } from 'lucide-react';

const GRID_SIZE = 5;
const TOTAL_CELLS = 25;
const TOTAL_SHIPS = 3;

type Mode = 'mp_pass_p1_setup' | 'mp_setup_p1' | 'mp_pass_p2_setup' | 'mp_setup_p2' | 'mp_pass_play' | 'mp_playing' | 'mp_won';

export default function BatalhaNaval() {
  const { loggedUsers, endGame, activeDifficulty } = useAppStore();
  
  const player1 = loggedUsers[0];
  const player2 = loggedUsers[1] || { name: 'Jogador 2' };

  const p1Name = player1?.name || 'Jogador 1';
  const p2Name = player2?.name || 'Jogador 2';

  const [mode, setMode] = useState<Mode>('mp_pass_p1_setup');
  const [turn, setTurn] = useState<'p1' | 'p2'>('p1');
  const [winner, setWinner] = useState('');

  const [p1Ships, setP1Ships] = useState<number[]>([]);
  const [p2Ships, setP2Ships] = useState<number[]>([]);

  const [p1Attacks, setP1Attacks] = useState<number[]>([]);
  const [p2Attacks, setP2Attacks] = useState<number[]>([]);

  const RenderPass = (title: string, subtitle: string, nextMode: Mode, onStart?: () => void) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8 text-center animate-in fade-in duration-300">
      <EyeOff size={100} className="text-amber-500 mb-8 animate-pulse" />
      <h1 className="text-6xl font-black mb-6 text-white">{title}</h1>
      <p className="text-3xl text-slate-400 mb-12">{subtitle}</p>
      
      <button 
        onClick={() => {
          playClick();
          if (onStart) onStart();
          setMode(nextMode);
        }} 
        className="flex items-center justify-center gap-4 py-6 px-12 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-3xl text-3xl transition-transform active:scale-95 shadow-lg shadow-amber-500/30"
      >
        <SwitchCamera size={36} /> Pronto, prosseguir!
      </button>
    </div>
  );

  if (mode === 'mp_pass_p1_setup') return RenderPass(`Vire de costas, ${p2Name}!`, `Agora é a vez de ${p1Name} esconder os roteadores.`, 'mp_setup_p1');
  if (mode === 'mp_pass_p2_setup') return RenderPass(`Vire de costas, ${p1Name}!`, `Agora é a vez de ${p2Name} esconder os roteadores.`, 'mp_setup_p2');
  if (mode === 'mp_pass_play') return RenderPass('Tudo pronto!', `A Batalha vai começar. Sorteando quem ataca primeiro...`, 'mp_playing', () => setTurn(Math.random() > 0.5 ? 'p1' : 'p2'));

  const acaoSetup = (index: number, player: 'p1' | 'p2') => {
    playClick();
    const currentShips = player === 'p1' ? p1Ships : p2Ships;
    const setShips = player === 'p1' ? setP1Ships : setP2Ships;

    if (currentShips.includes(index)) setShips(currentShips.filter(i => i !== index));
    else if (currentShips.length < TOTAL_SHIPS) setShips([...currentShips, index]);
  };

  const RenderSetup = (player: 'p1' | 'p2', name: string, nextMode: Mode) => {
    const currentShips = player === 'p1' ? p1Ships : p2Ships;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative p-8 animate-in zoom-in duration-300">
        <h2 className="text-5xl font-black mb-4 text-cyan-400">Vez de {name}</h2>
        <p className="text-2xl text-slate-400 mb-8">Esconda {TOTAL_SHIPS} roteadores na rede. O outro jogador não pode olhar!</p>
        
        <div className="grid gap-2 bg-slate-800 p-6 rounded-3xl border-4 border-slate-700 shadow-2xl" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
          {Array.from({ length: TOTAL_CELLS }).map((_, i) => (
            <button 
              key={i} 
              onClick={() => acaoSetup(i, player)} 
              className={`w-20 h-20 md:w-24 md:h-24 relative rounded-xl border-2 transition-all active:scale-95 flex items-center justify-center
                ${currentShips.includes(i) ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-900 border-slate-700 hover:border-cyan-500/50'}
              `}
            >
              {currentShips.includes(i) && <Router size={40} className="text-emerald-400" />}
            </button>
          ))}
        </div>

        <button 
          onClick={() => { playClick(); setMode(nextMode); }} 
          disabled={currentShips.length !== TOTAL_SHIPS} 
          className="mt-10 px-12 py-5 bg-cyan-500 disabled:bg-slate-700 text-white disabled:text-slate-500 text-3xl font-bold rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-4"
        >
          Confirmar Posições <ArrowRight />
        </button>
      </div>
    );
  };

  if (mode === 'mp_setup_p1') return RenderSetup('p1', p1Name, 'mp_pass_p2_setup');
  if (mode === 'mp_setup_p2') return RenderSetup('p2', p2Name, 'mp_pass_play');

  const ataque = (index: number, atacante: 'p1' | 'p2') => {
    if (atacante !== turn) return;
    
    const isP1 = atacante === 'p1';
    const attacks = isP1 ? p1Attacks : p2Attacks;
    const enemyShips = isP1 ? p2Ships : p1Ships;
    const setAttacks = isP1 ? setP1Attacks : setP2Attacks;

    if (attacks.includes(index)) return; 

    const newAttacks = [...attacks, index];
    setAttacks(newAttacks);

    const isHit = enemyShips.includes(index);
    if (isHit) playSuccess();
    else playError();

    const hitsFound = newAttacks.filter(a => enemyShips.includes(a)).length;

    if (hitsFound === TOTAL_SHIPS) {
      setTimeout(() => {
        setWinner(atacante === 'p1' ? p1Name : p2Name);
        setMode('mp_won');
      }, 1000);
      return;
    }

    setTimeout(() => setTurn(atacante === 'p1' ? 'p2' : 'p1'), 1000);
  };

  if (mode === 'mp_playing') {
    return (
      <div className="w-full h-full flex flex-col bg-slate-900 relative select-none">
        
        <div className="absolute top-6 w-full text-center z-40 pointer-events-none"> 
          <h2 className="text-4xl font-black text-slate-800 bg-cyan-400 inline-block px-10 py-3 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.6)]">
            Vez de {turn === 'p1' ? p1Name : p2Name}
          </h2> 
        </div>
        
        <div className="flex-1 flex w-full">
          
          {/* LADO DO JOGADOR 1 */}
          <div className={`flex-1 flex flex-col items-center justify-center p-8 border-r-4 border-slate-800 transition-opacity duration-300 ${turn === 'p2' ? 'opacity-30 pointer-events-none' : 'bg-slate-800/20'}`}>
             <h3 className="text-4xl font-black text-cyan-400 mb-2">{p1Name}</h3> 
             <p className="text-slate-400 mb-8 text-xl uppercase tracking-widest">Ataque a rede de {p2Name}</p>
             
             <div className="grid gap-2 bg-slate-800 p-6 rounded-[2rem] shadow-2xl border-4 border-slate-700" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
               {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
                 const isRevealed = p1Attacks.includes(i);
                 const hasBug = p2Ships.includes(i);

                 return (
                   <button 
                    key={i} 
                    onClick={() => ataque(i, 'p1')} 
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 transition-all active:scale-95 flex items-center justify-center
                      ${!isRevealed ? 'bg-slate-900 border-slate-700 hover:border-cyan-500' : hasBug ? 'bg-rose-500/20 border-rose-500' : 'bg-slate-800/50 border-slate-700 shadow-inner'}
                    `}
                   >
                     {isRevealed && hasBug && <Bug size={40} className="text-rose-500 animate-in zoom-in drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" />} 
                     {isRevealed && !hasBug && <div className="w-2 h-2 rounded-full bg-slate-600 opacity-50" />} 
                   </button>
                 );
               })}
             </div>
             <p className="mt-8 text-2xl font-bold text-slate-300">
               Invasores Descobertos: <strong className="text-cyan-400">{p1Attacks.filter(a => p2Ships.includes(a)).length} / {TOTAL_SHIPS}</strong>
             </p>
          </div>

          {/* LADO DO JOGADOR 2 */}
          <div className={`flex-1 flex flex-col items-center justify-center p-8 transition-opacity duration-300 ${turn === 'p1' ? 'opacity-30 pointer-events-none' : 'bg-slate-800/20'}`}>
             <h3 className="text-4xl font-black text-amber-400 mb-2">{p2Name}</h3> 
             <p className="text-slate-400 mb-8 text-xl uppercase tracking-widest">Ataque a rede de {p1Name}</p>
             
             <div className="grid gap-2 bg-slate-800 p-6 rounded-[2rem] shadow-2xl border-4 border-slate-700" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
               {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
                 const isRevealed = p2Attacks.includes(i);
                 const hasBug = p1Ships.includes(i);

                 return (
                   <button 
                    key={i} 
                    onClick={() => ataque(i, 'p2')} 
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 transition-all active:scale-95 flex items-center justify-center
                      ${!isRevealed ? 'bg-slate-900 border-slate-700 hover:border-amber-500' : hasBug ? 'bg-rose-500/20 border-rose-500' : 'bg-slate-800/50 border-slate-700 shadow-inner'}
                    `}
                   >
                     {isRevealed && hasBug && <Bug size={40} className="text-rose-500 animate-in zoom-in drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" />} 
                     {isRevealed && !hasBug && <div className="w-2 h-2 rounded-full bg-slate-600 opacity-50" />} 
                   </button>
                 );
               })}
             </div>
             <p className="mt-8 text-2xl font-bold text-slate-300">
               Invasores Descobertos: <strong className="text-amber-400">{p2Attacks.filter(a => p1Ships.includes(a)).length} / {TOTAL_SHIPS}</strong>
             </p>
          </div>

        </div>
      </div>
    );
  }

  if (mode === 'mp_won') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-center animate-in fade-in p-8">
        <Bug size={100} className="text-rose-500 mb-8 animate-bounce drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
        <h1 className="text-7xl font-black text-white mb-6">
          <strong className="text-cyan-400">{winner}</strong> VENCEU!
        </h1>
        <p className="text-3xl text-slate-400 mb-12">Destruiu todos os invasores da rede inimiga.</p>
        
        <button 
          onClick={() => {
            playClick();
            const maxPts = MAX_SCORES['batalha-naval'][activeDifficulty || 'INICIANTE'] || 80;
            const pts1 = winner === p1Name ? maxPts : Math.round((p1Attacks.filter(a => p2Ships.includes(a)).length / TOTAL_SHIPS) * maxPts * 0.5);
            const pts2 = winner === p2Name ? maxPts : Math.round((p2Attacks.filter(a => p1Ships.includes(a)).length / TOTAL_SHIPS) * maxPts * 0.5);
            endGame([pts1, pts2]);
          }} 
          className="flex items-center gap-4 px-12 py-6 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-3xl text-3xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30"
        >
          Ver Pontuação Final <ArrowRight size={36} />
        </button>
      </div>
    );
  }

  return null;
}