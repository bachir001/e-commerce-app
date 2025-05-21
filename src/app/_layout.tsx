import { Stack } from "expo-router";
import { getOrCreateSessionId } from "@/lib/session";
import { View, ActivityIndicator } from "react-native";
import React, { createContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import "../../global.css";

export const SessionContext = createContext<string | null>(null);

export default function RootLayout() {
  const [sessionId, setSession] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const id = await getOrCreateSessionId();
        setSession(id);
      } catch (error) {
        console.error("Error getting session ID:", error);
        // Handle error (e.g., show error message)
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
      <SessionContext.Provider value={sessionId}>
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
