import { create } from "zustand";
import {
  Brand,
  Slider,
  MegaCategory,
  Product,
  UserContextType,
  Governorate,
} from "@/types/globalTypes";
import axiosApi from "@/apis/axiosApi";

interface SessionStore {
  sessionId: string | null;
  isLogged: boolean;
  user: UserContextType | null;
  token: string | null;
  governorates: Governorate[];

  setSessionId: (sessionId: string | null) => void;
  setIsLogged: (logged: boolean) => void;
  setUser: (user: UserContextType) => void;
  setToken: (token: string) => void;
  setGovernorates: (governorates: Governorate[]) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: null,
  isLogged: false,
  user: null,
  token: null,
  governorates: [],

  setSessionId: (sessionId: string | null) => {
    set({ sessionId: sessionId });
  },
  setIsLogged: (logged) => {
    set({ isLogged: logged });
  },
  setUser: (user) => {
    set({ user: user });
  },
  setToken: (token) => {
    set({ token });
  },
  setGovernorates: (governorates) => {
    set({ governorates });
  },
}));
