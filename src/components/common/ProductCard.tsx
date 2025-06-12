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

const ProductCard = React.memo(
  ({ product, containerColor = "white", innerColor = "#5e3ebd" }: Props) => {
    if (!product) {
      return null;
    }

    // Safe property access with fallbacks
    const productName = product.name || "Untitled Product";
    const productImage = product.image || "https://via.placeholder.com/150";
    const productRating = product.rating ? String(product.rating) : "0";
    const purchasePoints = product.purchase_points
      ? String(product.purchase_points)
      : undefined;
    const price = product.price ? String(product.price) : "0.00";
    const specialPrice = product.special_price
      ? String(product.special_price)
      : undefined;

    const hasSpecialPrice = specialPrice !== undefined;
    const hasPurchasePoints = purchasePoints !== undefined;

    return (
      <TouchableOpacity
        className="w-44 bg-white rounded-xl p-3 mx-1"
        style={{
          height: 250,
          borderColor: innerColor,
          borderWidth: 1,
        }}
      >
        {/* Product Image */}
        <View className="items-center mb-3 relative">
          <Image
            source={{ uri: productImage }}
            className="w-28 h-28"
            resizeMode="contain"
          />

          {/* Heart icon */}
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

        {/* Product Name - Always wrapped in Text */}
        <Text
          className="text-gray-800 text-sm font-semibold mb-2"
          numberOfLines={2}
        >
          {productName}
        </Text>

        {/* Rating and Purchase Points Row */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <FontAwesome5 name="star" size={12} color="#FFD700" />
            <Text className="text-gray-600 text-xs ml-1">{productRating}</Text>
          </View>

          {hasPurchasePoints && (
            <View className="flex-row items-center">
              <Text
                style={{ color: innerColor, fontSize: 10, fontWeight: "600" }}
              >
                {purchasePoints}
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
                style={{ color: innerColor, fontSize: 14, fontWeight: "bold" }}
              >
                ${specialPrice}
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
              ${price}
            </Text>
          </View>

          <TouchableOpacity
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{
              backgroundColor: innerColor,
              shadowColor: innerColor,
              shadowOffset: { width: 0, height: 2 },
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
  (prevProps, nextProps) => {
    // Enhanced comparison function remains the same
    if (
      prevProps.innerColor !== nextProps.innerColor ||
      prevProps.containerColor !== nextProps.containerColor ||
      prevProps.loading !== nextProps.loading
    ) {
      return false;
    }

    const prevProduct = prevProps.product;
    const nextProduct = nextProps.product;

    if (prevProduct === nextProduct) return true;
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
