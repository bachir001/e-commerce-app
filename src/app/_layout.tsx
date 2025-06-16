import "../../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { getOrCreateSessionId } from "@/lib/session";
import { initOneSignal } from "@/Services/oneSignal";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { ImageBackground } from "react-native";
import {
  useBrands,
  useMegaCategories,
  useSliders,
} from "@/hooks/home/topSection";
import { useFeaturedSection } from "@/hooks/home/featuredSections";
import * as SplashScreen from "expo-splash-screen";
import { useSessionStore } from "@/store/useSessionStore";
import { useAppDataStore } from "@/store/useAppDataStore";

export const queryClient = new QueryClient({});

SplashScreen.preventAutoHideAsync();

function AppWithProviders() {
  const setSessionId = useSessionStore((state) => state.setSessionId);
  const setBrands = useAppDataStore((state) => state.setBrands);
  const setSliders = useAppDataStore((state) => state.setSliders);
  const setMegaCategories = useAppDataStore((state) => state.setMegaCategories);
  const setNewArrivals = useAppDataStore((state) => state.setNewArrivals);

  const { data: brands, isLoading: loadingBrands } = useBrands();
  const { data: sliders, isLoading: loadingSliders } = useSliders();
  const { data: megaCategories, isLoading: loadingMega } = useMegaCategories();

  const newArrivalsOptions = useMemo(
    () => ({
      per_page: 15,
      sort: "price_high_low" as const,
      page: 1,
    }),
    []
  );

  const { data: newArrivals, isLoading: loadingNewArrivals } =
    useFeaturedSection("new-arrivals", newArrivalsOptions);

  // Combined initialization and data loading effect
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize session
        const id = await getOrCreateSessionId();
        setSessionId(id);
        initOneSignal();

        // Update stores only when data changes
        if (brands && !loadingBrands) setBrands(brands);
        if (sliders && !loadingSliders) setSliders(sliders);
        if (megaCategories && !loadingMega) setMegaCategories(megaCategories);
        if (newArrivals && !loadingNewArrivals) setNewArrivals(newArrivals);

        // Hide splash screen when all data is loaded
        if (
          !loadingBrands &&
          !loadingSliders &&
          !loadingMega &&
          !loadingNewArrivals
        ) {
          await SplashScreen.hideAsync();
        }
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
    loadingBrands,
    loadingSliders,
    loadingMega,
    loadingNewArrivals,
  ]);

  const appNotReady =
    loadingBrands || loadingSliders || loadingMega || loadingNewArrivals;

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
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/signInAccount"
          options={{ headerShown: true, title: "Sign In" }}
        />
      </Stack>
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
