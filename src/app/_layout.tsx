import { Stack } from "expo-router";
import { getOrCreateSessionId } from "@/lib/session";
import { View, ActivityIndicator } from "react-native";
import React, { createContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import "../../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface SessionContextType {
  sessionId: string;
  isLogged: UserContext | null;
  setIsLogged: React.Dispatch<React.SetStateAction<UserContext | null>>;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export interface UserContext {
  id: number;
  first_name: string;
  last_name: string;
  mobile: string | null;
  gender_id: number | null;
  gender: string;
  date_of_birth: string | null;
  email: string | null;
  email_verified: boolean;
  mobile_verified: boolean;
}

export default function RootLayout() {
  const [sessionId, setSession] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [user, setUser] = useState<UserContext | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const id = await getOrCreateSessionId();
        setSession(id);
      } catch (error) {
        console.error("Error getting session ID:", error);
      }
    })();
  }, []);

  if (!sessionId) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <SessionContext.Provider
        value={{
          sessionId,
          isLogged,
          setIsLogged,
          user,
          setUser,
          token,
          setToken,
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
      </SessionContext.Provider>
      <Toast />
    </>
  );
}
