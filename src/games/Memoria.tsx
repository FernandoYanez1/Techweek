import { useState, useEffect } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { playClick, playSuccess, playError } from '../core/audio';
import { Database, Cloud, Code, Cpu, Globe, Lock, Server, Monitor } from 'lucide-react';

const ICONS = [
  <Database size={48} />, <Cloud size={48} />, <Code size={48} />, <Cpu size={48} />,
  <Globe size={48} />, <Lock size={48} />, <Server size={48} />, <Monitor size={48} />
];

interface Card {
  id: number;
  iconId: number;
  icon: any; // BLINDADO: Resolve qualquer erro de tipagem no seu VS Code
  isFlipped: boolean;
  isMatched: boolean;
}

export default function Memoria() {
  const { loggedUsers, endGame, activeDifficulty } = useAppStore();
  const player1 = loggedUsers[0];
  const player2 = loggedUsers.length > 1 ? loggedUsers[1] : null;

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  
  const [turn, setTurn] = useState<0 | 1>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const deck = [...ICONS, ...ICONS].map((icon, index) => ({
      id: index,
      iconId: index % ICONS.length,
      icon,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(deck.sort(() => Math.random() - 0.5));
  }, []);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    playClick();
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      checkMatch(newFlipped[0], newFlipped[1], newCards);
    }
  };

  const checkMatch = (idx1: number, idx2: number, currentCards: Card[]) => {
    const match = currentCards[idx1].iconId === currentCards[idx2].iconId;

    setTimeout(() => {
      if (match) {
        playSuccess();
        currentCards[idx1].isMatched = true;
        currentCards[idx2].isMatched = true;
        
        const newScores: [number, number] = [...scores];
        newScores[turn] += 1;
        setScores(newScores);
        
        const newMatches = matches + 1;
        setMatches(newMatches);

        if (newMatches === ICONS.length) {
          concludeGame(newScores);
        }
      } else {
        playError();
        currentCards[idx1].isFlipped = false;
        currentCards[idx2].isFlipped = false;
        if (player2) setTurn(turn === 0 ? 1 : 0);
      }
      
      setCards([...currentCards]);
      setFlippedIndices([]);
      setIsLocked(false);
    }, 1000);
  };

  const concludeGame = (finalScores: [number, number]) => {
    const maxPts = MAX_SCORES['memoria'][activeDifficulty || 'INICIANTE'];
    const ptsP1 = Math.round((finalScores[0] / ICONS.length) * maxPts);
    const ptsP2 = Math.round((finalScores[1] / ICONS.length) * maxPts);
    endGame(player2 ? [ptsP1, ptsP2] : [ptsP1]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 relative">
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-800 border-2 border-slate-700 px-10 py-3 rounded-full text-2xl font-bold text-slate-300 shadow-xl z-50 flex items-center gap-6">
        <span className={`transition-colors ${turn === 0 ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] scale-110' : 'text-slate-500'}`}>
          {player1?.name}: {scores[0]}
        </span> 
        {player2 && (
          <>
            <span className="text-slate-600">|</span> 
            <span className={`transition-colors ${turn === 1 ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)] scale-110' : 'text-slate-500'}`}>
              {player2.name}: {scores[1]}
            </span>
          </>
        )}
      </div>

      <div className="text-center mb-8 mt-16">
        <h1 className="text-5xl font-black text-white mb-2">Memória Tech</h1>
        <p className="text-xl text-slate-400">Encontre os pares de tecnologia</p>
      </div>

      <div className="grid grid-cols-4 gap-4 md:gap-6 bg-slate-800 p-8 rounded-[3rem] border-4 border-slate-700 shadow-2xl">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`w-20 h-20 md:w-28 md:h-28 rounded-2xl flex items-center justify-center transition-all duration-300 transform
              ${card.isFlipped || card.isMatched ? 'bg-slate-700 shadow-inner border-2 border-cyan-500/50' : 'bg-gradient-to-br from-cyan-600 to-blue-700 hover:scale-105 hover:shadow-cyan-500/30 shadow-lg border-b-4 border-blue-900'}
            `}
          >
            <div className={`transition-opacity duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100 text-cyan-400' : 'opacity-0'}`}>
              {card.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}