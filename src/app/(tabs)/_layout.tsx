import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCartStore } from "@/store/cartStore";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  // const fetchCart = useCartStore((s) => s.fetchCart);

  // const totalCartQuantity = useCartStore((state) =>
  //   state.items.reduce((sum, item) => sum + item.quantity, 0)
  // );

  // useEffect(() => {
  //   fetchCart();
  // }, [fetchCart]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        lazy: true,
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
          // tabBarBadge: totalCartQuantity > 0 ? totalCartQuantity : undefined,
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
