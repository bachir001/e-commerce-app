import { create } from "zustand";
import { Brand, Slider, MegaCategory } from "@/types/globalTypes";
import axiosApi from "@/apis/axiosApi";

interface AppDataState {
  brands: Brand[] | null;
  sliders: Slider[] | null;
  megaCategories: MegaCategory[] | null;
  fetchBrands: () => Promise<void>;
  fetchSliders: () => Promise<void>;
  fetchMegaCategories: () => Promise<void>;
}

export const useAppDataStore = create<AppDataState>((set) => ({
  brands: null,
  sliders: null,
  megaCategories: null,

  fetchBrands: async () => {
    const { data } = await axiosApi.get("get-brand-data");
    set({ brands: data.data });
  },

  fetchSliders: async () => {
    const { data } = await axiosApi.get("getSlider/home-slider");
    set({ sliders: data.data.slides });
  },

  fetchMegaCategories: async () => {
    const { data } = await axiosApi.get("getMegaCategories");
    set({ megaCategories: data.data });
  },
}));
