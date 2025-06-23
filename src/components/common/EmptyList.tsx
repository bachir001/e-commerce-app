import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function EmptyState({
  title = "No items found",
  subtitle = "Try adjusting your search or filters",
  icon = "search",
}) {
  return (
    <View className="flex-1 justify-center items-center px-8 py-12">
      {/* Icon Container */}
      <View
        className="w-20 h-20 rounded-full justify-center items-center mb-6"
        style={{ backgroundColor: "#f3f0ff" }}
      >
        <Feather name={icon} size={32} color="#6e3ebd" />
      </View>

      {/* Main Message */}
      <Text
        className="text-xl font-semibold text-center mb-2"
        style={{ color: "#1f2937" }}
      >
        {title}
      </Text>

      {/* Subtitle */}
      <Text
        className="text-base text-center leading-6"
        style={{ color: "#6b7280" }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
