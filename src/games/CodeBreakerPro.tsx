import { useState } from 'react';
import { useAppStore } from '../core/store';
import { playClick, playSuccess, playError } from '../core/audio';
import { Database, Cloud, Code, Cpu, Globe, Lock, Terminal, MonitorPlay, Check, Delete, ArrowRight } from 'lucide-react';

// PRO: 8 Símbolos disponíveis
const SYMBOLS = [
  { id: 0, icon: <Database size={28} />, color: 'text-rose-500', bg: 'bg-rose-500/20', border: 'border-rose-500' },
  { id: 1, icon: <Cloud size={28} />, color: 'text-cyan-400', bg: 'bg-cyan-400/20', border: 'border-cyan-400' },
  { id: 2, icon: <Code size={28} />, color: 'text-emerald-500', bg: 'bg-emerald-500/20', border: 'border-emerald-500' },
  { id: 3, icon: <Cpu size={28} />, color: 'text-amber-500', bg: 'bg-amber-500/20', border: 'border-amber-500' },
  { id: 4, icon: <Globe size={28} />, color: 'text-blue-500', bg: 'bg-blue-500/20', border: 'border-blue-500' },
  { id: 5, icon: <Lock size={28} />, color: 'text-purple-500', bg: 'bg-purple-500/20', border: 'border-purple-500' },
  { id: 6, icon: <Terminal size={28} />, color: 'text-indigo-400', bg: 'bg-indigo-400/20', border: 'border-indigo-400' },
  { id: 7, icon: <MonitorPlay size={28} />, color: 'text-pink-500', bg: 'bg-pink-500/20', border: 'border-pink-500' }
];

// PRO: Senha de 5 símbolos, com até 10 tentativas
const CODE_LENGTH = 5;
const MAX_TRIES = 10;

interface HistoryRow {
  guess: number[];
  perfect: number;
  partial: number;
}

