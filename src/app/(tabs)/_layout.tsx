import React, { useCallback } from "react";
import { Tabs } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

import { useCartStore } from "@/store/cartStore";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react-native";
import { Platform } from "react-native";
// Corrected Haptics import: Import all as Haptics
import * as Haptics from "expo-haptics";
import { ImpactFeedbackStyle } from "expo-haptics"; // Keep this for the style enum

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const totalCartQuantity = useCartStore(
    useCallback((state) => state.totalQuantity, [])
  );
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        lazy: true,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        animation: "fade",
      }}
      initialRouteName="home"
      screenListeners={{
        tabPress: (e) => {
          // Add a check to ensure Haptics is available before calling methods
          if (Haptics && (Platform.OS === "ios" || Platform.OS === "android")) {
            Haptics.impactAsync(ImpactFeedbackStyle.Light);
          }
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Home size={24} color="#5e3ebd" strokeWidth={1.8} />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          headerShown: false,
          tabBarLabel: "Categories",
          tabBarIcon: ({ color }) => <LayoutGrid size={24} color="#5e3ebd" />,
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarLabel: "Cart",
          tabBarIcon: ({ color }) => <ShoppingBag size={24} color="#5e3ebd" />,
          tabBarBadge: totalCartQuantity || undefined,
          tabBarBadgeStyle: {
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#FF6B6B",
          },
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          headerShown: false,
          title: "Account",
          tabBarLabel: "Account",
          tabBarIcon: ({ color }) => <User size={24} color="#5e3ebd" />,
        }}
      />
    </Tabs>
  );
}
