import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../../core/store';
import { saveUserDB, saveMuralPhotoDB, getAllUsersDB } from '../../core/db';
import { Camera as CameraIcon, Check, RefreshCcw, ArrowLeft } from 'lucide-react';
import { playClick } from '../../core/audio';

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { loggedUsers, cameraConfig, setScreen, updateLoggedUser, gamesPlayedInSession, logoutUser } = useAppStore();
  const [photo, setPhoto] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const currentPlayer = loggedUsers[0];

  useEffect(() => {
    if (!cameraConfig) {
      setScreen('menu');
      return;
    }
    startCamera();
    return () => stopCamera();
  }, [cameraConfig, setScreen]);

  const startCamera = async () => {
    setPhoto(null);
    setCountdown(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Erro ao acessar a câmera: ", err);
      alert("Não foi possível acessar a câmera do Totem. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startCountdown = () => {
    playClick();
    setCountdown(3);
    
    let currentCount = 3;
    const interval = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);
      
      if (currentCount === 0) {
        clearInterval(interval);
        setTimeout(() => takePhoto(), 100);
      }
    }, 1000);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.translate(canvasRef.current.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        setPhoto(canvasRef.current.toDataURL('image/jpeg', 0.8));
        stopCamera();
      }
    }
  };

  const savePhoto = async () => {
    playClick();
    if (!photo || !cameraConfig) return;

    if (cameraConfig.mode === 'mural' && currentPlayer) {
      // SALVA NO BANCO DO MURAL
      await saveMuralPhotoDB({
        id: crypto.randomUUID(),
        userId: currentPlayer.id,
        userName: currentPlayer.name,
        photoBase64: photo,
        timestamp: Date.now()
      });
      
      // Se era o fim da sessão de 3 jogos e tirou a foto pro mural, desloga o usuário
      if (gamesPlayedInSession >= 3) {
        logoutUser(0);
        return; 
      }
    } 
    else if (cameraConfig.mode === 'profile') {
      // SALVA COMO FOTO DE PERFIL
      if (cameraConfig.targetUserId) {
         // O Admin está alterando a foto de alguém na aba de configurações
         const allUsers = await getAllUsersDB();
         const targetUser = allUsers.find(u => u.id === cameraConfig.targetUserId);
         if (targetUser) {
            targetUser.photoBase64 = photo;
            await saveUserDB(targetUser);
         }
      } else if (currentPlayer) {
         // O próprio usuário está tirando foto no primeiro acesso
         const updated = { ...currentPlayer, photoBase64: photo };
         await saveUserDB(updated);
         updateLoggedUser(updated); 
      }
    }
    setScreen(cameraConfig.returnScreen);
  };

  if (!cameraConfig) return null;

  const title = cameraConfig.mode === 'mural' ? 'Mural TechWeek' : 'Foto de Perfil';
  const subtitle = cameraConfig.mode === 'mural' 
    ? 'Registre sua reação após o jogo para o nosso mural interativo!' 
    : 'Sorria! Adicione um rosto ao seu nome no ranking.';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-900 relative p-12 animate-in fade-in duration-500">
      
      <button 
        onClick={() => {
          playClick();
          stopCamera();
          setScreen(cameraConfig.returnScreen);
        }} 
        className="absolute top-12 left-12 p-4 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95 z-50"
      >
        <ArrowLeft size={40} />
      </button>

      <div className="flex flex-col items-center w-full max-w-4xl">
        <h1 className="text-5xl font-black text-white mb-4">{title}</h1>
        <p className="text-2xl text-slate-400 mb-10 text-center">{subtitle}</p>

        <div className="relative w-full aspect-video bg-slate-800 border-4 border-slate-700 rounded-[3rem] overflow-hidden shadow-2xl flex justify-center items-center mb-10">
          {!photo ? (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover -scale-x-100" />
              {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in zoom-in duration-200">
                  <span className="text-[150px] font-black text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] animate-pulse">
                    {countdown}
                  </span>
                </div>
              )}
            </>
          ) : (
            <img src={photo} alt="Sua foto" className="w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-6 w-full justify-center">
          {!photo ? (
            <button 
              onClick={startCountdown} 
              disabled={countdown !== null}
              className="flex items-center gap-4 px-12 py-6 bg-cyan-500 hover:bg-cyan-400 text-white text-3xl font-bold rounded-full transition-all active:scale-95 shadow-[0_0_40px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:active:scale-100"
            >
              <CameraIcon size={36} /> Capturar Foto
            </button>
          ) : (
            <>
              <button onClick={() => { playClick(); startCamera(); }} className="flex items-center gap-3 px-10 py-5 bg-slate-700 hover:bg-slate-600 text-white text-2xl font-bold rounded-full transition-all active:scale-95">
                <RefreshCcw size={28} /> Tirar Outra
              </button>
              <button onClick={savePhoto} className="flex items-center gap-3 px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-white text-2xl font-bold rounded-full transition-all active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                <Check size={32} /> Salvar Foto
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}