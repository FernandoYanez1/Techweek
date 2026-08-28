import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../core/store';
import { getAllUsersDB, deleteUserDB, saveUserDB } from '../../core/db';
import type { User } from '../../core/store';
import { ArrowLeft, Trash2, ImageMinus, Search, Users, Camera, Delete, Check, Lock, BarChart3, Trophy, Flame, RotateCcw, Building2, UserCircle2 } from 'lucide-react';

export default function Admin() {
  const { setScreen, openCamera } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [typedPassword, setTypedPassword] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('users');
  const todayStr = new Date().toDateString();

  const loadData = async () => {
    try {
      const usersData = await getAllUsersDB();
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar dados do admin:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleDigit = (n: number) => {
    if (typedPassword.length < 6) {
      setTypedPassword(prev => prev + n.toString());
    }
  };

  const handleBackspace = () => {
    setTypedPassword(prev => prev.slice(0, -1));
  };

  const handleLogin = () => {
    if (typedPassword === '123987') { 
      setIsAuthenticated(true);
    } else {
      setErrorShake(true);
      setTimeout(() => {
        setErrorShake(false);
        setTypedPassword('');
      }, 500);
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.scoreGeral - a.scoreGeral);
  }, [users, searchTerm]);

  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`ATENÇÃO: Tem certeza que deseja apagar DEFINITIVAMENTE o usuário ${name} e todos os seus dados?`)) {
      await deleteUserDB(id);
      loadData();
    }
  };

  const handleDeletePhoto = async (user: User) => {
    if (!user.photoBase64) return;
    if (window.confirm(`Deseja remover apenas a foto do perfil de ${user.name}?`)) {
      const updatedUser = { ...user };
      delete updatedUser.photoBase64;
      await saveUserDB(updatedUser);
      loadData();
    }
  };

  const handleResetScore = async (user: User) => {
    if (window.confirm(`Tem certeza que deseja ZERAR todos os pontos de ${user.name}? Essa ação não pode ser desfeita.`)) {
      const updatedUser = { ...user, scoreGeral: 0, scoreDiario: 0, scoreHistory: {} };
      await saveUserDB(updatedUser);
      loadData();
    }
  };

  const topOverall = useMemo(() => {
    return [...users].sort((a, b) => (b.scoreGeral || 0) - (a.scoreGeral || 0))[0];
  }, [users]);

  const topDaily = useMemo(() => {
    return [...users].sort((a, b) => (b.scoreHistory?.[todayStr] || 0) - (a.scoreHistory?.[todayStr] || 0))[0];
  }, [users, todayStr]);

  const departmentLeaders = useMemo(() => {
    const deps: Record<string, User> = {};
    users.forEach(u => {
      const dep = u.department.toUpperCase();
      if (!deps[dep] || u.scoreGeral > deps[dep].scoreGeral) {
        deps[dep] = u;
      }
    });
    return Object.values(deps).sort((a, b) => b.scoreGeral - a.scoreGeral).filter(u => u.scoreGeral > 0);
  }, [users]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 relative animate-in fade-in duration-500">
        <button onClick={() => setScreen('welcome')} className="absolute top-12 left-12 p-4 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95">
          <ArrowLeft size={40} />
        </button>
        
        <div className="bg-slate-800 p-12 rounded-[3rem] border-2 border-slate-700 shadow-2xl flex flex-col items-center max-w-sm w-full">
          <div className="bg-cyan-500/20 p-6 rounded-full mb-6">
            <Lock size={48} className="text-cyan-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-8">Acesso Restrito</h2>
          
          <div className={`flex gap-4 mb-10 ${errorShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-full transition-all duration-200 ${i < typedPassword.length ? 'bg-cyan-400 shadow-[0_0_15px_#06b6d4]' : 'bg-slate-700'}`} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button key={n} onClick={() => handleDigit(n)} className="w-full aspect-square bg-slate-700 hover:bg-slate-600 rounded-full text-3xl font-black text-white active:scale-95 transition-transform flex items-center justify-center">
                {n}
              </button>
            ))}
            <button onClick={handleBackspace} className="w-full aspect-square bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full text-rose-500 active:scale-95 transition-transform flex items-center justify-center">
              <Delete size={32} />
            </button>
            <button onClick={() => handleDigit(0)} className="w-full aspect-square bg-slate-700 hover:bg-slate-600 rounded-full text-3xl font-black text-white active:scale-95 transition-transform flex items-center justify-center">
              0
            </button>
            <button onClick={handleLogin} disabled={typedPassword.length === 0} className="w-full aspect-square bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500 rounded-full text-emerald-400 hover:text-white active:scale-95 transition-all flex items-center justify-center disabled:opacity-50">
              <Check size={40} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full bg-slate-900 relative p-12 animate-in fade-in duration-500 overflow-hidden">
      
      <button 
        onClick={() => setScreen('welcome')} 
        className="absolute top-12 left-12 p-4 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95 z-50"
      >
        <ArrowLeft size={40} />
      </button>

      <div className="w-full max-w-7xl flex flex-col h-full z-10 mt-4">
        
        <div className="flex gap-4 bg-slate-800 p-2 rounded-2xl border-2 border-slate-700 shadow-xl mb-8 self-center">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl text-xl font-bold transition-all ${activeTab === 'users' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Users size={24} /> Gerenciar Participantes
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl text-xl font-bold transition-all ${activeTab === 'stats' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <BarChart3 size={24} /> Estatísticas de Pontos
          </button>
        </div>

        {activeTab === 'users' && (
          <>
            <div className="flex items-center gap-6 mb-8 w-full bg-slate-800 p-4 rounded-3xl border-2 border-slate-700">
              <Search className="text-slate-400 ml-4" size={32} />
              <input 
                type="text" 
                placeholder="Pesquisar participante por nome ou setor..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-white text-2xl outline-none" 
              />
              <div className="bg-slate-900 px-6 py-3 rounded-2xl flex items-center gap-3 text-cyan-400 font-bold border border-slate-700">
                <Users size={24} />
                <span className="text-xl">{filteredUsers.length} Cadastros</span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-800 border-2 border-slate-700 rounded-3xl flex flex-col pb-12">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center text-slate-500 text-2xl mt-12 font-bold">Nenhum participante encontrado com este filtro.</div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="flex flex-col md:flex-row gap-6 p-6 bg-slate-900 border border-slate-700 rounded-2xl items-center">
                      
                      <div className="flex items-center gap-6 flex-1 min-w-[300px]">
                        {user.photoBase64 ? (
                          <img src={user.photoBase64} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-cyan-500 object-top" />
                        ) : (
                          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 font-bold text-3xl border-4 border-slate-600">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-black text-white text-3xl truncate">{user.name}</span>
                          <span className="text-slate-400 text-lg font-bold tracking-widest uppercase">{user.department}</span>
                          <span className="text-cyan-400 font-bold text-xl mt-1">{user.scoreGeral} pontos totais</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => openCamera({ mode: 'profile', targetUserId: user.id, returnScreen: 'admin' })}
                          className="flex items-center gap-3 px-5 py-4 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-2xl font-bold transition-all text-lg flex-1 md:flex-none justify-center"
                        >
                          <Camera size={24} /> {user.photoBase64 ? "Trocar Foto" : "Tirar Foto"}
                        </button>
                        
                        <button 
                          onClick={() => handleDeletePhoto(user)}
                          disabled={!user.photoBase64}
                          className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all text-lg flex-1 md:flex-none justify-center ${user.photoBase64 ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}
                        >
                          <ImageMinus size={24} /> Apagar Foto
                        </button>
                        
                        <button 
                          onClick={() => handleResetScore(user)}
                          className="flex items-center gap-3 px-5 py-4 bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white rounded-2xl font-bold transition-all text-lg flex-1 md:flex-none justify-center"
                        >
                          <RotateCcw size={24} /> Zerar Pontos
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="flex items-center gap-3 px-5 py-4 bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-bold transition-all text-lg flex-1 md:flex-none justify-center border border-rose-500/30"
                        >
                          <Trash2 size={24} /> Apagar Conta
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <div className="flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar pb-12 animate-in fade-in">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
               <div className="bg-gradient-to-br from-cyan-900/50 to-slate-900 border-2 border-cyan-500/50 rounded-3xl p-8 flex items-center gap-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                     <Trophy size={100} className="text-cyan-400" />
                  </div>
                  <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-cyan-400 flex items-center justify-center overflow-hidden shrink-0 z-10">
                     {topOverall?.photoBase64 ? <img src={topOverall.photoBase64} className="w-full h-full object-cover" /> : <UserCircle2 size={48} className="text-slate-500" />}
                  </div>
                  <div className="flex flex-col z-10">
                     <span className="text-cyan-400 font-black uppercase tracking-widest text-lg mb-1">Recordista Absoluto</span>
                     <span className="text-4xl font-black text-white truncate">{topOverall?.name || 'Ninguém'}</span>
                     <span className="text-2xl font-bold text-slate-300 mt-2">{topOverall?.scoreGeral || 0} pontos totais</span>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-fuchsia-900/50 to-slate-900 border-2 border-fuchsia-500/50 rounded-3xl p-8 flex items-center gap-6 shadow-[0_0_30px_rgba(232,121,249,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                     <Flame size={100} className="text-fuchsia-400" />
                  </div>
                  <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-fuchsia-400 flex items-center justify-center overflow-hidden shrink-0 z-10">
                     {topDaily?.photoBase64 ? <img src={topDaily.photoBase64} className="w-full h-full object-cover" /> : <UserCircle2 size={48} className="text-slate-500" />}
                  </div>
                  <div className="flex flex-col z-10">
                     <span className="text-fuchsia-400 font-black uppercase tracking-widest text-lg mb-1">Rei do Dia (Hoje)</span>
                     <span className="text-4xl font-black text-white truncate">{topDaily?.name || 'Ninguém'}</span>
                     <span className="text-2xl font-bold text-slate-300 mt-2">{topDaily?.scoreHistory?.[todayStr] || 0} pontos hoje</span>
                  </div>
               </div>
            </div>

            <h3 className="text-3xl font-black text-white mb-6 flex items-center gap-4 border-b-2 border-slate-700 pb-4">
              <Building2 size={36} className="text-emerald-400" /> Melhores por Setor
            </h3>
            
            {departmentLeaders.length === 0 ? (
               <div className="text-slate-500 text-2xl font-bold text-center mt-8">Nenhum setor pontuou ainda.</div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departmentLeaders.map((leader, index) => (
                     <div key={index} className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-6 flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-700 rounded-full border-2 border-emerald-500 flex items-center justify-center overflow-hidden shrink-0">
                           {leader.photoBase64 ? <img src={leader.photoBase64} className="w-full h-full object-cover" /> : <UserCircle2 size={32} className="text-slate-500" />}
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                           <span className="text-emerald-400 font-black uppercase tracking-widest text-sm">{leader.department}</span>
                           <span className="text-2xl font-bold text-white truncate">{leader.name}</span>
                           <span className="text-slate-400 font-bold">{leader.scoreGeral} pts</span>
                        </div>
                     </div>
                  ))}
               </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}