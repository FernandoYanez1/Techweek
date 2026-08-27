import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../core/store';
import { getAllUsersDB } from '../../core/db';
import type { User } from '../../core/store';
import { GAME_REGISTRY, MAX_SCORES, type DifficultyLevel, type GameDefinition } from '../../core/GameRegistry';
import { Terminal, Rocket, BrainCircuit, Play, LogOut, UserCircle2, X, Search, Users, Bot, Gamepad2, Trophy } from 'lucide-react';

const CATEGORIES = [
  { id: 'ARCADE' as DifficultyLevel, label: 'Arcade', icon: <Gamepad2 size={24} /> },
  { id: 'INICIANTE' as DifficultyLevel, label: 'Iniciante', icon: <Terminal size={24} /> },
  { id: 'INTERMEDIARIO' as DifficultyLevel, label: 'Intermediário', icon: <Rocket size={24} /> },
  { id: 'AVANCADO' as DifficultyLevel, label: 'Avançado', icon: <BrainCircuit size={24} /> },
];

const getTheme = (level: DifficultyLevel) => {
  switch (level) {
    case 'ARCADE': return { text: 'text-blue-400', border: 'border-blue-500', shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]', hoverBorder: 'hover:border-blue-500', hoverShadow: 'hover:shadow-[0_10px_40px_rgba(59,130,246,0.2)]' };
    case 'INICIANTE': return { text: 'text-emerald-400', border: 'border-emerald-500', shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]', hoverBorder: 'hover:border-emerald-500', hoverShadow: 'hover:shadow-[0_10px_40px_rgba(16,185,129,0.2)]' };
    case 'INTERMEDIARIO': return { text: 'text-orange-400', border: 'border-orange-500', shadow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]', hoverBorder: 'hover:border-orange-500', hoverShadow: 'hover:shadow-[0_10px_40px_rgba(249,115,22,0.2)]' };
    case 'AVANCADO': return { text: 'text-rose-500', border: 'border-rose-500', shadow: 'shadow-[0_0_30px_rgba(244,63,94,0.3)]', hoverBorder: 'hover:border-rose-500', hoverShadow: 'hover:shadow-[0_10px_40px_rgba(244,63,94,0.2)]' };
  }
};

const getGameInfo = (game: GameDefinition, tab: DifficultyLevel) => {
  if (game.categories.length > 1 && tab !== 'ARCADE') {
    if (tab === 'INICIANTE') return { title: game.title, badge: 'Fácil' };
    if (tab === 'INTERMEDIARIO') return { title: game.title, badge: 'Médio' };
    if (tab === 'AVANCADO') return { title: game.title, badge: 'Difícil' };
  }
  return { title: game.title, badge: null };
};

