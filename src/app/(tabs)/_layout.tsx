// Optimized TabLayout with smart cart loading
import React, { useEffect, useCallback, useMemo } from "react";
import { Tabs } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCartStore } from "@/store/cartStore";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";

  // Performance: Use selective subscriptions to prevent unnecessary re-renders
  const items = useCartStore((state) => state.items);
  const needsRefresh = useCartStore((state) => state.needsRefresh);
  const fetchCart = useCartStore((state) => state.fetchCart);

  // Performance: Memoize total quantity calculation
  const totalCartQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  // Performance: Smart cart loading - only when needed
  const loadCartIfNeeded = useCallback(async () => {
    if (needsRefresh()) {
      await fetchCart();
    }
  }, [needsRefresh, fetchCart]);

  useEffect(() => {
    // Load cart data on app startup, but don't block the UI
    const timer = setTimeout(() => {
      loadCartIfNeeded();
    }, 100); // Small delay to let the UI render first

    return () => clearTimeout(timer);
  }, [loadCartIfNeeded]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        lazy: false, // Keep lazy loading enabled
        // Performance: Optimize tab bar animations
        tabBarStyle: {
          // Reduce overdraw
          backgroundColor: Colors[colorScheme].background,
        },
        // Performance: Disable unnecessary animations if they cause issues
        animation: "fade", // or 'fade' for smoother transitions
      }}
      initialRouteName="home"
      screenListeners={{
        tabPress: (e) => {
          if (Platform.OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } else if (Platform.OS === "android") {
            Haptics.selectionAsync();
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
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          headerShown: false,
          tabBarLabel: "Categories",
          tabBarIcon: ({ color }) => (
            <Entypo name="menu" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarLabel: "Cart",
          tabBarIcon: ({ color }) => (
            <Entypo name="shopping-cart" size={24} color={color} />
          ),
          // Performance: Only show badge when there are items
          tabBarBadge: totalCartQuantity > 0 ? totalCartQuantity : undefined,
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
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
