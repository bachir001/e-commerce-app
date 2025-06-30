import { router } from "expo-router";
import { ChevronLeft, Heart, Share2 } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import type React from "react";
import { FontAwesome5 } from "@expo/vector-icons";

interface ProductHeaderProps {
  toggleFavorite: () => void;
  isFavorite: boolean;
  shareProduct: () => Promise<void>;
}

export default function ProductHeader({
  toggleFavorite,
  isFavorite,
  shareProduct,
}: ProductHeaderProps): React.ReactElement {
  return (
    <View className="flex-row justify-between items-center px-4 py-2">
      <TouchableOpacity
        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        activeOpacity={0.7}
        onPress={() => router.back()}
      >
        <ChevronLeft size={24} color="#333" />
      </TouchableOpacity>

      <View className="flex-row">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2"
          onPress={toggleFavorite}
          activeOpacity={0.7}
        >
          <FontAwesome5
            name="heart"
            size={16}
            color={isFavorite ? "#ffb500" : "#666"}
            solid={isFavorite}
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          onPress={shareProduct}
          activeOpacity={0.7}
        >
          <Share2 size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
