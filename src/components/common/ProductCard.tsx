import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import type { Product } from "@/types/globalTypes";
import { FontAwesome5 } from "@expo/vector-icons";

interface Props {
  product: Product;
  containerColor?: string;
  innerColor?: string;
  loading?: boolean;
}

// Use React.memo with deep comparison for better performance
const ProductCard = React.memo(
  ({ product, containerColor = "white", innerColor = "#5e3ebd" }: Props) => {
    if (!product) {
      return null;
    }

    // Pre-calculate values to avoid inline calculations
    const hasSpecialPrice =
      product?.special_price !== undefined && product.special_price !== null;
    const hasPurchasePoints = typeof product?.purchase_points === "number";

    return (
      <TouchableOpacity
        className="w-44 bg-white rounded-xl p-3 mx-1"
        style={{
          height: 250,
          borderColor: innerColor,
          borderWidth: 1,
        }}
      >
        {/* Product Image - Now at the top */}
        <View className="items-center mb-3 relative">
          <Image
            source={{
              uri: product?.image || "https://via.placeholder.com/150",
            }}
            className="w-28 h-28"
            resizeMode="contain"
          />

          {/* Heart icon positioned over the image */}
          <TouchableOpacity
            className="absolute top-0 right-0 w-7 h-7 bg-white rounded-full items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <FontAwesome5 name="heart" size={12} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Product Name */}
        <Text
          className="text-gray-800 text-sm font-semibold mb-2"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Rating and Purchase Points Row */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <FontAwesome5 name="star" size={12} color="#FFD700" />
            <Text className="text-gray-600 text-xs ml-1">{product.rating}</Text>
          </View>

          {hasPurchasePoints && (
            <View className="flex-row items-center">
              <Text
                style={{ color: innerColor, fontSize: 10, fontWeight: "600" }}
              >
                {product.purchase_points}
              </Text>
              <FontAwesome5
                name="shopping-cart"
                size={7}
                color={innerColor}
                style={{ marginLeft: 2 }}
              />
            </View>
          )}
        </View>

        {/* Price and Cart */}
        <View className="flex-row justify-between items-center mt-auto">
          <View>
            {hasSpecialPrice && (
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
                color: hasSpecialPrice ? "#9CA3AF" : innerColor,
                fontSize: hasSpecialPrice ? 11 : 14,
                fontWeight: hasSpecialPrice ? "normal" : "bold",
                textDecorationLine: hasSpecialPrice ? "line-through" : "none",
              }}
            >
              ${product.price}
            </Text>
          </View>

          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{
              backgroundColor: innerColor,
              shadowColor: innerColor,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <FontAwesome5 name="shopping-cart" size={12} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  },
  // Enhanced comparison function
  (prevProps, nextProps) => {
    // Compare primitive props first (fastest)
    if (
      prevProps.innerColor !== nextProps.innerColor ||
      prevProps.containerColor !== nextProps.containerColor ||
      prevProps.loading !== nextProps.loading
    ) {
      return false;
    }

    // Deep compare product object only if primitives match
    const prevProduct = prevProps.product;
    const nextProduct = nextProps.product;

    if (prevProduct === nextProduct) return true; // Same reference
    if (!prevProduct || !nextProduct) return false;

    return (
      prevProduct.id === nextProduct.id &&
      prevProduct.name === nextProduct.name &&
      prevProduct.price === nextProduct.price &&
      prevProduct.special_price === nextProduct.special_price &&
      prevProduct.image === nextProduct.image &&
      prevProduct.rating === nextProduct.rating &&
      prevProduct.purchase_points === nextProduct.purchase_points
    );
  }
);

export default ProductCard;
