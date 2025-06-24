import { create } from "zustand";

interface UiState {
  isTabBarVisible: boolean;
  showTabBar: () => void;
  hideTabBar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isTabBarVisible: true,
  showTabBar: () => set({ isTabBarVisible: true }),
  hideTabBar: () => set({ isTabBarVisible: false }),
}));
