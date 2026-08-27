import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { playClick, playSuccess, playError } from '../core/audio';
import { Terminal, AlertTriangle, Flame } from 'lucide-react';

const BANCO_PALAVRAS = {
  INICIANTE: [
    { word: 'MOUSE', hint: 'Periférico usado para mover o ponteiro na tela.' },
    { word: 'PLACA', hint: 'Componente "mãe" onde tudo se conecta.' },
    { word: 'DADOS', hint: 'Informação bruta processada pelo computador.' },
    { word: 'WIFI', hint: 'Tecnologia de conexão à internet sem fio.' },
    { word: 'LINUX', hint: 'Sistema operacional de código aberto (pinguim).' },
    { word: 'TECLADO', hint: 'Dispositivo principal de entrada de texto.' },
    { word: 'TELA', hint: 'Superfície que exibe as imagens do PC.' },
    { word: 'CABO', hint: 'Fio que transmite energia ou dados.' },
    { word: 'PENDRIVE', hint: 'Pequeno dispositivo portátil de armazenamento.' },
    { word: 'BATERIA', hint: 'Fornece energia para notebooks e celulares.' },
    { word: 'PASTA', hint: 'Diretório onde se guardam arquivos.' },
    { word: 'VIRUS', hint: 'Programa malicioso que infecta a máquina.' },
    { word: 'FONTE', hint: 'Peça que distribui energia para o computador.' },
    { word: 'SITE', hint: 'Página acessada através da internet.' },
    { word: 'NUVEM', hint: 'Armazenamento em servidores na internet.' }
  ],
  INTERMEDIARIO: [
    { word: 'FIREWALL', hint: 'Barreira de segurança que filtra o tráfego da rede.' },
    { word: 'BACKUP', hint: 'Cópia de segurança dos arquivos importantes.' },
    { word: 'SERVIDOR', hint: 'Computador central que provê serviços a outros.' },
    { word: 'PYTHON', hint: 'Linguagem de programação com nome de cobra.' },
    { word: 'HACKER', hint: 'Especialista que explora vulnerabilidades em sistemas.' },
    { word: 'BROWSER', hint: 'Navegador utilizado para acessar a web.' },
    { word: 'PLANILHA', hint: 'Documento usado para cálculos e tabelas.' },
    { word: 'ROTEADOR', hint: 'Equipamento que distribui o sinal de internet.' },
    { word: 'SISTEMA', hint: 'Conjunto de partes que formam o operacional.' },
    { word: 'MEMORIA', hint: 'Onde os dados de uso rápido são armazenados.' },
    { word: 'DOWNLOAD', hint: 'Ato de baixar um arquivo da internet.' },
    { word: 'ARQUIVO', hint: 'Conjunto de dados salvo com um nome específico.' },
    { word: 'HARDWARE', hint: 'A parte física do computador.' },
    { word: 'SOFTWARE', hint: 'A parte lógica e os programas do computador.' },
    { word: 'INTERNET', hint: 'A rede mundial de computadores.' }
  ],
  AVANCADO: [
    { word: 'KUBERNETES', hint: 'Sistema de orquestração de contêineres.' },
    { word: 'MIDDLEWARE', hint: 'Software que atua como ponte entre aplicações.' },
    { word: 'CRIPTOGRAFIA', hint: 'Técnica para proteger informações com chaves.' },
    { word: 'BLOCKCHAIN', hint: 'Tecnologia de registro distribuído e imutável.' },
    { word: 'TYPESCRIPT', hint: 'Superconjunto de JavaScript com tipagem estática.' },
    { word: 'COMPILADOR', hint: 'Programa que traduz código para linguagem de máquina.' },
    { word: 'FRAMEWORK', hint: 'Base estrutural de código para desenvolvimento.' },
    { word: 'TERMINAL', hint: 'Interface de linha de comando do sistema.' },
    { word: 'PROTOCOLO', hint: 'Conjunto de regras para comunicação em rede.' },
    { word: 'ALGORITMO', hint: 'Sequência lógica de passos para resolver um problema.' },
    { word: 'REPOSITORIO', hint: 'Local onde o código-fonte e suas versões são salvos.' },
    { word: 'FIREBASE', hint: 'Plataforma de desenvolvimento de apps do Google.' },
    { word: 'FRONTEND', hint: 'Parte da aplicação que interage com o usuário.' },
    { word: 'DATABASE', hint: 'Sistema estruturado para armazenamento de informações.' },
    { word: 'KERNEL', hint: 'O núcleo principal de um sistema operacional.' }
  ]
};