export default function Menu() {
  const { startGame, loggedUsers, logoutUser, loginUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<DifficultyLevel>('ARCADE');
  const [selectedGame, setSelectedGame] = useState<GameDefinition | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllUsersDB().then(setAllUsers).catch(console.error);
  }, []);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => 
      u.id !== loggedUsers[0]?.id && 
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       u.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allUsers, searchTerm, loggedUsers]);

  const filteredGames = GAME_REGISTRY.filter((game) => game.categories.includes(activeTab));
  const currentTheme = getTheme(activeTab);

  const handleGameClick = (game: GameDefinition) => {
    if (game.maxPlayers > 1) {
      setSelectedGame(game);
    } else {
      logoutUser(1);
      startGame(game.id, activeTab);
    }
  };

  const handleStartVsBot = () => {
    logoutUser(1);
    if (selectedGame) startGame(selectedGame.id, activeTab);
  };

  const handleStartVsPlayer = (player2: User) => {
    loginUser(player2, 1);
    if (selectedGame) startGame(selectedGame.id, activeTab);
  };

  return (
    <div className="flex flex-col w-full h-full p-12 bg-slate-900 animate-in fade-in duration-500 relative">
      
      {/* Estilos CSS Inline para o Efeito de Neon Líquido */}
      <style>
        {`
          @keyframes pan-gradient {
            100% { background-position: 0% center; }
            0% { background-position: 200% center; }
          }
          .neon-animated-text {
            background: linear-gradient(to right, #3b82f6, #7706d4, #f97316, #f59e0b, #3b82f6);
            background-size: 200% auto;
            color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            animation: pan-gradient 7s linear infinite;
            filter: drop-shadow(0 0 15px rgba(17, 97, 226, 0.4));
          }
          .neon-animated-line {
            background: linear-gradient(to right, #3b82f6, #7706d4, #f97316, #f59e0b, #3b82f6);
            background-size: 200% auto;
            animation: pan-gradient 7s linear infinite;
            box-shadow: 0 0 15px rgba(249,115,22,0.4);
          }
        `}
      </style>

      <div className="absolute top-8 left-12 flex gap-4 z-40">
        {loggedUsers.map((user, index) => (
          <div key={`${user.id}-${index}`} className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md px-6 py-3 rounded-full border-2 border-slate-700 shadow-lg">
            {user.photoBase64 ? (
              <img 
                src={user.photoBase64} 
                alt={user.name} 
                className={`w-12 h-12 rounded-full object-cover border-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] ${index === 0 ? 'border-cyan-400' : 'border-rose-400'}`} 
              />
            ) : (
              <UserCircle2 size={40} className={index === 0 ? "text-cyan-400" : "text-rose-400"} />
            )}
            <div className="flex flex-col">
              <span className="font-bold text-white leading-tight max-w-[150px] truncate">{user.name}</span>
              <span className="text-xs text-slate-400 leading-tight">JOGADOR {index + 1}</span>
            </div>
            <button 
              onClick={() => logoutUser(index as 0 | 1)}
              className="ml-4 p-2 bg-slate-700 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-full transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        ))}
      </div>

      <header className="mb-12 text-center mt-4 flex flex-col items-center">
        {/* Aqui aplicamos a classe CSS customizada do neon */}
        <h1 className="text-[5.5rem] font-black tracking-tighter mb-2 uppercase leading-none neon-animated-text">
          TechWeek Arcade
        </h1>
        {/* A linha embaixo acompanha o movimento das cores */}
        <div className="h-1.5 w-64 rounded-full mt-2 neon-animated-line"></div>
      </header>

      <div className="flex justify-center gap-4 mb-12">
        {CATEGORIES.map((cat) => {
          const isActive = activeTab === cat.id;
          const catTheme = getTheme(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-full text-2xl font-bold transition-all duration-300 ${
                isActive
                  ? `bg-slate-800/80 ${catTheme.text} border-2 ${catTheme.border} ${catTheme.shadow}`
                  : 'bg-slate-800 text-slate-500 border-2 border-transparent hover:bg-slate-700 hover:text-slate-300'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-3 gap-8 max-w-7xl mx-auto pb-24 pr-4">
          {filteredGames.map((game) => {
            const maxPts = MAX_SCORES[game.id]?.[activeTab] || 0;
            const { title, badge } = getGameInfo(game, activeTab);

            return (
              <button
                key={game.id}
                onClick={() => handleGameClick(game)}
                className={`group flex flex-col bg-slate-800 rounded-[2rem] p-8 border-2 border-slate-700 ${currentTheme.hoverBorder} ${currentTheme.hoverShadow} transition-all active:scale-95 text-left relative overflow-hidden`}
              >
                
                <div className="absolute top-0 right-0 flex items-start">
                  {maxPts > 0 && (
                    <div className={`flex items-center gap-1 bg-slate-900 border-b-2 border-l-2 border-slate-700 ${currentTheme.text} px-4 py-1.5 rounded-bl-xl font-black text-sm group-hover:${currentTheme.border} transition-colors`}>
                      <Trophy size={14} /> Máx: {maxPts} pts
                    </div>
                  )}
                  <div className="bg-slate-700 text-slate-300 px-4 py-1.5 rounded-bl-xl font-bold text-sm h-full flex items-center border-b-2 border-slate-700">
                    {game.minPlayers === game.maxPlayers 
                    ? (game.maxPlayers === 1 ? '1 Jogador' : `${game.maxPlayers} Jogadores`) 
                    : `${game.minPlayers} a ${game.maxPlayers} Jogadores`}
                  </div>
                </div>

                <div className={`text-6xl mb-6 mt-4 bg-slate-900 w-24 h-24 rounded-2xl flex items-center justify-center border-2 border-slate-700 group-hover:${currentTheme.border} group-hover:scale-110 transition-all shadow-inner flex-shrink-0`}>
                  {game.icon}
                </div>
                
                <div className="flex items-center justify-between w-full mb-3 gap-3">
                  <h2 className="text-2xl font-bold text-slate-100 truncate flex-1">{title}</h2>
                  {badge && (
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 ${currentTheme.border} ${currentTheme.text} bg-slate-900 shadow-sm flex-shrink-0`}>
                      {badge}
                    </span>
                  )}
                </div>
                
                <p className="text-lg text-slate-400 flex-1 leading-relaxed line-clamp-2">{game.description}</p>
                
                <div className={`mt-8 flex items-center ${currentTheme.text} font-bold text-xl gap-2 group-hover:translate-x-2 transition-transform`}>
                  <Play size={24} /> Jogar Agora
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedGame && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-300 p-8">
          <div className={`bg-slate-800 border-2 ${currentTheme.border} rounded-[3rem] p-12 max-w-5xl w-full ${currentTheme.shadow} relative flex flex-col items-center`}>
            
            <button onClick={() => setSelectedGame(null)} className="absolute top-8 right-8 p-3 bg-slate-700 text-slate-400 hover:text-white rounded-full">
              <X size={32} />
            </button>

            <div className="flex items-center gap-4 mb-4">
               <h2 className="text-5xl font-black text-white text-center">{getGameInfo(selectedGame, activeTab).title}</h2>
               {getGameInfo(selectedGame, activeTab).badge && (
                 <span className={`px-4 py-2 rounded-xl text-xl font-black uppercase border-2 ${currentTheme.border} ${currentTheme.text} bg-slate-900`}>
                    {getGameInfo(selectedGame, activeTab).badge}
                 </span>
               )}
            </div>
            
            <p className="text-2xl text-slate-400 mb-12 text-center">Como você deseja jogar?</p>

            <div className="flex gap-8 w-full mb-12">
              {selectedGame.minPlayers === 1 && (
                <button onClick={handleStartVsBot} className={`flex-1 flex flex-col items-center gap-4 p-8 bg-slate-900 border-2 border-slate-700 ${currentTheme.hoverBorder} rounded-3xl group transition-all`}>
                  <Bot size={64} className={`${currentTheme.text} group-hover:scale-110 transition-transform`} />
                  <span className="text-3xl font-bold text-white">Sozinho / IA</span>
                  <span className="text-slate-400">Modo de 1 jogador</span>
                </button>
              )}

              <div className={`flex flex-col p-8 bg-slate-900 border-2 border-slate-700 rounded-3xl relative ${selectedGame.minPlayers === 2 ? 'w-full' : 'flex-1'}`}>
                <div className="flex items-center gap-4 mb-6">
                  <Users size={40} className="text-rose-500" />
                  <span className="text-2xl font-bold text-white">Desafiar Colega</span>
                </div>
                
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Buscar oponente..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-700 text-white p-4 pl-14 rounded-xl outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex-1 max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                  {filteredUsers.length === 0 ? (
                    <div className="text-slate-500 text-center mt-4">Nenhum jogador encontrado.</div>
                  ) : (
                    filteredUsers.map(user => (
                      <button 
                        key={user.id} 
                        onClick={() => handleStartVsPlayer(user)}
                        className="flex items-center gap-4 p-3 hover:bg-slate-800 rounded-xl transition-colors text-left border border-transparent hover:border-rose-500/50"
                      >
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300 overflow-hidden">
                           {user.photoBase64 ? <img src={user.photoBase64} className="w-full h-full object-cover" /> : user.name.substring(0,2).toUpperCase()}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.department}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}