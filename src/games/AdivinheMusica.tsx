import { useState, useRef, useMemo } from 'react';
import { useAppStore } from '../core/store';
import { playClick, playSuccess, playError } from '../core/audio';
import { Music, Play, Square, FastForward, CheckCircle2, XCircle, Search, Trophy, Delete, SkipForward, Heart } from 'lucide-react';
import { SONG_DATABASE, type SongDef } from '../data/songs';

const PREDEFINED_ORDER = [
  'Sertanejo',
  'Forró/Piseiro',
  'Pop Internacional',
  'Pagode/Samba',
  'Eletrônica',
  'MPB',
  'Rock',
  'Rap/Trap'
];

const DB_GENRES = Array.from(new Set(SONG_DATABASE.map(s => s.genre)));
const GENRES = [
  ...PREDEFINED_ORDER.filter(g => DB_GENRES.includes(g)),
  ...DB_GENRES.filter(g => !PREDEFINED_ORDER.includes(g))
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const STAGES = [
  { time: 3, label: '3s', points: 50 },
  { time: 6, label: '6s', points: 40 },
  { time: 10, label: '10s', points: 30 },
  { time: 15, label: '15s', points: 20 },
  { time: 30, label: '30s', points: 10 },
  { time: 999, label: 'Toda', points: 5 },
];

const ROUNDS_PER_GAME = 3;
const MAX_GUESSES = 3;

type GameState = 'setup' | 'playing' | 'roundResult';

// ==========================================
// FUNÇÃO PARA IGNORAR ACENTOS NA BUSCA
// ==========================================
const removeAcentos = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function AdivinheMusica() {
  const { endGame } = useAppStore();
  
  const [gameState, setGameState] = useState<GameState>('setup');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [playAllGenres, setPlayAllGenres] = useState(false);
  
  const [playlist, setPlaylist] = useState<SongDef[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [guessesLeft, setGuessesLeft] = useState(MAX_GUESSES);
  const [score, setScore] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimeoutRef = useRef<number | null>(null);

  const toggleGenre = (genre: string) => {
    playClick();
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    } else {
      setSelectedGenres(prev => [...prev, genre]);
    }
  };

  const startGame = () => {
    playClick();
    
    let availableSongs = SONG_DATABASE.filter(s => !s.isFake);
    
    if (!playAllGenres) {
      availableSongs = availableSongs.filter(song => selectedGenres.includes(song.genre));
    }

    if (availableSongs.length < ROUNDS_PER_GAME) {
      alert(`Selecione mais gêneros! (Mínimo: ${ROUNDS_PER_GAME} músicas válidas)`);
      return;
    }

    const shuffled = [...availableSongs].sort(() => Math.random() - 0.5).slice(0, ROUNDS_PER_GAME);
    setPlaylist(shuffled);
    setCurrentRound(0);
    setCurrentStageIndex(0);
    setGuessesLeft(MAX_GUESSES);
    setScore(0);
    setSearchQuery('');
    setFeedback(null);
    setGameState('playing');
  };

  const handleKeyPress = (key: string) => { playClick(); setSearchQuery(prev => prev + key); };
  const handleBackspace = () => { playClick(); setSearchQuery(prev => prev.slice(0, -1)); };
  const handleSpace = () => { playClick(); setSearchQuery(prev => prev + ' '); };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
  };

  const playAudioSegment = () => {
    if (!audioRef.current) return;
    stopAudio();

    const song = playlist[currentRound];
    const allowedTime = STAGES[currentStageIndex].time;

    audioRef.current.currentTime = song.startTime || 0;
    audioRef.current.play().catch(e => console.error("Erro ao tocar áudio:", e));
    setIsPlaying(true);

    if (allowedTime !== 999) {
      playTimeoutRef.current = window.setTimeout(() => stopAudio(), allowedTime * 1000);
    }
  };

  const requestMoreTime = () => {
    playClick();
    if (currentStageIndex < STAGES.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
      stopAudio(); 
    }
  };

  const executeFinishGame = (finalScoreLocal: number) => {
    setTimeout(() => {
      endGame([finalScoreLocal]);
    }, 3500);
  };

  const handleGuess = (songId: string) => {
    if (feedback !== null) return;
    stopAudio();

    const isCorrect = songId === playlist[currentRound].id;
    let currentScore = score;
    
    if (isCorrect) {
      playSuccess();
      setFeedback('correct');
      
      let pointsEarned = STAGES[currentStageIndex].points;
      if (playAllGenres) pointsEarned = Math.round(pointsEarned * 1.2); 
      
      currentScore += pointsEarned;
      setScore(currentScore);
      setGameState('roundResult');
      
      if (currentRound + 1 >= ROUNDS_PER_GAME) executeFinishGame(currentScore);
    } else {
      playError();
      setSearchQuery('');
      const remainingGuesses = guessesLeft - 1;
      setGuessesLeft(remainingGuesses);
      
      if (remainingGuesses <= 0) {
        setFeedback('wrong');
        setGameState('roundResult');
        if (currentRound + 1 >= ROUNDS_PER_GAME) executeFinishGame(currentScore);
      }
    }
  };

  const skipSong = () => {
    playClick();
    if (feedback !== null) return;
    stopAudio();
    playError();
    setFeedback('wrong');
    setGameState('roundResult');
    if (currentRound + 1 >= ROUNDS_PER_GAME) executeFinishGame(score);
  };

  const nextRound = () => {
    playClick();
    setCurrentRound(prev => prev + 1);
    setCurrentStageIndex(0);
    setGuessesLeft(MAX_GUESSES);
    setSearchQuery('');
    setFeedback(null);
    setGameState('playing');
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const available = playAllGenres ? SONG_DATABASE : SONG_DATABASE.filter(s => selectedGenres.includes(s.genre));
    
    // Passa a query digitada pela nossa função de limpar acentos
    const normalizedQuery = removeAcentos(searchQuery.toLowerCase());
    
    return available.filter(s => {
      // Passa o título e artista do banco de dados pela limpeza também antes de comparar
      const normalizedTitle = removeAcentos(s.title.toLowerCase());
      const normalizedArtist = removeAcentos(s.artist.toLowerCase());
      
      return normalizedTitle.includes(normalizedQuery) || normalizedArtist.includes(normalizedQuery);
    }).slice(0, 8); 
  }, [searchQuery, playAllGenres, selectedGenres]);

  if (gameState === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-800 rounded-[3rem] shadow-2xl text-center max-w-4xl w-full border-4 border-slate-700 animate-in zoom-in">
        <Music size={80} className="text-purple-400 mb-6" />
        <h2 className="text-5xl font-black text-white mb-4">Qual é a Música?</h2>
        <p className="text-xl text-slate-400 mb-8">Você tem 3 chances por música. Quanto menos tempo de áudio você usar, mais pontos ganha!</p>
        
        <div className="w-full bg-slate-900 p-8 rounded-3xl mb-8 border-2 border-slate-700">
          <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b border-slate-700">
            <input 
              type="checkbox" 
              id="all-genres" 
              checked={playAllGenres}
              onChange={(e) => { playClick(); setPlayAllGenres(e.target.checked); }}
              className="w-8 h-8 accent-purple-500"
            />
            <label htmlFor="all-genres" className="text-2xl font-bold text-white flex items-center gap-2 cursor-pointer">
              Misturar Todos os Gêneros <span className="text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">+20% Bônus</span>
            </label>
          </div>

          <div className={`grid grid-cols-2 gap-4 transition-opacity ${playAllGenres ? 'opacity-30 pointer-events-none' : ''}`}>
            {GENRES.map(genre => (
              <button 
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`py-4 px-6 rounded-xl text-xl font-bold border-2 transition-all ${
                  selectedGenres.includes(genre) ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <button onClick={startGame} disabled={!playAllGenres && selectedGenres.length === 0} className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-3xl font-bold active:scale-95 transition-all shadow-lg">
          Começar o Show
        </button>
      </div>
    );
  }

  const currentSong = playlist[currentRound];

  return (
    <div className="flex flex-col items-center w-full max-w-[95vw] select-none h-[88vh]">
      
      <audio ref={audioRef} src={currentSong?.file ? `/music/${currentSong.file}` : ''} preload="auto" />

      <div className="w-full flex justify-between items-center mb-6 bg-slate-800 p-6 rounded-3xl shadow-lg border-2 border-slate-700 shrink-0">
        <div className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Música {currentRound + 1}/{ROUNDS_PER_GAME}</div>
        <div className="text-2xl font-bold text-purple-400 flex items-center gap-2"><Trophy size={28}/> {score} pts</div>
      </div>

      <div className="w-full flex flex-1 gap-6 min-h-0 relative">
        
        {gameState === 'roundResult' && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in zoom-in rounded-[3rem] border-4 border-slate-700">
            {feedback === 'correct' ? <CheckCircle2 size={100} className="text-emerald-400 mb-6" /> : <XCircle size={100} className="text-rose-500 mb-6" />}
            <h2 className={`text-5xl font-black mb-4 ${feedback === 'correct' ? 'text-emerald-400' : 'text-rose-500'}`}>
              {feedback === 'correct' ? 'Bela Audição!' : 'Passou Longe!'}
            </h2>
            <div className="text-center mb-10">
              <p className="text-xl text-slate-400 mb-2">A música era:</p>
              <p className="text-4xl font-bold text-white">{currentSong.title}</p>
              <p className="text-2xl text-purple-400">{currentSong.artist}</p>
            </div>
            {currentRound + 1 < ROUNDS_PER_GAME ? (
              <button onClick={nextRound} className="py-5 px-12 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-2xl font-bold active:scale-95 transition-all shadow-lg">
                Próxima Música
              </button>
            ) : (
               <div className="py-5 px-12 bg-slate-700 text-slate-300 rounded-2xl text-2xl font-bold animate-pulse">
                 Finalizando e Salvando Pontos...
               </div>
            )}
          </div>
        )}

        <div className="w-3/12 flex flex-col bg-slate-800 rounded-[2rem] border-2 border-slate-700 shadow-xl p-5">
          
          <div className="flex justify-center gap-2 mb-4 shrink-0">
            {[...Array(MAX_GUESSES)].map((_, i) => (
              <Heart key={i} size={28} className={i < guessesLeft ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" : "text-slate-600"} />
            ))}
          </div>

          <div className="mb-4 shrink-0">
            <h3 className="text-slate-400 font-bold mb-3 uppercase tracking-widest text-sm text-center">Progresso</h3>
            <div className="flex flex-col gap-2">
              {STAGES.map((s, i) => {
                const isCurrent = i === currentStageIndex;
                const isPast = i < currentStageIndex;
                const displayPoints = playAllGenres ? Math.round(s.points * 1.2) : s.points;
                
                return (
                  <div key={i} className={`flex justify-between items-center px-5 py-3 rounded-2xl transition-all ${
                    isCurrent ? 'bg-purple-500 text-white shadow-lg scale-105 z-10' : 
                    isPast ? 'bg-slate-900/50 text-slate-600 line-through' : 'bg-slate-900 text-slate-400'
                  }`}>
                    <span className="font-bold">{s.label}</span>
                    <span className={`font-black ${isCurrent ? 'text-white' : 'text-slate-500'}`}>{displayPoints} pts</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-end gap-3 mt-2">
             <div className="flex items-center justify-center gap-4 w-full">
               {!isPlaying ? (
                 <button onClick={playAudioSegment} className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.4)] active:scale-95 transition-all shrink-0">
                   <Play size={36} className="text-white ml-2" fill="currentColor" />
                 </button>
               ) : (
                 <button onClick={stopAudio} className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.4)] active:scale-95 transition-all shrink-0">
                   <Square size={36} className="text-white" fill="currentColor" />
                 </button>
               )}

               <button 
                 onClick={requestMoreTime} 
                 disabled={currentStageIndex >= STAGES.length - 1}
                 className="flex-1 h-20 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold flex flex-col justify-center items-center gap-1 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
               >
                 <FastForward size={24} />
                 <span className="text-xs">Avançar Tempo</span>
               </button>
             </div>
             
             <button 
               onClick={skipSong} 
               className="w-full py-4 bg-slate-900 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-2xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 shrink-0"
             >
               <SkipForward size={20} /> Não sei (Pular)
             </button>
          </div>
        </div>

        <div className="w-5/12 flex flex-col bg-slate-800 rounded-[2rem] border-2 border-slate-700 shadow-xl p-6">
          <div className="flex-1 flex flex-col justify-center gap-3">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2 w-full">
                {row.map(key => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="flex-1 max-w-[65px] h-16 bg-slate-700 hover:bg-slate-600 text-white text-3xl font-black rounded-xl shadow-sm border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
            
            <div className="flex justify-center gap-4 mt-2">
              <button 
                onClick={handleSpace}
                className="flex-[2] h-16 bg-slate-700 hover:bg-slate-600 text-slate-300 text-2xl font-bold rounded-xl shadow-sm border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center uppercase tracking-widest"
              >
                Espaço
              </button>
              <button 
                onClick={handleBackspace}
                className="flex-1 h-16 bg-rose-900/50 hover:bg-rose-800 text-rose-300 text-xl font-bold rounded-xl shadow-sm border-b-4 border-rose-950 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Delete size={28} /> Apagar
              </button>
            </div>
          </div>
        </div>

        <div className="w-4/12 flex flex-col bg-slate-800 rounded-[2rem] border-2 border-slate-700 shadow-xl overflow-hidden">
          
          <div className="h-20 bg-slate-900 border-b-2 border-slate-700 flex items-center px-6 gap-4 shrink-0 relative">
            <Search className="text-purple-400 shrink-0" size={28} />
            <div className="flex-1 overflow-hidden">
              {searchQuery ? (
                <span className="text-2xl font-bold text-white tracking-wide whitespace-nowrap block">{searchQuery}</span>
              ) : (
                <span className="text-xl text-slate-600 font-medium">Digite para buscar...</span>
              )}
            </div>
            <span className="w-1 h-8 bg-purple-500 absolute right-6 animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-800 p-2">
            {searchQuery.trim() !== '' ? (
              searchResults.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-lg font-bold">Nenhuma música na base com esse nome.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {searchResults.map(song => (
                    <button
                      key={song.id}
                      onClick={() => handleGuess(song.id)}
                      className="w-full flex flex-col items-start p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-purple-500 active:bg-slate-700 text-left transition-all"
                    >
                      <span className="text-xl font-bold text-white leading-tight mb-1">{song.title}</span>
                      <span className="text-sm font-bold text-purple-400">{song.artist}</span>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <p className="text-slate-500 font-medium">Use o teclado ao lado para procurar o seu palpite.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}