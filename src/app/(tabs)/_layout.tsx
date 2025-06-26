import React, { useCallback, useRef, useEffect } from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useCartStore } from "@/store/cartStore";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react-native";
import { Platform, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { ImpactFeedbackStyle } from "expo-haptics";
import { useUiStore } from "@/store/useUiStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  // const colorScheme = useColorScheme() ?? "light";
  const totalCartQuantity = useCartStore(
    useCallback((state) => state.totalQuantity, [])
  );

  const { isTabBarVisible } = useUiStore();
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const tabBarHeight = 65;
  const dynamicBottomMargin = 20 + insets.bottom;

  useEffect(() => {
    Animated.timing(tabBarTranslateY, {
      toValue: isTabBarVisible ? 0 : tabBarHeight + dynamicBottomMargin + 5,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isTabBarVisible, tabBarTranslateY, tabBarHeight, dynamicBottomMargin]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
        lazy: true,
        tabBarStyle: {
          backgroundColor: "#6e3ebd",
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: 0,
          paddingTop: 5,
          marginHorizontal: 16,
          marginBottom: dynamicBottomMargin,
          borderRadius: 20,
          position: "absolute",
          shadowColor: "#6e3ebd",
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.35,
          shadowRadius: 25,
          elevation: 20,
          transform: [{ translateY: tabBarTranslateY }],
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        animation: "fade",
      }}
      initialRouteName="home"
      screenListeners={{
        tabPress: (e) => {
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
          tabBarIcon: ({ focused }) => (
            <Home
              size={20}
              color={focused ? "white" : "rgba(255,255,255,0.6)"}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          headerShown: false,
          tabBarLabel: "Categories",
          tabBarIcon: ({ focused }) => (
            <LayoutGrid
              size={20}
              color={focused ? "white" : "rgba(255,255,255,0.6)"}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          headerShown: false,
          tabBarLabel: "Cart",
          tabBarIcon: ({ focused }) => (
            <ShoppingBag
              size={20}
              color={focused ? "white" : "rgba(255,255,255,0.6)"}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
          tabBarBadge: totalCartQuantity || undefined,
          tabBarBadgeStyle: {
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#FF4757",
            borderWidth: 1.5,
            borderColor: "#6e3ebd",
            fontSize: 10,
            fontWeight: "700",
            color: "white",
          },
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          headerShown: false,
          title: "Account",
          tabBarLabel: "Account",
          tabBarIcon: ({ focused }) => (
            <User
              size={20}
              color={focused ? "white" : "rgba(255,255,255,0.6)"}
              strokeWidth={focused ? 2.2 : 1.8}
            />
          ),
        }}
      />
    </Tabs>
  );
}