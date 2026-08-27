import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../core/store';
import { playClick, playError, playSuccess } from '../core/audio';
import { ArrowRight, Play, Database } from 'lucide-react';

export default function QuebraTijolos() {
  const { endGame } = useAppStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);

  const [paddleX, setPaddleX] = useState(350);
  const [ball, setBall] = useState({ x: 400, y: 500, dx: 4, dy: -4 });
  const [bricks, setBricks] = useState<{ id: number, x: number, y: number, status: boolean }[]>([]);

  const gameAreaRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number>(0);
  
  const PADDLE_WIDTH = 120;
  const BALL_SIZE = 20;

  useEffect(() => {
    const newBricks = [];
    for (let c = 0; c < 6; c++) {
      for (let r = 0; r < 4; r++) {
        newBricks.push({
          id: r * 6 + c,
          x: c * 110 + 70,
          y: r * 40 + 50,
          status: true
        });
      }
    }
    setBricks(newBricks);
  }, []);

  const startGame = () => {
    playClick();
    setIsPlaying(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlaying || isGameOver || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    setPaddleX(Math.max(0, Math.min(relativeX - PADDLE_WIDTH / 2, rect.width - PADDLE_WIDTH)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPlaying || isGameOver || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = e.touches[0].clientX - rect.left;
    setPaddleX(Math.max(0, Math.min(relativeX - PADDLE_WIDTH / 2, rect.width - PADDLE_WIDTH)));
  };

  const gameLoop = () => {
    if (!isPlaying || isGameOver) return;

    setBall(prev => {
      let newX = prev.x + prev.dx;
      let newY = prev.y + prev.dy;
      let newDx = prev.dx;
      let newDy = prev.dy;

      const gameWidth = gameAreaRef.current?.clientWidth || 800;
      const gameHeight = gameAreaRef.current?.clientHeight || 600;

      // Paredes
      if (newX <= 0 || newX + BALL_SIZE >= gameWidth) newDx = -newDx;
      // Teto
      if (newY <= 0) newDy = -newDy;

      // Paddle
      if (
        newY + BALL_SIZE >= gameHeight - 30 &&
        newX + BALL_SIZE >= paddleX &&
        newX <= paddleX + PADDLE_WIDTH
      ) {
        newDy = -newDy;
        newY = gameHeight - 30 - BALL_SIZE; 
      }

      // Chão
      if (newY + BALL_SIZE >= gameHeight) {
        endRound(false);
        return prev;
      }

      // Blocos
      setBricks(currBricks => {
        let hit = false;
        const updatedBricks = currBricks.map(b => {
          if (b.status && !hit) {
            if (
              newX + BALL_SIZE > b.x &&
              newX < b.x + 100 &&
              newY + BALL_SIZE > b.y &&
              newY < b.y + 30
            ) {
              newDy = -newDy;
              hit = true;
              setScore(s => s + 1);
              return { ...b, status: false };
            }
          }
          return b;
        });

        if (updatedBricks.filter(b => b.status).length === 0) {
          endRound(true);
        }
        return updatedBricks;
      });

      return { x: newX, y: newY, dx: newDx, dy: newDy };
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, isGameOver, paddleX]);

  const endRound = (playerWon: boolean) => {
    if (playerWon) playSuccess();
    else playError();
    setIsPlaying(false);
    setIsGameOver(true);
    setWon(playerWon);
    cancelAnimationFrame(requestRef.current);
  };

  const manualConcludeGame = () => {
    playClick();
    // BLINDAGEM DE PONTOS: Limite forçado de 60 pontos para jogos Arcade.
    const totalBricks = 24;
    const pontos = won ? 60 : Math.min(60, Math.round((score / totalBricks) * 60));
    endGame([pontos]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 relative">
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-800 border-2 border-slate-700 px-10 py-3 rounded-full text-3xl font-black text-cyan-400 shadow-xl z-50">
        PONTOS: {score}
      </div>

      <div 
        ref={gameAreaRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="w-full max-w-4xl h-[600px] bg-slate-900 border-4 border-slate-700 rounded-3xl overflow-hidden relative shadow-2xl cursor-none touch-none"
      >
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-900/50 backdrop-blur-sm pointer-events-none">
            <Database size={80} className="text-cyan-400 mb-6" />
            <h2 className="text-5xl font-black text-white mb-2">Quebra-Tijolos</h2>
            <p className="text-xl text-slate-400 mb-8">Arraste para mover e destrua os dados.</p>
            <button onClick={startGame} className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-cyan-500 text-white font-bold rounded-2xl text-2xl animate-pulse active:scale-95 transition-transform">
              <Play size={28} fill="currentColor" /> COMEÇAR
            </button>
          </div>
        )}

        {bricks.map(b => b.status && (
          <div 
            key={b.id}
            className="absolute bg-rose-500 border-2 border-rose-400 rounded-lg shadow-sm"
            style={{ left: b.x, top: b.y, width: 100, height: 30 }}
          />
        ))}

        <div 
          className="absolute bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"
          style={{ left: ball.x, top: ball.y, width: BALL_SIZE, height: BALL_SIZE }}
        />

        <div 
          className="absolute bg-white border-2 border-slate-300 rounded-full shadow-lg"
          style={{ left: paddleX, bottom: 20, width: PADDLE_WIDTH, height: 10 }}
        />
      </div>

      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-in fade-in rounded-[3rem]">
          <div className="text-center flex flex-col items-center">
            <h2 className={`text-7xl font-black mb-4 ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
              {won ? 'DADOS DESTRUÍDOS!' : 'FIM DE JOGO!'}
            </h2>
            <p className="text-3xl text-white mt-4">Você quebrou <strong className="text-cyan-400">{score}</strong> blocos.</p>

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