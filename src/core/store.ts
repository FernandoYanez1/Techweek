import { create } from 'zustand';
import type { DifficultyLevel } from './GameRegistry';
import { saveUserDB } from './db';

export type ScreenState = 'welcome' | 'menu' | 'playing' | 'post-game' | 'standby' | 'admin' | 'camera' | 'ranking';

export interface User {
  id: string;
  name: string;
  department: string;
  photoBase64?: string;
  scoreGeral: number;
  scoreDiario: number; 
  scoreHistory?: Record<string, number>; 
  lastPlayed: number;
}

export interface CameraConfig {
  mode: 'profile' | 'mural';
  returnScreen: ScreenState;
  targetUserId?: string; 
}

interface AppState {
  screen: ScreenState;
  loggedUsers: User[];
  activeGameId: string | null;
  activeDifficulty: DifficultyLevel | null;
  matchScores: number[];
  cameraConfig: CameraConfig | null;
  gamesPlayedInSession: number;
  activeRankingTab: 'ranking' | 'mural'; // NOVO: Controla se a tela vai ser Ranking ou Mural
  
  setScreen: (screen: ScreenState) => void;
  setActiveRankingTab: (tab: 'ranking' | 'mural') => void; // NOVO
  openCamera: (config: CameraConfig) => void;
  loginUser: (user: User, playerSlot?: 0 | 1) => void;
  logoutUser: (playerSlot?: 0 | 1) => void;
  updateLoggedUser: (user: User) => void; 
  startGame: (gameId: string, difficulty: DifficultyLevel) => void;
  endGame: (pontosGanhos: number[]) => void;
  resetToMenu: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'welcome',
  loggedUsers: [],
  activeGameId: null,
  activeDifficulty: null,
  matchScores: [],
  cameraConfig: null,
  gamesPlayedInSession: 0, 
  activeRankingTab: 'ranking',

  setScreen: (screen) => set({ screen }),
  setActiveRankingTab: (tab) => set({ activeRankingTab: tab }),
  
  openCamera: (config) => set({ screen: 'camera', cameraConfig: config }),

  loginUser: (user, playerSlot = 0) => {
    const currentUsers = [...get().loggedUsers];
    currentUsers[playerSlot] = user;
    set({ 
      loggedUsers: currentUsers,
      gamesPlayedInSession: playerSlot === 0 ? 0 : get().gamesPlayedInSession 
    });
  },

  logoutUser: (playerSlot = 0) => {
    const currentUsers = [...get().loggedUsers];
    currentUsers.splice(playerSlot, 1);
    if (currentUsers.length === 0) set({ loggedUsers: [], screen: 'welcome', gamesPlayedInSession: 0 });
    else set({ loggedUsers: currentUsers, gamesPlayedInSession: playerSlot === 0 ? 0 : get().gamesPlayedInSession });
  },
  
  updateLoggedUser: (user) => {
     const currentUsers = [...get().loggedUsers];
     const index = currentUsers.findIndex(u => u.id === user.id);
     if(index !== -1) {
         currentUsers[index] = user;
         set({ loggedUsers: currentUsers });
     }
  },

  startGame: (gameId, difficulty) => set({ activeGameId: gameId, activeDifficulty: difficulty, screen: 'playing', matchScores: [] }),
  
  endGame: (pontosGanhos) => {
    const users = [...get().loggedUsers];
    const hoje = new Date().toDateString();

    pontosGanhos.forEach((pontos, i) => {
      if (users[i]) {
        if (!users[i].scoreHistory) users[i].scoreHistory = {};
        if (!users[i].scoreHistory[hoje]) users[i].scoreHistory[hoje] = 0;
        
        users[i].scoreHistory[hoje] += pontos;
        users[i].scoreGeral += pontos;
        users[i].scoreDiario = users[i].scoreHistory[hoje];
        users[i].lastPlayed = Date.now();
        
        saveUserDB(users[i]).catch(console.error);
      }
    });

    set({ 
      loggedUsers: users, 
      matchScores: pontosGanhos, 
      screen: 'post-game',
      gamesPlayedInSession: get().gamesPlayedInSession + 1 
    });
  },
  
  resetToMenu: () => set({ screen: 'menu', activeGameId: null, activeDifficulty: null, matchScores: [] }),
}));