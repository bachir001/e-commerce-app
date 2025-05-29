import { Stack } from "expo-router";
import { getOrCreateSessionId } from "@/lib/session";
import { ImageBackground, View } from "react-native";
import React, { createContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import "../../global.css";
import { initOneSignal } from "@/Services/oneSignal";
import axiosApi from "@/apis/axiosApi";
import {
  Address,
  Brand,
  Governorate,
  MegaCategories,
  SessionContextValue,
  Slider,
  UserContextType,
} from "@/types/contextTypes";

export const SessionContext = createContext<SessionContextValue | null>(null);

export default function RootLayout() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [user, setUser] = useState<UserContextType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  //account page
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);

  //home top section
  const [appIsReady, setAppIsReady] = useState<boolean>(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [megaCategories, setMegaCategories] = useState<MegaCategories[]>([]);

  const addAddress = (address: Address) => {
    setAddresses((prevAddresses) => [...prevAddresses, address]);
  };

  useEffect(() => {
    async function performInitialLoad() {
      try {
        const [id, brands, sliders, megaCategories] = await Promise.all([
          getOrCreateSessionId(),
          axiosApi.get("get-brand-data"),
          axiosApi.get("getSlider/home-slider"),
          axiosApi.get("getMegaCategories"),
        ]);

        setSessionId(id);
        initOneSignal();
        setBrands(brands.data.data);
        setSliders(sliders.data.data.slides);
        setMegaCategories(megaCategories.data.data);
      } catch (error) {
        console.error("Error during initial app load:", error);
      } finally {
        setAppIsReady(true);
      }
    }

    performInitialLoad();
  }, []);

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
        screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}
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
