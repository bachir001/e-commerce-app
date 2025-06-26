import "../../global.css";
import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { getOrCreateSessionId } from "@/lib/session";
import { Stack } from "expo-router";
import { ImageBackground } from "react-native";
import {
  useBrands,
  useMegaCategories,
  useSliders,
} from "@/hooks/home/topSection";
import { useFeaturedSection } from "@/hooks/home/featuredSections";
import { useSessionStore } from "@/store/useSessionStore";
import { useAppDataStore } from "@/store/useAppDataStore";
import { initOneSignalNew } from "@/Services/OneSignalService";

import ErrorState from "@/components/common/ErrorState";
import Toast from "react-native-toast-message";
import axiosApi from "@/apis/axiosApi";

export const queryClient = new QueryClient({});

const newArrivalsOptions = {
  per_page: 15,
  sort: "price_high_low" as const,
  page: 1,
};

// SplashScreen.preventAutoHideAsync();

function AppWithProviders() {
  const { setSessionId } = useSessionStore();
  const {
    setBrands,
    setSliders,
    setMegaCategories,
    setNewArrivals,
    setWishList,
  } = useAppDataStore();
  const {
    data: brands,
    isLoading: loadingBrands,
    isError: brandErrorBool,
    error: brandError,
    refetch: refetchBrands,
  } = useBrands();
  const {
    data: sliders,
    isLoading: loadingSliders,
    isError: sliderErrorBool,
    error: sliderError,
    refetch: refetchSliders,
  } = useSliders();
  const {
    data: megaCategories,
    isLoading: loadingMega,
    isError: megaErrorBool,
    error: megaError,
    refetch: refetchMega,
  } = useMegaCategories();

  const { data: newArrivals, isLoading: loadingNewArrivals } =
    useFeaturedSection("new-arrivals", newArrivalsOptions);

  const { isLogged, token } = useSessionStore();

  const fetchWishlist = async (token: string) => {
    try {
      const response = await axiosApi.get("favorite", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data;
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const id = await getOrCreateSessionId();
        const userString = await SecureStore.getItemAsync("user");

        if (token !== null && isLogged) {
          const wishList = await fetchWishlist(token ?? "");
          setWishList(wishList || []);
        } else {
          setWishList([]);
        }

        const userParsed = userString ? JSON.parse(userString) : null;
        setSessionId(id);

        if (brands && !loadingBrands) setBrands(brands);
        if (sliders && !loadingSliders) setSliders(sliders);
        if (megaCategories && !loadingMega) {
          setMegaCategories(megaCategories);
        }
        if (newArrivals && !loadingNewArrivals) setNewArrivals(newArrivals);
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initializeApp();
  }, [
    brands,
    sliders,
    megaCategories,
    newArrivals,
    isLogged,
    // loadingBrands,
    // loadingSliders,
    // loadingMega,
    // loadingNewArrivals,
  ]);

  useEffect(() => {
    initOneSignalNew();
    // sendUserNotification('1374',"Welcome","Hello");
    // sendGenderNotification("male", "Welcome", "Hello");
  }, []);

  const appNotReady = loadingBrands || loadingSliders || loadingMega;

  if (megaErrorBool || sliderErrorBool || brandErrorBool) {
    return (
      <ErrorState
        onRetry={() => {
          refetchBrands();
          refetchSliders();
          refetchMega();
        }}
        subtitle={megaError?.message}
      />
    );
  }

  if (appNotReady) {
    return (
      <ImageBackground
        source={require("@/assets/images/initialPageLoader.jpeg")}
        className="flex-1 justify-center items-center"
        resizeMode="cover"
      />
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
        }}
      />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithProviders />
    </QueryClientProvider>
  );
}
