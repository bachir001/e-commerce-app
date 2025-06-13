import { FlatList, ListRenderItem, Text, View } from "react-native";
import SimilarProductItem, { SimilarProduct } from "./SimilarProductItem";
import { useCallback } from "react";

export default function SimilarProductsSection({ similarProducts, price }) {
  const renderSimilarProduct: ListRenderItem<SimilarProduct> = useCallback(
    ({ item }) => <SimilarProductItem item={item} basePrice={price || 0} />,
    [price]
  );
  return (
    <View className="mb-8">
      <Text className="text-lg font-bold text-gray-900 px-4 mb-4">
        You May Also Like
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={similarProducts}
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
