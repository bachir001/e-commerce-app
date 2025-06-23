import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons"; // or any icon library you're using

export default function ErrorState({
  title = "Something went wrong",
  subtitle = "We're having trouble loading this content",
  icon = "alert-circle",
  onRetry,
  retryText = "Try again",
}) {
  return (
    <View className="flex-1 justify-center items-center px-8 py-12">
      {/* Icon Container */}
      <View
        className="w-20 h-20 rounded-full justify-center items-center mb-6"
        style={{ backgroundColor: "#fef2f2" }}
      >
        <Feather name={icon} size={32} color="#ef4444" />
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
        className="text-base text-center leading-6 mb-8"
        style={{ color: "#6b7280" }}
      >
        {subtitle}
      </Text>

      {/* Retry Button */}
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="py-3 px-6 rounded-full flex-row items-center"
          style={{ backgroundColor: "#6e3ebd" }}
          activeOpacity={0.8}
        >
          <Feather
            name="refresh-cw"
            size={16}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-base font-medium" style={{ color: "white" }}>
            {retryText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
