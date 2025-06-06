import { useQuery } from "@tanstack/react-query";
import axiosApi from "@/apis/axiosApi";

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => axiosApi.get("get-brand-data").then((res) => res.data.data),
    staleTime: 24 * 1000 * 60 * 60,
  });
}

export function useSliders() {
  return useQuery({
    queryKey: ["sliders"],
    queryFn: () =>
      axiosApi.get("getSlider/home-slider").then((res) => res.data.data.slides),
    staleTime: 24 * 1000 * 60 * 60,
  });
}

export function useMegaCategories() {
  return useQuery({
    queryKey: ["megaCategories"],
    queryFn: () =>
      axiosApi.get("getMegaCategories").then((res) => res.data.data),
    staleTime: 24 * 1000 * 60 * 60,
  });
}
