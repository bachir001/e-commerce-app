// src/app/(tabs)/layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCartStore } from '@/store/cartStore';

export default function TabLayout() {

  const fetchCart = useCartStore((s) => s.fetchCart);

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const colorScheme = useColorScheme() ?? 'light';
  // Subscribe to the cart items array
  const cartItems = useCartStore((state) => state.items);

  // Compute total quantity (you could also do `cartItems.length` if
  // you just want distinct line-item count)
  const totalCartQuantity = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
 
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          headerShown: false,
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color }) => (
            <Entypo name="menu" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color }) => (
            <Entypo name="shopping-cart" size={24} color={color} />
          ),
          // only show a badge when there's at least one item
          tabBarBadge:
            totalCartQuantity > 0 ? totalCartQuantity : undefined,
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
