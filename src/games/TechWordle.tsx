import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { playClick, playSuccess, playError } from '../core/audio';
import { Keyboard as KeyboardIcon, Delete } from 'lucide-react';

const WORDS = [
  'PLACA', 'DADOS', 'MOUSE', 'VIRUS', 'LINUX', 'REDES', 'LOGIC', 'TOKEN', 'FIBRA', 'CLOUD', 
  'CACHE', 'MACRO', 'PIXEL', 'PROXY', 'QUERY', 'DEBUG', 'PAINEL', 'SENHA', 'LOGIN', 'HOSTS'
];

const MAX_TRIES = 6;
const WORD_LENGTH = 5;

export default function TechWordle() {
  const { endGame, activeDifficulty } = useAppStore();
  const targetWord = useMemo(() => WORDS[Math.floor(Math.random() * WORDS.length)], []);
  
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_TRIES).fill(''));
  const [currentTry, setCurrentTry] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [won, setWon] = useState(false);

  const currentGuess = guesses[currentTry] || '';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (e.key === 'Enter') handleEnter();
      else if (e.key === 'Backspace') handleBackspace();
      else if (/^[A-Za-z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, currentTry, isFinished]);

  const handleKeyPress = (letter: string) => {
    if (currentGuess.length < WORD_LENGTH && !isFinished) {
      playClick();
      const newGuesses = [...guesses];
      newGuesses[currentTry] = currentGuess + letter;
      setGuesses(newGuesses);
    }
  };

  const handleBackspace = () => {
    if (currentGuess.length > 0 && !isFinished) {
      playClick();
      const newGuesses = [...guesses];
      newGuesses[currentTry] = currentGuess.slice(0, -1);
      setGuesses(newGuesses);
    }
  };

  const handleEnter = () => {
    if (currentGuess.length !== WORD_LENGTH || isFinished) return;

    if (currentGuess === targetWord) {
      playSuccess();
      setWon(true);
      setIsFinished(true);
      setTimeout(() => concludeGame(true, currentTry + 1), 3000);
    } else {
      if (currentTry + 1 >= MAX_TRIES) {
        playError();
        setIsFinished(true);
        setTimeout(() => concludeGame(false, MAX_TRIES), 3000);
      } else {
        playClick();
        setCurrentTry(currentTry + 1);
      }
    }
  };

  const concludeGame = (isWin: boolean, triesUsed: number) => {
    const maxPts = MAX_SCORES['tech-wordle'][activeDifficulty || 'INTERMEDIARIO'];
    const points = isWin ? Math.round(maxPts * (1 - ((triesUsed - 1) * 0.15))) : 0;
    endGame([points]);
  };

  // CORREÇÃO: O TypeScript agora usa a variável "letter" corretamente.
  const getLetterState = (letter: string, pos: number, guess: string) => {
    if (!guess) return 'empty';
    if (letter === targetWord[pos]) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  const qwerty = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  const getKeyColor = (key: string) => {
    if (key === 'ENTER' || key === 'BACKSPACE') return 'bg-slate-700 text-white';
    
    let state = 'bg-slate-700 text-white';
    for (let i = 0; i < currentTry; i++) {
      const guess = guesses[i];
      for (let j = 0; j < WORD_LENGTH; j++) {
        if (guess[j] === key) {
          if (targetWord[j] === key) return 'bg-emerald-500 text-white'; 
          if (targetWord.includes(key) && state !== 'bg-emerald-500 text-white') state = 'bg-amber-500 text-white';
          if (!targetWord.includes(key) && state === 'bg-slate-700 text-white') state = 'bg-slate-900 text-slate-600';
        }
      }
    }
    return state;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl p-8 relative">
      <div className="text-center mb-6 flex flex-col items-center">
        <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-4">
          <KeyboardIcon size={40} className="text-cyan-400" /> Tech Wordle
        </h1>
        <p className="text-xl text-slate-400">Adivinhe o termo de TI de 5 letras.</p>
      </div>

      {/* LEGENDA DE REGRAS ADICIONADA */}
      <div className="flex gap-4 md:gap-8 mb-8 bg-slate-800 p-4 rounded-2xl border-2 border-slate-700 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-emerald-500 rounded-md shadow-inner" />
          <span className="text-slate-300 font-bold text-sm md:text-base">Lugar Certo</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-amber-500 rounded-md shadow-inner" />
          <span className="text-slate-300 font-bold text-sm md:text-base">Tem na Palavra</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-slate-900 border border-slate-600 rounded-md shadow-inner" />
          <span className="text-slate-300 font-bold text-sm md:text-base">Não Existe</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-10">
        {guesses.map((guess, tryIdx) => (
          <div key={tryIdx} className="flex gap-2">
            {Array.from({ length: WORD_LENGTH }).map((_, letterIdx) => {
              const letter = guess[letterIdx] || '';
              const state = tryIdx < currentTry ? getLetterState(letter, letterIdx, guess) : 'empty';
              
              let colors = 'border-slate-700 bg-slate-800 text-white';
              if (state === 'correct') colors = 'bg-emerald-500 border-emerald-500 text-white';
              else if (state === 'present') colors = 'bg-amber-500 border-amber-500 text-white';
              else if (state === 'absent') colors = 'bg-slate-900 border-slate-900 text-slate-600';
              else if (letter) colors = 'border-slate-500 bg-slate-800 text-white';

              return (
                <div 
                  key={letterIdx} 
                  className={`w-14 h-14 md:w-20 md:h-20 border-2 rounded-xl flex items-center justify-center text-4xl font-black uppercase transition-all duration-500 ${colors}`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 w-full max-w-3xl">
        {qwerty.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-2">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'ENTER') handleEnter();
                  else if (key === 'BACKSPACE') handleBackspace();
                  else handleKeyPress(key);
                }}
                className={`h-12 md:h-16 flex items-center justify-center font-bold rounded-lg transition-colors active:scale-95 text-lg md:text-xl
                  ${key === 'ENTER' || key === 'BACKSPACE' ? 'px-4 bg-slate-700 text-white' : 'w-10 md:w-12 ' + getKeyColor(key)}
                `}
              >
                {key === 'BACKSPACE' ? <Delete size={24} /> : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {isFinished && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-in fade-in rounded-[3rem]">
          <div className="text-center">
            <h2 className={`text-6xl font-black mb-4 ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
              {won ? 'VOCÊ ACERTOU!' : 'FIM DE JOGO!'}
            </h2>
            {!won && <p className="text-3xl text-white">A palavra era: <strong className="text-cyan-400">{targetWord}</strong></p>}
          </div>
        </div>
      )}
    </div>
  );
}