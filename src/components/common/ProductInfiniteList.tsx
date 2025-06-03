import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import axiosApi from "@/apis/axiosApi";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/globalTypes";

interface ProductListProps {
  type: "mega" | "featured" | "categoryData";
  url: string;
}

const { width } = Dimensions.get("window");

export default function ProductInfiniteList({ type, url }: ProductListProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["products", type, url],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosApi.get(
        `${url}?page=${pageParam}&per_page=20`
      );

      if (type === "categoryData") {
        return {
          products: response.data.data.relatedProducts.results,
          currentPage: response.data.data.relatedProducts.currentPage,
          totalPages: response.data.data.relatedProducts.totalPages,
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.currentPage < lastPage?.totalPages) {
        return lastPage?.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation for the icon
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => rotateAnimation.stop();
  }, [fadeAnim, slideAnim, scaleAnim, rotateAnim]);

  const onEndReached = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item, index }: { item: Product; index: number }) => {
      return (
        <View className="flex-1 px-2 mb-4" style={{ maxWidth: width / 2 }}>
          <ProductCard product={item} />
        </View>
      );
    },
    []
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#5e3ebd" />
          <Text className="text-gray-500 mt-2 text-sm">
            Loading more products...
          </Text>
        </View>
      );
    }
    return <View className="h-4" />;
  }, [isFetchingNextPage]);

  const renderHeader = useCallback(() => {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    return (
      <LinearGradient
        colors={["#5e3ebd", "#8b7bd8", "#c4b5fd", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mx-4 mb-6 rounded-2xl overflow-hidden"
        style={{
          elevation: 8,
          shadowColor: "#5e3ebd",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <View className="p-6 items-center">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            }}
            className="items-center"
          >
            <Animated.View
              style={{ transform: [{ rotate: spin }] }}
              className="mb-4"
            >
              <FontAwesome5 name="search" size={32} color="white" />
            </Animated.View>

            <Text className="text-white text-2xl font-bold mb-2 text-center">
              Find Out More
            </Text>
            <Text className="text-white/80 text-base text-center mb-4">
              Discover amazing products tailored just for you
            </Text>

            <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full">
              <FontAwesome5 name="star" size={14} color="#FFD700" />
              <Text className="text-white font-medium ml-2 text-sm">
                Premium Collection
              </Text>
            </View>
          </Animated.View>

          {/* Decorative elements */}
          <View className="absolute top-4 right-4 opacity-20">
            <FontAwesome5 name="gem" size={24} color="white" />
          </View>
          <View className="absolute bottom-4 left-4 opacity-20">
            <FontAwesome5 name="heart" size={20} color="white" />
          </View>
        </View>
      </LinearGradient>
    );
  }, [fadeAnim, slideAnim, scaleAnim, rotateAnim]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-20">
        <ActivityIndicator size="large" color="#5e3ebd" />
        <Text className="text-gray-500 mt-4 text-base">
          Loading products...
        </Text>
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

  return (
    <FlatList
      data={data?.pages.flatMap((page) => page?.products || [])}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      scrollEnabled={true}
      nestedScrollEnabled={true}
      numColumns={2}
      contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 16 }}
      columnWrapperStyle={{ justifyContent: "space-between" }}
    />
  );
}
