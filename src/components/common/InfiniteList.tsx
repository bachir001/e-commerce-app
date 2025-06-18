import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { FlatList, Dimensions, View, Text } from "react-native";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/globalTypes";
import axiosApi from "@/apis/axiosApi";
import DotsLoader from "./AnimatedLayout";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

const InfiniteList = ({ slug }: { slug: string }) => {
  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["infinite", slug],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const response = await axiosApi.get(
        `getCategoryData/${slug}?page=${pageParam}&per_page=10`
      );

      if (response.status === 200) {
        return {
          data: response.data.data.relatedProducts.results,
          currentPage: response.data.data.relatedProducts.current_page,
          totalPages: response.data.data.relatedProducts.total_pages,
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.currentPage + 1 > lastPage.totalPages) {
        return null;
      }
      return lastPage.currentPage + 1;
    },
  });

  const allItems = data?.pages.flatMap((page) => page?.data || []) || [];

  const renderItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => {
      return (
        <View style={{ width: ITEM_WIDTH, marginBottom: 16 }}>
          <ProductCard product={item} variant="grid" />
        </View>
      );
    },
    []
  );

  const renderListFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-8 items-center">
          <DotsLoader />
        </View>
      );
    }

    if (!hasNextPage && allItems.length > 0) {
      return (
        <View className="py-8 items-center">
          <LinearGradient
            colors={["#10B981", "#059669"]}
            className="px-8 py-6 rounded-2xl items-center"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white font-bold text-base">
              🎉 All Caught Up!
            </Text>
            <Text className="text-white/80 text-sm mt-1">
              You've seen our entire collection
            </Text>
          </LinearGradient>
        </View>
      );
    }

    return <View className="h-4" />;
  }, [isFetchingNextPage, hasNextPage, allItems.length]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === "error") {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <LinearGradient
          colors={["#EF4444", "#DC2626", "#B91C1C"]}
          className="px-12 py-8 rounded-3xl items-center"
          style={{
            shadowColor: "#EF4444",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          <Text className="text-white text-xl font-bold">Oops!</Text>
          <Text className="text-white/90 text-base mt-2 text-center">
            {error?.message || "Something went wrong"}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <FlatList
      data={allItems}
      renderItem={renderItem}
      keyExtractor={(item: Product, index: number) => `${item.id}-${index}`}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={8}
      windowSize={10}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={50}
      numColumns={2}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderListFooter}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
      }}
      columnWrapperStyle={{
        justifyContent: "space-between",
        marginBottom: 8,
      }}
      getItemLayout={(data, index) => ({
        length: 280,
        offset: 280 * Math.floor(index / 2),
        index,
      })}
      scrollEnabled={false}
    />
  );
};

export default InfiniteList;
