import "../../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createContext,
  useEffect,
  useMemo,
  useState,
  useContext,
  useCallback,
} from "react";
import { getOrCreateSessionId } from "@/lib/session";
import { initOneSignal } from "@/Services/oneSignal";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { ImageBackground } from "react-native";
import {
  Governorate,
  SessionContextValue,
  UserContextType,
} from "@/types/globalTypes";
import {
  useBrands,
  useMegaCategories,
  useSliders,
} from "@/hooks/home/topSection";
import { useFeaturedSection } from "@/hooks/home/featuredSections";

export const queryClient = new QueryClient();

export let SessionContext = createContext<SessionContextValue | null>(null);

function AppWithProviders() {
  const { data: brands, isLoading: loadingBrands } = useBrands();
  const { data: sliders, isLoading: loadingSliders } = useSliders();
  const { data: megaCategories, isLoading: loadingMega } = useMegaCategories();
  const { data: newArrivals, isLoading: loadingNewArrivals } =
    useFeaturedSection("new-arrivals", {
      per_page: 15,
      sort: "price_high_low" as const,
      page: 1,
    });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [user, setUser] = useState<UserContextType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);

  useEffect(() => {
    async function performInitialLoad() {
      try {
        const id = await getOrCreateSessionId();
        setSessionId(id);
        initOneSignal();
      } catch (error) {
        console.error("Error during initial app load:", error);
      }
    }

    performInitialLoad();
  }, []);

  const appNotReady =
    loadingBrands || loadingSliders || loadingMega || loadingNewArrivals;

  const contextValue = useMemo(
    () => ({
      sessionId,
      isLogged,
      setIsLogged,
      user,
      setUser,
      token,
      setToken,
      governorates,
      setGovernorates,
      brands,
      sliders,
      megaCategories,
      newArrivals,
    }),
    [
      sessionId,
      isLogged,
      user,
      token,
      governorates,
      brands,
      sliders,
      megaCategories,
      newArrivals,
    ]
  );

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
    <SessionContext.Provider value={contextValue}>
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
    </SessionContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithProviders />
    </QueryClientProvider>
  );
}
