import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { getOrCreateSessionId } from "@/lib/session";
import { initOneSignalNew } from "@/Services/OneSignalService";
import "./global.css";

export const queryClient = new QueryClient({});

const newArrivalsOptions = {
  per_page: 15,
  sort: "price_high_low" as const,
  page: 1,
};

async function prefetchInitialData() {
  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["brands"],
        queryFn: () =>
          axios.get("/get-brand-data").then((res) => res.data.data || []),
      }),
      queryClient.prefetchQuery({
        queryKey: ["sliders"],
        queryFn: () =>
          axios
            .get("/getSlider/home-slider")
            .then((res) => res.data.data.slides || []),
      }),
      queryClient.prefetchQuery({
        queryKey: ["megaCategories"],
        queryFn: () =>
          axios.get("/getMegaCategories").then((res) => res.data.data || []),
      }),
      queryClient.prefetchQuery({
        queryKey: ["featuredSection", "new-arrivals", newArrivalsOptions],
        queryFn: () =>
          axios
            .get("/featured-section/new-arrivals", {
              params: newArrivalsOptions,
            })
            .then((res) => res.data.data || []),
      }),
    ]);

    const token = await SecureStore.getItemAsync("token");
    if (token) {
      await queryClient.prefetchQuery({
        queryKey: ["wishlist", token],
        queryFn: () =>
          axiosApi
            .get("/favorite", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => res.data.data || []),
      });
    }
  } catch (error) {
    console.error("Prefetch error:", error);
  }
}

async function initializeApp() {
  try {
    initOneSignalNew();
    await getOrCreateSessionId();

    prefetchInitialData();
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

initializeApp();

import "expo-router/entry";
import axiosApi from "@/apis/axiosApi";
