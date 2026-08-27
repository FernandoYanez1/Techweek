import { useState, useMemo } from 'react';
import { useAppStore } from '../core/store';
import { Coins, Trophy, Shield, Users, Gavel, Delete, X, SkipForward, AlertTriangle, Swords, ChevronRight, ListOrdered, UserCircle2 } from 'lucide-react';
import { PLAYER_DATABASE, type PlayerDef } from '../data/players';

const FORMATION_LIMITS = { GOL: 1, LD: 1, ZAG: 2, LE: 1, VOL: 1, MEI: 2, PE: 1, CA: 1, PD: 1 };
const DECK_LIMITS = { GOL: 4, LD: 4, ZAG: 6, LE: 4, VOL: 4, MEI: 6, PE: 4, CA: 4, PD: 4 };
const INITIAL_BUDGET = 200;

type GameState = 'setup' | 'reveal' | 'auction' | 'simulation' | 'result' | 'recap';

interface PlayerState {
  budget: number;
  draftBid: number;
  team: PlayerDef[];
  showNumpad: boolean;
}

interface MatchEvent { 
  time: string; 
  type: 'goal' | 'info';
  text?: string; 
  scorer?: string;
  assister?: string | null;
  isGoal: boolean; 
  team?: 1 | 2; 
  leg: 1 | 2 | 3; 
}

interface PlayerStats { goals: number; assists: number; }

const GOAL_WEIGHTS = { CA: 5, PE: 5, PD: 5, MEI: 3, VOL: 1, LE: 0.5, LD: 0.5, ZAG: 0.5, GOL: 0 };
const ASSIST_WEIGHTS = { MEI: 5, PE: 4, PD: 4, LE: 2, LD: 2, VOL: 2, CA: 1, ZAG: 0.5, GOL: 0 };

