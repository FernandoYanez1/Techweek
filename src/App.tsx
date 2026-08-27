import { useAppStore } from './core/store';
import Menu from './features/menu/Menu';
import PostGame from './features/post-game/PostGame';
import GameWrapper from './features/games/GameWrapper';
import Welcome from './features/auth/Welcome';
import Admin from './features/admin/Admin';
import Camera from './features/camera/Camera';
import Ranking from './features/ranking/Ranking';
import StandbyManager from './features/ranking/StandbyManager';

export default function App() {
  const { screen } = useAppStore();

  return (
    <StandbyManager>
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <img 
          src="/gamelab-logo.png" 
          alt="GameLab Logo" 
          className="absolute top-6 right-6 w-32 opacity-90 drop-shadow-md" 
        />
        
        {/* Renderiza o rodapé apenas se NÃO for a tela de ranking */}
        {screen !== 'ranking' && (
          <div className="absolute bottom-6 w-full text-center">
            <p className="text-slate-500 font-bold tracking-widest uppercase text-sm drop-shadow-sm">
              Desenvolvido pela STI - Secretaria de Tecnologia e Informação - TCDF
            </p>
          </div>
        )}
      </div>

      <div className="w-screen h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500/30">
        
        {screen === 'welcome' && (
          <div className="flex items-center justify-center w-full h-full text-4xl font-bold text-cyan-400">
            <Welcome />
          </div>
        )}
        
        {screen === 'menu' && <Menu />}
        {screen === 'playing' && <GameWrapper />}
        {screen === 'post-game' && <PostGame />} 
        {screen === 'camera' && <Camera />}
        
        {screen === 'admin' && (
          <div className="flex items-center justify-center w-full h-full text-4xl font-bold text-red-500">
            <Admin />
          </div>
        )}
        
        {screen === 'ranking' && <Ranking />}

      </div>
    </StandbyManager>
  );
}