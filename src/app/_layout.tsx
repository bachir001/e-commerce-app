import "../../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useEffect, useState } from "react";
import { getOrCreateSessionId } from "@/lib/session";
import { initOneSignal } from "@/Services/oneSignal";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { ImageBackground } from "react-native";
import {
  Address,
  Governorate,
  SessionContextValue,
  UserContextType,
} from "@/types/globalTypes";
import {
  useBrands,
  useMegaCategories,
  useSliders,
} from "@/hooks/home/topSection";

const queryClient = new QueryClient();

export let SessionContext = createContext<SessionContextValue | null>(null);

function AppWithProviders() {
  const { data: brands, isLoading: loadingBrands } = useBrands();
  const { data: sliders, isLoading: loadingSliders } = useSliders();
  const { data: megaCategories, isLoading: loadingMega } = useMegaCategories();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [user, setUser] = useState<UserContextType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);

  const addAddress = (address: Address) => {
    setAddresses((prevAddresses) => [...prevAddresses, address]);
  };

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
    <SessionContext.Provider
      value={{
        sessionId,
        isLogged,
        setIsLogged,
        user,
        setUser,
        token,
        setToken,
        addresses,
        setAddresses,
        addAddress,
        governorates,
        setGovernorates,
        brands,
        sliders,
        megaCategories,
      }}
    >
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
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  if (sessionId === null) {
    return (
      <ImageBackground
        source={require("@/assets/images/initialPageLoader.jpeg")}
        className="flex-1 justify-center items-center"
        resizeMode="cover"
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppWithProviders />
    </QueryClientProvider>
  );
}
