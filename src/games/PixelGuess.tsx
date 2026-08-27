import { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { playClick, playSuccess, playError } from '../core/audio';
import { ArrowRight } from 'lucide-react';

const IMAGE_DB = [
  { img: '/pixel/adobe.png', name: 'Adobe', wrong: ['Canva', 'Figma', 'CorelDRAW', 'Photoshop', 'Illustrator'], fact: 'Criadora do Photoshop, um dos softwares de edição mais famosos do mundo.' },
  { img: '/pixel/amazon.jpeg', name: 'Amazon', wrong: ['Mercado Livre', 'Shopee', 'AliExpress', 'Magazine Luiza', 'eBay'], fact: 'Começou vendendo livros pela internet.' },
  { img: '/pixel/android.png', name: 'Android', wrong: ['iOS', 'Windows Phone', 'HarmonyOS', 'Linux', 'Ubuntu'], fact: 'Está presente em mais de 70% dos smartphones do mundo.' },
  { img: '/pixel/apple.jpeg', name: 'Apple', wrong: ['Samsung', 'Xiaomi', 'Huawei', 'LG', 'Sony'], fact: 'O primeiro iPhone foi lançado em 2007.' },
  { img: '/pixel/baby-yoda.jpg', name: 'Baby Yoda (Grogu)', wrong: ['Yoda', 'Chewbacca', 'Stitch', 'ET', 'WALL-E'], fact: 'O nome oficial do personagem é Grogu.' },
  { img: '/pixel/batman.jpg', name: 'Batman', wrong: ['Superman', 'Flash', 'Homem-Aranha', 'Homem de Ferro', 'Coringa'], fact: 'Batman não possui superpoderes.' },
  { img: '/pixel/bluetooth.png', name: 'Bluetooth', wrong: ['Wi-Fi', 'NFC', 'USB', 'GPS', 'Ethernet'], fact: 'O nome vem de um rei viking chamado Harald Bluetooth.' },
  { img: '/pixel/canva.jpg', name: 'Canva', wrong: ['Figma', 'Adobe Express', 'Photoshop', 'CorelDRAW', 'Illustrator'], fact: 'Possui mais de 100 milhões de usuários.' },
  { img: '/pixel/chatGPT.png', name: 'ChatGPT', wrong: ['Gemini', 'Claude', 'Copilot', 'Grok', 'DeepSeek'], fact: 'Foi lançado ao público em 2022.' },
  { img: '/pixel/Darth-Vader.jpg', name: 'Darth Vader', wrong: ['Kylo Ren', 'Stormtrooper', 'Boba Fett', 'Obi-Wan Kenobi', 'Yoda'], fact: 'Antes de ser Vader, era Anakin Skywalker.' },
  { img: '/pixel/disquete.png', name: 'Disquete', wrong: ['CD', 'Pendrive', 'HD Externo', 'Cartão SD', 'DVD'], fact: 'Já foi a principal forma de armazenar arquivos.' },
  { img: '/pixel/docker.jpg', name: 'Docker', wrong: ['Kubernetes', 'GitHub', 'Jenkins', 'GitLab', 'VMware'], fact: 'Revolucionou o uso de containers para aplicações.' },
  { img: '/pixel/drone.jpg', name: 'Drone', wrong: ['Helicóptero', 'Satélite', 'Avião', 'Robô', 'Câmera'], fact: 'Originalmente teve uso militar antes de se popularizar.' },
  { img: '/pixel/figma.jpg', name: 'Figma', wrong: ['Canva', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'], fact: 'Foi comprado pela Adobe após se tornar líder em design colaborativo.' },
  { img: '/pixel/firebase.jpg', name: 'Firebase', wrong: ['MongoDB', 'MySQL', 'PostgreSQL', 'Supabase', 'Oracle'], fact: 'É uma plataforma de desenvolvimento do Google.' },
  { img: '/pixel/gemini.png', name: 'Gemini', wrong: ['ChatGPT', 'Claude', 'Copilot', 'Grok', 'DeepSeek'], fact: 'É a IA multimodal do Google.' },
  { img: '/pixel/github.png', name: 'GitHub', wrong: ['GitLab', 'Bitbucket', 'Docker Hub', 'SourceForge', 'Azure DevOps'], fact: 'Hospeda mais de 400 milhões de repositórios.' },
  { img: '/pixel/Google.jpg', name: 'Google', wrong: ['Bing', 'Yahoo', 'DuckDuckGo', 'Baidu', 'Ask'], fact: 'O nome surgiu de uma variação da palavra "Googol".' },
  { img: '/pixel/homem-aranha.png', name: 'Homem-Aranha', wrong: ['Deadpool', 'Batman', 'Flash', 'Superman', 'Demolidor'], fact: 'Fez sua primeira aparição em 1962.' },
  { img: '/pixel/homem-de-ferro.jpg', name: 'Homem de Ferro', wrong: ['Máquina de Combate', 'Batman', 'Capitão América', 'Thor', 'Homem-Aranha'], fact: 'Foi o personagem que iniciou o MCU nos cinemas.' },
  { img: '/pixel/impressora.jpg', name: 'Impressora', wrong: ['Scanner', 'Notebook', 'Monitor', 'Projetor', 'Webcam'], fact: 'A primeira impressora a laser surgiu nos anos 70.' },
  { img: '/pixel/instagram.jpg', name: 'Instagram', wrong: ['TikTok', 'Facebook', 'Snapchat', 'Threads', 'X'], fact: 'Começou como aplicativo exclusivo para iPhone.' },
  { img: '/pixel/java.jpg', name: 'Java', wrong: ['Python', 'PHP', 'C#', 'JavaScript', 'Kotlin'], fact: 'Seu mascote é uma xícara de café.' },
  { img: '/pixel/kindle.jpg', name: 'Kindle', wrong: ['Tablet', 'iPad', 'Kobo', 'Notebook', 'Smartphone'], fact: 'Foi um dos responsáveis pela popularização dos ebooks.' },
  { img: '/pixel/linux.jpg', name: 'Linux', wrong: ['Windows', 'macOS', 'Android', 'Ubuntu', 'Debian'], fact: 'Criado por Linus Torvalds em 1991.' },
  { img: '/pixel/mario.jpg', name: 'Mario', wrong: ['Luigi', 'Sonic', 'Yoshi', 'Kirby', 'Link'], fact: 'É o personagem mais famoso da Nintendo.' },
  { img: '/pixel/microsoft.png', name: 'Microsoft', wrong: ['Google', 'Apple', 'IBM', 'Oracle', 'Dell'], fact: 'Foi fundada por Bill Gates e Paul Allen.' },
  { img: '/pixel/mouse.jpg', name: 'Mouse', wrong: ['Teclado', 'Touchpad', 'Webcam', 'Controle', 'Scanner'], fact: 'O primeiro mouse era feito de madeira.' },
  { img: '/pixel/naruto.png', name: 'Naruto', wrong: ['Goku', 'Luffy', 'Sasuke', 'Ichigo', 'Saitama'], fact: 'É um dos animes mais vendidos da história.' },
  { img: '/pixel/netflix.png', name: 'Netflix', wrong: ['Prime Video', 'Disney+', 'Max', 'Paramount+', 'Hulu'], fact: 'Começou enviando DVDs pelo correio.' },
  { img: '/pixel/notebook.png', name: 'Notebook', wrong: ['Tablet', 'Smartphone', 'Monitor', 'Impressora', 'Desktop'], fact: 'O primeiro notebook comercial surgiu nos anos 80.' },
  { img: '/pixel/nvidia.jpeg', name: 'NVIDIA', wrong: ['AMD', 'Intel', 'Qualcomm', 'ASUS', 'Gigabyte'], fact: 'Tornou-se referência mundial em IA graças às GPUs.' },
  { img: '/pixel/pac-man.jpg', name: 'Pac-Man', wrong: ['Mario', 'Sonic', 'Bomberman', 'Donkey Kong', 'Kirby'], fact: 'É um dos jogos mais famosos da história.' },
  { img: '/pixel/pendrive.jpg', name: 'Pendrive', wrong: ['HD Externo', 'Disquete', 'Cartão SD', 'SSD', 'DVD'], fact: 'Substituiu CDs e disquetes para transporte de arquivos.' },
  { img: '/pixel/php.jpg', name: 'PHP', wrong: ['JavaScript', 'Python', 'Java', 'Ruby', 'C#'], fact: 'Cerca de 75% dos sites usam PHP de alguma forma.' },
  { img: '/pixel/pikachu.jpg', name: 'Pikachu', wrong: ['Charmander', 'Eevee', 'Raichu', 'Jigglypuff', 'Squirtle'], fact: 'É o mascote oficial da franquia Pokémon.' },
  { img: '/pixel/placa-de-video.jpg', name: 'Placa de Vídeo', wrong: ['Processador', 'Memória RAM', 'SSD', 'Placa-Mãe', 'Fonte'], fact: 'É o componente principal para jogos e IA.' },
  { img: '/pixel/playstation5.jpg', name: 'PlayStation 5', wrong: ['Xbox Series X', 'Nintendo Switch', 'Steam Deck', 'PlayStation 4', 'Xbox One'], fact: 'Foi lançado mundialmente em 2020.' },
  { img: '/pixel/react.png', name: 'React', wrong: ['Angular', 'Vue.js', 'Svelte', 'Next.js', 'Node.js'], fact: 'Foi criada pelo Facebook (Meta).' },
  { img: '/pixel/round6.jpg', name: 'Round 6', wrong: ['La Casa de Papel', 'Stranger Things', 'Dark', 'Black Mirror', 'The Boys'], fact: 'Tornou-se uma das séries mais assistidas da Netflix.' },
  { img: '/pixel/sonic.jpg', name: 'Sonic', wrong: ['Mario', 'Tails', 'Crash Bandicoot', 'Knuckles', 'Kirby'], fact: 'Foi criado para competir com o Mario.' },
  { img: '/pixel/spotify.jpg', name: 'Spotify', wrong: ['Deezer', 'YouTube Music', 'Apple Music', 'SoundCloud', 'Tidal'], fact: 'Possui mais de 100 milhões de músicas disponíveis.' },
  { img: '/pixel/steam.jpeg', name: 'Steam', wrong: ['Epic Games', 'GOG', 'Origin', 'Battle.net', 'Ubisoft Connect'], fact: 'É a maior plataforma de jogos para PC.' },
  { img: '/pixel/tribunal-de-contas.jpg', name: 'Tribunal de Contas', wrong: ['Receita Federal', 'Ministério Público', 'Polícia Federal', 'Senado Federal', 'Câmara dos Deputados'], fact: 'Fiscaliza a aplicação de recursos públicos.' },
  { img: '/pixel/VSCode.jpg', name: 'VS Code', wrong: ['Visual Studio', 'Sublime Text', 'Notepad++', 'IntelliJ IDEA', 'Eclipse'], fact: 'É o editor de código mais utilizado do mundo.' },
  { img: '/pixel/wall-e.jpg', name: 'WALL-E', wrong: ['R2-D2', 'Baymax', 'ET', 'Robocop', 'Bumblebee'], fact: 'O personagem fala muito pouco durante o filme.' },
  { img: '/pixel/youtube.jpg', name: 'YouTube', wrong: ['Vimeo', 'TikTok', 'Twitch', 'Netflix', 'Dailymotion'], fact: 'O primeiro vídeo publicado foi "Me at the zoo".' }
];

const TOTAL_ROUNDS = 6;
const TIME_PER_ROUND = 20;

export default function PixelGuess() {
  const { endGame, activeDifficulty } = useAppStore();
  
  // Sorteia os 3 desafios da partida
  const challenges = useMemo(() => [...IMAGE_DB].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS), []);
  
  const [currentRound, setCurrentRound] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const totalScore = useRef(0);

  const currentChallenge = challenges[currentRound];
  
  const options = useMemo(() => {
    if (!currentChallenge) return [];
    const wrongSelected = [...currentChallenge.wrong].sort(() => Math.random() - 0.5).slice(0, 5);
    return [currentChallenge.name, ...wrongSelected].sort(() => Math.random() - 0.5);
  }, [currentChallenge]);

  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND); 
  const [isFinished, setIsFinished] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (isFinished || timeLeft <= 0 || !currentChallenge) {
      if (timeLeft <= 0 && !isFinished) {
        setIsFinished(true);
        setWon(false);
        playError();
        
        // Fica 1.5s com a imagem nítida com "TEMPO ESGOTADO" em cima e avança
        setTimeout(() => {
          setCurrentRound(r => {
            if (r + 1 < TOTAL_ROUNDS) {
              setIsFinished(false);
              setTimeLeft(TIME_PER_ROUND);
              setWon(false);
              return r + 1;
            } else {
              setShowSummary(true);
              return r;
            }
          });
        }, 1500);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, currentChallenge]);

  const handleAnswer = (option: string) => {
    if (isFinished) return;
    
    playClick();
    setIsFinished(true);
    
    const acertou = option === currentChallenge.name;
    setWon(acertou);

    const maxPtsPerRound = (MAX_SCORES['pixel-guess'][activeDifficulty || 'INICIANTE'] || 150) / TOTAL_ROUNDS;

    if (acertou) {
      playSuccess();
      const points = Math.round((timeLeft / TIME_PER_ROUND) * maxPtsPerRound);
      totalScore.current += Math.max(points, Math.round(maxPtsPerRound * 0.2));
    } else {
      playError();
    }
  };

  // Avanço manual APÓS a pessoa responder antes do tempo acabar
  const manualNextRound = () => {
    playClick();
    if (currentRound + 1 < TOTAL_ROUNDS) {
      setIsFinished(false);
      setTimeLeft(TIME_PER_ROUND);
      setWon(false);
      setCurrentRound(r => r + 1);
    } else {
      setShowSummary(true);
    }
  };

  // TELA DE RESUMO FINAL
  if (showSummary) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 relative animate-in fade-in">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2">Resumo da Partida</h1>
          <p className="text-xl text-slate-400">Confira as imagens que apareceram para você:</p>
        </div>

        <div className="bg-slate-800 p-8 rounded-[3rem] border-2 border-slate-700 shadow-2xl w-full flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {challenges.map((challenge, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center gap-6 bg-slate-900 p-6 rounded-3xl border border-slate-700">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                <img src={challenge.img} alt={challenge.name} className="w-full h-full object-contain p-2" />
              </div>
              <div className="flex flex-col flex-1 text-center md:text-left">
                <h3 className="text-3xl font-black text-white mb-2">{challenge.name}</h3>
                <p className="text-lg text-slate-400">{challenge.fact}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => { playClick(); endGame([totalScore.current]); }} 
          className="mt-8 flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30"
        >
          Concluir e Ver Pontuação <ArrowRight size={28} />
        </button>
      </div>
    );
  }

  if (!currentChallenge) return null;

  // Usa 40px de blur máximo. 
  // No último 1 segundo (timeLeft <= 1) o desfoque some totalmente para revelar a imagem!
  const currentBlur = isFinished || timeLeft <= 1 
    ? 0 
    : Math.max(0, ((timeLeft - 1) / (TIME_PER_ROUND - 1)) * 40);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 relative">
      
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black text-white mb-2">Adivinhe a Imagem</h1>
        <p className="text-xl text-slate-400 font-bold uppercase tracking-widest mb-2">
          Imagem {currentRound + 1} de {TOTAL_ROUNDS}
        </p>
        <p className="text-2xl text-slate-400">Tempo restante: <span className="text-cyan-400 font-bold">{timeLeft}s</span></p>
      </div>

      <div className="flex flex-col items-center bg-slate-800 p-12 rounded-[3rem] border-2 border-slate-700 shadow-2xl w-full">
        
        <div className="w-80 h-80 flex items-center justify-center bg-slate-900 rounded-3xl border-4 border-slate-700 mb-10 overflow-hidden relative">
          
          <img 
            key={currentRound}
            src={currentChallenge.img} 
            alt="Desafio" 
            className="w-full h-full object-contain"
            style={{ 
              filter: `blur(${currentBlur}px)`,
              transform: `scale(${isFinished || timeLeft <= 1 ? 1 : 1.2})`, // Remove o zoom junto com o blur
              transition: isFinished || timeLeft <= 1 ? 'filter 0.3s ease-out, transform 0.5s ease-out' : 'none'
            }}
          />

          {/* OVERLAY: ACERTOU OU ERROU ANTES DO TEMPO */}
          {isFinished && timeLeft > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 animate-in zoom-in z-20">
              <span className={`text-5xl font-black text-center drop-shadow-2xl ${won ? 'text-emerald-400' : 'text-rose-500'}`}>
                {won ? 'ACERTOU!' : 'ERROU!'}
              </span>
            </div>
          )}
          
          {/* OVERLAY: TEMPO ESGOTADO (Centralizado e sem Backdrop Blur para a imagem brilhar no fundo) */}
          {isFinished && timeLeft <= 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 animate-in zoom-in z-20">
              <span className="text-5xl font-black text-rose-500 text-center leading-tight drop-shadow-2xl">
                TEMPO<br/>ESGOTADO
              </span>
            </div>
          )}
        </div>

        {/* CURIOSIDADE E BOTÃO (Só aparece se você respondeu. Se for timeout, ele pula automático) */}
        {isFinished && timeLeft > 0 ? (
          <div className="w-full text-center animate-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
            <h3 className="text-3xl font-black text-white mb-4">{currentChallenge.name}</h3>
            <p className="text-xl text-slate-300 bg-slate-700 px-8 py-6 rounded-2xl border border-slate-600 shadow-inner mb-8 w-full">
              {currentChallenge.fact}
            </p>
            
            <button 
              onClick={manualNextRound} 
              className="flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30"
            >
              {currentRound + 1 < TOTAL_ROUNDS ? 'Próxima Imagem' : 'Ver Resumo da Partida'} <ArrowRight size={28} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {options.map((option, i) => (
              <button
                key={i}
                disabled={isFinished}
                onClick={() => handleAnswer(option)}
                className="p-6 bg-slate-700 hover:bg-cyan-500 text-white border-2 border-slate-600 hover:border-cyan-400 text-xl md:text-2xl font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center text-center"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}