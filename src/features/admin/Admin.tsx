import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../core/store';
import { getAllUsersDB, deleteUserDB, saveUserDB, getAllMuralPhotosDB, deleteMuralPhotoDB } from '../../core/db';
import type { User } from '../../core/store';
import type { MuralPhoto } from '../../core/db';
import { ArrowLeft, Trash2, ImageMinus, Search, ShieldAlert, Users, Camera, Delete, Check, Lock, BarChart3, Trophy, Heart, ThumbsUp, RotateCcw, LayoutGrid, X } from 'lucide-react';
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

export default function Admin() {
  const { setScreen, openCamera } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [photos, setPhotos] = useState<MuralPhotoWithReactions[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [typedPassword, setTypedPassword] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  // NOVO: Adicionado a aba 'gallery' para Gerenciar Mural
  const [activeTab, setActiveTab] = useState<'users' | 'stats' | 'gallery'>('users');
  
  // NOVO: Estado para controlar a foto ampliada e ver detalhes das reações
  const [selectedPhoto, setSelectedPhoto] = useState<MuralPhotoWithReactions | null>(null);

  const loadData = async () => {
    try {
      const usersData = await getAllUsersDB();
      setUsers(usersData);
      const photosData = await getAllMuralPhotosDB();
      setPhotos(photosData);
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
    playClick();
    if (typedPassword.length < 6) {
      setTypedPassword(prev => prev + n.toString());
    }
  };

  const handleBackspace = () => {
    playClick();
    setTypedPassword(prev => prev.slice(0, -1));
  };

  const handleLogin = () => {
    playClick();
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

  const handleDeleteMuralPhoto = async (photoId: string) => {
    if (window.confirm('Tem certeza que deseja EXCLUIR esta foto do mural? Essa ação não pode ser desfeita.')) {
      await deleteMuralPhotoDB(photoId);
      if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
      loadData();
    }
  };

  const photoStats = useMemo(() => {
    return photos.map(p => {
      const r = p.reactions || { heart: 0, like: 0, party: 0, cat: 0, cool: 0 };
      const total = r.heart + r.like + r.party + r.cat + r.cool;
      return { ...p, totalReactions: total };
    }).sort((a, b) => b.totalReactions - a.totalReactions); 
  }, [photos]);

  const top3Photos = photoStats.slice(0, 3);
  const remainingPhotos = photoStats.slice(3, 10);

  const p1 = top3Photos[0];
  const p2 = top3Photos[1];
  const p3 = top3Photos[2];

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 relative animate-in fade-in duration-500">
        <button onClick={() => { playClick(); setScreen('welcome'); }} className="absolute top-12 left-12 p-4 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95">
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
      
      {/* MODAL DE FOTO AMPLIADA COM REAÇÕES */}
      {selectedPhoto && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-12 animate-in fade-in zoom-in-95 duration-300">
          
          <button 
            onClick={() => setSelectedPhoto(null)} 
            className="absolute top-12 right-12 p-4 bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500 rounded-full transition-colors"
          >
            <X size={40} />
          </button>

          <h2 className="text-4xl font-black text-white mb-2">{selectedPhoto.userName}</h2>
          <p className="text-slate-400 mb-8">{new Date(selectedPhoto.timestamp).toLocaleString()}</p>

          <img 
            src={selectedPhoto.photoBase64} 
            className="w-full max-w-3xl max-h-[50vh] object-contain rounded-3xl border-4 border-slate-700 shadow-2xl mb-12 bg-black/50" 
          />

          <h3 className="text-2xl font-bold text-slate-300 mb-6 uppercase tracking-widest">Detalhe de Reações</h3>
          
          <div className="flex gap-6">
            <div className="flex flex-col items-center bg-slate-800 border-2 border-slate-700 p-6 rounded-3xl min-w-[100px]">
              <Heart size={40} className="text-rose-500 mb-4" fill="currentColor" />
              <span className="text-3xl font-black text-white">{selectedPhoto.reactions?.heart || 0}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-800 border-2 border-slate-700 p-6 rounded-3xl min-w-[100px]">
              <ThumbsUp size={40} className="text-blue-500 mb-4" fill="currentColor" />
              <span className="text-3xl font-black text-white">{selectedPhoto.reactions?.like || 0}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-800 border-2 border-slate-700 p-6 rounded-3xl min-w-[100px]">
              <span className="text-4xl mb-4">🎉</span>
              <span className="text-3xl font-black text-white">{selectedPhoto.reactions?.party || 0}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-800 border-2 border-slate-700 p-6 rounded-3xl min-w-[100px]">
              <span className="text-4xl mb-4">😻</span>
              <span className="text-3xl font-black text-white">{selectedPhoto.reactions?.cat || 0}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-800 border-2 border-slate-700 p-6 rounded-3xl min-w-[100px]">
              <span className="text-4xl mb-4">😎</span>
              <span className="text-3xl font-black text-white">{selectedPhoto.reactions?.cool || 0}</span>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => { playClick(); setScreen('welcome'); }} 
        className="absolute top-12 left-12 p-4 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95 z-50"
      >
        <ArrowLeft size={40} />
      </button>

      <div className="w-full max-w-7xl flex flex-col h-full z-10">
        
        <header className="flex flex-col items-center mb-8 text-center mt-4">
          <div className="bg-rose-500/20 p-6 rounded-full mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <ShieldAlert size={64} className="text-rose-500" />
          </div>
          <h1 className="text-5xl font-black text-white mb-2">Painel de Controle</h1>
          <p className="text-xl text-slate-400">Gerenciamento e Estatísticas da TechWeek</p>
        </header>

        <div className="flex gap-4 bg-slate-800 p-2 rounded-2xl border-2 border-slate-700 shadow-xl mb-8 self-center">
          <button 
            onClick={() => { playClick(); setActiveTab('users'); }}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-lg font-bold transition-all ${activeTab === 'users' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Users size={20} /> Participantes
          </button>
          <button 
            onClick={() => { playClick(); setActiveTab('stats'); }}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-lg font-bold transition-all ${activeTab === 'stats' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <BarChart3 size={20} /> Estatísticas
          </button>
          <button 
            onClick={() => { playClick(); setActiveTab('gallery'); }}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-lg font-bold transition-all ${activeTab === 'gallery' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutGrid size={20} /> Gerenciar Mural
          </button>
        </div>

        {/* =========================================
            ABA: PARTICIPANTES 
        ========================================= */}
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
              <div className="bg-slate-900 px-6 py-2 rounded-2xl flex items-center gap-3 text-cyan-400 font-bold border border-slate-700">
                <Users size={24} />
                <span className="text-xl">{filteredUsers.length} Cadastros</span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-800 border-2 border-slate-700 rounded-3xl flex flex-col pb-12">
              <div className="grid grid-cols-12 gap-4 p-6 border-b-2 border-slate-700 font-bold text-slate-400 uppercase tracking-wider items-center">
                <div className="col-span-2 text-center">Foto</div>
                <div className="col-span-4 pl-4">Nome do Participante</div>
                <div className="col-span-2 text-center">Setor</div>
                <div className="col-span-2 text-center">Pontos</div>
                <div className="col-span-2 text-center">Ações</div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center text-slate-500 text-2xl mt-12">Nenhum participante encontrado.</div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors rounded-2xl">
                      <div className="col-span-2 flex justify-center">
                        {user.photoBase64 ? (
                          <img src={user.photoBase64} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500 object-top" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 font-bold text-xl">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="col-span-4 font-bold text-white text-2xl truncate pl-4">{user.name}</div>
                      <div className="col-span-2 text-center text-slate-300 text-lg">{user.department}</div>
                      <div className="col-span-2 text-center font-black text-cyan-400 text-2xl">{user.scoreGeral}</div>
                      
                      <div className="col-span-2 flex justify-center gap-2">
                        <button 
                          onClick={() => openCamera({ mode: 'profile', targetUserId: user.id, returnScreen: 'admin' })}
                          className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-xl font-bold transition-all"
                          title={user.photoBase64 ? "Trocar Foto" : "Adicionar Foto"}
                        >
                          <Camera size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeletePhoto(user)}
                          disabled={!user.photoBase64}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition-all ${user.photoBase64 ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}
                          title="Apagar Foto"
                        >
                          <ImageMinus size={18} />
                        </button>
                        <button 
                          onClick={() => handleResetScore(user)}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white rounded-xl font-bold transition-all"
                          title="Zerar Pontuação"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="flex items-center gap-2 px-3 py-2 bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition-all"
                          title="Apagar Usuário"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* =========================================
            ABA: ESTATÍSTICAS (PÓDIO CLICÁVEL)
        ========================================= */}
        {activeTab === 'stats' && (
          <div className="flex-1 w-full flex flex-col items-center overflow-y-auto custom-scrollbar pb-12 animate-in fade-in">
            {photoStats.length === 0 ? (
              <div className="text-center text-slate-500 text-2xl mt-12">Nenhuma estatística disponível no momento.</div>
            ) : (
              <>
                <p className="text-slate-400 mb-8 mt-4 text-xl">Toque em qualquer foto para ver os detalhes das reações.</p>
                
                {/* PÓDIO CORRIGIDO - Estilo semelhante ao Ranking */}
                <div className="flex items-end justify-center gap-8 mb-16 mt-8">
                  
                  {/* 2º LUGAR */}
                  {p2 && p2.totalReactions > 0 && (
                    <div 
                      onClick={() => { playClick(); setSelectedPhoto(p2); }}
                      className="flex flex-col items-center cursor-pointer hover:-translate-y-2 transition-transform group"
                    >
                      <div className="w-24 h-24 bg-slate-700 rounded-full border-4 border-slate-400 overflow-hidden mb-4 z-10 aspect-square shadow-lg">
                        <img src={p2.photoBase64} className="w-full h-full object-cover" />
                      </div>
                      <div className="bg-slate-800 border-2 border-slate-600 w-40 h-32 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-lg group-hover:border-slate-400 transition-colors">
                        <span className="text-3xl font-black text-slate-400 mb-1">2º Lugar</span>
                        <span className="font-bold text-white truncate w-36 text-center">{p2.userName}</span>
                        <span className="text-sm font-black text-slate-400 bg-slate-900 px-3 py-1 rounded-full mt-2 border border-slate-700">
                          {p2.totalReactions} Reações
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 1º LUGAR */}
                  {p1 && p1.totalReactions > 0 && (
                    <div 
                      onClick={() => { playClick(); setSelectedPhoto(p1); }}
                      className="flex flex-col items-center relative cursor-pointer hover:-translate-y-2 transition-transform group"
                    >
                      <Trophy size={56} className="text-amber-400 absolute -top-16 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] z-20" />
                      <div className="w-32 h-32 aspect-square bg-slate-700 rounded-full border-4 border-amber-400 overflow-hidden mb-4 z-10 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                        <img src={p1.photoBase64} className="w-full h-full object-cover" />
                      </div>
                      <div className="bg-gradient-to-t from-amber-600/20 to-transparent border-t-2 border-l-2 border-r-2 border-amber-500 w-48 h-40 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-2xl group-hover:bg-amber-600/30 transition-colors">
                        <span className="text-4xl font-black text-amber-500 mb-1">1º Lugar</span>
                        <span className="font-bold text-white truncate w-44 text-center text-lg">{p1.userName}</span>
                        <span className="text-base font-black text-amber-400 bg-slate-900 px-4 py-1.5 rounded-full mt-2 border border-amber-500/50 shadow-lg">
                          {p1.totalReactions} Reações
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 3º LUGAR */}
                  {p3 && p3.totalReactions > 0 && (
                    <div 
                      onClick={() => { playClick(); setSelectedPhoto(p3); }}
                      className="flex flex-col items-center cursor-pointer hover:-translate-y-2 transition-transform group"
                    >
                      <div className="w-24 h-24 bg-slate-700 rounded-full border-4 border-amber-700 overflow-hidden mb-4 z-10 aspect-square shadow-lg">
                        <img src={p3.photoBase64} className="w-full h-full object-cover" />
                      </div>
                      <div className="bg-slate-800 border-2 border-amber-900 w-40 h-28 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-lg group-hover:border-amber-700 transition-colors">
                        <span className="text-2xl font-black text-amber-700 mb-1">3º Lugar</span>
                        <span className="font-bold text-white truncate w-36 text-center">{p3.userName}</span>
                        <span className="text-sm font-black text-amber-600 bg-slate-900 px-3 py-1 rounded-full mt-2 border border-slate-800">
                          {p3.totalReactions} Reações
                        </span>
                      </div>
                    </div>
                  )}

                </div>

                <div className="w-full bg-slate-800 rounded-3xl p-8 border-2 border-slate-700">
                  <h3 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Demais Fotos com Reações</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {remainingPhotos.filter(p => p.totalReactions > 0).map(photo => {
                      return (
                        <div 
                          key={photo.id} 
                          onClick={() => { playClick(); setSelectedPhoto(photo); }}
                          className="flex gap-4 items-center bg-slate-900 p-4 rounded-2xl border border-slate-700 hover:border-purple-500 cursor-pointer transition-colors active:scale-95"
                        >
                          <img src={photo.photoBase64} className="w-20 h-20 rounded-xl object-cover border border-slate-600" />
                          <div className="flex flex-col flex-1">
                            <span className="text-white font-bold truncate text-lg">{photo.userName}</span>
                            <span className="text-purple-400 font-bold mb-1">{photo.totalReactions} reações no total</span>
                            <span className="text-slate-500 text-xs">Toque para ver detalhes</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* =========================================
            ABA: GERENCIAR MURAL (TODAS AS FOTOS)
        ========================================= */}
        {activeTab === 'gallery' && (
          <div className="flex-1 w-full overflow-y-auto custom-scrollbar pb-12 animate-in fade-in">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
              {photos.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 text-2xl mt-12">O mural está vazio.</div>
              ) : (
                photos.sort((a, b) => b.timestamp - a.timestamp).map(photo => (
                  <div key={photo.id} className="bg-slate-800 p-4 rounded-[2rem] border-2 border-slate-700 flex flex-col group hover:border-slate-500 transition-colors">
                    <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 relative">
                      <img src={photo.photoBase64} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold border border-white/10">
                        {photo.reactions ? (photo.reactions.heart + photo.reactions.like + photo.reactions.party + photo.reactions.cat + photo.reactions.cool) : 0} Reações
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-white truncate text-lg">{photo.userName}</span>
                        <span className="text-sm text-slate-400">{new Date(photo.timestamp).toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteMuralPhoto(photo.id)}
                        className="p-3 bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shrink-0 active:scale-90"
                        title="Excluir Foto"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}