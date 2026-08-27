import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../core/store';
import type { User } from '../../core/store';
import { getAllUsersDB, getAllMuralPhotosDB, saveMuralPhotoDB } from '../../core/db';
import type { MuralPhoto } from '../../core/db';
import { Trophy, Calendar, ArrowLeft, Heart, ThumbsUp, SkipForward } from 'lucide-react';
import { playClick } from '../../core/audio';

interface MuralPhotoWithReactions extends MuralPhoto {
  reactions?: {
    heart: number;
    like: number;
    party: number;
    cat: number;
    cool: number;
  }
}

export default function Ranking() {
  // NOVO: Puxando o activeRankingTab para dividir as telas!
  const { setScreen, activeRankingTab } = useAppStore();
  const [rankingMode, setRankingMode] = useState<'geral' | 'diario'>('geral');
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toDateString());

  const [muralFotos, setMuralFotos] = useState<MuralPhotoWithReactions[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    getAllUsersDB().then(setUsers).catch(console.error);
    
    getAllMuralPhotosDB().then((photos) => {
      if (photos.length > 0) {
        const sorted = [...photos].sort((a, b) => b.timestamp - a.timestamp);
        const newest = sorted[0];
        const others = sorted.slice(1).sort(() => Math.random() - 0.5);
        setMuralFotos([newest, ...others]);
      }
    }).catch(console.error);
  }, []);

  const rankingGeral = useMemo(() => {
    return [...users].sort((a, b) => b.scoreGeral - a.scoreGeral).filter(u => u.scoreGeral > 0);
  }, [users]);

  const rankingDiario = useMemo(() => {
    return [...users]
      .map(u => ({
        ...u,
        pontosNesteDia: u.scoreHistory?.[selectedDate] || 0 
      }))
      .filter(u => u.pontosNesteDia > 0)
      .sort((a, b) => b.pontosNesteDia - a.pontosNesteDia);
  }, [users, selectedDate]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    });
  }, []);

  const handleReaction = async (reactionType: 'heart' | 'like' | 'party' | 'cat' | 'cool') => {
    playClick();
    const currentPhoto = muralFotos[currentPhotoIndex];
    if (!currentPhoto) return;

    const updatedPhoto = { ...currentPhoto };
    if (!updatedPhoto.reactions) {
      updatedPhoto.reactions = { heart: 0, like: 0, party: 0, cat: 0, cool: 0 };
    }
    updatedPhoto.reactions[reactionType] += 1;

    const novaLista = [...muralFotos];
    novaLista[currentPhotoIndex] = updatedPhoto;
    setMuralFotos(novaLista);
    
    await saveMuralPhotoDB(updatedPhoto);
    handleNextPhoto();
  };

  const handleNextPhoto = () => {
    playClick();
    if (currentPhotoIndex < muralFotos.length - 1) {
      setCurrentPhotoIndex(i => i + 1);
    } else {
      setCurrentPhotoIndex(0); 
    }
  };

  const renderRankingList = (lista: any[], tipo: 'geral' | 'diario') => {
    if (lista.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full mt-20 animate-in fade-in">
          <p className="text-slate-500 text-3xl font-bold mb-2">Nenhum ponto registrado</p>
          <p className="text-slate-600 text-xl">
            {tipo === 'diario' ? 'Nesta data, os servidores estavam em paz.' : 'Ainda não há competidores na tabela.'}
          </p>
        </div>
      );
    }

    const top3 = lista.slice(0, 3);
    const restantes = lista.slice(3, 10);
    const getScore = (u: any) => tipo === 'geral' ? u.scoreGeral : u.pontosNesteDia;

    return (
      <div className="flex flex-col w-full h-full animate-in fade-in duration-500">
        <div className="flex items-end justify-center gap-6 mb-12 mt-16">
          {top3[1] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="w-20 h-20 bg-slate-700 rounded-full border-4 border-slate-400 overflow-hidden mb-4 z-10 aspect-square flex-shrink-0">
                {top3[1].photoBase64 ? <img src={top3[1].photoBase64} className="w-full h-full object-cover object-top" /> : <span className="flex items-center justify-center w-full h-full text-2xl font-bold text-slate-400">{top3[1].name.substring(0,2)}</span>}
              </div>
              <div className="bg-slate-300 w-32 h-32 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-lg">
                <span className="text-4xl font-black text-slate-500">2º</span>
                <span className="font-bold text-slate-700 truncate w-28 text-center mt-2">{top3[1].name}</span>
                <span className="text-sm font-black text-slate-600">{getScore(top3[1])} pts</span>
              </div>
            </div>
          )}

          {top3[0] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-12 duration-700 relative">
              <Trophy size={50} className="text-amber-400 absolute -top-14 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] z-20" />
              <div className="w-28 h-28 aspect-square flex-shrink-0 bg-slate-700 rounded-full border-4 border-amber-400 overflow-hidden mb-4 z-10 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                {top3[0].photoBase64 ? <img src={top3[0].photoBase64} className="w-full h-full object-cover object-top" /> : <span className="flex items-center justify-center w-full h-full text-3xl font-bold text-amber-400">{top3[0].name.substring(0,2)}</span>}
              </div>
              <div className="bg-gradient-to-t from-amber-500 to-amber-300 w-40 h-44 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-2xl">
                <span className="text-6xl font-black text-amber-700">1º</span>
                <span className="font-bold text-amber-900 truncate w-36 text-center mt-2 text-lg">{top3[0].name}</span>
                <span className="text-md font-black text-amber-800">{getScore(top3[0])} pts</span>
              </div>
            </div>
          )}

          {top3[2] && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="w-20 h-20 bg-slate-700 rounded-full border-4 border-amber-700 overflow-hidden mb-4 z-10 aspect-square flex-shrink-0">
                {top3[2].photoBase64 ? <img src={top3[2].photoBase64} className="w-full h-full object-cover object-top" /> : <span className="flex items-center justify-center w-full h-full text-2xl font-bold text-amber-700">{top3[2].name.substring(0,2)}</span>}
              </div>
              <div className="bg-amber-800 w-32 h-24 rounded-t-2xl flex flex-col items-center justify-start pt-2 shadow-lg">
                <span className="text-3xl font-black text-amber-500">3º</span>
                <span className="font-bold text-amber-300 truncate w-28 text-center mt-1">{top3[2].name}</span>
                <span className="text-sm font-black text-amber-400">{getScore(top3[2])} pts</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-3xl mx-auto flex-1 overflow-y-auto custom-scrollbar pr-4 pb-32">
          {restantes.map((user, index) => (
            <div key={user.id} className="flex items-center bg-slate-800/80 p-4 rounded-2xl border border-slate-700 hover:border-slate-500 transition-colors">
              <span className="text-2xl font-black text-slate-500 w-12 text-center">{index + 4}º</span>
              <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden mx-4 aspect-square flex-shrink-0">
                {user.photoBase64 ? <img src={user.photoBase64} className="w-full h-full object-cover object-top" /> : <span className="flex items-center justify-center w-full h-full font-bold text-slate-400">{user.name.substring(0,2)}</span>}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xl font-bold text-white truncate">{user.name}</p>
                <p className="text-slate-400 text-sm truncate uppercase tracking-wider">{user.department}</p>
              </div>
              <div className="text-2xl font-black text-cyan-400">
                {getScore(user)} <span className="text-sm font-normal text-slate-500">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const currentPhoto = muralFotos[currentPhotoIndex];
  const currentReacts = currentPhoto?.reactions || { heart: 0, like: 0, party: 0, cat: 0, cool: 0 };

  return (
    <div className="flex flex-col items-center w-full h-full bg-slate-900 relative pt-12 px-12 overflow-hidden">
      
      <button 
        onClick={() => { playClick(); setScreen('welcome'); }} 
        className="absolute top-12 left-12 p-4 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95 z-50 shadow-lg"
      >
        <ArrowLeft size={40} />
      </button>

      <div className="w-full max-w-5xl flex flex-col items-center mb-8 z-10">
        
        {/* TÍTULO DINÂMICO BASEADO NA ABA ESCOLHIDA */}
        <h1 className="text-6xl font-black text-white mb-8 tracking-tight drop-shadow-md">
          {activeRankingTab === 'mural' ? (
            <>Mural de <span className="text-emerald-400">Fotos</span></>
          ) : (
            <>TechWeek <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Ranking</span></>
          )}
        </h1>

        {/* SELETOR MOSTRADO APENAS SE FOR RANKING */}
        {activeRankingTab === 'ranking' && (
          <div className="flex bg-slate-800 p-2 rounded-2xl border-2 border-slate-700 shadow-xl mb-6">
            <button 
              onClick={() => { playClick(); setRankingMode('geral'); }}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl text-xl font-bold transition-all ${rankingMode === 'geral' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Trophy size={24} /> Ranking Geral
            </button>
            <button 
              onClick={() => { playClick(); setRankingMode('diario'); }}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl text-xl font-bold transition-all ${rankingMode === 'diario' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Calendar size={24} /> Ranking Diário
            </button>
          </div>
        )}

        {/* SELETOR DE DATA (Visível apenas no Ranking Diário) */}
        {activeRankingTab === 'ranking' && rankingMode === 'diario' && (
          <div className="flex gap-3 max-w-full overflow-x-auto custom-scrollbar pb-4 pt-2 px-2 animate-in slide-in-from-top-4">
            {last7Days.map((date, i) => {
              const dateStr = date.toDateString();
              const isSelected = selectedDate === dateStr;
              
              let label = '';
              if (i === 0) label = 'Hoje';
              else if (i === 1) label = 'Ontem';
              else label = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).replace('.', '');

              return (
                <button 
                  key={dateStr}
                  onClick={() => { playClick(); setSelectedDate(dateStr); }}
                  className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 border-2 ${
                    isSelected 
                      ? 'bg-amber-500 border-amber-400 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-1 w-full flex flex-col items-center overflow-hidden">
        {activeRankingTab === 'ranking' && rankingMode === 'geral' && renderRankingList(rankingGeral, 'geral')}
        {activeRankingTab === 'ranking' && rankingMode === 'diario' && renderRankingList(rankingDiario, 'diario')}
        
        {activeRankingTab === 'mural' && (
          <div className="w-full flex-1 flex flex-col items-center justify-center animate-in fade-in pb-12">
            {muralFotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-20">
                <p className="text-slate-500 text-3xl font-bold mb-2">Mural Vazio</p>
                <p className="text-slate-600 text-xl">Vá jogar e registre seu sorriso para aparecer aqui!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full max-w-5xl">
                
                <div className="relative w-full aspect-video bg-slate-900 rounded-[2.5rem] p-3 border-[6px] border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                  <div className="w-full h-full border-4 border-cyan-400 rounded-3xl overflow-hidden relative shadow-inner bg-slate-800 flex items-center justify-center">
                    
                    {currentPhoto && (
                      <>
                        <img 
                          key={currentPhoto.id}
                          src={currentPhoto.photoBase64} 
                          alt="Foto Mural" 
                          className="w-full h-full object-cover animate-in zoom-in-95 duration-500" 
                        />
                        
                        <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-700 shadow-xl">
                          <p className="text-white font-black text-2xl drop-shadow-md">
                            {currentPhoto.userName}
                          </p>
                          <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase">
                            {new Date(currentPhoto.timestamp).toLocaleDateString()}
                          </p>
                        </div>

                        {/* OVERLAY DE REAÇÕES SEGURO */}
                        <div className="absolute top-6 right-6 flex flex-col gap-2 items-end z-30">
                          {currentReacts.heart > 0 && (
                            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full text-white font-bold text-xl flex items-center gap-2 shadow-lg animate-in slide-in-from-right">
                              <Heart size={20} className="text-rose-500" fill="currentColor" /> {currentReacts.heart}
                            </div>
                          )}
                          {currentReacts.like > 0 && (
                            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full text-white font-bold text-xl flex items-center gap-2 shadow-lg animate-in slide-in-from-right">
                              <ThumbsUp size={20} className="text-blue-500" fill="currentColor" /> {currentReacts.like}
                            </div>
                          )}
                          {currentReacts.party > 0 && (
                            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full text-white font-bold text-xl flex items-center gap-2 shadow-lg animate-in slide-in-from-right">
                              🎉 {currentReacts.party}
                            </div>
                          )}
                          {currentReacts.cat > 0 && (
                            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full text-white font-bold text-xl flex items-center gap-2 shadow-lg animate-in slide-in-from-right">
                              😻 {currentReacts.cat}
                            </div>
                          )}
                          {currentReacts.cool > 0 && (
                            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full text-white font-bold text-xl flex items-center gap-2 shadow-lg animate-in slide-in-from-right">
                              😎 {currentReacts.cool}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                  </div>
                </div>

                <div className="flex items-center gap-6 mt-12 bg-slate-800 p-4 rounded-full border-2 border-slate-700 shadow-2xl">
                  <button onClick={() => handleReaction('heart')} className="p-4 bg-slate-900 hover:bg-rose-500/20 rounded-full border border-slate-700 hover:border-rose-500 transition-all active:scale-90 group relative">
                    <Heart size={36} className="text-rose-500" fill="currentColor" />
                  </button>
                  <button onClick={() => handleReaction('like')} className="p-4 bg-slate-900 hover:bg-blue-500/20 rounded-full border border-slate-700 hover:border-blue-500 transition-all active:scale-90 group">
                    <ThumbsUp size={36} className="text-blue-500" fill="currentColor" />
                  </button>
                  <button onClick={() => handleReaction('party')} className="p-4 bg-slate-900 hover:bg-emerald-500/20 rounded-full border border-slate-700 hover:border-emerald-500 transition-all active:scale-90 group text-4xl">
                    🎉
                  </button>
                  <button onClick={() => handleReaction('cat')} className="p-4 bg-slate-900 hover:bg-amber-500/20 rounded-full border border-slate-700 hover:border-amber-500 transition-all active:scale-90 group text-4xl">
                    😻
                  </button>
                  <button onClick={() => handleReaction('cool')} className="p-4 bg-slate-900 hover:bg-purple-500/20 rounded-full border border-slate-700 hover:border-purple-500 transition-all active:scale-90 group text-4xl">
                    😎
                  </button>

                  <div className="w-[2px] h-12 bg-slate-700 mx-2" /> 

                  <button 
                    onClick={handleNextPhoto}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold text-xl transition-all active:scale-95"
                  >
                    Pular <SkipForward size={24} />
                  </button>
                </div>
                
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}