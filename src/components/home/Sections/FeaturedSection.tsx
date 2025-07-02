import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useCallback, useEffect } from "react";
import { ChevronRight } from "lucide-react-native";
import ProductCard from "@/components/common/product/ProductCard";
import { useFeaturedSection } from "@/hooks/home/featuredSections";
import type { HomePageSectionProp } from "@/constants/HomePageSections";
import { useAppDataStore } from "@/store/useAppDataStore";
import DotsLoader from "@/components/common/AnimatedLayout";
import ErrorState from "@/components/common/ErrorState";
import { router } from "expo-router";

interface FeaturedSectionProps extends HomePageSectionProp {
  color?: string;
  startFromLeft?: boolean;
  onViewMorePress?: () => void;
  list?: any;
  setLoading: (b: boolean) => void;
}

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

const FeaturedSection = React.memo(
  ({
    title,
    description,
    fetchParams,
    type,
    color = "#5e3ebd",
    startFromLeft = false,
    list,
    setLoading,
  }: FeaturedSectionProps) => {
    const { data, isLoading, error, isError, refetch } = useFeaturedSection(
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

    const onViewMorePress = useCallback((id: number) => {
      router.navigate({
        pathname: "category",
        params: {
          slug: type,
          color: color,
          id: String(id),
        },
      });
    }, []);

    if (isLoading) {
      return <DotsLoader color={color} text={`Loading ${title}`} />;
    }

    if (isError) {
      return (
        <ErrorState
          onRetry={refetch}
          title={`Failed to load ${title}`}
          subtitle={error.message}
        />
      );
    }

    const lightColorStyle = { backgroundColor: `${color}10` };

    if ((!data || data.length === 0) && !list) {
      return null;
    }

    useEffect(() => {
      if (setLoading) {
        setLoading(isLoading);
      }
    }, [isLoading, setLoading]);

    return (
      <View
        className="py-5 my-2 mx-2 rounded-xl shadow-sm"
        style={lightColorStyle}
      >
        <View className="flex-row justify-between items-center px-4 mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            {description ? (
              <Text className="text-sm text-gray-600 mt-0.5">
                {description}
              </Text>
            ) : null}
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
