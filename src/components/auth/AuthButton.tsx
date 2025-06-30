import { View, Text, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface AuthButtonParams {
  text: string;
  icon: string;
  iconColor?: string;
  href?: string;
}

export default function AuthButton({
  text,
  icon,
  iconColor = "#6b7280",
  href,
}: AuthButtonParams) {
  const router = useRouter();

  return (
    <Pressable
      className="flex-row items-center py-4 px-5 rounded-2xl border"
      style={{
        backgroundColor: "white",
        borderColor: "rgba(110, 62, 189, 0.15)",
        shadowColor: "rgba(110, 62, 189, 0.1)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 4,
      }}
      onPress={() => {
        if (href) {
          router.navigate(href);
        }
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: "rgba(110, 62, 189, 0.1)" }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="flex-1 text-gray-800 font-semibold text-base">
        {text}
      </Text>
      <View
        className="w-8 h-8 rounded-full items-center justify-center"
        style={{ backgroundColor: "rgba(110, 62, 189, 0.08)" }}
      >
        <Ionicons name="chevron-forward" size={16} color="#6e3ebd" />
      </View>
    </Pressable>
  );
}
