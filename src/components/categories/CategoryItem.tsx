import type { MainCategory } from "@/app/(tabs)/categories";
import { Colors } from "@/constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import { Image, Text, TouchableOpacity, View, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const ITEM_WIDTH = (screenWidth - 48) / 3;

export type niche =
  | "garden-tools"
  | "sports-outdoor"
  | "hardware-and-fasteners"
  | "home-living"
  | "beauty-health";

export const allowedNiches: niche[] = [
  "garden-tools",
  "sports-outdoor",
  "hardware-and-fasteners",
  "home-living",
  "beauty-health",
];

export const colorMap: Record<string, string> = {
  "beauty-health": Colors.beautyAndHealth,
  "home-living": Colors.homeAndLiving,
  "hardware-and-fasteners": Colors.hardware,
  "garden-tools": Colors.agriculture,
  "sports-outdoor": Colors.sportsAndOutdoors,
};

export default function CategoryItem({
  item,
  color,
}: {
  item: MainCategory;
  color: string;
}) {
  const computedValues = useMemo(
    () => ({
      hasImage: item.main_image && item.main_image.trim() !== "",
      subcategoriesCount: item.subcategories?.length || 0,
      categoryColor: colorMap[item.slug as niche] || color,
      isAllowedNiche: allowedNiches.includes(item.slug as niche),
    }),
    [item.main_image, item.subcategories, item.slug, color]
  );

  const handleCategoryPress = useCallback(() => {
    const categoryData = {
      id: item.id,
      name: item.name,
      slug: item.slug,
      main_image: item.main_image,
      subcategories: item.subcategories,
    };

    router.navigate({
      pathname: computedValues.isAllowedNiche ? "mega" : "category",
      params: {
        slug: String(categoryData.slug),
        color: computedValues.categoryColor,
        id: String(categoryData.id),
      },
    });
  }, [item, computedValues]);

  return (
    <TouchableOpacity
      onPress={handleCategoryPress}
      style={{
        width: ITEM_WIDTH,
        marginBottom: 16,
      }}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: ITEM_WIDTH - 5,
          height: ITEM_WIDTH,
          borderRadius: 12,
          backgroundColor: computedValues.hasImage ? "#F8FAFC" : color,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        {computedValues.hasImage ? (
          <Image
            source={{ uri: item.main_image }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            // Add caching for better performance
            cache="force-cache"
            fadeDuration={0}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <FontAwesome5 name="th-large" size={24} color="white" />
            <Text
              className="text-white text-xs font-medium mt-2 text-center px-2"
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </View>
        )}

        {computedValues.subcategoriesCount > 0 && (
          <View className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1">
            <Text className="text-xs font-bold text-gray-700">
              {computedValues.subcategoriesCount}
            </Text>
          </View>
        )}
      </View>

      <Text
        className="text-gray-900 text-sm font-semibold text-center"
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}
