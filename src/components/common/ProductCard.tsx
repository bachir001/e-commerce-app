import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useCallback } from "react";
import type { Product } from "@/types/globalTypes";
import { Heart, Star, ShoppingBag } from "lucide-react-native";
import { useRouter } from "expo-router";

interface Props {
  product: Product;
  innerColor?: string;
  containerColor?: string;
  onPress?: () => void;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
}

const ProductCard = React.memo(
  ({
    product,
    innerColor = "#5e3ebd",
    containerColor = "white",
    onPress,
    onAddToCart,
    onAddToWishlist,
  }: Props) => {
    if (!product) return null;

    const router = useRouter();

    const productName = product.name || "Untitled Product";
    const productImage = product.image || "https://via.placeholder.com/150";
    const productRating = product.rating ? Number(product.rating) : 0;
    const price = product.price ? String(product.price) : "0.00";
    const specialPrice = product.special_price
      ? String(product.special_price)
      : undefined;

    const hasSpecialPrice = specialPrice !== undefined;
    const discount = hasSpecialPrice
      ? Math.round(
          ((Number(price) - Number(specialPrice)) / Number(price)) * 100
        )
      : 0;

    return (
      <TouchableOpacity
        className="w-40 rounded-lg overflow-hidden shadow-md mx-1 my-2 border border-gray-100"
        style={{ backgroundColor: containerColor }}
        activeOpacity={0.9}
        onPress={onPress}
      >
        {/* Image container with wishlist button and discount badge */}
        <View className="w-full h-48 relative bg-gray-50">
          <Image
            source={{ uri: productImage }}
            className="w-full h-full bg-gray-100"
            resizeMode="cover"
          />

          <TouchableOpacity
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 items-center justify-center z-10 shadow-sm"
            onPress={onAddToWishlist}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Heart size={18} color="#111" stroke="#111" fill="transparent" />
          </TouchableOpacity>

          {hasSpecialPrice && discount > 0 && (
            <View
              className="absolute top-2 left-2 px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#e4344f" }}
            >
              <Text className="text-white text-xs font-bold">-{discount}%</Text>
            </View>
          )}
        </View>

        {/* Product details */}
        <View className="p-2.5">
          {/* Rating */}
          {productRating > 0 && (
            <View className="flex-row items-center mb-1">
              <Star size={12} color="#FFB800" fill="#FFB800" />
              <Text className="text-xs text-gray-600 ml-0.5 font-medium">
                {productRating.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Product name */}
          <Text
            className="text-sm font-medium text-gray-900 mb-1"
            numberOfLines={1}
          >
            {productName}
          </Text>

          {/* Price row */}
          <View className="flex-row items-center">
            {hasSpecialPrice ? (
              <>
                <Text
                  className="text-sm font-bold mr-1.5"
                  style={{ color: "#e4344f" }}
                >
                  ${specialPrice}
                </Text>
                <Text className="text-xs text-gray-400 line-through">
                  ${price}
                </Text>
              </>
            ) : (
              <Text className="text-sm font-bold text-gray-900">${price}</Text>
            )}
          </View>
        </View>

        {/* Add to cart button */}
        <TouchableOpacity
          className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full items-center justify-center shadow-sm"
          style={{ backgroundColor: innerColor }}
          activeOpacity={0.8}
          onPress={onAddToCart}
        >
          <ShoppingBag size={16} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    if (
      prevProps.innerColor !== nextProps.innerColor ||
      prevProps.containerColor !== nextProps.containerColor
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
      prevProduct.rating === nextProduct.rating
    );
  }
);

export default ProductCard;
