import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { router } from "expo-router";

interface Props {
  title: string;
  coloredTitle?: string;
  variant?: "purple" | "yellow";
  onViewAllPress?: () => void;
}

export default function CategoryHeader({
  title,
  coloredTitle,
  variant = "purple",
  onViewAllPress,
}: Props) {
  const [isPressed, setIsPressed] = useState(false);

  const gradientColors =
    variant === "purple"
      ? ["#5e3ebd", "#2d1e5c", "#1a1a1a"]
      : ["#FACC15", "#ca9e0e", "#1a1a1a"];

  const accentColor = variant === "purple" ? "#FACC15" : "#5e3ebd";

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <Pressable
        className="flex flex-row justify-between items-center py-4 px-4"
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
      >
        <View className="flex-row items-center">
          <Text className="text-white text-xl font-bold">{title}</Text>

          {coloredTitle && (
            <Text
              className="text-xl font-bold ml-2"
              style={{ color: accentColor }}
            >
              - {coloredTitle}
            </Text>
          )}
        </View>

        <Pressable
          className="py-2 px-4"
          style={{
            backgroundColor: `${accentColor}20`,
          }}
          onPress={() => {
            router.push("/(tabs)/categories");
          }}
        >
          <Text style={{ color: accentColor }} className="font-bold text-base">
            View All
          </Text>
        </Pressable>
      </Pressable>
    </LinearGradient>
  );
}
