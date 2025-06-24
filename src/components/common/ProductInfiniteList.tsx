import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/globalTypes";
import AnimatedLoader from "./AnimatedLayout";
import { Colors } from "@/constants/Colors";
import useInfiniteProductList from "@/hooks/home/infiniteProductList";
import DotsLoader from "./AnimatedLayout";
import axiosApi from "@/apis/axiosApi";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32) / 2;

interface ProductInfiniteListProps {
  type: "mega" | "featured" | "categoryData";
  url: string;
}

const ProductInfiniteList = memo(function ProductInfiniteList({
  type,
  url,
}: ProductInfiniteListProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<any>(null);
  const [isError, setIsError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);

  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    if (page === 1) {
      setLoading(true);
      setIsLoadingMore(false);
    } else {
      setLoading(false);
      setIsLoadingMore(true);
    }

    try {
      const response = await axiosApi.get(`${url}?page=${page}&per_page=20`);

      if (response.status === 200) {
        const newProducts = response.data.data.relatedProducts?.results || [];
        const totalPages = response.data.data.relatedProducts?.total_pages || 1;

        if (page === 1) {
          setProducts(newProducts);
        } else {
          const newProdArray = [...products, ...newProducts];
          setProducts(newProdArray);
        }

        setTotalPages(totalPages);
      } else {
        setError(response.data.message || "Failed to load products.");
        setProducts([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [page]);

  useEffect(() => {
    setPage(1);
    setProducts([]);
    setTotalPages(1);
    setError(null);
    fetchProducts();
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchProducts();
    }
  }, [page, fetchProducts]);

  const loadMore = useCallback(() => {
    if (!loading && page < totalPages && !isLoadingMore) {
      setPage(page + 1);
    }
  }, [loading, page, isLoadingMore, totalPages]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={{ width: CARD_WIDTH }} className="mb-3">
        <ProductCard product={item} variant="grid" />
      </View>
    ),
    []
  );

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View className="py-6 items-center">
          <DotsLoader size="large" color={Colors.PRIMARY} />
          <Text className="text-gray-500 mt-3 text-sm font-medium">
            Loading more products...
          </Text>
        </View>
      );
    }

    if (!loading && products.length > 0 && page >= totalPages) {
      return (
        <View className="py-6 items-center">
          <View className="w-12 h-0.5 bg-gray-200 rounded-full mb-3" />
          <Text className="text-gray-400 text-sm font-medium">
            You've reached the end
          </Text>
        </View>
      );
    }

    return null;
  }, [isLoadingMore, products.length]);

  const renderHeader = useCallback(
    () => (
      <View
        className="mx-4 mb-6 rounded-3xl overflow-hidden"
        style={{
          backgroundColor: Colors.PRIMARY,
          shadowColor: Colors.PRIMARY,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        <View className="p-8 items-center relative">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <FontAwesome5 name="search" size={28} color="white" />
          </View>

          <Text className="text-white text-2xl font-bold mb-2 text-center">
            Discover Amazing Products
          </Text>
          <Text className="text-white/85 text-base text-center mb-6 leading-6">
            Curated collection just for you
          </Text>

          <View
            className="flex-row items-center px-5 py-2.5 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <FontAwesome5 name="crown" size={14} color="#FFD700" />
            <Text className="text-white font-semibold ml-2 text-sm">
              Premium Selection
            </Text>
          </View>

          <View className="absolute top-6 right-6 opacity-10">
            <FontAwesome5 name="gem" size={32} color="white" />
          </View>
          <View className="absolute bottom-6 left-6 opacity-10">
            <FontAwesome5 name="heart" size={24} color="white" />
          </View>
        </View>
      </View>
    ),
    []
  );

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center py-20 px-4">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: "#fef2f2" }}
        >
          <FontAwesome5 name="exclamation-triangle" size={32} color="#EF4444" />
        </View>
        <Text className="text-gray-900 text-xl font-bold mt-4 text-center">
          {error}
        </Text>
        <Text className="text-gray-500 text-base mt-2 text-center leading-6">
          Please try again later
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
      contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 16 }}
      columnWrapperStyle={{
        justifyContent: "space-between",
        paddingHorizontal: 4,
      }}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      removeClippedSubviews={true}
      getItemLayout={undefined}
      updateCellsBatchingPeriod={50}
    />
  );
});

export default ProductInfiniteList;
