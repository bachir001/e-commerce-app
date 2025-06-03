import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useEffect, useCallback, useMemo } from "react";
import { Colors } from "@/constants/Colors";
import { useQuery } from "@tanstack/react-query";
import axiosApi from "@/apis/axiosApi";
import type {
  Brand,
  MegaCategory,
  Product,
  RelatedCategory,
} from "@/types/globalTypes";
import type { HomePageSectionProp } from "@/constants/HomePageSections";
import RelatedCategorySkeleton from "@/components/common/RelatedCategorySkeleton";
import ProductSkeleton from "@/components/common/ProductSkeleton";
import ProductCard from "@/components/common/ProductCard";

interface MegaCategoryInfo {
  status: boolean;
  message: string;
  data: {
    categoryInfo: MegaCategory;
    relatedCategories: RelatedCategory[];
    relatedProducts: Product[];
    relatedBrands: Brand[];
  };
}

interface SpecificSectionProps extends HomePageSectionProp {
  backgroundImage?: string;
  color: string;
  onViewMorePress?: () => void;
}

const RelatedCategoryItem = React.memo(
  ({ name, image }: { name: string; image: string | null }) => {
    return (
      <TouchableOpacity className="items-center mr-4">
        <View className="w-32 h-36 bg-white border-2 border-white rounded-xl overflow-hidden shadow-sm">
          <View className="flex-1 items-center justify-center p-3">
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <View className="w-full h-full bg-gray-100 rounded-lg items-center justify-center">
                <Text className="text-gray-400 text-sm">No Image</Text>
              </View>
            )}
          </View>
        </View>
        <Text
          className="text-white text-sm font-medium mt-2 text-center w-32"
          numberOfLines={2}
        >
          {name}
        </Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.name === nextProps.name && prevProps.image === nextProps.image
    );
  }
);

const MemoizedProductItem = React.memo(
  ({ item, innerColor }: { item: any; innerColor: string }) => (
    <View className="mr-3">
      <ProductCard product={item} innerColor={innerColor} />
    </View>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.innerColor === nextProps.innerColor
    );
  }
);

const MemoizedCategoryItem = React.memo(
  ({ item }: { item: any }) => (
    <RelatedCategoryItem name={item.name} image={item.image} />
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.item.name === nextProps.item.name &&
      prevProps.item.image === nextProps.item.image
    );
  }
);

const SpecificSection = React.memo(
  ({
    title,
    type,
    description,
    fetchParams,
    mega_mobile_bg,
    color,
  }: SpecificSectionProps) => {
    const { data: metaCategoryInfo, isLoading } = useQuery({
      queryKey: ["metaCategoryInfo", type],
      queryFn: async () => {
        const response = await axiosApi.get<MegaCategoryInfo>(
          `/getMegaCategory/${type}`
        );
        return {
          relatedCategories: response.data.data.relatedCategories.slice(
            0,
            fetchParams!.per_page + 1
          ),
          relatedProducts: response.data.data.relatedProducts.slice(
            0,
            fetchParams!.per_page + 1
          ),
        };
      },
    });

    // Memoize render functions
    const renderProductItem = useCallback(
      ({ item }: { item: any }) => (
        <MemoizedProductItem item={item} innerColor={color} />
      ),
      [color]
    );

    const renderCategoryItem = useCallback(
      ({ item }: { item: any }) => <MemoizedCategoryItem item={item} />,
      []
    );

    const productKeyExtractor = useCallback(
      (item: any, index: number) => `product-${item.id}-${index}`,
      []
    );

    const categoryKeyExtractor = useCallback(
      (item: any, index: number) => `category-${item.name}-${index}`,
      []
    );

    // Skeleton rendering functions
    const renderCategorySkeleton = useCallback(
      ({ index }: { index: number }) => (
        <View className="mr-4" key={`category-skeleton-${index}`}>
          <RelatedCategorySkeleton />
        </View>
      ),
      []
    );

    const renderProductSkeleton = useCallback(
      ({ index }: { index: number }) => (
        <View className="mr-3" key={`product-skeleton-${index}`}>
          <ProductSkeleton />
        </View>
      ),
      []
    );

    return (
      <View className="flex flex-col mb-6" style={{ height: 550 }}>
        {mega_mobile_bg ? (
          <ImageBackground
            source={{ uri: mega_mobile_bg }}
            resizeMode="stretch"
          >
            {/* Categories Section with Skeleton Loading */}
            {isLoading ? (
              <FlatList
                data={Array(3).fill({})} // Show 3 skeleton items
                renderItem={renderCategorySkeleton}
                keyExtractor={(_, index) => `category-skeleton-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              />
            ) : (
              <FlatList
                data={metaCategoryInfo?.relatedCategories}
                renderItem={renderCategoryItem}
                keyExtractor={categoryKeyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                initialNumToRender={2}
                maxToRenderPerBatch={3}
                windowSize={5}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={100}
                getItemLayout={(data, index) => ({
                  length: 144,
                  offset: 144 * index,
                  index,
                })}
              />
            )}
          </ImageBackground>
        ) : (
          <View style={{ backgroundColor: color }} className="px-4 py-4">
            {/* Categories Section with Skeleton Loading */}
            {isLoading ? (
              <FlatList
                data={Array(3).fill({})} // Show 3 skeleton items
                renderItem={renderCategorySkeleton}
                keyExtractor={(_, index) => `category-skeleton-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <FlatList
                data={metaCategoryInfo?.relatedCategories}
                renderItem={renderCategoryItem}
                keyExtractor={categoryKeyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                initialNumToRender={2}
                maxToRenderPerBatch={3}
                windowSize={5}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={100}
                getItemLayout={(data, index) => ({
                  length: 144,
                  offset: 144 * index,
                  index,
                })}
              />
            )}
          </View>
        )}

        {/* Related Products Section */}
        <View className="bg-gray-50 px-4 py-4">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 text-lg font-bold">
              {description}
            </Text>
            <TouchableOpacity className=" px-3 py-1.5 rounded-full">
              <Text className="text-white font-semibold text-sm">Shop Now</Text>
            </TouchableOpacity>
          </View>

          {/* Products Section with Skeleton Loading */}
          {isLoading ? (
            <FlatList
              data={Array(3).fill({})} // Show 3 skeleton items
              renderItem={renderProductSkeleton}
              keyExtractor={(_, index) => `product-skeleton-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 0 }}
            />
          ) : (
            <FlatList
              data={metaCategoryInfo?.relatedProducts}
              renderItem={renderProductItem}
              keyExtractor={productKeyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              initialNumToRender={2}
              maxToRenderPerBatch={3}
              windowSize={5}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={100}
              getItemLayout={(data, index) => ({
                length: 176,
                offset: 176 * index,
                index,
              })}
            />
          )}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.type === nextProps.type &&
      prevProps.description === nextProps.description &&
      prevProps.color === nextProps.color &&
      prevProps.mega_mobile_bg === nextProps.mega_mobile_bg &&
      JSON.stringify(prevProps.fetchParams) ===
        JSON.stringify(nextProps.fetchParams)
    );
  }
);

export default SpecificSection;