export default function LeilaoFutebol() {
  const appStore = useAppStore() as any;

  const p1Name = appStore.loggedUsers?.[0]?.name || 'Treinador 1';
  const p1Photo = appStore.loggedUsers?.[0]?.photoBase64;

  const p2Name = appStore.loggedUsers?.[1]?.name || 'Treinador 2';
  const p2Photo = appStore.loggedUsers?.[1]?.photoBase64;

  const [gameState, setGameState] = useState<GameState>('setup');
  const [deck, setDeck] = useState<PlayerDef[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerDef | null>(null);

  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState<1 | 2 | null>(null);
  const [hasPassed, setHasPassed] = useState<{ 1: boolean, 2: boolean }>({ 1: false, 2: false });

  const [roundStarter, setRoundStarter] = useState<1 | 2>(1);
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);

  const [p1, setP1] = useState<PlayerState>({ budget: INITIAL_BUDGET, draftBid: 0, team: [], showNumpad: false });
  const [p2, setP2] = useState<PlayerState>({ budget: INITIAL_BUDGET, draftBid: 0, team: [], showNumpad: false });

  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [matchScore, setMatchScore] = useState({ t1_ida: 0, t2_ida: 0, t1_volta: 0, t2_volta: 0, pen1: 0, pen2: 0, isPenalty: false });
  const [matchStats, setMatchStats] = useState<Record<string, PlayerStats>>({});

  // ==========================================
  // SORTEIO INTELIGENTE DO BARALHO (LEGENDS)
  // ==========================================
  const generateDeck = () => {
    let newDeck: PlayerDef[] = [];
    const normals = PLAYER_DATABASE.filter(p => !p.isLegend);
    const legends = PLAYER_DATABASE.filter(p => p.isLegend).sort(() => Math.random() - 0.5);

    Object.entries(DECK_LIMITS).forEach(([pos, limit]) => {
      const posPlayers = normals.filter(p => p.pos === pos).sort(() => Math.random() - 0.5);
      newDeck.push(...posPlayers.slice(0, limit));
    });

    newDeck = newDeck.sort(() => Math.random() - 0.5);

    // 1º Legend obrigatório entre rodada 2 e 5 (índices 1 a 4)
    if (legends.length > 0) newDeck.splice(Math.floor(Math.random() * 4) + 1, 0, legends.shift()!);
    // 2º Legend obrigatório entre rodada 8 e 11 (índices 7 a 10)
    if (legends.length > 0) newDeck.splice(Math.floor(Math.random() * 4) + 7, 0, legends.shift()!);
    // 3º Legend obrigatório entre rodada 17 e 19 (índices 16 a 18)
    if (legends.length > 0) newDeck.splice(Math.floor(Math.random() * 3) + 16, 0, legends.shift()!);

    // Entre 0 a 3 extras aleatórios pro resto do jogo
    const numExtras = Math.floor(Math.random() * 4);
    for(let i = 0; i < numExtras; i++) {
      if (legends.length > 0) {
        newDeck.splice(Math.floor(Math.random() * newDeck.length), 0, legends.shift()!);
      }
    }

    return newDeck;
  };

  const startGame = () => {
    const shuffledDeck = generateDeck();
    setDeck(shuffledDeck);
    setP1({ budget: INITIAL_BUDGET, draftBid: 0, team: [], showNumpad: false });
    setP2({ budget: INITIAL_BUDGET, draftBid: 0, team: [], showNumpad: false });
    setRoundStarter(1);
    drawNextPlayer(shuffledDeck, [], [], 1);
  };

  const drawNextPlayer = (currentDeck: PlayerDef[], currentP1Team: PlayerDef[], currentP2Team: PlayerDef[], nextStarter: 1 | 2) => {
    if (currentP1Team.length === 11 && currentP2Team.length === 11) {
      startSimulation(currentP1Team, currentP2Team); return;
    }

    const nextPlayerIndex = currentDeck.findIndex(p => canBuyPosition(currentP1Team, p.pos) || canBuyPosition(currentP2Team, p.pos));

    if (nextPlayerIndex === -1) {
      startSimulation(currentP1Team, currentP2Team); return;
    }

    const nextPlayer = currentDeck[nextPlayerIndex];
    const newDeck = [...currentDeck];
    newDeck.splice(nextPlayerIndex, 1);

    setDeck(newDeck);
    setCurrentPlayer(nextPlayer);
    setCurrentBid(0);
    setHighestBidder(null);

    const canP1Buy = canBuyPosition(currentP1Team, nextPlayer.pos);
    const canP2Buy = canBuyPosition(currentP2Team, nextPlayer.pos);
    setHasPassed({ 1: !canP1Buy, 2: !canP2Buy });

    setRoundStarter(nextStarter);
    if (!canP1Buy && canP2Buy) setCurrentTurn(2);
    else if (canP1Buy && !canP2Buy) setCurrentTurn(1);
    else setCurrentTurn(nextStarter);

    setP1(prev => ({ ...prev, draftBid: 0, showNumpad: false }));
    setP2(prev => ({ ...prev, draftBid: 0, showNumpad: false }));

    setGameState('reveal');
    setTimeout(() => setGameState('auction'), 1500); 
  };

  const completeTeamWithBagres = (team: PlayerDef[]) => {
    const finalTeam = [...team];
    Object.entries(FORMATION_LIMITS).forEach(([pos, limit]) => {
      const count = finalTeam.filter(p => p.pos === pos).length;
      for (let i = count; i < limit; i++) {
        finalTeam.push({ id: `B-${pos}-${Math.random()}`, name: 'Bagre', team: 'Base', pos: pos as any, ovr: 60 });
      }
    });
    return finalTeam;
  };

  // ==========================================
  // SIMULADOR: LÓGICA DE EVENTOS E UI MINIMALISTA
  // ==========================================
  const getWeightedPlayer = (team: PlayerDef[], weightTable: Record<string, number>) => {
    const weightedPool = team.map(p => {
      const posWeight = weightTable[p.pos] || 0;
      const ovrWeight = p.ovr / 100; 
      return { player: p, score: posWeight * ovrWeight * Math.random() };
    });
    
    const validPool = weightedPool.filter(w => w.score > 0);
    if (validPool.length === 0) return team[0];
    validPool.sort((a, b) => b.score - a.score);
    return validPool[0].player;
  };

  const getScorer = (team: PlayerDef[]) => getWeightedPlayer(team, GOAL_WEIGHTS);
  
  const getAssister = (team: PlayerDef[], scorerId: string) => {
    const eligibleTeam = team.filter(p => p.id !== scorerId);
    if (eligibleTeam.length === 0) return null;
    return getWeightedPlayer(eligibleTeam, ASSIST_WEIGHTS);
  };

  const startSimulation = (finalP1: PlayerDef[], finalP2: PlayerDef[]) => {
    setGameState('simulation');
    const fullP1 = completeTeamWithBagres(finalP1);
    const fullP2 = completeTeamWithBagres(finalP2);
    setP1(prev => ({...prev, team: fullP1}));
    setP2(prev => ({...prev, team: fullP2}));

    const ovr1 = Math.round(fullP1.reduce((acc, p) => acc + p.ovr, 0) / 11);
    const ovr2 = Math.round(fullP2.reduce((acc, p) => acc + p.ovr, 0) / 11);

    const diff = ovr1 - ovr2;
    const baseChance = 0.15;
    const chanceP1 = Math.max(0.02, Math.min(0.50, baseChance + (diff * 0.025)));
    const chanceP2 = Math.max(0.02, Math.min(0.50, baseChance - (diff * 0.025)));

    let script: MatchEvent[] = [];
    const stats: Record<string, PlayerStats> = {};

    const addStat = (id: string, type: 'goals' | 'assists') => {
      if (!stats[id]) stats[id] = { goals: 0, assists: 0 };
      stats[id][type]++;
    };

    const processGoal = (teamNum: 1 | 2, team: PlayerDef[], time: string, leg: 1 | 2) => {
      const scorer = getScorer(team);
      const assister = Math.random() > 0.4 ? getAssister(team, scorer.id) : null;
      addStat(scorer.id, 'goals');
      if (assister) addStat(assister.id, 'assists');

      script.push({ 
        time, 
        type: 'goal',
        scorer: scorer.name.split(' ').pop()?.toUpperCase(),
        assister: assister ? assister.name.split(' ').pop()?.toUpperCase() : null,
        isGoal: true, 
        team: teamNum, 
        leg 
      });
    };

    let s1_ida = 0, s2_ida = 0;
    let s1_volta = 0, s2_volta = 0;

    script.push({ time: "00'", type: 'info', text: "INÍCIO DO JOGO DE IDA", isGoal: false, leg: 1 });
    for (let i = 10; i <= 90; i += 15) {
      if (Math.random() < chanceP1) { s1_ida++; processGoal(1, fullP1, `${i}'`, 1); }
      if (Math.random() < chanceP2) { s2_ida++; processGoal(2, fullP2, `${i + 4}'`, 1); }
    }
    script.push({ time: "90'", type: 'info', text: `FIM DO JOGO DE IDA`, isGoal: false, leg: 1 });

    script.push({ time: "00'", type: 'info', text: "INÍCIO DO JOGO DE VOLTA", isGoal: false, leg: 2 });
    for (let i = 10; i <= 90; i += 15) {
      if (Math.random() < chanceP1) { s1_volta++; processGoal(1, fullP1, `${i}'`, 2); }
      if (Math.random() < chanceP2) { s2_volta++; processGoal(2, fullP2, `${i + 4}'`, 2); }
    }
    script.push({ time: "90'", type: 'info', text: `FIM DO JOGO DE VOLTA`, isGoal: false, leg: 2 });

    const total1 = s1_ida + s1_volta;
    const total2 = s2_ida + s2_volta;
    let pen1 = 0, pen2 = 0;

    if (total1 === total2) {
      script.push({ time: "120'", type: 'info', text: "DISPUTA DE PÊNALTIS", isGoal: false, leg: 3 });
      pen1 = Math.floor(Math.random() * 3) + 3;
      pen2 = Math.floor(Math.random() * 3) + 3;
      while(pen1 === pen2) { pen1++; if(Math.random() > 0.5) pen2++; }
      script.push({ time: "PEN", type: 'info', text: `VITÓRIA: ${pen1} a ${pen2}`, isGoal: true, team: pen1 > pen2 ? 1 : 2, leg: 3 });
    }

    setMatchStats(stats);

    let currentEvent = 0;
    const interval = setInterval(() => {
      if (currentEvent < script.length) {
        const ev = script[currentEvent];
        setMatchEvents(prev => [ev, ...prev]);

        if (ev.isGoal && ev.leg === 1) {
          if (ev.team === 1) setMatchScore(prev => ({...prev, t1_ida: prev.t1_ida + 1}));
          else setMatchScore(prev => ({...prev, t2_ida: prev.t2_ida + 1}));
        }
        if (ev.isGoal && ev.leg === 2) {
          if (ev.team === 1) setMatchScore(prev => ({...prev, t1_volta: prev.t1_volta + 1}));
          else setMatchScore(prev => ({...prev, t2_volta: prev.t2_volta + 1}));
        }
        if (ev.leg === 3 && ev.isGoal) {
          setMatchScore(prev => ({...prev, isPenalty: true, pen1, pen2}));
        }
        currentEvent++;
      } else {
        clearInterval(interval);
        setTimeout(() => setGameState('result'), 3000);
      }
    }, 1200); 
  };

  const finalSubmitPoints = () => {
    const total1 = matchScore.t1_ida + matchScore.t1_volta + matchScore.pen1;
    const total2 = matchScore.t2_ida + matchScore.t2_volta + matchScore.pen2;
    const winner = total1 > total2 ? 1 : 2;

    appStore.endGame([winner === 1 ? 70 : 30, winner === 2 ? 70 : 30]);
  };

  // ==========================================
  // LÓGICA DO LEILÃO E TURNOS
  // ==========================================
  const handleAuctionEnd = (winner: 1 | 2 | null, finalBid: number) => {
    let updatedP1Team = [...p1.team];
    let updatedP2Team = [...p2.team];

    if (winner !== null) {
      if (winner === 1) {
        updatedP1Team.push(currentPlayer!);
        setP1(prev => ({ ...prev, budget: prev.budget - finalBid, team: updatedP1Team }));
      } else {
        updatedP2Team.push(currentPlayer!);
        setP2(prev => ({ ...prev, budget: prev.budget - finalBid, team: updatedP2Team }));
      }
    }
    drawNextPlayer(deck, updatedP1Team, updatedP2Team, roundStarter === 1 ? 2 : 1);
  };

  const placeBid = (playerNum: 1 | 2, amount: number) => {
    if (currentTurn !== playerNum) return; 
    if (amount <= currentBid || amount <= 0) return;

    const pState = playerNum === 1 ? p1 : p2;
    if (amount > pState.budget) return;

    const otherPlayer = playerNum === 1 ? 2 : 1;

    setCurrentBid(amount);
    setHighestBidder(playerNum);
    setHasPassed(prev => ({ ...prev, [playerNum]: false })); 

    if (playerNum === 1) setP1(prev => ({ ...prev, draftBid: 0, showNumpad: false }));
    else setP2(prev => ({ ...prev, draftBid: 0, showNumpad: false }));

    if (hasPassed[otherPlayer]) handleAuctionEnd(playerNum, amount);
    else setCurrentTurn(otherPlayer);
  };

  const passAuction = (playerNum: 1 | 2) => {
    if (currentTurn !== playerNum) return;
    const otherPlayer = playerNum === 1 ? 2 : 1;

    setHasPassed(prev => {
      const updated = { ...prev, [playerNum]: true };
      if (updated[1] && updated[2]) handleAuctionEnd(null, 0);
      else if (highestBidder === otherPlayer) handleAuctionEnd(otherPlayer, currentBid);
      else setCurrentTurn(otherPlayer); 
      return updated;
    });
  };

  const addDraftBid = (playerNum: 1 | 2, val: number) => {
    if (currentTurn !== playerNum) return;
    const setPState = playerNum === 1 ? setP1 : setP2;
    setPState(prev => {
      let newBid = prev.draftBid === 0 ? currentBid + val : prev.draftBid + val;
      if (newBid > prev.budget) newBid = prev.budget;
      return { ...prev, draftBid: newBid };
    });
  };

  const canBuyPosition = (team: PlayerDef[], pos: string) => {
    return team.filter(p => p.pos === pos).length < FORMATION_LIMITS[pos as keyof typeof FORMATION_LIMITS];
  };

  const isLastInDeck = useMemo(() => {
    if (!currentPlayer) return false;
    return deck.filter(p => p.pos === currentPlayer.pos).length === 0;
  }, [currentPlayer, deck]);

  const getMarketSummary = () => {
    const market = { GOL: 0, LD: 0, ZAG: 0, LE: 0, VOL: 0, MEI: 0, PE: 0, CA: 0, PD: 0 };
    deck.forEach(p => { if (market[p.pos as keyof typeof market] !== undefined) market[p.pos as keyof typeof market]++; });
    if (currentPlayer) market[currentPlayer.pos as keyof typeof market]++;
    return market;
  };

  // ==========================================
  // RENDERIZAÇÃO DE UI
  // ==========================================
  const renderPitchRow = (positions: string[], pState: PlayerState) => {
    return (
      <div className="flex w-full justify-around items-center flex-1 my-1 px-4">
        {positions.map((pos, idx) => {
          let extraClass = "";
          if (positions.length === 3 && idx === 0) extraClass = "mr-auto";
          if (positions.length === 3 && idx === 2) extraClass = "ml-auto";

          const playersInPos = pState.team.filter(p => p.pos === pos);
          const posOccurrences = positions.slice(0, idx).filter(p => p === pos).length;
          const p = playersInPos[posOccurrences]; 

          return p ? (
            <div key={idx} className={`bg-slate-900 border-[3px] ${p.isLegend ? 'border-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.5)]' : 'border-amber-500/80'} p-1.5 rounded-lg text-center w-16 z-10 flex flex-col items-center ${extraClass}`}>
              <div className={`font-black text-sm ${p.ovr === 60 ? 'text-rose-400' : p.isLegend ? 'text-fuchsia-400' : 'text-amber-400'}`}>{p.ovr}</div>
              <div className="text-[10px] text-white truncate font-bold w-full">{p.name.split(' ').pop()}</div>
            </div>
          ) : (
            <div key={idx} className={`bg-slate-900/40 border-2 border-slate-600 border-dashed p-1.5 rounded-lg text-center w-16 z-10 flex flex-col items-center opacity-70 ${extraClass}`}>
              <span className="text-[10px] text-slate-400 font-black">{pos}</span>
              <span className="w-3 h-3 rounded-full bg-slate-800 mt-1 opacity-50"></span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPlayerSide = (playerNum: 1 | 2) => {
    const pState = playerNum === 1 ? p1 : p2;
    const setPState = playerNum === 1 ? setP1 : setP2;
    const isTeamFull = pState.team.length === 11;
    const playerName = playerNum === 1 ? p1Name : p2Name;
    const playerPhoto = playerNum === 1 ? p1Photo : p2Photo;
    const isMyTurn = currentTurn === playerNum && gameState === 'auction';

    return (
      <div className={`w-[32%] flex flex-col p-5 bg-slate-800 relative transition-all duration-300 ${playerNum === 1 ? 'border-r-4' : 'border-l-4'} border-slate-950`}>

        {pState.showNumpad && isMyTurn && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in zoom-in">
            <div className="w-full max-w-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="text-white font-bold text-xl uppercase tracking-widest">Digitar Lance</span>
                <button onClick={() => setPState(prev => ({ ...prev, showNumpad: false }))} className="bg-slate-800 p-2 rounded-full hover:bg-rose-500 text-white"><X /></button>
              </div>
              <div className="text-5xl font-black text-emerald-400 mb-8 bg-slate-800 w-full text-center py-6 rounded-2xl border-2 border-emerald-500/30">R$ {pState.draftBid}</div>
              <div className="grid grid-cols-3 gap-3 w-full">
                {['1','2','3','4','5','6','7','8','9','0'].map(num => (
                  <button key={num} onClick={() => { setPState(prev => ({...prev, draftBid: parseInt((prev.draftBid === 0 ? '' : prev.draftBid) + num) > prev.budget ? prev.budget : parseInt((prev.draftBid === 0 ? '' : prev.draftBid) + num)})); }} className={`h-16 bg-slate-700 hover:bg-slate-600 text-white text-2xl font-black rounded-xl active:scale-95 shadow-md ${num === '0' ? 'col-span-2' : ''}`}>{num}</button>
                ))}
                <button onClick={() => { setPState(prev => ({...prev, draftBid: Math.floor(prev.draftBid / 10)})); }} className="h-16 bg-rose-900/50 hover:bg-rose-800 text-rose-300 rounded-xl flex items-center justify-center active:scale-95"><Delete size={28}/></button>
              </div>
              <button onClick={() => placeBid(playerNum, pState.draftBid)} disabled={pState.draftBid <= currentBid || pState.draftBid > pState.budget} className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black text-xl rounded-xl active:scale-95">CONFIRMAR LANCE</button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border-2 border-slate-700 mb-4 shrink-0 shadow-lg">
          <div className="flex items-center gap-3 overflow-hidden pr-2">
            {playerPhoto ? (
              <img src={playerPhoto} alt={playerName} className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 shrink-0" />
            ) : (
              <UserCircle2 size={48} className="text-slate-600 shrink-0" />
            )}
            <div className="flex flex-col overflow-hidden">
              <h2 className="text-xl font-black text-white truncate">{playerName}</h2>
              <p className="text-slate-400 font-bold text-xs">{pState.team.length}/11 Jogadores</p>
            </div>
          </div>
          <div className="text-right shrink-0 pl-2">
            <div className="text-3xl font-black text-emerald-400 flex items-center gap-1"><Coins size={24}/> R$ {pState.budget}</div>
          </div>
        </div>

        <div className="flex-1 bg-green-900/30 border-2 border-green-800/50 rounded-[2rem] relative overflow-hidden mb-4 py-4 flex flex-col justify-between shadow-inner">
          <div className="absolute inset-0 z-0 flex flex-col justify-between pointer-events-none">
             <div className="h-[40%] border-b-2 border-green-500/20 w-full relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1/2 border-b-2 border-x-2 border-green-500/20"></div>
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-green-500/20"></div>
             <div className="h-[20%] border-t-2 border-green-500/20 w-full relative mt-auto">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-full border-t-2 border-x-2 border-green-500/20"></div>
             </div>
          </div>

          <div className="z-10 flex-1 flex flex-col justify-around">
            {renderPitchRow(['PE', 'CA', 'PD'], pState)}
            {renderPitchRow(['MEI', 'VOL', 'MEI'], pState)}
            {renderPitchRow(['LE', 'ZAG', 'ZAG', 'LD'], pState)}
            {renderPitchRow(['GOL'], pState)}
          </div>
        </div>

        <div className={`bg-slate-900 p-5 rounded-[2rem] border-2 shrink-0 shadow-xl relative overflow-hidden transition-all duration-300 ${isMyTurn ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-slate-700 opacity-60 pointer-events-none'}`}>
          {hasPassed[playerNum] && (
            <div className="absolute inset-0 z-20 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
              <span className="text-xl font-black text-rose-500 bg-slate-950 px-4 py-2 rounded-full border-2 border-rose-500/50 rotate-[-5deg] shadow-xl">FORA DO LANCE</span>
            </div>
          )}

          {isTeamFull ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Shield size={32} className="text-emerald-500 mb-2" />
              <span className="text-lg font-black text-white">ELENCO FECHADO</span>
            </div>
          ) : (
            <>
              <div className="h-6 flex items-center justify-center mb-2">
                {isMyTurn ? (
                  <span className="text-emerald-400 font-black text-sm uppercase tracking-widest animate-pulse">Sua Vez de Agir!</span>
                ) : (
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Aguardando Adversário...</span>
                )}
              </div>

              <div className="flex gap-2 mb-3">
                {[1, 2, 5, 10, 20].map(val => (
                  <button key={val} onClick={() => addDraftBid(playerNum, val)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-black py-2 rounded-xl shadow-sm active:scale-95 transition-all text-sm">+{val}</button>
                ))}
              </div>

              <div className="flex gap-3 mb-3 h-12">
                <button onClick={() => setPState(prev => ({...prev, showNumpad: true}))} className="flex-1 bg-slate-800 border-2 border-slate-600 hover:border-emerald-500 rounded-xl text-2xl font-black text-white flex items-center justify-center gap-2 transition-all shadow-inner">
                  <span className="text-emerald-400 text-lg">R$</span> {pState.draftBid > 0 ? pState.draftBid : '---'}
                </button>
                <button onClick={() => { setPState(prev => ({...prev, draftBid: 0})); }} className="bg-slate-800 border-2 border-slate-600 hover:border-rose-500 text-slate-400 px-4 rounded-xl font-bold transition-all active:scale-95 text-sm">Zerar</button>
              </div>

              <div className="flex gap-3 h-14">
                <button onClick={() => placeBid(playerNum, pState.draftBid)} disabled={pState.draftBid <= currentBid || pState.draftBid > pState.budget} className="flex-[2] bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-black text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                  <Gavel size={20}/> LANCE
                </button>
                <button onClick={() => passAuction(playerNum)} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                  <SkipForward size={16}/> PASSAR
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDERIZAÇÃO: TELAS FINAIS E INICIAIS
  // ==========================================
  if (gameState === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-800 rounded-[3rem] shadow-2xl text-center max-w-3xl w-full border-4 border-slate-700 animate-in zoom-in">
        <Users size={100} className="text-emerald-500 mb-6" />
        <h2 className="text-5xl font-black text-white mb-4">O Draft de Craques</h2>
        <p className="text-xl text-slate-400 mb-8 leading-relaxed">
          Mercado restrito em turnos!<br/>
          Se ficar sem vaga ou sem dinheiro para fechar o time, a diretoria vai colocar um <strong className="text-rose-400">Bagre (OVR 60)</strong> de titular na final!
        </p>
        <button onClick={startGame} className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-3xl font-bold active:scale-95 transition-all shadow-lg">
          Iniciar Leilão
        </button>
      </div>
    );
  }

  // TELA DE SIMULAÇÃO (UI MINIMALISTA)
  if (gameState === 'simulation') {
    const totalT1 = matchScore.t1_ida + matchScore.t1_volta;
    const totalT2 = matchScore.t2_ida + matchScore.t2_volta;

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-6xl border-4 border-slate-700 animate-in zoom-in h-[85vh]">
        <h2 className="text-3xl font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-3">
          <Swords size={32} className="text-amber-400"/> Confronto Final
        </h2>

        <div className="flex w-full justify-between items-center bg-slate-800 p-8 rounded-[2rem] border-2 border-slate-700 shadow-2xl mb-6">
          <div className="text-center w-1/3">
            <h3 className="text-3xl font-black text-white mb-2 truncate">{p1Name}</h3>
            <div className="text-8xl font-black text-emerald-400 drop-shadow-lg">{totalT1}</div>
            {matchScore.isPenalty && <div className="text-amber-400 font-bold text-xl mt-2">({matchScore.pen1})</div>}
          </div>
          <div className="text-5xl font-black text-slate-600">X</div>
          <div className="text-center w-1/3">
            <h3 className="text-3xl font-black text-white mb-2 truncate">{p2Name}</h3>
            <div className="text-8xl font-black text-emerald-400 drop-shadow-lg">{totalT2}</div>
            {matchScore.isPenalty && <div className="text-amber-400 font-bold text-xl mt-2">({matchScore.pen2})</div>}
          </div>
        </div>

        <div className="w-full flex gap-4 h-64">
          <div className="flex-1 bg-slate-950 rounded-2xl border-2 border-slate-800 p-4 overflow-y-auto custom-scrollbar shadow-inner relative">
            <h4 className="text-amber-400 font-bold mb-4 sticky top-0 bg-slate-950 z-10 py-1 border-b border-slate-800">JOGO DE IDA</h4>
            {matchEvents.filter(e => e.leg === 1).map((ev, i) => (
              ev.type === 'goal' ? (
                <div key={i} className="flex gap-4 mb-4 animate-in slide-in-from-left-2 items-center">
                   <div className="font-black w-10 text-right text-emerald-400 text-lg">{ev.time}</div>
                   <div className="flex flex-col">
                      <div className="font-black text-white text-xl flex items-center gap-2">● {ev.scorer}</div>
                      {ev.assister && <div className="text-slate-400 text-xs font-bold flex items-center gap-1 mt-0.5">👟 {ev.assister}</div>}
                   </div>
                </div>
              ) : (
                <div key={i} className="flex gap-4 mb-4 text-slate-500 animate-in slide-in-from-left-2 items-center">
                   <div className="font-black w-10 text-right text-lg">{ev.time}</div>
                   <div className="font-bold text-xs uppercase tracking-widest">{ev.text}</div>
                </div>
              )
            ))}
          </div>

          <div className="flex-1 bg-slate-950 rounded-2xl border-2 border-slate-800 p-4 overflow-y-auto custom-scrollbar shadow-inner relative">
            <h4 className="text-amber-400 font-bold mb-4 sticky top-0 bg-slate-950 z-10 py-1 border-b border-slate-800">JOGO DE VOLTA</h4>
            {matchEvents.filter(e => e.leg === 2 || e.leg === 3).map((ev, i) => (
              ev.type === 'goal' ? (
                <div key={i} className="flex gap-4 mb-4 animate-in slide-in-from-left-2 items-center">
                   <div className="font-black w-10 text-right text-emerald-400 text-lg">{ev.time}</div>
                   <div className="flex flex-col">
                      <div className="font-black text-white text-xl flex items-center gap-2">● {ev.scorer}</div>
                      {ev.assister && <div className="text-slate-400 text-xs font-bold flex items-center gap-1 mt-0.5">👟 {ev.assister}</div>}
                   </div>
                </div>
              ) : (
                <div key={i} className="flex gap-4 mb-4 text-slate-500 animate-in slide-in-from-left-2 items-center">
                   <div className="font-black w-10 text-right text-lg">{ev.time}</div>
                   <div className="font-bold text-xs uppercase tracking-widest">{ev.text}</div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    const total1 = matchScore.t1_ida + matchScore.t1_volta + matchScore.pen1;
    const total2 = matchScore.t2_ida + matchScore.t2_volta + matchScore.pen2;
    const winner = total1 > total2 ? 1 : 2;

    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-800 rounded-[3rem] shadow-2xl text-center w-full max-w-4xl border-4 border-slate-700 animate-in zoom-in">
        <Trophy size={100} className="text-amber-400 mb-6" />
        <h2 className="text-5xl font-black text-white mb-8">
          {winner === 1 ? p1Name : p2Name} Venceu o Campeonato!
        </h2>
        <div className="flex gap-8 w-full mb-8">
          <div className={`flex-1 p-8 rounded-3xl border-4 ${winner === 1 ? 'bg-emerald-900/30 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-700'}`}>
            <h3 className="text-2xl font-bold text-slate-300 mb-4 truncate">{p1Name}</h3>
            <div className="text-8xl font-black text-white">{winner === 1 ? '70' : '30'} <span className="text-3xl text-slate-500">PTS</span></div>
          </div>
          <div className={`flex-1 p-8 rounded-3xl border-4 ${winner === 2 ? 'bg-emerald-900/30 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-700'}`}>
            <h3 className="text-2xl font-bold text-slate-300 mb-4 truncate">{p2Name}</h3>
            <div className="text-8xl font-black text-white">{winner === 2 ? '70' : '30'} <span className="text-3xl text-slate-500">PTS</span></div>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <button onClick={() => setGameState('recap')} className="flex-1 py-6 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl text-2xl font-bold transition-all shadow-lg flex justify-center items-center gap-3">
            <ListOrdered size={28} /> Resumo do Jogo
          </button>
          <button onClick={finalSubmitPoints} className="flex-1 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-2xl font-bold transition-all shadow-lg flex justify-center items-center gap-3">
            Salvar Pontos <ChevronRight size={28} />
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'recap') {
    return (
      <div className="flex flex-col items-center p-8 bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-6xl border-4 border-slate-700 animate-in fade-in h-[90vh]">
        <h2 className="text-4xl font-black text-white mb-6">Resumo da Partida</h2>
        <div className="flex-1 w-full flex gap-6 overflow-hidden">

          <div className="flex-1 bg-slate-800 rounded-3xl border-2 border-slate-700 p-6 overflow-y-auto custom-scrollbar">
             <h3 className="text-2xl font-bold text-amber-400 mb-4 text-center">{p1Name}</h3>
             {p1.team.sort((a,b) => b.ovr - a.ovr).map(p => {
               const pStats = matchStats[p.id] || { goals: 0, assists: 0 };
               return (
                <div key={p.id} className="flex justify-between items-center text-lg mb-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
                  <span className={`truncate pr-2 font-bold ${p.ovr === 60 ? 'text-rose-400' : p.isLegend ? 'text-fuchsia-400' : 'text-white'}`}>{p.name}</span>
                  <div className="flex items-center gap-3">
                    {pStats.goals > 0 && <span className="text-emerald-400 font-bold text-sm bg-emerald-950 px-2 rounded border border-emerald-900">⚽ {pStats.goals > 1 ? `x${pStats.goals}` : ''}</span>}
                    {pStats.assists > 0 && <span className="text-sky-400 font-bold text-sm bg-sky-950 px-2 rounded border border-sky-900">👟 {pStats.assists > 1 ? `x${pStats.assists}` : ''}</span>}
                    <span className="text-slate-500 text-sm w-8 text-center">{p.pos}</span>
                    <span className="bg-slate-800 px-3 py-1 rounded text-amber-400 font-black">{p.ovr}</span>
                  </div>
                </div>
               )
             })}
          </div>

          <div className="flex-1 bg-slate-800 rounded-3xl border-2 border-slate-700 p-6 overflow-y-auto custom-scrollbar">
             <h3 className="text-2xl font-bold text-amber-400 mb-4 text-center">{p2Name}</h3>
             {p2.team.sort((a,b) => b.ovr - a.ovr).map(p => {
               const pStats = matchStats[p.id] || { goals: 0, assists: 0 };
               return (
                <div key={p.id} className="flex justify-between items-center text-lg mb-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
                  <span className={`truncate pr-2 font-bold ${p.ovr === 60 ? 'text-rose-400' : p.isLegend ? 'text-fuchsia-400' : 'text-white'}`}>{p.name}</span>
                  <div className="flex items-center gap-3">
                    {pStats.goals > 0 && <span className="text-emerald-400 font-bold text-sm bg-emerald-950 px-2 rounded border border-emerald-900">● {pStats.goals > 1 ? `x${pStats.goals}` : ''}</span>}
                    {pStats.assists > 0 && <span className="text-sky-400 font-bold text-sm bg-sky-950 px-2 rounded border border-sky-900">👟 {pStats.assists > 1 ? `x${pStats.assists}` : ''}</span>}
                    <span className="text-slate-500 text-sm w-8 text-center">{p.pos}</span>
                    <span className="bg-slate-800 px-3 py-1 rounded text-amber-400 font-black">{p.ovr}</span>
                  </div>
                </div>
               )
             })}
          </div>

        </div>
        <button onClick={finalSubmitPoints} className="mt-8 px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-2xl font-bold transition-all shadow-lg flex justify-center items-center gap-3">
           Finalizar e Salvar Pontos <ChevronRight size={28} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full h-[95vh] bg-slate-900 rounded-[3rem] border-4 border-slate-700 overflow-hidden shadow-2xl relative select-none">

      {renderPlayerSide(1)}

      <div className="w-[36%] flex flex-col items-center p-6 bg-slate-900 z-10 shadow-2xl relative border-x-4 border-slate-950">

        <div className="w-full bg-slate-950 p-4 rounded-3xl border-2 border-slate-800 mb-6 shrink-0 shadow-inner">
          <h3 className="text-slate-500 font-bold mb-3 text-center uppercase text-[11px] tracking-widest">No Mercado (Restam)</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(getMarketSummary()).map(([pos, count]) => (
              <div key={pos} className="bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-700">
                <span className="text-slate-400 font-black text-xs">{pos}</span>
                <span className={`text-base font-black ${count > 0 ? 'text-emerald-400' : 'text-slate-700'}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {gameState === 'reveal' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in">
            <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest animate-pulse">Sorteando...</h2>
          </div>
        )}

        {gameState === 'auction' && currentPlayer && (
          <div className="w-full flex-1 flex flex-col items-center justify-center animate-in zoom-in -mt-4 relative">

            <div className={`w-full max-w-[280px] bg-slate-800 rounded-[2rem] border-4 flex flex-col mb-6 overflow-hidden transition-all duration-500 relative ${
              currentPlayer.isLegend 
              ? 'border-fuchsia-500 shadow-[0_0_60px_rgba(232,121,249,0.4)]' 
              : 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
            }`}>

              <div className={`flex justify-between px-6 py-2 shadow-md ${currentPlayer.isLegend ? 'bg-gradient-to-r from-fuchsia-600 to-purple-800 text-white' : 'bg-amber-500 text-slate-900'}`}>
                <span className="font-black text-4xl flex items-center gap-2">{currentPlayer.isLegend && <span className="text-amber-300">★</span>} {currentPlayer.ovr}</span>
                <span className="font-black text-2xl mt-1">{currentPlayer.pos}</span>
              </div>
              <div className="p-6 flex flex-col items-center bg-gradient-to-b from-slate-800 to-slate-900 relative">

                <div className={`w-36 h-36 rounded-full mb-4 border-4 flex items-center justify-center overflow-hidden bg-slate-950 shadow-inner z-10 ${
                  currentPlayer.isLegend ? 'border-fuchsia-400' : 'border-slate-700'
                }`}>
                  {currentPlayer.photo ? (
                    <img src={currentPlayer.photo} alt={currentPlayer.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={60} className={currentPlayer.isLegend ? 'text-fuchsia-900' : 'text-slate-600'}/>
                  )}
                </div>

                <h3 className="text-3xl font-black text-white leading-tight mb-1 text-center z-10">{currentPlayer.name}</h3>
                <p className={`font-bold text-sm text-center uppercase tracking-widest z-10 ${currentPlayer.isLegend ? 'text-fuchsia-400' : 'text-amber-400'}`}>{currentPlayer.team}</p>
              </div>
            </div>

            {isLastInDeck && (
              <div className="w-full bg-rose-600 text-white font-black text-base text-center py-2 px-4 rounded-xl mb-4 flex items-center justify-center gap-2 animate-pulse shadow-lg">
                <AlertTriangle size={24} /> ÚLTIMO {currentPlayer.pos} NO MERCADO!
              </div>
            )}

            <div className="bg-slate-950 p-6 rounded-3xl w-full border-2 border-slate-800 shadow-inner flex flex-col items-center text-center">
              <span className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Maior Lance</span>
              <div className="text-6xl font-black text-white mb-4 drop-shadow-md">R$ {currentBid}</div>

              {highestBidder === 1 && <div className="text-emerald-400 font-black text-lg bg-emerald-900/30 px-6 py-2 rounded-xl w-full border border-emerald-500/30 truncate">{p1Name} Vencendo!</div>}
              {highestBidder === 2 && <div className="text-emerald-400 font-black text-lg bg-emerald-900/30 px-6 py-2 rounded-xl w-full border border-emerald-500/30 truncate">{p2Name} Vencendo!</div>}
              {highestBidder === null && <div className="text-slate-400 font-bold text-sm py-2">Façam suas ofertas...</div>}
            </div>
          </div>
        )}
      </div>

      {renderPlayerSide(2)}

    </div>
  );
}