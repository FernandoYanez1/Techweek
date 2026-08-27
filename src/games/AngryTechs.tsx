import { useState, useEffect } from 'react';
import { useAppStore } from '../core/store';
import { MAX_SCORES } from '../core/GameRegistry';
import { playClick, playSuccess, playError } from '../core/audio';
import { Target, Server, SendHorizontal, ArrowRight, ShieldAlert, Wifi } from 'lucide-react';

export default function AngryTechs() {
  const { endGame, activeDifficulty } = useAppStore();

  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(50);
  const [attempts, setAttempts] = useState(3);
  
  const [status, setStatus] = useState<'idle' | 'firing' | 'hit' | 'miss'>('idle');
  const [won, setWon] = useState(false);
  const [projectilePos, setProjectilePos] = useState({ x: 0, y: 0 });

  // A janela ideal do tiro (Força entre 70 e 80, Ângulo entre 35 e 45)
  const targetAngle = { min: 35, max: 45 };
  const targetPower = { min: 70, max: 80 };

  useEffect(() => {
    if (status === 'firing') {
      let time = 0;
      // Converte ângulo para radianos
      const theta = (angle * Math.PI) / 180;
      // Multiplicador visual da força
      const v0 = power * 1.5; 

      const interval = setInterval(() => {
        time += 0.1; // Delta T acelerado
        // Física Básica: X constante, Y usa gravidade
        const x = v0 * Math.cos(theta) * time;
        const y = (v0 * Math.sin(theta) * time) - (0.5 * 9.8 * time * time);

        setProjectilePos({ x, y });

        // Verificação de Impacto Visual
        // Se a posição da bolinha passar da barreira no eixo X (uns 500px na tela)
        if (x > 500) {
          clearInterval(interval);
          
          // Checa se a força e angulo batiam no ponto fraco
          const hitTarget = 
            angle >= targetAngle.min && angle <= targetAngle.max &&
            power >= targetPower.min && power <= targetPower.max;

          if (hitTarget) {
            setStatus('hit');
            setWon(true);
            playSuccess();
          } else {
            setStatus('miss');
            playError();
          }
        }
        
        // Bateu no chão antes
        if (y < -50 && x <= 500) {
          clearInterval(interval);
          setStatus('miss');
          playError();
        }

      }, 16);

      return () => clearInterval(interval);
    }
  }, [status, angle, power]);

  const handleFire = () => {
    if (status !== 'idle' || attempts <= 0) return;
    playClick();
    setAttempts(a => a - 1);
    setStatus('firing');
  };

  const resetRound = () => {
    playClick();
    if (attempts <= 0 && !won) {
      concludeGame();
    } else {
      setStatus('idle');
      setProjectilePos({ x: 0, y: 0 });
    }
  };

  const concludeGame = () => {
    playClick();
    const maxPts = MAX_SCORES['angry-techs'][activeDifficulty || 'INICIANTE'] || 60;
    // Se ganhou na primeira, maxPts. Na segunda, 80%. Na terceira 60%.
    const pts = won ? Math.round(maxPts * (0.6 + ((attempts) * 0.2))) : 0;
    endGame([pts]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl p-8 relative">
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-800 border-2 border-slate-700 px-10 py-3 rounded-full text-xl font-bold text-slate-300 shadow-xl z-50">
        Pacotes Restantes: <strong className={attempts > 0 ? 'text-emerald-400' : 'text-rose-500'}>{attempts}</strong>
      </div>

      <div className="text-center mb-6 mt-4">
        <h1 className="text-5xl font-black text-white mb-2 flex items-center justify-center gap-4">
          <Target size={40} className="text-rose-500" /> Angry Techs
        </h1>
        <p className="text-xl text-slate-400">Ajuste o ângulo e a força para destruir o Firewall.</p>
      </div>

      <div className="flex flex-col items-center w-full gap-8 bg-slate-800 p-8 rounded-[3rem] border-2 border-slate-700 shadow-2xl">
        
        {/* ÁREA DO JOGO (VISUAL) */}
        <div className="w-full h-64 bg-slate-900 border-4 border-slate-700 rounded-3xl relative overflow-hidden flex items-end">
          
          {/* Estilingue e Pacote */}
          <div className="absolute bottom-4 left-16 z-20">
            <Server size={64} className="text-slate-600 absolute bottom-0 -left-6" />
            
            {/* O Projétil que voa */}
            {status !== 'idle' && (
              <div 
                className="absolute w-8 h-8 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,1)] z-30"
                style={{ 
                  left: projectilePos.x, 
                  bottom: projectilePos.y + 40, // +40 do tamanho do servidor base
                  transition: 'none'
                }}
              >
                <Wifi size={32} className="text-slate-900 absolute -top-1 -left-1" />
              </div>
            )}
            
            {/* O Projétil na base quando parado */}
            {status === 'idle' && (
              <div className="absolute -top-4 -left-2 w-8 h-8 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,1)] z-30">
                <Wifi size={32} className="text-slate-900 absolute -top-1 -left-1" />
              </div>
            )}
          </div>

          {/* Firewall Alvo */}
          <div className="absolute bottom-4 right-16 z-10 flex flex-col items-center">
            {status === 'hit' ? (
              <div className="w-32 h-32 flex items-center justify-center animate-in zoom-in text-rose-500 font-black text-2xl">
                DESTRUÍDO!
              </div>
            ) : (
              <div className="w-16 h-40 bg-rose-500/80 border-4 border-rose-500 rounded-t-lg shadow-[0_0_20px_rgba(244,63,94,0.4)] flex flex-col justify-between py-2">
                <ShieldAlert size={32} className="text-rose-900 mx-auto opacity-50" />
                <ShieldAlert size={32} className="text-rose-900 mx-auto opacity-50" />
                <ShieldAlert size={32} className="text-rose-900 mx-auto opacity-50" />
              </div>
            )}
          </div>
        </div>

        {/* CONTROLES E FEEDBACK */}
        {status === 'idle' ? (
          <div className="flex flex-col md:flex-row items-center w-full gap-8">
            <div className="flex-1 w-full bg-slate-900 p-6 rounded-2xl border border-slate-700">
              <label className="text-slate-400 font-bold uppercase text-sm mb-4 block">Ângulo: {angle}°</label>
              <input 
                type="range" min="10" max="80" value={angle} 
                onChange={(e) => { playClick(); setAngle(parseInt(e.target.value)) }}
                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex-1 w-full bg-slate-900 p-6 rounded-2xl border border-slate-700">
              <label className="text-slate-400 font-bold uppercase text-sm mb-4 block">Força: {power}%</label>
              <input 
                type="range" min="20" max="100" value={power} 
                onChange={(e) => { playClick(); setPower(parseInt(e.target.value)) }}
                className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button 
              onClick={handleFire}
              disabled={attempts <= 0}
              className="px-10 py-8 bg-rose-500 hover:bg-rose-400 text-white font-black text-2xl rounded-2xl active:scale-95 transition-transform flex flex-col items-center shadow-[0_0_20px_rgba(244,63,94,0.4)] disabled:opacity-50"
            >
              <SendHorizontal size={36} className="mb-2" /> DISPARAR
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
            {status === 'firing' && <p className="text-3xl text-cyan-400 font-black animate-pulse">Calculando Rota...</p>}
            
            {status === 'hit' && (
              <>
                <h3 className="text-5xl font-black text-emerald-400 mb-6">IMPACTO CRÍTICO!</h3>
                <button onClick={concludeGame} className="flex items-center gap-3 px-10 py-5 bg-emerald-500 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-emerald-500/30">
                  Ver Pontuação <ArrowRight size={28} />
                </button>
              </>
            )}

            {status === 'miss' && (
              <>
                <h3 className="text-4xl font-black text-rose-500 mb-6">ERROU O ALVO!</h3>
                <button onClick={resetRound} className="flex items-center gap-3 px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-2xl text-2xl transition-transform active:scale-95 shadow-lg shadow-cyan-500/30">
                  {attempts > 0 ? 'Tentar Novamente' : 'Ver Resultado'} <ArrowRight size={28} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}