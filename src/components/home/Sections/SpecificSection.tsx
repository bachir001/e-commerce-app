import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import React, { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosApi from "@/apis/axiosApi";
import type {
  Brand,
  MegaCategory,
  Product,
  RelatedCategory,
} from "@/types/globalTypes";
import type { HomePageSectionProp } from "@/constants/HomePageSections";
import ProductCard from "@/components/common/ProductCard";
import AnimatedLoader from "@/components/common/AnimatedLayout";
import { ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import DotsLoader from "@/components/common/AnimatedLayout";

interface MegaCategoryInfo {
  status: boolean;
  message: string;
  data: {
    categoryInfo: MegaCategory;
    relatedCategories: RelatedCategory[];
    relatedProducts: {
      results: Product[];
    };
    relatedBrands: Brand[];
  };
}

interface SpecificSectionProps extends HomePageSectionProp {
  backgroundImage?: string;
  color: string;
  onViewMorePress?: () => void;
  setLoading: (loading: boolean) => void;
}

const RelatedCategoryItem = React.memo(
  ({
    name,
    image,
    onPress,
  }: {
    name: string;
    image: string | null;
    onPress?: () => void;
  }) => {
    return (
      <TouchableOpacity className="items-center mr-3 w-20" onPress={onPress}>
        <View className="w-20 h-20 rounded-full bg-white overflow-hidden shadow-md border-2 border-white">
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gray-100 items-center justify-center">
              <Text className="text-gray-400 text-xs">No Image</Text>
            </View>
          )}
        </View>
        <Text
          className="text-white text-xs font-medium mt-2 text-center"
          numberOfLines={1}
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
      <ProductCard
        product={item}
        innerColor={innerColor}
        onAddToCart={() => console.log("Add to cart:", item.id)}
        onAddToWishlist={() => console.log("Add to wishlist:", item.id)}
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

const MemoizedCategoryItem = React.memo(
  ({ item, onPress }: { item: any; onPress?: () => void }) => (
    <RelatedCategoryItem
      name={item.name}
      image={item.image}
      onPress={() => onPress?.(item)}
    />
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
    setLoading,
    onViewMorePress,
  }: SpecificSectionProps) => {
    const { data: metaCategoryInfo, isLoading } = useQuery({
      queryKey: ["metaCategoryInfo", type],
      queryFn: async ({ signal }) => {
        const response = await axiosApi.get<MegaCategoryInfo>(
          `/getCategoryData/${type}`,
          {
            params: fetchParams,
            signal: signal,
          }
        );
        return {
          relatedCategories: response.data.data.relatedCategories.slice(
            0,
            fetchParams!.per_page + 1
          ),
          relatedProducts: response.data.data.relatedProducts.results,
        };
      },
    });

    const renderProductItem = useCallback(
      ({ item }: { item: any }) => (
        <MemoizedProductItem item={item} innerColor={color} />
      ),
      [color]
    );

    const renderCategoryItem = useCallback(
      ({ item }: { item: any }) => (
        <MemoizedCategoryItem
          item={item}
          onPress={() => {
            router.push({
              pathname: "category",
              params: {
                slug: String(item.slug),
                color: color,
                id: String(item.id),
              },
            });
          }}
        />
      ),
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

    return (
      <View className="mb-2">
        {/* Categories Section */}
        {mega_mobile_bg ? (
          <ImageBackground
            source={{ uri: mega_mobile_bg }}
            className="py-4 mx-2 rounded-t-xl overflow-hidden"
            imageStyle={{ opacity: 0.9 }}
          >
            <View
              className="flex-row justify-between items-center px-4 mb-3 py-2 -mt-4"
              style={{ backgroundColor: `${color}B3` }} // 70% opacity
            >
              <Text className="text-base font-bold text-white">{title}</Text>
              <TouchableOpacity
                onPress={onViewMorePress}
                className="bg-white/20 px-2.5 py-1 rounded-full"
              >
                <Text className="text-xs font-semibold text-white">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={metaCategoryInfo?.relatedCategories}
              renderItem={renderCategoryItem}
              keyExtractor={categoryKeyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
              removeClippedSubviews={true}
            />
          </ImageBackground>
        ) : (
          <View
            className="py-4 mx-2 rounded-t-xl"
            style={{ backgroundColor: color }}
          >
            <View className="flex-row justify-between items-center px-4 mb-3">
              <Text className="text-base font-bold text-white">{title}</Text>
              <TouchableOpacity
                onPress={onViewMorePress}
                className="bg-white/20 px-2.5 py-1 rounded-full"
              >
                <Text className="text-xs font-semibold text-white">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={metaCategoryInfo?.relatedCategories}
              renderItem={renderCategoryItem}
              keyExtractor={categoryKeyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
              removeClippedSubviews={true}
            />
          </View>
        )}

        {/* Related Products Section */}
        <View className="py-4 bg-white mx-2 rounded-b-xl shadow-sm">
          <View className="flex-row justify-between items-center px-4 mb-4">
            <Text className="text-base font-bold text-gray-900">
              {description}
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={onViewMorePress}
            >
              <Text className="text-xs font-semibold text-gray-900 mr-0.5">
                Shop Now
              </Text>
              <ChevronRight size={16} color="#111" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={metaCategoryInfo?.relatedProducts}
            renderItem={renderProductItem}
            keyExtractor={productKeyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={100}
            getItemLayout={(data, index) => ({
              length: 172,
              offset: 172 * index,
              index,
            })}
          />
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
