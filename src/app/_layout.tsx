import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useCallback, useEffect } from "react";
import { ImageBackground } from "react-native";
import Toast from "react-native-toast-message";
import ErrorState from "@/components/common/ErrorState";
import {
  useBrands,
  useMegaCategories,
  useSliders,
} from "@/hooks/home/topSection";
import { useFeaturedSection } from "@/hooks/home/featuredSections";
import { useSessionStore } from "@/store/useSessionStore";
import { useAppDataStore } from "@/store/useAppDataStore";
import { getOrCreateSessionId } from "@/lib/session";

// Create query client instance outside component
const queryClient = new QueryClient();

const newArrivalsOptions = {
  per_page: 15,
  sort: "price_high_low" as const,
  page: 1,
};

function AppLayout() {
  const { setSessionId } = useSessionStore();
  const { setBrands, setSliders, setMegaCategories, setNewArrivals } =
    useAppDataStore();

  const brandsQuery = useBrands();
  const slidersQuery = useSliders();
  const megaQuery = useMegaCategories();
  const newArrivalsQuery = useFeaturedSection(
    "new-arrivals",
    newArrivalsOptions
  );

  const initializeSession = useCallback(async () => {
    const id = await getOrCreateSessionId();
    setSessionId(id);
  }, []);

  useEffect(() => {
    if (brandsQuery.data) setBrands(brandsQuery.data);
    if (slidersQuery.data) setSliders(slidersQuery.data);
    if (megaQuery.data) setMegaCategories(megaQuery.data);
    if (newArrivalsQuery.data) setNewArrivals(newArrivalsQuery.data);
  }, [
    brandsQuery.data,
    slidersQuery.data,
    megaQuery.data,
    newArrivalsQuery.data,
  ]);

  useEffect(() => {
    initializeSession();
  }, []);

  const appNotReady =
    brandsQuery.isLoading || slidersQuery.isLoading || megaQuery.isLoading;
  const anyError =
    brandsQuery.isError || slidersQuery.isError || megaQuery.isError;

  if (anyError) {
    return (
      <ErrorState
        onRetry={() => {
          brandsQuery.refetch();
          slidersQuery.refetch();
          megaQuery.refetch();
        }}
        subtitle="Failed to load initial data"
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
      <AppLayout />
    </QueryClientProvider>
  );
}
