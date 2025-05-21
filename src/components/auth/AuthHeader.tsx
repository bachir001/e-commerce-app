import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AuthHeader() {
  const router = useRouter();
  return (
    <View className="flex flex-row items-center justify-between">
      <Image
        source={require("@/assets/images/logo.png")}
        className="w-28 h-28"
        resizeMode="contain"
      />

      <Pressable onPress={() => router.back()}>
        <Ionicons name="close-outline" size={32}></Ionicons>
      </Pressable>
    </View>
  );
}
