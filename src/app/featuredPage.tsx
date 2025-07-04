import InfiniteList from "@/components/common/InfiniteList";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function FeaturedPage() {
  const { pageName, slug } = useLocalSearchParams();

  useEffect(() => {
    console.log(slug);
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "white" }}>
      <View className="px-6 pt-4 pb-6">
        <View className="flex-row items-center mb-4">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: "rgba(110, 62, 189, 0.1)" }}
          >
            <Ionicons name="star" size={24} color="#6e3ebd" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              {pageName || "Featured Products"}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Discover our handpicked selection
            </Text>
          </View>
        </View>

        <View
          className="p-4 rounded-2xl mb-4"
          style={{ backgroundColor: "rgba(110, 62, 189, 0.08)" }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                Premium Collection
              </Text>
              <Text className="text-sm text-gray-600">
                Curated products just for you
              </Text>
            </View>
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: "#6e3ebd" }}
            >
              <Ionicons name="diamond" size={20} color="white" />
            </View>
          </View>
        </View>
      </View>

      <InfiniteList
        isBrand={false}
        color="#6e3ebd"
        slug={Array.isArray(slug) ? slug[0] : slug}
        isFeatured
      />
    </SafeAreaView>
  );
}
