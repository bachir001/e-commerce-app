import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Brand, Slider, MegaCategory, Product } from "@/types/globalTypes";
interface AppDataState {
  brands: Brand[] | null;
  sliders: Slider[] | null;
  megaCategories: MegaCategory[] | null;
  newArrivals: Product[] | null;
  wishList: Product[] | null;
  setBrands: (brands: Brand[] | null) => void;
  setSliders: (sliders: Slider[] | null) => void;
  setMegaCategories: (megaCategories: MegaCategory[] | null) => void;
  setNewArrivals: (products: Product[] | null) => void;
  setWishList: (wishList: Product[] | null) => void;
}
export const useAppDataStore = create<AppDataState>()((set) => ({
  brands: [],
  sliders: [],
  megaCategories: [],
  newArrivals: [],
  wishList: [],
  setWishList: (wishList) => set({ wishList }),
  setBrands: (brands) => set({ brands }),
  setSliders: (sliders) => set({ sliders }),
  setMegaCategories: (megaCategories) => set({ megaCategories }),
  setNewArrivals: (products) => set({ newArrivals: products }),
}));
