import React from "react";
import { View, SafeAreaView } from "react-native";
import { Slot, Stack, useSegments } from "expo-router";
import Sidebar from "@/components/Sidebar";

export default function CategoriesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
