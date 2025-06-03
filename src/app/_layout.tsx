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

const queryClient = new QueryClient();

// Loading Context for managing section loading states
interface LoadingContextType {
  loadingSections: Set<string>;
  addLoadingSection: (sectionId: string) => void;
  removeLoadingSection: (sectionId: string) => void;
  isAnyLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const useLoadingContext = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoadingContext must be used within LoadingProvider");
  }
  return context;
};

const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loadingSections, setLoadingSections] = useState<Set<string>>(
    new Set()
  );

  const addLoadingSection = useCallback((sectionId: string) => {
    setLoadingSections((prev) => new Set(prev).add(sectionId));
  }, []);

  const removeLoadingSection = useCallback((sectionId: string) => {
    setLoadingSections((prev) => {
      const newSet = new Set(prev);
      newSet.delete(sectionId);
      return newSet;
    });
  }, []);

  const isAnyLoading = loadingSections.size > 0;

  return (
    <LoadingContext.Provider
      value={{
        loadingSections,
        addLoadingSection,
        removeLoadingSection,
        isAnyLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

// Session Context (your existing context)
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
      newArrivals, // Added this to dependency array
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
    <LoadingProvider>
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
    </LoadingProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithProviders />
    </QueryClientProvider>
  );
}
