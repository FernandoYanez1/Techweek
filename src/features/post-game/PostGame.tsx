import { useEffect, useRef } from 'react';
import { useAppStore } from '../../core/store';
import { saveUserDB } from '../../core/db';
import { Trophy, RotateCcw, Home, LogOut, AlertCircle, Gamepad2 } from 'lucide-react';

export default function PostGame() {
  const { 
    loggedUsers, matchScores, activeGameId, activeDifficulty, 
    startGame, resetToMenu, gamesPlayedInSession, logoutUser 
  } = useAppStore();

  const isSessionOver = (gamesPlayedInSession || 0) >= 3;
  const partidasRestantes = Math.max(0, 3 - (gamesPlayedInSession || 0));
  const hasSaved = useRef(false);

  // Salva os pontos no banco assim que a tela abre
  useEffect(() => {
    if (!hasSaved.current) {
      hasSaved.current = true;
      loggedUsers.forEach(async (u) => {
         await saveUserDB(u);
      });
    }
  }, [loggedUsers]);

  const handleLogout = () => {
    logoutUser(); // Chama o logout sem parâmetros, que desloga todos e volta pro welcome
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 relative p-12 animate-in fade-in duration-500">
      
      {/* BADGE DE AVISO NO TOPO */}
      {isSessionOver ? (
        <div className="absolute top-8 bg-rose-500 text-white px-8 py-3 rounded-full font-black tracking-widest uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse z-50">
          <AlertCircle size={24} /> Limite de Partidas Atingido
        </div>
      ) : (
        <div className="absolute top-8 bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 px-8 py-3 rounded-full font-black tracking-widest uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] z-50">
          <Gamepad2 size={24} /> Partidas Restantes: {partidasRestantes}
        </div>
      )}

      <div className="bg-slate-800 p-12 rounded-[3rem] shadow-2xl max-w-4xl w-full text-center border-2 border-slate-700 flex flex-col items-center">
        
        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-6 rounded-full mb-8 shadow-[0_0_40px_rgba(6,182,212,0.4)]">
          <Trophy size={80} className="text-white" />
        </div>
        
        <h1 className="text-5xl font-black text-white mb-4">Fim de Jogo!</h1>
        <p className="text-2xl text-slate-400 mb-8">Pontuação final da partida:</p>
        
        {/* Renderiza as pontuações dinamicamente */}
        <div className="flex justify-center gap-12 w-full mb-12">
          {loggedUsers.map((p, index) => (
            <div key={p.id} className="flex flex-col items-center bg-slate-900/50 p-8 rounded-3xl border border-slate-700 min-w-[250px]">
              <span className={`text-xl font-bold mb-4 uppercase tracking-widest ${index === 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                {p.name}
              </span>
              <div className="text-7xl font-black text-white">
                {matchScores[index] || 0} <span className="text-2xl text-slate-500 font-normal">pts</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col w-full gap-4 max-w-3xl">
          
          {isSessionOver ? (
            // LAYOUT QUANDO ATINGE 3 JOGOS (FIM DA SESSÃO)
            <>
              <div className="bg-slate-700/50 p-6 rounded-2xl mb-4 border border-slate-600">
                <p className="text-xl text-slate-300 font-bold mb-2">Sua sessão de jogos terminou.</p>
                <p className="text-slate-400">Passe a vez para o próximo jogador.</p>
              </div>
              
              <button 
                onClick={handleLogout} 
                className="flex w-full items-center justify-center gap-2 py-5 mt-2 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-2xl font-bold transition-colors shadow-lg"
              >
                <LogOut size={28} /> Encerrar Sessão
              </button>
            </>
          ) : (
            // LAYOUT NORMAL ANTES DOS 3 JOGOS
            <>
              <button 
                onClick={() => { if(activeGameId && activeDifficulty) startGame(activeGameId, activeDifficulty); }} 
                className="flex items-center justify-center gap-4 w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-3xl font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
              >
                <RotateCcw size={36} /> Jogar Novamente
              </button>
              
              <div className="flex gap-4 w-full mt-2">
                <button 
                  onClick={() => { resetToMenu(); }} 
                  className="flex-1 flex items-center justify-center gap-2 py-5 bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-2xl font-bold hover:bg-slate-600 transition-colors"
                >
                  <Home size={28} /> Escolher outro jogo
                </button>
                <button 
                  onClick={handleLogout} 
                  className="flex-1 flex items-center justify-center gap-2 py-5 bg-slate-800 text-rose-400 border-2 border-rose-500/30 hover:bg-rose-500 hover:text-white rounded-2xl text-2xl font-bold transition-colors"
                >
                  <LogOut size={28} /> Não quero mais jogar
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}