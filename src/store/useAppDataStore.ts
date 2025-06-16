import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Brand, Slider, MegaCategory, Product } from "@/types/globalTypes";

interface AppDataState {
  brands: Brand[] | null;
  sliders: Slider[] | null;
  megaCategories: MegaCategory[] | null;
  newArrivals: Product[] | null;
  setBrands: (brands: Brand[] | null) => void;
  setSliders: (sliders: Slider[] | null) => void;
  setMegaCategories: (megaCategories: MegaCategory[] | null) => void;
  setNewArrivals: (products: Product[] | null) => void;
}

export const useAppDataStore = create<AppDataState>()(
  persist(
    (set) => ({
      brands: null,
      sliders: null,
      megaCategories: null,
      newArrivals: null,
      setBrands: (brands) => set({ brands }),
      setSliders: (sliders) => set({ sliders }),
      setMegaCategories: (megaCategories) => set({ megaCategories }),
      setNewArrivals: (products) => set({ newArrivals: products }),
    }),
    {
      name: "app-data-store",
      partialize: (state) => ({
        brands: state.brands,
        sliders: state.sliders,
        megaCategories: state.megaCategories,
      }),
    }
  )
);
