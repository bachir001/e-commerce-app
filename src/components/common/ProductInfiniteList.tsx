import React, { memo, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/globalTypes";
import AnimatedLoader from "./AnimatedLayout";
import { Colors } from "@/constants/Colors";
import useInfiniteProductList from "@/hooks/home/infiniteProductList";
import DotsLoader from "./AnimatedLayout";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface ProductInfiniteListProps {
  type: "mega" | "featured" | "categoryData";
  url: string;
}

const ProductInfiniteList = memo(function ProductInfiniteList({
  type,
  url,
}: ProductInfiniteListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    status,
  } = useInfiniteProductList({ type, url });

  const isLoadingMore = useRef(false);

  const products = data?.pages.flatMap((page) => page?.products || []) || [];

  const handleLoadMore = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (isLoadingMore.current || isFetchingNextPage || !hasNextPage) {
      return;
    }

    isLoadingMore.current = true;
    fetchNextPage().finally(() => {
      isLoadingMore.current = false;
    });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={{ width: CARD_WIDTH }} className="mb-4 px-2">
        <ProductCard product={item} />
      </View>
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center">
          <DotsLoader size="large" color={Colors.PRIMARY} />
          <Text className="text-gray-500 mt-2 text-sm">
            Loading more products...
          </Text>
        </View>
      );
    }

    if (!hasNextPage && products.length > 0) {
      return (
        <View className="py-4 items-center">
          <Text className="text-gray-400 text-sm">
            No more products to load.
          </Text>
        </View>
      );
    }

    return null;
  }, [isFetchingNextPage, hasNextPage, products.length]);

  const renderHeader = useCallback(
    () => (
      <LinearGradient
        colors={["#5e3ebd", "#8b7bd8", "#c4b5fd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mx-4 mb-6 rounded-2xl overflow-hidden shadow-lg shadow-violet-500/20"
      >
        <View className="p-6 items-center">
          <View className="mb-4">
            <FontAwesome5 name="search" size={32} color="white" />
          </View>

          <Text className="text-white text-2xl font-bold mb-2 text-center">
            Discover Amazing Products
          </Text>
          <Text className="text-white/80 text-base text-center mb-4">
            Curated collection just for you
          </Text>

          <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full">
            <FontAwesome5 name="crown" size={14} color="#FFD700" />
            <Text className="text-white font-medium ml-2 text-sm">
              Premium Selection
            </Text>
          </View>

          <View className="absolute top-4 right-4 opacity-20">
            <FontAwesome5 name="gem" size={24} color="white" />
          </View>
          <View className="absolute bottom-4 left-4 opacity-20">
            <FontAwesome5 name="heart" size={20} color="white" />
          </View>
        </View>
      </LinearGradient>
    ),
    []
  );

  if (status === "pending") {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <DotsLoader text="Loading Products" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center py-20 px-4">
        <FontAwesome5 name="exclamation-triangle" size={48} color="#EF4444" />
        <Text className="text-red-500 text-lg font-semibold mt-4 text-center">
          Oops! Something went wrong
        </Text>
        <Text className="text-gray-500 text-sm mt-2 text-center">
          Please try again later
        </Text>
      </View>
    );
  }

  if (products.length === 0 && !isLoading && !isFetchingNextPage) {
    return (
      <View className="flex-1 justify-center items-center py-20 px-4">
        <FontAwesome5 name="box-open" size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-lg font-semibold mt-4 text-center">
          No products found.
        </Text>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          Try adjusting your filters or check back later.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      numColumns={2}
      contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 16 }}
      columnWrapperStyle={{
        justifyContent: "space-between",
        paddingHorizontal: 8,
      }}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      removeClippedSubviews={true}
      // Performance optimizations
      getItemLayout={undefined} // Let FlatList calculate
      updateCellsBatchingPeriod={50}
    />
  );
});

export default ProductInfiniteList;