export default function CodeBreakerPro() {
  const { endGame } = useAppStore();
  
  const [secretCode] = useState<number[]>(() => {
    return Array.from({ length: CODE_LENGTH }, () => Math.floor(Math.random() * SYMBOLS.length));
  });

  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [won, setWon] = useState(false);

  const handleSymbolClick = (id: number) => {
    if (isFinished || currentGuess.length >= CODE_LENGTH) return;
    playClick();
    setCurrentGuess([...currentGuess, id]);
  };

  const handleUndo = () => {
    if (isFinished || currentGuess.length === 0) return;
    playClick();
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const handleSubmit = () => {
    if (currentGuess.length !== CODE_LENGTH || isFinished) return;

    let perfect = 0;
    let partial = 0;
    
    const secretCopy = [...secretCode];
    const guessCopy = [...currentGuess];

    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        perfect++;
        secretCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }

    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] !== -2) {
        const foundIndex = secretCopy.indexOf(guessCopy[i]);
        if (foundIndex !== -1) {
          partial++;
          secretCopy[foundIndex] = -1;
        }
      }
    }

    const newHistory = [...history, { guess: currentGuess, perfect, partial }];
    setHistory(newHistory);
    setCurrentGuess([]);

    if (perfect === CODE_LENGTH) {
      playSuccess();
      setWon(true);
      setIsFinished(true);
    } else if (newHistory.length >= MAX_TRIES) {
      playError();
      setIsFinished(true);
    } else {
      playClick();
    }
  };

  const manualConcludeGame = () => {
    playClick();
    const maxPts = 350; // Travado na força para o modo PRO
    const points = won ? Math.round(maxPts * (1 - ((history.length - 1) * 0.08))) : 0;
    endGame([points]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-6xl p-8 relative">
      <div className="text-center mb-4">
        <h1 className="text-5xl font-black text-rose-500 mb-2 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">Code Breaker PRO</h1>
        <p className="text-xl text-slate-400">Nível Expert: Descubra a sequência de 5 símbolos (símbolos podem se repetir).</p>
      </div>

      <div className="flex gap-6 mb-6 bg-slate-800 p-4 rounded-2xl border-2 border-slate-700 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-emerald-500 rounded-full" />
          <span className="text-slate-300 font-bold text-sm">Símbolo e Posição Certos</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-white rounded-full" />
          <span className="text-slate-300 font-bold text-sm">Apenas Símbolo Certo</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full">
        
        {/* HISTÓRICO */}
        <div className="flex-1 bg-slate-800 border-2 border-slate-700 rounded-3xl p-6 h-[400px] overflow-y-auto custom-scrollbar flex flex-col gap-3">
          {Array.from({ length: MAX_TRIES }).map((_, i) => {
            const row = history[i];
            return (
              <div key={i} className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-700">
                <span className="text-slate-600 font-bold w-6">{i + 1}</span>
                <div className="flex gap-2">
                  {Array.from({ length: CODE_LENGTH }).map((_, j) => {
                    const symbolId = row ? row.guess[j] : null;
                    const symbol = symbolId !== null ? SYMBOLS.find(s => s.id === symbolId) : null;
                    return (
                      <div key={j} className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${symbol ? `${symbol.bg} ${symbol.border} ${symbol.color}` : 'border-slate-700 bg-slate-800'}`}>
                        {symbol?.icon}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap w-14 gap-1 justify-center">
                  {row && Array.from({ length: CODE_LENGTH }).map((_, k) => {
                    let pinClass = 'bg-slate-700'; 
                    if (k < row.perfect) pinClass = 'bg-emerald-500'; 
                    else if (k < row.perfect + row.partial) pinClass = 'bg-white'; 
                    return <div key={k} className={`w-2.5 h-2.5 rounded-full ${pinClass}`} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* CONTROLES */}
        <div className="w-full md:w-[400px] flex flex-col gap-6">
          <div className="bg-slate-800 border-2 border-slate-700 rounded-3xl p-6 flex flex-col items-center gap-4">
            <span className="text-slate-400 font-bold uppercase text-sm">Sequência Atual</span>
            <div className="flex gap-2">
              {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                const symbolId = currentGuess[i];
                const symbol = symbolId !== undefined ? SYMBOLS.find(s => s.id === symbolId) : null;
                return (
                  <div key={i} className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${symbol ? `${symbol.bg} ${symbol.border} ${symbol.color}` : 'border-slate-600 bg-slate-700'}`}>
                    {symbol?.icon}
                  </div>
                );
              })}
            </div>
            <div className="flex w-full gap-2 mt-2">
              <button onClick={handleUndo} disabled={currentGuess.length === 0} className="flex-1 py-3 bg-slate-700 hover:bg-rose-500/20 text-white hover:text-rose-400 rounded-xl font-bold flex justify-center items-center active:scale-95 disabled:opacity-50 transition-colors">
                <Delete size={24} />
              </button>
              <button onClick={handleSubmit} disabled={currentGuess.length < CODE_LENGTH} className="flex-[2] py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold flex justify-center items-center active:scale-95 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/25">
                <Check size={24} className="mr-2" /> TENTAR
              </button>
            </div>
          </div>

          <div className="bg-slate-800 border-2 border-slate-700 rounded-3xl p-6 grid grid-cols-4 gap-3">
            {SYMBOLS.map(symbol => (
              <button
                key={symbol.id}
                onClick={() => handleSymbolClick(symbol.id)}
                disabled={currentGuess.length >= CODE_LENGTH || isFinished}
                className={`w-full aspect-square rounded-2xl flex items-center justify-center border-2 transition-all active:scale-95 disabled:opacity-50
                  ${symbol.bg} ${symbol.border} ${symbol.color} hover:bg-slate-700 shadow-md`}
              >
                {symbol.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isFinished && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in rounded-[3rem]">
          <div className="text-center flex flex-col items-center">
            <h2 className={`text-6xl font-black mb-4 ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
              {won ? 'CÓDIGO PRO QUEBRADO!' : 'SISTEMA BLOQUEADO!'}
            </h2>
            
            <div className="flex flex-col items-center mt-6">
              <p className="text-2xl text-slate-300 mb-6">A sequência correta era:</p>
              <div className="flex gap-4">
                {secretCode.map((id, i) => {
                  const symbol = SYMBOLS.find(s => s.id === id);
                  return (
                    <div key={i} className={`w-16 h-16 rounded-2xl flex items-center justify-center border-4 ${symbol?.bg} ${symbol?.border} ${symbol?.color}`}>
                      {symbol?.icon}
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={manualConcludeGame}
              className="mt-12 flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30"
            >
              Continuar <ArrowRight size={28} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}