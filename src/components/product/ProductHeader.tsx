import { router } from "expo-router";
import { ChevronLeft, Heart, Share2 } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

export default function ProductHeader({
  toggleFavorite,
  isFavorite,
  shareProduct,
}) {
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
          <Heart
            size={20}
            color={isFavorite ? "#FF4D4F" : "#333"}
            fill={isFavorite ? "#FF4D4F" : "transparent"}
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
