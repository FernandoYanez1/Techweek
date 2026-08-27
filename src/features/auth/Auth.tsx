import { useState } from 'react';
import { useAppStore } from '../../core/store';
import { ArrowLeft, UserCircle2, CheckCircle2, Users } from 'lucide-react';
import { GAME_REGISTRY } from '../../core/GameRegistry';

export default function Auth() {
  const { setScreen, loginUser, activeGameId } = useAppStore(); // <-- ATUALIZADO
  
  const gameConfig = GAME_REGISTRY.find(g => g.id === activeGameId);
  const isMultiplayerAllowed = (gameConfig?.maxPlayers || 1) > 1;

  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');

  const handleStart = () => {
    if (name1.trim().length === 0) return;
    if (isMultiplayer && name2.trim().length === 0) return;

    // Login mockado (falso) para não quebrar o sistema enquanto não temos o BD
    loginUser({ id: crypto.randomUUID(), name: name1.trim(), department: 'Geral', scoreGeral: 0, scoreDiario: 0, lastPlayed: Date.now() }, 0);
    
    if (isMultiplayer) {
      loginUser({ id: crypto.randomUUID(), name: name2.trim(), department: 'Geral', scoreGeral: 0, scoreDiario: 0, lastPlayed: Date.now() }, 1);
    }

    setScreen('playing');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 relative p-12 animate-in slide-in-from-right duration-500">
      <button onClick={() => setScreen('menu')} className="absolute top-12 left-12 p-4 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95">
        <ArrowLeft size={40} />
      </button>

      <div className="max-w-2xl w-full flex flex-col items-center">
        <div className="bg-cyan-500/10 p-8 rounded-full mb-6 border border-cyan-500/20">
          {isMultiplayer ? <Users size={100} className="text-cyan-400" /> : <UserCircle2 size={100} className="text-cyan-400" />}
        </div>
        
        <h1 className="text-5xl font-black text-white mb-4 text-center">Identificação Temporária</h1>
        
        {isMultiplayerAllowed && (
          <div className="flex gap-4 mb-8 bg-slate-800 p-2 rounded-2xl mt-4">
            <button onClick={() => setIsMultiplayer(false)} className={`px-8 py-4 rounded-xl text-xl font-bold transition-all ${!isMultiplayer ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>1 Jogador</button>
            <button onClick={() => setIsMultiplayer(true)} className={`px-8 py-4 rounded-xl text-xl font-bold transition-all ${isMultiplayer ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>2 Jogadores</button>
          </div>
        )}

        <div className="w-full flex flex-col gap-4 mb-12">
          <input type="text" placeholder={isMultiplayer ? "Nome do Jogador 1 (DEV)" : "Como devemos te chamar?"} value={name1} onChange={(e) => setName1(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 text-white text-3xl p-6 rounded-2xl outline-none focus:border-cyan-500 text-center" />
          {isMultiplayer && (
            <input type="text" placeholder="Nome do Jogador 2 (BUG)" value={name2} onChange={(e) => setName2(e.target.value)} className="w-full bg-slate-800 border-2 border-slate-700 text-white text-3xl p-6 rounded-2xl outline-none focus:border-rose-500 text-center animate-in zoom-in" />
          )}
        </div>

        <button onClick={handleStart} disabled={name1.trim().length === 0 || (isMultiplayer && name2.trim().length === 0)} className="flex items-center justify-center gap-4 w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-600 disabled:from-slate-700 text-white text-3xl font-bold rounded-2xl transition-all">
          <CheckCircle2 size={36} /> Continuar
        </button>
      </div>
    </div>
  );
}