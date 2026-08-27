import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { Palette, CheckCircle2, XCircle, Type } from 'lucide-react';

const COLORS = [
  { name: 'VERMELHO', hex: '#ef4444' },
  { name: 'AZUL', hex: '#3b82f6' },
  { name: 'VERDE', hex: '#22c55e' },
  { name: 'AMARELO', hex: '#eab308' },
  { name: 'ROXO', hex: '#a855f7' },
  { name: 'LARANJA', hex: '#f97316' }
];

export default function CliqueNaCor() {
  const { endGame, activeDifficulty } = useAppStore();
  
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  const [wordText, setWordText] = useState(COLORS[0]);
  const [wordColor, setWordColor] = useState(COLORS[1]);
  const [rule, setRule] = useState<'COR' | 'PALAVRA'>('COR');
  const [shuffledButtons, setShuffledButtons] = useState(COLORS);
  
  // Total múltiplo de 6 para fechar blocos de 3 perfeitamente
  const TOTAL_ROUNDS = 18;

  const generateRound = useCallback((currentRound: number) => {
    const randomText = COLORS[Math.floor(Math.random() * COLORS.length)];
    let randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Garante que a cor da tinta seja sempre diferente da palavra escrita
    while (randomColor.name === randomText.name) {
      randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    // A MÁGICA DOS 3 EM 3: 
    // Rodadas 1, 2, 3 -> COR | 4, 5, 6 -> PALAVRA | 7, 8, 9 -> COR...
    const isColorRule = Math.ceil(currentRound / 3) % 2 !== 0;
    setRule(isColorRule ? 'COR' : 'PALAVRA');
    
    setShuffledButtons([...COLORS].sort(() => Math.random() - 0.5));
    
    setWordText(randomText);
    setWordColor(randomColor);
    setFeedback('none');
  }, []);

  useEffect(() => {
    generateRound(1);
  }, [generateRound]);

  const handleGuess = (clickedHex: string) => {
    if (feedback !== 'none') return;

    let isCorrect = false;
    
    if (clickedHex) {
      isCorrect = rule === 'COR' 
        ? clickedHex === wordColor.hex 
        : clickedHex === wordText.hex;
    }

    const newScore = isCorrect ? score + 10 : score;
    if (isCorrect) setScore(newScore);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      if (round < TOTAL_ROUNDS) {
        const nextRound = round + 1;
        setRound(nextRound);
        generateRound(nextRound);
      } else {
        const maxPts = MAX_SCORES['clique-na-cor'][activeDifficulty || 'INICIANTE'] || 100;
        const pontosFinais = Math.round((newScore / (TOTAL_ROUNDS * 10)) * maxPts);
        endGame([pontosFinais]);
      }
    }, 600);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl select-none">
      
      {/* HEADER: PLACAR E RODADA */}
      <div className="w-full flex justify-between items-center mb-8 bg-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-700">
        <div className="text-2xl font-bold text-slate-400">Rodada {round}/{TOTAL_ROUNDS}</div>
        <div className="text-3xl font-bold text-emerald-400">Pontos: {score}</div>
      </div>

      {/* ÁREA CENTRAL: REGRA E PALAVRA */}
      <div className="text-center mb-12 w-full bg-slate-900 rounded-[3rem] p-10 border-4 border-slate-800 shadow-inner relative overflow-hidden">
        
        {/* INSTRUÇÃO COM NOVO DESTAQUE */}
        <h2 className="text-3xl text-slate-300 font-bold mb-8 uppercase tracking-widest flex items-center justify-center h-12">
          {rule === 'COR' ? (
            <>
              <Palette size={32} className="text-emerald-500 mr-3" /> 
              Toque na 
              <span className="bg-emerald-500 text-slate-950 px-5 py-2 rounded-xl font-black ml-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                COR DA TINTA
              </span>
            </>
          ) : (
            <>
              <Type size={32} className="text-sky-500 mr-3" /> 
              Toque no que está 
              <span className="bg-sky-500 text-slate-950 px-5 py-2 rounded-xl font-black ml-4 shadow-[0_0_20px_rgba(14,165,233,0.4)]">
                ESCRITO
              </span>
            </>
          )}
        </h2>
        
        <div className="h-40 flex items-center justify-center relative">
          <span 
            className="text-[7rem] font-black uppercase tracking-tighter drop-shadow-2xl transition-transform duration-200"
            style={{ color: wordColor.hex, transform: feedback !== 'none' ? 'scale(0.95)' : 'scale(1)' }}
          >
            {wordText.name}
          </span>
          
          {feedback === 'correct' && <CheckCircle2 size={120} className="absolute text-emerald-400 opacity-90 animate-in zoom-in" />}
          {feedback === 'wrong' && <XCircle size={120} className="absolute text-red-500 opacity-90 animate-in zoom-in" />}
        </div>
      </div>

      {/* BOTÕES EMBARALHADOS */}
      <div className="grid grid-cols-3 gap-6 w-full">
        {shuffledButtons.map((c) => (
          <button
            key={c.name}
            onClick={() => handleGuess(c.hex)}
            disabled={feedback !== 'none'}
            className="py-10 rounded-3xl shadow-xl active:scale-90 transition-all flex items-center justify-center border-b-8 active:border-b-0 active:translate-y-2 hover:brightness-110"
            style={{ backgroundColor: c.hex, borderColor: `${c.hex}80` }}
          >
            <span className="text-white font-black text-3xl drop-shadow-md tracking-wide">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}