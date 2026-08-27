import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../core/store';
import StandbyScreen from './StandbyScreen'; 

export default function StandbyManager({ children }: { children: React.ReactNode }) {
  const { loggedUsers } = useAppStore();
  const [isStandby, setIsStandby] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    
    // Só entra em standby se a lista de logados estiver VAZIA
    if (loggedUsers.length === 0) {
       timeoutRef.current = window.setTimeout(() => {
          setIsStandby(true);
       }, 45000); // 60.000 ms = 1 minuto
    } else {
       setIsStandby(false);
    }
  }, [loggedUsers.length]);

  useEffect(() => {
    // REMOVIDO o 'mousemove' e 'scroll' para evitar toques "fantasmas" em monitores touch
    const events = ['mousedown', 'keydown', 'touchstart', 'click'];
    
    const handleInteraction = () => {
       setIsStandby(false);
       resetTimer();
    };

    events.forEach(e => window.addEventListener(e, handleInteraction, { passive: true }));
    
    resetTimer(); // Inicia o relógio na primeira vez

    return () => {
       events.forEach(e => window.removeEventListener(e, handleInteraction));
       if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  return (
    <>
      {children}
      {isStandby && <StandbyScreen onWakeUp={() => {
        setIsStandby(false);
        resetTimer();
      }} />}
    </>
  );
}