export default function ForcaTech() {
  const { endGame, activeDifficulty } = useAppStore();

  const desafio = useMemo(() => {
    const safeDifficulty = (activeDifficulty === 'ARCADE' ? 'INTERMEDIARIO' : activeDifficulty) as keyof typeof BANCO_PALAVRAS;
    const list = BANCO_PALAVRAS[safeDifficulty || 'INICIANTE'];
    return list[Math.floor(Math.random() * list.length)];
  }, [activeDifficulty]);

  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const maxWrong = 6;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const isWinner = desafio.word.split('').every((letter: string) => guessedLetters.includes(letter));
  const isLoser = wrongCount >= maxWrong;

  useEffect(() => {
    if (isWinner && !isFinished) {
      setIsFinished(true);
      playSuccess();
      setTimeout(() => concludeGame(true), 3000);
    } else if (isLoser && !isFinished) {
      setIsFinished(true);
      playError();
      setTimeout(() => concludeGame(false), 3000);
    }
  }, [isWinner, isLoser, isFinished]);

  const handleGuess = (letter: string) => {
    if (isFinished || guessedLetters.includes(letter)) return;
    
    playClick();
    setGuessedLetters([...guessedLetters, letter]);

    if (!desafio.word.includes(letter)) {
      setWrongCount(w => w + 1);
    }
  };

  const concludeGame = (won: boolean) => {
    const maxPts = MAX_SCORES['forca'][activeDifficulty || 'INICIANTE'];
    const pontos = won ? maxPts : 0;
    endGame([pontos]);
  };

  const renderComputer = () => {
    const integrity = Math.max(0, Math.round(((maxWrong - wrongCount) / maxWrong) * 100));
    let screenBg = 'bg-slate-800';
    if (wrongCount === 4) screenBg = 'bg-blue-700';
    if (wrongCount >= 6) screenBg = 'bg-black';

    return (
      <div className="relative flex flex-col items-center justify-center w-72 h-72">
        
        <div className={`relative w-64 h-48 border-[12px] rounded-xl flex flex-col overflow-hidden transition-colors duration-500 shadow-2xl z-10 
          ${wrongCount >= 6 ? 'border-slate-900' : 'border-slate-300'} ${screenBg}`}>
          
          {wrongCount < 4 && (
            <div className="absolute inset-0 flex flex-col p-3">
              <div className="w-full flex flex-col gap-1 mb-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase font-bold tracking-widest">
                  <span>Sys.Integrity</span>
                  <span className={integrity > 50 ? 'text-emerald-400' : 'text-rose-500'}>{integrity}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${wrongCount === 0 ? 'bg-emerald-500' : wrongCount <= 2 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}
                    style={{ width: `${integrity}%` }}
                  />
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                {wrongCount <= 1 && <Terminal className="text-cyan-400 opacity-80" size={56} />}
                {wrongCount === 2 && <AlertTriangle className="text-amber-500 animate-pulse opacity-80" size={56} />}
                {wrongCount === 3 && <AlertTriangle className="text-rose-500 animate-ping opacity-80" size={64} />}
              </div>
            </div>
          )}

          {wrongCount === 4 && (
            <div className="absolute inset-0 flex flex-col p-4">
              <span className="text-white font-mono text-xl font-bold mb-2">:(</span>
              <span className="text-white/90 font-mono text-[10px] leading-tight mt-1">FATAL_ERROR<br/>SYSTEM_HALTED</span>
            </div>
          )}

          {wrongCount === 5 && (
             <div className="absolute inset-0 pointer-events-none z-20 flex mix-blend-difference opacity-80">
               <div className="w-full h-full bg-stripes opacity-30 animate-pulse" />
               <div className="absolute top-0 left-6 w-2 h-24 bg-white/60 skew-x-12" />
               <div className="absolute bottom-0 right-10 w-2 h-28 bg-white/60 -skew-x-12" />
               <div className="absolute top-10 left-0 w-full h-[4px] bg-white/50 -rotate-3" />
             </div>
          )}

          {wrongCount >= 6 && (
            <div className="absolute inset-0 flex items-center justify-center border-4 border-rose-900/50">
              <span className="text-rose-700 font-black text-2xl tracking-widest opacity-40">OFFLINE</span>
            </div>
          )}
          
          {wrongCount < 6 && (
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
          )}
        </div>

        <div className="w-12 h-10 bg-slate-400 z-0 border-x-4 border-slate-500" />
        <div className="w-40 h-5 bg-slate-300 rounded-t-lg shadow-xl" />
        
        {wrongCount >= 5 && (
          <div className="absolute -top-6 left-8 w-24 h-24 bg-slate-400/30 rounded-full blur-xl animate-pulse z-20 mix-blend-screen" />
        )}

        {wrongCount >= 6 && (
          <div className="absolute bottom-8 right-4 z-30 animate-bounce">
            <Flame className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,1)]" fill="currentColor" size={80} />
          </div>
        )}
      </div>
    );
  };

  // Cálculo de layout super adaptável (impede wrap em palavras longas)
  const wordLen = desafio.word.length;
  const gapClass = wordLen > 12 ? 'gap-1' : wordLen > 8 ? 'gap-1 md:gap-2' : 'gap-2 md:gap-3';
  const boxClass = wordLen > 12 
    ? 'w-7 h-10 md:w-10 md:h-14 text-2xl md:text-3xl' 
    : wordLen > 8 
      ? 'w-9 h-12 md:w-12 md:h-16 text-3xl md:text-4xl' 
      : 'w-12 h-16 md:w-16 md:h-20 text-4xl md:text-5xl';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-7xl p-8 relative">
      
      <div className="text-center mb-6">
        <h1 className="text-5xl font-black text-white mb-2">Hard Reset</h1>
        <p className="text-xl text-slate-400">Descubra a palavra antes que a máquina frite!</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-16 w-full bg-slate-900 border-2 border-slate-700 rounded-[3rem] shadow-2xl p-8 lg:p-12 relative">
        
        <div className="absolute top-6 left-10 text-lg font-bold text-slate-400">
          Tentativas Restantes: <strong className="text-rose-500 text-2xl ml-2">{maxWrong - wrongCount}</strong>
        </div>

        <div className="flex flex-col items-center gap-6 w-full md:w-80 pt-8 shrink-0">
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl w-full text-center">
            <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Dica do Sistema</span>
            <span className="text-cyan-400 font-bold leading-tight block min-h-[48px] flex items-center justify-center">{desafio.hint}</span>
          </div>
          {renderComputer()}
        </div>

        <div className="flex flex-col items-center flex-1 w-full pt-8 min-w-0">
          
          <div className={`flex justify-center flex-nowrap ${gapClass} mb-12 w-full overflow-hidden`}>
            {desafio.word.split('').map((letter: string, i: number) => (
              <div key={i} className={`${boxClass} flex-shrink-0 border-b-4 flex items-center justify-center font-black rounded-t-xl shadow-inner transition-colors duration-300
                ${(guessedLetters.includes(letter) || isLoser) ? 'bg-slate-800 text-white border-cyan-500' : 'bg-slate-800/30 text-transparent border-slate-600'}
                ${isLoser && !guessedLetters.includes(letter) ? 'text-rose-500 border-rose-500/50' : ''}
              `}>
                {(guessedLetters.includes(letter) || isLoser) ? letter : '?'}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2 w-full max-w-3xl">
            {alphabet.map((letter) => {
              const isGuessed = guessedLetters.includes(letter);
              const isCorrect = desafio.word.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={isGuessed || isFinished}
                  className={`w-10 h-12 md:w-12 md:h-14 text-xl font-bold rounded-xl transition-all ${
                    isGuessed 
                      ? isCorrect 
                        ? 'bg-cyan-500/20 text-cyan-500 border-2 border-cyan-500/50 cursor-default' 
                        : 'bg-slate-900 text-slate-700 border-2 border-slate-800 cursor-default'
                      : 'bg-slate-700 hover:bg-cyan-500 text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] active:scale-95 border-b-4 border-slate-800 hover:border-cyan-700'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {isFinished && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-in fade-in rounded-[3rem]">
          <div className="text-center flex flex-col items-center">
            {isWinner ? (
              <>
                <h2 className="text-6xl font-black text-emerald-400 mb-4">MÁQUINA SALVA!</h2>
                <p className="text-2xl text-slate-300">Você adivinhou a palavra a tempo.</p>
              </>
            ) : (
              <>
                <h2 className="text-6xl font-black text-rose-500 mb-4">MÁQUINA DESTRUÍDA!</h2>
                <p className="text-3xl text-white mt-4">A palavra era: <strong className="text-cyan-400">{desafio.word}</strong></p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}