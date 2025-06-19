import "../../global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { useSessionStore } from "@/store/useSessionStore";
import { useAppDataStore } from "@/store/useAppDataStore";
import { addExternalUserID } from "@/Services/notificationService";
export const queryClient = new QueryClient({});

const newArrivalsOptions = {
  per_page: 15,
  sort: "price_high_low" as const,
  page: 1,
};

// SplashScreen.preventAutoHideAsync();

function AppWithProviders() {
  const { setSessionId } = useSessionStore();
  const { setBrands, setSliders, setMegaCategories, setNewArrivals } =
    useAppDataStore();

  const { data: brands, isLoading: loadingBrands } = useBrands();
  const { data: sliders, isLoading: loadingSliders } = useSliders();
  const { data: megaCategories, isLoading: loadingMega } = useMegaCategories();

  const { data: newArrivals, isLoading: loadingNewArrivals } =
    useFeaturedSection("new-arrivals", newArrivalsOptions);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const id = await getOrCreateSessionId();
        const userString = await AsyncStorage.getItem("user");
        const userParsed = userString ? JSON.parse(userString) : null;
        setSessionId(id);
        
        console.log("This is me hello: ", userParsed)
        initOneSignal();

        console.log("User parsed:", userParsed);
        
        await addExternalUserID(userParsed);
        
        if (brands && !loadingBrands) setBrands(brands);
        if (sliders && !loadingSliders) setSliders(sliders);
        if (megaCategories && !loadingMega) {
          // console.log(megaCategories);
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
    // loadingBrands,
    // loadingSliders,
    // loadingMega,
    // loadingNewArrivals,
  ]);

  const appNotReady = loadingBrands || loadingSliders || loadingMega;

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
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithProviders />
    </QueryClientProvider>
  );
}
