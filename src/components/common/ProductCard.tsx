import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import type { Product } from "@/types/globalTypes";
import { Heart, Star, ShoppingBag } from "lucide-react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  product: Product;
  innerColor?: string;
  containerColor?: string;
  variant?: "default" | "grid";
  onPress?: () => void;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
}

const ProductCard = React.memo(
  ({
    product,
    innerColor = "#5e3ebd",
    containerColor = "white",
    variant = "default",
    onAddToCart,
    onAddToWishlist,
  }: Props) => {
    const router = useRouter();
    if (!product) return null;

    const onPress = () => {
      router.push({
        pathname: "/ProductDetails",
        params: { productJSON: JSON.stringify(product) },
      });
    };

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

    if (variant === "grid") {
      return (
        <TouchableOpacity
          className="rounded-2xl overflow-hidden bg-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={0.95}
          onPress={onPress}
        >
          {/* Image container */}
          <View className="w-full h-48 relative bg-gray-50">
            <Image
              source={{ uri: productImage }}
              className="w-full h-full"
              resizeMode="cover"
            />

            {/* Gradient overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.1)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 40,
              }}
            />

            {/* Wishlist button */}
            <TouchableOpacity
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 items-center justify-center shadow-sm"
              onPress={onAddToWishlist}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Heart size={16} color="#666" stroke="#666" fill="transparent" />
            </TouchableOpacity>

            {/* Discount badge */}
            {hasSpecialPrice && discount > 0 && (
              <LinearGradient
                colors={["#FF4757", "#FF3742"]}
                className="absolute top-3 left-3 px-2 py-1 rounded-full"
                style={{
                  shadowColor: "#FF4757",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-white text-xs font-bold">
                  -{discount}%
                </Text>
              </LinearGradient>
            )}
          </View>

          {/* Product details */}
          <View className="p-4">
            {/* Rating */}
            {productRating > 0 && (
              <View className="flex-row items-center mb-2">
                <Star size={14} color="#FFB800" fill="#FFB800" />
                <Text className="text-xs text-gray-600 ml-1 font-medium">
                  {productRating.toFixed(1)}
                </Text>
                <View className="flex-1" />
                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                  <Text className="text-green-700 text-xs font-semibold">
                    In Stock
                  </Text>
                </View>
              </View>
            )}

            {/* Product name */}
            <Text
              className="text-base font-semibold text-gray-900 mb-3"
              numberOfLines={2}
            >
              {productName}
            </Text>

            {/* Price and cart section */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                {hasSpecialPrice ? (
                  <View>
                    <Text
                      className="text-lg font-bold"
                      style={{ color: "#FF4757" }}
                    >
                      ${specialPrice}
                    </Text>
                    <Text className="text-sm text-gray-400 line-through">
                      ${price}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-lg font-bold text-gray-900">
                    ${price}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: innerColor,
                  shadowColor: innerColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 6,
                }}
                activeOpacity={0.8}
                onPress={onAddToCart}
              >
                <ShoppingBag size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    // Default variant (original design)
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
      prevProps.containerColor !== nextProps.containerColor ||
      prevProps.variant !== nextProps.variant
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
