import { FlatList, ListRenderItem, Text, View } from "react-native";
import { useCallback } from "react";
import ProductCard from "../common/ProductCard";
import { Product } from "@/types/globalTypes";

export default function SimilarProductsSection({ similarProducts }) {
  const renderSimilarProduct: ListRenderItem<Product> = useCallback(
    ({ item }) => <ProductCard product={item} />,
    []
  );

  if (similarProducts === undefined || similarProducts === null) {
    return (
      <View className="w-[90%] h-[200px] rounded-xl py-16 bg-[#e0d7f5] mx-auto"></View>
    );
  }

  return (
    <View className="mb-8">
      <Text className="text-lg font-bold text-gray-900 px-4 mb-4">
        You May Also Like
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={
          similarProducts && similarProducts.length > 0 ? similarProducts : []
        }
        keyExtractor={(item) => `similar-${item.id}`}
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
        renderItem={renderSimilarProduct}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        windowSize={6}
      />
    </View>
  );
}
