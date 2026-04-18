import { create } from 'zustand';

interface AppState {
  currentTeamId: number | null;
  setCurrentTeam: (id: number | null) => void;
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  currentTeamId: null,
  setCurrentTeam: (id) => set({ currentTeamId: id }),
  isOnline: navigator.onLine,
  setOnlineStatus: (status) => set({ isOnline: status }),
}));

// 監聽網路狀態
window.addEventListener('online', () => useStore.getState().setOnlineStatus(true));
window.addEventListener('offline', () => useStore.getState().setOnlineStatus(false));
