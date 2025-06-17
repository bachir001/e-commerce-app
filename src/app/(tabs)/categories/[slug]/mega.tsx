"use client";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import type { SubCategory } from "..";
import CategoryItem from "@/components/categories/CategoryItem";

const { width } = Dimensions.get("window");

export default function Mega() {
  const router = useRouter();
  const { categoryJSON, color } = useLocalSearchParams();
  const [imageLoading, setImageLoading] = useState(true);

  const category =
    typeof categoryJSON === "string" ? JSON.parse(categoryJSON) : null;
  const bgColor = Array.isArray(color) ? color[0] : color || "#5e3ebd";

  const onCategoryPress = useCallback((item: SubCategory) => {
    // Handle category navigation
    console.log("Category pressed:", item.name);
  }, []);

  const renderSubCategories = useCallback(
    ({ item, index }: { item: SubCategory; index: number }) => (
      <View className="mr-4">
        <CategoryItem item={item} onPress={() => onCategoryPress(item)} />
      </View>
    ),
    [onCategoryPress]
  );

  const keyExtractor = useCallback(
    (item: SubCategory) => item.id.toString(),
    []
  );

  const renderSectionHeader = (
    title: string,
    subtitle?: string,
    showViewAll?: boolean
  ) => (
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-1">
        <Text className="text-2xl font-bold text-gray-900">{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
        )}
      </View>
      {/* {showViewAll && (
        <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-full">
          <Text className="text-gray-700 font-semibold text-sm">View All</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bgColor }}>
      <LinearGradient
        colors={[bgColor, `${bgColor}CC`, `${bgColor}99`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ height: 200 }}
        className="px-6 py-8 justify-center items-center relative"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
        >
          <FontAwesome5 name="arrow-left" size={16} color="white" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="font-bold text-3xl text-white text-center mb-2">
            {category?.name}
          </Text>
          <Text className="text-white/80 text-base text-center">
            {category?.subcategories?.length || 0} subcategories available
          </Text>
        </View>

        <View className="absolute top-16 right-8 w-20 h-20 rounded-full bg-white/10" />
        <View className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-white/15" />
      </LinearGradient>

      {/* Main Content with improved styling */}
      <ScrollView
        className="flex-1 bg-white"
        style={{
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          marginTop: -20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View className="px-6 pt-8 pb-6">
          <View
            className="relative rounded-3xl overflow-hidden"
            style={{
              height: 220,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Image
              source={{
                uri:
                  //   category?.category_cover_image ||
                  "https://gocami.gonext.tech/_next/image?url=%2Fimages%2Fcategories%2FbeautyBanner.jpeg&w=1080&q=75",
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />

            {/* Image overlay with gradient */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.3)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
              }}
            />

            {/* Loading state */}
            {imageLoading && (
              <View className="absolute inset-0 bg-gray-200 items-center justify-center">
                <FontAwesome5 name="image" size={32} color="#9CA3AF" />
              </View>
            )}

            {/* Featured badge */}
            <View className="absolute top-4 left-4 bg-white/90 rounded-full px-3 py-1">
              <Text className="text-xs font-bold" style={{ color: bgColor }}>
                FEATURED
              </Text>
            </View>
          </View>
        </View>

        {/* Categories Section */}
        <View className="px-6 mb-8">
          {renderSectionHeader(
            "Subcategories",
            "Explore different types within this category",
            true
          )}

          {category?.subcategories && category.subcategories.length > 0 ? (
            <FlatList
              data={category.subcategories}
              renderItem={renderSubCategories}
              keyExtractor={keyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24 }}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              removeClippedSubviews={true}
            />
          ) : (
            <View className="bg-gray-50 rounded-2xl p-8 items-center">
              <FontAwesome5 name="folder-open" size={32} color="#9CA3AF" />
              <Text className="text-gray-500 font-medium mt-3">
                No subcategories available
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                Check back later for more options
              </Text>
            </View>
          )}
        </View>

        {/* Best Sellers Section */}
        <View className="px-6 mb-8">
          {renderSectionHeader(
            "Popular Choices",
            "Most loved items in this category",
            true
          )}

          <View className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-amber-100 rounded-2xl items-center justify-center mr-3">
                <FontAwesome5 name="fire" size={18} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900">Trending Now</Text>
                <Text className="text-gray-600 text-sm">
                  Based on customer preferences
                </Text>
              </View>
            </View>
          </View>

          {category?.subcategories && category.subcategories.length > 0 ? (
            <FlatList
              data={category.subcategories.slice(0, 5)}
              renderItem={renderSubCategories}
              keyExtractor={keyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24 }}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              removeClippedSubviews={true}
            />
          ) : (
            <View className="bg-gray-50 rounded-2xl p-8 items-center">
              <FontAwesome5 name="star" size={32} color="#9CA3AF" />
              <Text className="text-gray-500 font-medium mt-3">
                No popular items yet
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                Be the first to discover great products
              </Text>
            </View>
          )}
        </View>

        {/* Additional Info Section */}
        <View className="px-6 mb-8">
          <View className="bg-gray-50 rounded-2xl p-6">
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: `${bgColor}20` }}
              >
                <FontAwesome5 name="info-circle" size={16} color={bgColor} />
              </View>
              <Text className="font-bold text-gray-900 text-lg">
                About This Category
              </Text>
            </View>

            <Text className="text-gray-600 leading-6">
              {category?.description ||
                `Discover amazing products in the ${category?.name} category. We've curated the best selection to help you find exactly what you're looking for.`}
            </Text>

            {/* Stats */}
            <View className="flex-row justify-between mt-6 pt-4 border-t border-gray-200">
              <View className="items-center">
                <Text className="font-bold text-xl" style={{ color: bgColor }}>
                  {category?.subcategories?.length || 0}
                </Text>
                <Text className="text-gray-500 text-sm">Categories</Text>
              </View>
              <View className="items-center">
                <Text className="font-bold text-xl" style={{ color: bgColor }}>
                  100+
                </Text>
                <Text className="text-gray-500 text-sm">Products</Text>
              </View>
              <View className="items-center">
                <Text className="font-bold text-xl" style={{ color: bgColor }}>
                  4.8★
                </Text>
                <Text className="text-gray-500 text-sm">Rating</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
