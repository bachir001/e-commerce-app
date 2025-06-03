import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface SectionSeparatorProps {
  variant?: "promo" | "newsletter" | "social" | "tips" | "trending";
  onPress?: () => void;
}

export default function SectionSeparator({
  variant = "promo",
  onPress,
}: SectionSeparatorProps) {
  if (variant === "newsletter") {
    return (
      <View className="py-6 px-4" style={{ backgroundColor: "#FFF8E1" }}>
        <View className="flex-row items-center justify-between bg-white rounded-xl p-4 shadow-sm">
          <View className="flex-1">
            <Text className="font-bold text-gray-800 text-base">
              Stay Updated!
            </Text>
            <Text className="text-gray-600 text-sm">
              Get exclusive deals & new arrivals
            </Text>
          </View>
          <TouchableOpacity
            onPress={onPress}
            className="px-4 py-2 rounded-lg bg-amber-100 border border-amber-200"
          >
            <Text className="text-amber-800 font-semibold text-sm">
              Subscribe
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (variant === "social") {
    return (
      <View className="py-6 px-4" style={{ backgroundColor: "#FFF8E1" }}>
        <View className="items-center">
          <Text className="font-bold text-gray-800 text-base mb-3">
            Follow Us
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-amber-100 border border-amber-200">
              <FontAwesome5 name="facebook-f" size={16} color="#B45309" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-amber-100 border border-amber-200">
              <FontAwesome5 name="instagram" size={16} color="#B45309" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center bg-amber-100 border border-amber-200">
              <FontAwesome5 name="twitter" size={16} color="#B45309" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (variant === "tips") {
    return (
      <View className="py-6 px-4" style={{ backgroundColor: "#FFF8E1" }}>
        <View className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-amber-300">
          <View className="flex-row items-center mb-2">
            <FontAwesome5 name="lightbulb" size={16} color="#B45309" />
            <Text className="font-bold text-gray-800 text-base ml-2">
              Pro Tip
            </Text>
          </View>
          <Text className="text-gray-600 text-sm">
            Use filters to find exactly what you're looking for faster!
          </Text>
        </View>
      </View>
    );
  }

  if (variant === "trending") {
    return (
      <View className="py-6 px-4" style={{ backgroundColor: "#FFF8E1" }}>
        <View className="flex-row items-center justify-center">
          <FontAwesome5 name="fire" size={16} color="#F59E0B" />
          <Text className="font-bold text-gray-800 text-base mx-2">
            Trending Now
          </Text>
          <FontAwesome5 name="fire" size={16} color="#F59E0B" />
        </View>
        <Text className="text-center text-gray-600 text-sm mt-1">
          Don't miss out on what everyone's buying
        </Text>
      </View>
    );
  }

  // Default promo variant
  return (
    <View className="py-4 px-4" style={{ backgroundColor: "#FFF8E1" }}>
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between bg-amber-50 p-3 rounded-lg border border-amber-100"
      >
        <View className="flex-1">
          <Text className="text-amber-800 font-bold text-base">
            🎉 Special Offer!
          </Text>
          <Text className="text-amber-700 text-sm">
            Get 20% off your first order
          </Text>
        </View>
        <View className="flex-row items-center bg-amber-100 px-3 py-1.5 rounded-full">
          <Text className="text-amber-800 font-semibold text-sm mr-2">
            Shop Now
          </Text>
          <FontAwesome5 name="chevron-right" size={12} color="#B45309" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
