import { View, Text, Image, TouchableOpacity } from "react-native";
import type { Product } from "@/types/globalTypes";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // Added for consistency if you use it elsewhere

interface Props {
  product?: Product;
  containerColor?: string;
  innerColor?: string;
  loading?: boolean;
}

export default function ProductCard({
  product,
  containerColor = "white",
  innerColor = "#5e3ebd",
  loading = false,
}: Props) {
  if (!product) {
    return null;
  }

  return (
    <View
      className="w-40 bg-white rounded-lg p-3 shadow-sm"
      style={{ height: 230 }}
    >
      {/* Top Row */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          {/* Fix: Ensure product?.purchase_points is always rendered inside Text if it's a number */}
          {typeof product?.purchase_points === "number" && (
            <>
              <Text
                style={{ color: innerColor, fontSize: 12, fontWeight: "600" }}
              >
                {product.purchase_points}
              </Text>
              <FontAwesome5
                name="diamond"
                size={8}
                color={innerColor}
                style={{ marginLeft: 2 }}
              />
            </>
          )}
        </View>

        <View className="flex-row items-center gap-2">
          <View
            className="px-2 py-1 rounded"
            style={{ backgroundColor: innerColor }}
          >
            <Text className="text-white text-xs font-medium">5 days left</Text>
          </View>

          <TouchableOpacity>
            <FontAwesome5 name="heart" size={14} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Image */}
      <View className="items-center mb-3">
        <Image
          source={{ uri: product?.image }}
          className="w-24 h-24"
          resizeMode="contain"
        />
      </View>

      {/* Product Name */}
      <Text
        className="text-gray-800 text-sm font-medium mb-2"
        numberOfLines={2}
      >
        {product.name}
      </Text>

      {/* Rating */}
      <View className="flex-row items-center mb-3">
        <FontAwesome5 name="star" size={12} color="#FFD700" />
        <Text className="text-gray-600 text-xs ml-1">{product.rating}</Text>
      </View>

      {/* Price and Cart */}
      <View className="flex-row justify-between items-center">
        <View>
          {product?.special_price !== undefined &&
            product.special_price !== null && (
              <Text
                style={{
                  color: innerColor,
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                ${product.special_price}
              </Text>
            )}

          <Text
            style={{
              color: product?.special_price ? "gray" : innerColor,
              fontSize: product?.special_price ? 10 : 14,
              fontWeight: product?.special_price ? "normal" : "bold",
              textDecorationLine: product?.special_price
                ? "line-through"
                : "none",
            }}
          >
            ${product.price}
          </Text>
        </View>

        <TouchableOpacity
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: innerColor }}
        >
          <FontAwesome5 name="shopping-cart" size={12} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
