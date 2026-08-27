import { useAppStore } from '../../core/store';
import VerdadeMito from '../../games/VerdadeMito';
import Velha from '../../games/Velha';
import Memoria from '../../games/Memoria';
import QuizTech from '../../games/QuizTech';
import ForcaTech from '../../games/ForcaTech';
import PixelGuess from '../../games/PixelGuess';
import TechWordle from '../../games/TechWordle';
import IdentifiqueLinguagem from '../../games/IdentifiqueLinguagem';
import CodeBreaker from '../../games/CodeBreaker';
import CorrijaCodigo from '../../games/CorrijaCodigo';
import Decodificador from '../../games/Decodificador';
import BatalhaNaval from '../../games/BatalhaNaval';
import FlappyBug from '../../games/FlappyBug';
import TechSurfers from '../../games/TechSurfers';
import QuebraTijolos from '../../games/QuebrarTijolos';
import AngryTechs from '../../games/AngryTechs';
import CodeBreakerPro from '../../games/CodeBreakerPro';
import CliqueNaCor from '../../games/CliqueNaCor';
import Desafio60Segundos from '../../games/Desafio60Segundos';
import LeilaoFutebol from '../../games/LeilaoFutebol';
// Importação do nosso Jogo de Música
import AdivinheMusica from '../../games/AdivinheMusica';

export default function GameWrapper() {
  const { activeGameId } = useAppStore();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center w-screen h-screen bg-slate-900 overflow-hidden z-40">
      <div className="flex items-center justify-center w-full max-w-7xl h-full p-4">
        
        {activeGameId === 'verdade-mito' && <VerdadeMito />}
        {activeGameId === 'velha' && <Velha />}
        {activeGameId === 'memoria' && <Memoria />}
        {activeGameId === 'quiz-tech' && <QuizTech />}
        {activeGameId === 'forca' && <ForcaTech />}
        {activeGameId === 'pixel-guess' && <PixelGuess />}
        {activeGameId === 'tech-wordle' && <TechWordle />}
        {activeGameId === 'identifique-linguagem' && <IdentifiqueLinguagem />}
        {activeGameId === 'code-breaker' && <CodeBreaker />}
        {activeGameId === 'corrija-codigo' && <CorrijaCodigo />}
        {activeGameId === 'decodificador' && <Decodificador />}
        {activeGameId === 'batalha-naval' && <BatalhaNaval />}
        {activeGameId === 'flappy-bug' && <FlappyBug />}
        {activeGameId === 'tech-surfers' && <TechSurfers />}
        {activeGameId === 'quebra-tijolos' && <QuebraTijolos />}
        {activeGameId === 'angry-techs' && <AngryTechs />} 
        {activeGameId === 'code-breaker-adv' && <CodeBreakerPro />}
        {activeGameId === 'clique-na-cor' && <CliqueNaCor />}
        {activeGameId === 'desafio-60-segundos' && <Desafio60Segundos />}
        {activeGameId === 'adivinhe-musica' && <AdivinheMusica />}
        {activeGameId === 'leilao-futebol' && <LeilaoFutebol />}
        
        
        {/* LISTA DE EXCLUSÃO ATUALIZADA - O Jogo em Construção não vai mais bugar! */}
        {![  'verdade-mito', 'velha', 'memoria', 'quiz-tech', 'forca', 'pixel-guess', 'tech-wordle', 'identifique-linguagem', 'code-breaker', 'corrija-codigo', 'decodificador', 'batalha-naval', 'flappy-bug', 'tech-surfers', 'quebra-tijolos', 'angry-techs', 'tower-defense', 'teste-conhecimento-int', 'teste-conhecimento-adv', 'code-breaker-adv', 'clique-na-cor', 'desafio-60-segundos', 'adivinhe-musica', 'leilao-futebol' ].includes(activeGameId || '') && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <h1 className="text-4xl font-bold text-slate-500 mb-4">🚧 Jogo em Construção 🚧</h1>
            <p className="text-xl text-slate-400">Este módulo será implementado em breve.</p>
          </div>
        )}

      </div>
    </div>
  );
}