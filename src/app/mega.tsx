import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import type { SubCategory } from "./(tabs)/categories";
import CategoryItem from "@/components/categories/CategoryItem";
import MegaHeader from "@/components/categories/MegaHeader";
import { useFeaturedSection } from "@/hooks/home/featuredSections";
import ProductCard from "@/components/common/ProductCard";
import { Product, RelatedCategory } from "@/types/globalTypes";
import { Colors } from "@/constants/Colors";
import useGetCategoryRelatedCategories, {
  CategoryData,
} from "@/hooks/categories/useGetCategory";
import DotsLoader from "@/components/common/AnimatedLayout";

export default function Mega() {
  const router = useRouter();
  const { slug, color = Colors.beautyAndHealth } = useLocalSearchParams();
  const [imageLoading, setImageLoading] = useState(true);

  const { data: category, isLoading: categoryLoading } =
    useGetCategoryRelatedCategories(
      slug as string,
      slug !== undefined && slug !== null
    ); //this comes in the form of CategoryData {categoryInfo, relatedCategories}

  const { data: bestSellers, isLoading: bestSellersLoading } =
    useFeaturedSection(
      "best-sellers",
      {
        per_page: 10 as const,
        page: 1 as const,
        sort: "price_high_low" as const,
        language: "en",
        category_slug: slug,
      },
      typeof slug === "string" && slug !== undefined && slug !== null
    );

  const renderSubCategories = useCallback(
    ({ item, index }: { item: RelatedCategory; index: number }) => {
      if (!item) {
        return null;
      }

      return (
        <View className="mr-4">
          <CategoryItem
            item={item}
            color={color as string}
            // subCount={}
          />
        </View>
      );
    },
    []
  );

  const renderBestSellers = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ProductCard product={item} innerColor={color as string} />
    ),
    []
  );

  const keyExtractor = useCallback((item: any) => item.id.toString(), []);

  const renderSectionHeader = (
    title: string,
    subtitle?: string
    // showViewAll?: boolean
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

  if (categoryLoading || bestSellersLoading) {
    return (
      <View className="flex-1 flex justify-center items-center">
        <DotsLoader size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: color as string }}
    >
      {category &&
        category?.categoryInfo !== null &&
        category.relatedCategories.length > 0 && (
          <MegaHeader
            name={category.categoryInfo?.name ?? ""}
            subCount={category?.relatedCategories.length}
            bgColor={color as string}
          />
        )}

      <ScrollView
        className="flex-1 bg-white"
        style={{
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          marginTop: -20,
        }}
        showsVerticalScrollIndicator={false}
      >
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

            {imageLoading && (
              <View className="absolute inset-0 bg-gray-200 items-center justify-center">
                <FontAwesome5 name="image" size={32} color="#9CA3AF" />
              </View>
            )}

            <View className="absolute top-4 left-4 bg-white/90 rounded-full px-3 py-1">
              <Text className="text-xs font-bold" style={{ color: color }}>
                FEATURED
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 mb-8">
          {renderSectionHeader(
            "Subcategories",
            "Explore different types within this category"
            // true
          )}

          {category &&
          category?.relatedCategories &&
          category.relatedCategories.length > 0 ? (
            <FlatList
              data={category.relatedCategories}
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

        <View className="px-6 mb-8">
          {renderSectionHeader(
            "Popular Choices",
            "Most loved items in this category"
            // true
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

          {bestSellers && bestSellers.length > 0 ? (
            <FlatList
              data={bestSellers}
              renderItem={renderBestSellers}
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

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
