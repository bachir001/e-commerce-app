import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect } from "react";
import { ChevronRight } from "lucide-react-native";
import ProductCard from "@/components/common/ProductCard";
import AnimatedLoader from "@/components/common/AnimatedLayout";
import { useFeaturedSection } from "@/hooks/home/featuredSections";
import type { HomePageSectionProp } from "@/constants/HomePageSections";

import { router } from "expo-router";
import { useAppDataStore } from "@/store/useAppDataStore";
import DotsLoader from "@/components/common/AnimatedLayout";

interface FeaturedSectionProps extends HomePageSectionProp {
  color?: string;
  startFromLeft?: boolean;
  onViewMorePress?: () => void;
  list?: any;
  setLoading?: (loading: boolean) => void;
}

const MemoizedProductItem = React.memo(
  ({ item, innerColor }: { item: any; innerColor: string }) => (
    <View className="mr-3">
      <ProductCard
        product={item}
        innerColor={innerColor}
        onAddToCart={() => console.log("Add to cart:", item.id)}
        onAddToWishlist={() => console.log("Add to wishlist:", item.id)}
        onPress={() => {
          router.push({
            pathname: "/(tabs)/home/ProductDetails",
            params: { productJSON: JSON.stringify(item) },
          });
        }}
      />
    </View>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.innerColor === nextProps.innerColor
    );
  }
);

const FeaturedSection = React.memo(
  ({
    title,
    description,
    fetchParams,
    type,
    color = "#5e3ebd",
    startFromLeft = false,
    onViewMorePress,
    list,
    setLoading,
  }: FeaturedSectionProps) => {
    const { data, isLoading } = useFeaturedSection(
      type,
      fetchParams,
      list ? false : true
    );

    const { newArrivals } = useAppDataStore();

    const renderProductItem = useCallback(
      ({ item }: { item: any }) => (
        <MemoizedProductItem item={item} innerColor={color} />
      ),
      [color]
    );

    const keyExtractor = useCallback(
      (item: any, index: number) => `${item.id}-${index}`,
      []
    );

    useEffect(() => {
      const loadingState = isLoading;
      setLoading?.(loadingState);

      return () => {
        if (loadingState) {
          setLoading?.(false);
        }
      };
    }, [isLoading, setLoading]);

    if (isLoading) {
      return <DotsLoader color={color} text={`Loading ${title}`} />;
    }

    // Create a light version of the color for the background
    const bgColorClass = "bg-gray-50";
    const lightColorStyle = { backgroundColor: `${color}10` }; // 10% opacity version of the color

    return (
      <View
        className="py-5 my-2 mx-2 rounded-xl shadow-sm"
        style={lightColorStyle}
      >
        <View className="flex-row justify-between items-center px-4 mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            {description && (
              <Text className="text-sm text-gray-600 mt-0.5">
                {description}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={onViewMorePress}
            className="flex-row items-center px-2.5 py-1.5 rounded-full"
            style={{ backgroundColor: `${color}20` }} // 20% opacity version of the color
          >
            <Text
              className="text-xs font-semibold mr-0.5"
              style={{ color: color }}
            >
              View All
            </Text>
            <ChevronRight size={16} color={color} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={list ? newArrivals : data}
          renderItem={renderProductItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={100}
          getItemLayout={(data, index) => ({
            length: 172, // width of item + margin
            offset: 172 * index,
            index,
          })}
        />
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.description === nextProps.description &&
      prevProps.type === nextProps.type &&
      prevProps.color === nextProps.color &&
      prevProps.startFromLeft === nextProps.startFromLeft &&
      JSON.stringify(prevProps.fetchParams) ===
        JSON.stringify(nextProps.fetchParams)
    );
  }
);

export default FeaturedSection;
