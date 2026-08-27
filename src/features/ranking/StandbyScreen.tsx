import { useState, useEffect } from 'react';
import { Trophy, Flame, ChevronRight } from 'lucide-react';
import { getAllUsersDB } from '../../core/db';
import type { User } from '../../core/store';

interface StandbyScreenProps {
  onWakeUp: () => void;
}

export default function StandbyScreen({ onWakeUp }: StandbyScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const todayStr = new Date().toDateString();

  useEffect(() => {
    getAllUsersDB().then(setUsers).catch(console.error);
    const interval = setInterval(() => {
        getAllUsersDB().then(setUsers).catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Busca os dados REAIS do seu banco (scoreGeral) limitando estritamente a 5
  const topGeneral = [...users]
    .filter(u => (u.scoreGeral || 0) > 0)
    .sort((a, b) => (b.scoreGeral || 0) - (a.scoreGeral || 0))
    .slice(0, 5);

  // Busca os dados REAIS do seu banco (scoreHistory de hoje) limitando estritamente a 5
  const topDaily = [...users]
    .filter(u => (u.scoreHistory?.[todayStr] || 0) > 0)
    .sort((a, b) => (b.scoreHistory?.[todayStr] || 0) - (a.scoreHistory?.[todayStr] || 0))
    .slice(0, 5);

  // Função para criar o design de cada linha (Destacando Top 1, 2 e 3)
  const renderRow = (user: User, index: number, type: 'geral' | 'diario') => {
    const is1st = index === 0;
    const is2nd = index === 1;
    const is3rd = index === 2;

    let rankColor = type === 'geral' ? "text-cyan-600" : "text-fuchsia-700";
    let borderColor = type === 'geral' ? "border-cyan-900/30" : "border-fuchsia-900/30";
    let bgStyle = "bg-slate-800/50";
    let imgBorder = type === 'geral' ? "border-cyan-800" : "border-fuchsia-800";

    if (is1st) {
        rankColor = "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]";
        borderColor = "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]";
        bgStyle = "bg-gradient-to-r from-amber-500/20 to-transparent";
        imgBorder = "border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]";
    } else if (is2nd) {
        rankColor = "text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.8)]";
        borderColor = "border-slate-400 shadow-[0_0_15px_rgba(203,213,225,0.15)]";
        bgStyle = "bg-gradient-to-r from-slate-400/10 to-transparent";
        imgBorder = "border-slate-300";
    } else if (is3rd) {
        rankColor = "text-amber-700 drop-shadow-[0_0_10px_rgba(180,83,9,0.8)]";
        borderColor = "border-amber-700 shadow-[0_0_15px_rgba(180,83,9,0.15)]";
        bgStyle = "bg-gradient-to-r from-amber-700/10 to-transparent";
        imgBorder = "border-amber-700";
    }

    const score = type === 'geral' ? (user.scoreGeral || 0) : (user.scoreHistory?.[todayStr] || 0);

    return (
        <div key={user.id} className={`relative flex items-center p-3 rounded-2xl border-2 ${borderColor} ${bgStyle} transition-all`}>
            <div className={`w-14 font-black text-3xl flex items-center justify-center mr-3 ${rankColor}`}>
                {index + 1}º
            </div>
            {user.photoBase64 ? (
                <img src={user.photoBase64} alt={user.name} className={`w-14 h-14 rounded-full object-cover border-2 mr-4 ${imgBorder}`} />
            ) : (
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl bg-slate-700 border-2 mr-4 ${imgBorder} text-slate-400`}>
                    {user.name.substring(0, 2).toUpperCase()}
                </div>
            )}
            <div className="flex-1 overflow-hidden pr-4">
                <h3 className={`text-xl font-bold truncate ${is1st ? 'text-white' : 'text-slate-200'}`}>{user.name}</h3>
                <p className={`text-xs truncate uppercase tracking-widest font-bold ${type === 'geral' ? 'text-cyan-500' : 'text-fuchsia-500'}`}>{user.department}</p>
            </div>
            <div className={`text-3xl font-black ${type === 'geral' ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,0.6)]'}`}>
                {score}
            </div>
        </div>
    );
  };

  return (
     <div 
       className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-between p-12 cursor-pointer select-none overflow-hidden"
       onClick={onWakeUp}
     >
        {/* EFEITOS NEON DINÂMICOS NO FUNDO */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-60">
            <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-cyan-600/20 blur-[150px] rounded-full animate-[pulse_6s_ease-in-out_infinite] -translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 right-0 w-[1000px] h-[1000px] bg-fuchsia-600/20 blur-[150px] rounded-full animate-[pulse_8s_ease-in-out_infinite] translate-x-1/4 translate-y-1/4" />
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        {/* CABEÇALHO */}
        <div className="z-10 text-center mt-6 animate-in slide-in-from-top-10 duration-1000">
           <h1 className="text-[5.5rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)] tracking-tighter uppercase leading-none">
              TechWeek Arcade
           </h1>
           <p className="text-3xl text-slate-300 font-bold tracking-[0.5em] mt-4 uppercase drop-shadow-md">Hall da Fama</p>
        </div>

        {/* CONTAINER DOS RANKINGS */}
        <div className="z-10 flex gap-10 w-full max-w-7xl flex-1 items-stretch justify-center my-8">
           
           {/* LADO ESQUERDO: RANKING GERAL (CYAN) */}
           <div className="flex-1 bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-8 border-4 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-in slide-in-from-left-10 duration-1000 flex flex-col h-full justify-start">
              <div className="flex items-center justify-center gap-4 mb-6">
                 <Trophy size={40} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                 <h2 className="text-3xl font-black text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">Ranking Geral</h2>
              </div>
              <div className="flex flex-col gap-3 w-full">
                 {topGeneral.map((user, i) => renderRow(user, i, 'geral'))}
              </div>
           </div>

           {/* LADO DIREITO: RANKING DO DIA (FUCHSIA) */}
           <div className="flex-1 bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-8 border-4 border-fuchsia-500/30 shadow-[0_0_50px_rgba(232,121,249,0.2)] animate-in slide-in-from-right-10 duration-1000 flex flex-col h-full justify-start">
              <div className="flex items-center justify-center gap-4 mb-6">
                 <Flame size={40} className="text-fuchsia-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.8)]" />
                 <h2 className="text-3xl font-black text-fuchsia-400 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]">Ranking do Dia</h2>
              </div>
              <div className="flex flex-col gap-3 w-full">
                 {topDaily.map((user, i) => renderRow(user, i, 'diario'))}
              </div>
           </div>

        </div>

        {/* BOTÃO PROPORCIONAL COM LED DUPLO GIRATÓRIO */}
        <div className="z-20 mb-8 w-full max-w-md">
           <button className="relative rounded-full p-[4px] w-full overflow-hidden group bg-slate-900 transition-transform shadow-[0_0_40px_rgba(6,182,212,0.3)]">
              {/* Efeito LED: Duas cores (Ciano e Esmeralda) girando ao redor da borda */}
              <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0_90deg,#06b6d4_180deg,transparent_180deg_270deg,#10b981_360deg)] animate-[spin_3s_linear_infinite]" />
              
              <div className="relative bg-slate-900 rounded-full w-full h-full px-12 py-5 flex items-center justify-center gap-4 z-10 border border-slate-700/50">
                  <span className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 uppercase">
                     Toque para Jogar
                  </span>
                  <ChevronRight size={36} className="text-emerald-400 group-hover:translate-x-2 transition-transform" />
              </div>
           </button>
        </div>
     </div>
  );
}