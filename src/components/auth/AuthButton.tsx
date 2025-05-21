import { View, Text, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface AuthButtonParams {
  text: string;
  icon: string;
  iconColor: string;
}
export default function AuthButton({
  text,
  icon,
  iconColor,
}: AuthButtonParams) {
  return (
    <Pressable className="flex flex-row py-4 pl-2 bg-transparent border border-black rounded-lg text-sm items-center">
      <Ionicons name={icon} size={24} color={iconColor} />
      <Text className="text-center flex-1">{text}</Text>
    </Pressable>
  );
}
