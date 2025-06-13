import React from "react";
import { Image, Text, View } from "react-native";

export interface SimilarProduct {
  id: number;
  name: string;
  price: number;
  image: string;
}

const SimilarProductItem = React.memo<{
  item: SimilarProduct;
  basePrice: number;
}>(({ item, basePrice }) => (
  <View className="w-36 mr-3">
    <View className="bg-gray-100 rounded-lg overflow-hidden mb-2">
      <Image
        source={{ uri: item.image }}
        className="w-full h-36"
        resizeMode="cover"
        fadeDuration={200}
      />
    </View>
    <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
      {item.name}
    </Text>
    <Text className="text-sm font-bold text-[#5E3EBD]">
      ${item.price.toFixed(2)}
    </Text>
  </View>
));

export default SimilarProductItem;
