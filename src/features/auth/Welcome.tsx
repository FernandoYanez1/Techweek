import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../core/store';
import type { User } from '../../core/store';
import { saveUserDB, getAllUsersDB } from '../../core/db';
import { UserPlus, Users, ArrowLeft, CheckCircle2, Settings, Search, Camera, Play, Trophy } from 'lucide-react';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Welcome() {
  const { setScreen, setActiveRankingTab, loginUser, openCamera } = useAppStore();
  const [view, setView] = useState<'home' | 'new' | 'returning'>('home');
  const [newUserStep, setNewUserStep] = useState<1 | 2>(1);
  
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');

  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [letterFilter, setLetterFilter] = useState<string | null>(null);

  useEffect(() => {
    if (view === 'returning') {
      getAllUsersDB().then(setDbUsers).catch(console.error);
    }
  }, [view]);

  const filteredUsers = useMemo(() => {
    return dbUsers.filter(u => {
      if (letterFilter) {
        return u.name.toUpperCase().startsWith(letterFilter);
      }
      return u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             u.department.toLowerCase().includes(searchTerm.toLowerCase());
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [dbUsers, searchTerm, letterFilter]);

  const handleCreateProfile = async () => {
    if (name.trim() === '' || department.trim() === '') return;
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      department: department.trim().toUpperCase(),
      scoreGeral: 0,
      scoreDiario: 0,
      lastPlayed: Date.now()
    };

    await saveUserDB(newUser);
    loginUser(newUser);
    setNewUserStep(2);
  };

  const handleReturningUser = (user: User) => {
    const hoje = new Date().toDateString();
    const ultimoJogo = new Date(user.lastPlayed).toDateString();
    
    if (hoje !== ultimoJogo) {
      user.scoreDiario = 0;
    }
    
    user.lastPlayed = Date.now();
    saveUserDB(user);
    loginUser(user);
    setScreen('menu');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 relative p-12 animate-in fade-in duration-500 overflow-hidden">
      
      <button 
        onClick={() => setScreen('admin')}
        className="absolute bottom-8 left-8 p-4 text-slate-800 hover:text-slate-600 transition-colors z-50"
      >
        <Settings size={32} />
      </button>

      {view !== 'home' && (
        <button onClick={() => { setView('home'); setNewUserStep(1); }} className="absolute top-12 left-12 p-5 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95 z-50">
          <ArrowLeft size={48} />
        </button>
      )}

      {view === 'home' && (
        <div className="absolute top-12 left-12 flex flex-col gap-4 z-50">
          {/* BOTÃO RANKING GERAL (Mural Removido) */}
          <button 
            onClick={() => { setActiveRankingTab('ranking'); setScreen('ranking'); }}
            className="flex items-center gap-4 px-8 py-4 bg-slate-800/80 backdrop-blur-md border-2 border-cyan-500 rounded-full text-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 font-bold text-xl overflow-hidden group w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            <Trophy size={28} className="animate-pulse flex-shrink-0" />
            <span className="whitespace-nowrap">Ranking Geral</span>
          </button>
        </div>
      )}

      {view === 'home' && (
        <div className="flex flex-col items-center max-w-5xl w-full text-center mt-16">
          <h1 className="text-[5.5rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6 drop-shadow-sm">
            Bem-vindo à TechWeek
          </h1>
          <p className="text-3xl text-slate-400 mb-20 font-medium tracking-wide">
            Identifique-se para participar do Ranking Geral
          </p>

          <div className="flex gap-12 w-full justify-center">
            <button 
              onClick={() => setView('new')} 
              className="relative rounded-[2.5rem] p-[4px] w-full max-w-sm overflow-hidden active:scale-95 transition-transform shadow-[0_0_30px_rgba(6,182,212,0.2)] bg-slate-900 group"
            >
              <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_270deg,#06b6d4_360deg)] animate-[spin_3s_linear_infinite]" />
              <div className="relative bg-slate-900 rounded-[2.3rem] w-full h-full p-12 flex flex-col items-center gap-8 z-10 border border-slate-700/50">
                <div className="bg-cyan-500/20 p-8 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-pulse">
                  <UserPlus size={72} className="text-cyan-400" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-white mb-2">Primeira Vez</span>
                  <span className="text-xl text-slate-400">Criar meu perfil e foto</span>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setView('returning')} 
              className="relative rounded-[2.5rem] p-[4px] w-full max-w-sm overflow-hidden active:scale-95 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-slate-900 group"
            >
              <div className="absolute -inset-[100%] bg-[conic-gradient(from_180deg,transparent_0_270deg,#10b981_360deg)] animate-[spin_3s_linear_infinite]" />
              <div className="relative bg-slate-900 rounded-[2.3rem] w-full h-full p-12 flex flex-col items-center gap-8 z-10 border border-slate-700/50">
                <div className="bg-emerald-500/20 p-8 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse">
                  <Users size={72} className="text-emerald-400" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-white mb-2">Já Joguei</span>
                  <span className="text-xl text-slate-400">Encontrar meu perfil</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {view === 'new' && (
        <div className="flex flex-col items-center max-w-2xl w-full animate-in slide-in-from-right duration-300">
          {newUserStep === 1 ? (
            <>
              <h2 className="text-5xl font-black text-white mb-12">Novo Cadastro</h2>
              <div className="w-full flex flex-col gap-6 mb-12">
                <input 
                  type="text" 
                  placeholder="Seu Nome Completo" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full bg-slate-800 border-2 border-slate-700 text-white text-3xl p-6 rounded-2xl outline-none focus:border-cyan-500 text-center shadow-inner"
                  maxLength={30}
                />
                <input 
                  type="text" 
                  placeholder="Órgão ou Setor (ex: STI, ESCON...)" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  className="w-full bg-slate-800 border-2 border-slate-700 text-white text-3xl p-6 rounded-2xl outline-none focus:border-cyan-500 text-center uppercase shadow-inner"
                  maxLength={15}
                />
              </div>
              <button 
                onClick={handleCreateProfile} 
                disabled={name.trim() === '' || department.trim() === ''}
                className="flex items-center justify-center gap-4 w-full py-8 bg-gradient-to-r from-cyan-500 to-blue-600 disabled:from-slate-800 disabled:text-slate-500 disabled:border-2 disabled:border-slate-700 text-white text-3xl font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-cyan-500/30"
              >
                <CheckCircle2 size={40} /> Continuar
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
              <div className="bg-emerald-500/20 p-8 rounded-full mb-8 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={96} className="text-emerald-400" />
              </div>
              <h2 className="text-6xl font-black text-white mb-6">Cadastro Concluído!</h2>
              <p className="text-2xl text-slate-400 mb-12 leading-relaxed">
                Deseja tirar uma foto agora para o seu perfil no Ranking?
              </p>
              
              <div className="flex gap-6 w-full">
                <button 
                  onClick={() => setScreen('menu')}
                  className="flex-1 flex items-center justify-center gap-3 py-8 bg-slate-800 border-2 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-2xl font-bold rounded-2xl transition-all active:scale-95"
                >
                  <Play size={32} /> Pular e Jogar
                </button>
                <button 
                  onClick={() => openCamera({ mode: 'profile', returnScreen: 'menu' })}
                  className="flex-[2] flex items-center justify-center gap-3 py-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-2xl font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-95"
                >
                  <Camera size={32} /> Tirar Foto Agora
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'returning' && (
        <div className="flex flex-col items-center max-w-6xl w-full animate-in slide-in-from-right duration-300">
          <h2 className="text-6xl font-black text-white mb-4">Encontrar Perfil</h2>
          <p className="text-slate-400 text-2xl mb-12">Busque pelo seu nome ou use o filtro de letras abaixo.</p>
          
          <div className="w-full max-w-3xl relative mb-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={36} />
            <input 
              type="text" 
              placeholder="Digite o nome se preferir..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setLetterFilter(null);
              }}
              className="w-full bg-slate-800 border-2 border-slate-700 text-white text-3xl p-6 pl-24 rounded-full outline-none focus:border-emerald-500 transition-all shadow-inner" 
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12 w-full max-w-4xl">
            <button 
              onClick={() => { setLetterFilter(null); setSearchTerm(''); }}
              className={`px-6 py-3 rounded-xl font-black text-xl transition-all active:scale-95 ${!letterFilter && searchTerm === '' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
            >
              TODOS
            </button>
            {ALFABETO.map(letter => (
              <button
                key={letter}
                onClick={() => { setLetterFilter(letter); setSearchTerm(''); }}
                className={`w-14 h-14 flex items-center justify-center rounded-xl font-black text-2xl transition-all active:scale-95 ${letterFilter === letter ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
              >
                {letter}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-h-[35vh] overflow-y-auto pr-4 custom-scrollbar pb-12">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full text-center text-slate-500 text-3xl mt-8">Nenhum participante encontrado com este filtro.</div>
            ) : (
              filteredUsers.map((user) => (
                <button 
                  key={user.id}
                  onClick={() => handleReturningUser(user)} 
                  className="flex items-center gap-6 bg-slate-800 p-5 rounded-[2rem] border-2 border-slate-700 transition-all text-left active:scale-95 shadow-md"
                >
                  <div className="w-20 h-20 bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center text-slate-300 font-bold text-3xl overflow-hidden border-2 border-slate-600">
                    {user.photoBase64 ? (
                      <img src={user.photoBase64} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col justify-center">
                    <p className="text-2xl font-black text-white truncate mb-1">{user.name}</p>
                    <p className="text-base text-emerald-400 font-bold tracking-widest uppercase">{user.department}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}