import "../../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getOrCreateSessionId } from "@/lib/session";
import { initOneSignal } from "@/Services/oneSignal";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { ImageBackground } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useSessionStore } from "@/store/useSessionStore";
import { useAppDataStore } from "@/store/useAppDataStore";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

SplashScreen.preventAutoHideAsync();

function AppWithProviders() {
  const [appIsReady, setAppIsReady] = useState(false);
  const setSessionId = useSessionStore((s) => s.setSessionId);
  const { fetchBrands, fetchSliders, fetchMegaCategories } = useAppDataStore();

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      console.log("run");
      try {
        const id = await getOrCreateSessionId();
        if (isMounted) {
          setSessionId(id);
          initOneSignal();
        }

        await Promise.allSettled([
          fetchBrands(),
          fetchSliders(),
          fetchMegaCategories(),
        ]);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        isMounted && setAppIsReady(true);
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (appIsReady) {
        await SplashScreen.hideAsync();
      }
    };

    hideSplashScreen();
  }, [appIsReady]);

  if (!appIsReady) {
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
