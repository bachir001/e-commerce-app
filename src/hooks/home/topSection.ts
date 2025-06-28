import { useQuery } from "@tanstack/react-query";
import axiosApi from "@/apis/axiosApi";
import axios from "axios";

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () =>
      axiosApi.get("/get-brand-data").then((res) => res.data.data || []),
    staleTime: 24 * 1000 * 60 * 60,
    retry: 2,
  });
}

export function useSliders() {
  return useQuery({
    queryKey: ["sliders"],
    queryFn: () =>
      axiosApi
        .get("/getSlider/home-slider")
        .then((res) => res.data.data.slides || []),
    staleTime: 24 * 1000 * 60 * 60,
    retry: 2,
  });
}

export function useMegaCategories() {
  return useQuery({
    queryKey: ["megaCategories"],
    queryFn: () =>
      axiosApi.get("/getMegaCategories").then((res) => res.data.data || []),
    staleTime: 24 * 1000 * 60 * 60,
    retry: 2,
  });
}

export function useWishlist(token: string | null) {
  return useQuery({
    queryKey: ["wishlist", token],
    queryFn: () => {
      if (!token) return [];
      return axiosApi
        .get("/favorite", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.data.data || []);
    },
    enabled: !!token,
  });
}
