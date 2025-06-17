import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Governorate, UserContextType } from "@/types/globalTypes";

interface SessionState {
  sessionId: string | null;
  isLogged: boolean;
  user: UserContextType | null;
  token: string | null;
  governorates: Governorate[];
  setSessionId: (id: string | null) => void;
  setIsLogged: (logged: boolean) => void;
  setUser: (user: UserContextType | null) => void;
  setToken: (token: string | null) => void;
  setGovernorates: (govs: Governorate[]) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  sessionId: null,
  isLogged: false,
  user: null,
  token: null,
  governorates: [],
  setSessionId: (id) => set({ sessionId: id }),
  setIsLogged: (logged) => set({ isLogged: logged }),
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setGovernorates: (govs) => set({ governorates: govs }),
}));
