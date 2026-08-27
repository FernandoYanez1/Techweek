import { useState, useEffect } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { Code, Bug } from 'lucide-react';
import { playClick, playSuccess, playError } from '../core/audio';

type PlayerType = 'DEV' | 'BUG' | null;

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const getSmartMove = (board: PlayerType[], botType: PlayerType, opponentType: PlayerType) => {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] === botType && board[b] === botType && board[c] === null) return c;
    if (board[a] === botType && board[c] === botType && board[b] === null) return b;
    if (board[b] === botType && board[c] === botType && board[a] === null) return a;
  }
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] === opponentType && board[b] === opponentType && board[c] === null) return c;
    if (board[a] === opponentType && board[c] === opponentType && board[b] === null) return b;
    if (board[b] === opponentType && board[c] === opponentType && board[a] === null) return a;
  }
  if (board[4] === null) return 4;
  
  const emptyIndexes = board.map((val, idx) => (val === null ? idx : null)).filter(val => val !== null) as number[];
  if (emptyIndexes.length > 0) return emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  return null;
};

export default function Velha() {
  const { loggedUsers, endGame, activeDifficulty } = useAppStore(); 
  
  const player1 = loggedUsers[0];
  const player2 = loggedUsers.length > 1 ? loggedUsers[1] : null; 

  const [board, setBoard] = useState<PlayerType[]>(Array(9).fill(null));
  const [isDevTurn, setIsDevTurn] = useState(true);
  const [roundWinner, setRoundWinner] = useState<PlayerType | 'DRAW' | null>(null);
  const [isWaitingBot, setIsWaitingBot] = useState(false);
  
  // Controle Exato de 3 Rodadas
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [devWins, setDevWins] = useState(0);
  const [bugWins, setBugWins] = useState(0);

  useEffect(() => {
    let currentWinner: PlayerType | 'DRAW' | null = null;

    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        currentWinner = board[a];
        break;
      }
    }

    if (!currentWinner && !board.includes(null)) {
      currentWinner = 'DRAW';
    }

    if (currentWinner && !roundWinner) {
      setRoundWinner(currentWinner);
      
      if (currentWinner === 'DEV') playSuccess();
      else if (currentWinner === 'BUG' && !player2) playError(); // Erro se perdeu pro bot
      else playSuccess(); // Se for PVP, é sempre festa

      const finalDev = devWins + (currentWinner === 'DEV' ? 1 : 0);
      const finalBug = bugWins + (currentWinner === 'BUG' ? 1 : 0);
      const currentRounds = roundsPlayed + 1;

      setDevWins(finalDev);
      setBugWins(finalBug);
      setRoundsPlayed(currentRounds);

      setTimeout(() => {
        // Encerra EXATAMENTE ao completar 3 rodadas
        if (currentRounds >= 3) {
          const maxPts = MAX_SCORES['velha'][activeDifficulty || 'INICIANTE'];
          
          // Pontuação proporcional: Ganhou 1? 20 pts. Ganhou 3? 60 pts.
          const ptsP1 = Math.round((finalDev / 3) * maxPts);
          const ptsP2 = Math.round((finalBug / 3) * maxPts);
          
          endGame(player2 ? [ptsP1, ptsP2] : [ptsP1]);
        } else {
          setBoard(Array(9).fill(null));
          setRoundWinner(null);
          setIsDevTurn(true); // Dev sempre começa a nova rodada
        }
      }, 2500);
    }
  }, [board, devWins, bugWins, player2, endGame, roundWinner, roundsPlayed, activeDifficulty]);

  useEffect(() => {
    if (!player2 && !isDevTurn && !roundWinner) {
      setIsWaitingBot(true);
      setTimeout(() => {
        const bestMove = getSmartMove(board, 'BUG', 'DEV');
        if (bestMove !== null) {
          const newBoard = [...board];
          newBoard[bestMove] = 'BUG';
          setBoard(newBoard);
          setIsDevTurn(true);
          playClick();
        }
        setIsWaitingBot(false);
      }, 1000);
    }
  }, [isDevTurn, board, roundWinner, player2]);

  const handleCellClick = (index: number) => {
    if (board[index] || roundWinner || isWaitingBot) return;
    if (!player2 && !isDevTurn) return;

    playClick();
    const newBoard = [...board];
    newBoard[index] = isDevTurn ? 'DEV' : 'BUG';
    setBoard(newBoard);
    setIsDevTurn(!isDevTurn);
  };

  const renderCell = (index: number) => {
    const value = board[index];
    const canClick = !value && !roundWinner && (player2 || isDevTurn);
    
    return (
      <button
        onClick={() => handleCellClick(index)}
        disabled={!canClick}
        className={`w-32 h-32 md:w-40 md:h-40 flex items-center justify-center rounded-3xl text-6xl transition-all duration-300
          ${canClick ? 'bg-slate-800 hover:bg-slate-700 active:scale-95 border-2 border-slate-700 hover:border-cyan-500/50 cursor-pointer' : 'bg-slate-800/80 border-2 border-slate-800 cursor-default'}
          ${value === 'DEV' ? 'text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)] border-cyan-500/50' : ''}
          ${value === 'BUG' ? 'text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)] border-rose-500/50' : ''}
        `}
      >
        <div className={value ? 'animate-in zoom-in duration-300' : ''}>
          {value === 'DEV' && <Code size={80} strokeWidth={2.5} />}
          {value === 'BUG' && <Bug size={80} strokeWidth={2.5} />}
        </div>
      </button>
    );
  };

  const getWinnerText = () => {
    if (roundWinner === 'DRAW') return 'DEU VELHA!';
    if (roundWinner === 'DEV') return 'RODADA DO DEV!';
    if (roundWinner === 'BUG') return 'RODADA DO BUG!';
    return '';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl p-8">
      
      <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-slate-800 border-2 border-slate-700 px-10 py-3 rounded-full text-2xl font-bold text-slate-300 shadow-xl z-50 flex items-center gap-6">
        <span className="uppercase text-sm tracking-widest text-slate-500">Rodada {Math.min(roundsPlayed + 1, 3)} de 3</span>
        <span className="text-cyan-400">DEV: {devWins}</span> 
        <span className="text-slate-600">|</span> 
        <span className="text-rose-500">BUG: {bugWins}</span>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-5xl font-black text-white mb-4 drop-shadow-md">Jogo da Velha</h1>
        
        <div className="flex items-center justify-center gap-6 text-2xl font-bold">
          <div className={`flex items-center gap-2 px-6 py-2 rounded-full transition-colors ${isDevTurn && !roundWinner ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 scale-110' : 'text-slate-500'}`}>
            <Code size={28} /> {player1?.name} (DEV)
          </div>
          <span className="text-slate-600">VS</span>
          <div className={`flex items-center gap-2 px-6 py-2 rounded-full transition-colors ${!isDevTurn && !roundWinner ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 scale-110' : 'text-slate-500'}`}>
            <Bug size={28} /> {player2 ? player2.name : 'Sistema'} (BUG)
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-[3rem] border-4 border-slate-800 shadow-2xl relative">
        {roundWinner && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm rounded-[2.5rem] z-10 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <h2 className={`text-4xl md:text-5xl font-black mb-4 text-center px-4 animate-in zoom-in slide-in-from-bottom-4 duration-500 ${
              roundWinner === 'DEV' ? 'text-cyan-400' : roundWinner === 'BUG' ? 'text-rose-500' : 'text-amber-400'
            }`}>
              {getWinnerText()}
            </h2>
            <p className="text-xl text-slate-400">
              {roundsPlayed >= 3 ? 'Calculando pontuação final...' : 'Preparando próxima rodada...'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {board.map((_, index) => renderCell(index))}
        </div>
      </div>

    </div>
  );
}