import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useMemo, useCallback, useEffect, useState } from "react";
import type { Product } from "@/types/globalTypes";
import { Heart, ShoppingBag, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

interface Props {
  product: Product;
  innerColor?: string;
  containerColor?: string;
  variant?: "default" | "grid";
  onPress?: () => void;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  simplified?: boolean;
}

const ProductCard = React.memo(
  ({
    product,
    innerColor = "#5e3ebd",
    containerColor = "white",
    variant = "default",
    simplified = false,
    onAddToCart,
    onAddToWishlist,
  }: Props) => {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState<string>("");

    const productData = useMemo(() => {
      if (!product) return null;

      const productName = product.name || "Untitled Product";
      const productImage = product.image || "https://via.placeholder.com/150";
      const productRating = product.rating ? Number(product.rating) : 0;
      const price = product.price ? String(product.price) : "0.00";
      const specialPrice = product.special_price
        ? String(product.special_price)
        : undefined;
      const purchasePoints = product.purchase_points || null;
      const endDate = product.end_date;

      const hasSpecialPrice =
        specialPrice !== undefined && specialPrice !== null;
      const discount = hasSpecialPrice
        ? Math.round(
            ((Number(price) - Number(specialPrice)) / Number(price)) * 100
          )
        : 0;

      return {
        productName,
        productImage,
        productRating,
        price,
        specialPrice,
        hasSpecialPrice,
        discount,
        purchasePoints,
        endDate,
      };
    }, [product]);

    useEffect(() => {
      if (!productData?.endDate) return;

      const updateTimer = () => {
        const now = new Date().getTime();
        const endTime = new Date(productData.endDate).getTime();
        const difference = endTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h`);
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m`);
          } else {
            setTimeLeft(`${minutes}m`);
          }
        } else {
          setTimeLeft("");
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000);

      return () => clearInterval(interval);
    }, [productData?.endDate]);

    const onPress = useCallback(() => {
      router.push({
        pathname: "/ProductDetails",
        params: { productJSON: JSON.stringify(product) },
      });
    }, [router, product]);

    const handleAddToCart = useCallback(() => {
      onAddToCart?.();
    }, [onAddToCart]);

    const handleAddToWishlist = useCallback(() => {
      onAddToWishlist?.();
    }, [onAddToWishlist]);

    if (!productData) return null;

    const {
      productName,
      productImage,
      productRating,
      price,
      specialPrice,
      hasSpecialPrice,
      discount,
      purchasePoints,
    } = productData;

    if (simplified || variant === "grid") {
      return (
        <TouchableOpacity
          className="rounded-lg overflow-hidden bg-white"
          activeOpacity={0.95}
          onPress={onPress}
        >
          {/* Image container */}
          <View className="w-full h-48 relative bg-gray-50">
            <Image
              source={{ uri: productImage }}
              className="w-full h-full"
              resizeMode="cover"
              defaultSource={{ uri: "https://via.placeholder.com/150" }}
              fadeDuration={0}
            />

            {/* Wishlist button */}
            <TouchableOpacity
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 items-center justify-center"
              onPress={handleAddToWishlist}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              activeOpacity={0.7}
            >
              <Heart size={16} color="#666" stroke="#666" fill="transparent" />
            </TouchableOpacity>

            {/* Discount badge */}
            {!simplified && hasSpecialPrice && discount > 0 && (
              <View className="absolute top-3 left-3 px-2 py-1 rounded-full bg-red-500">
                <Text className="text-white text-xs font-bold">
                  -{discount}%
                </Text>
              </View>
            )}

            {/* Timer badge */}
            {!simplified && timeLeft && (
              <View className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/70 flex-row items-center">
                <Clock size={10} color="white" />
                <Text className="text-white text-xs font-bold ml-1">
                  {timeLeft}
                </Text>
              </View>
            )}
          </View>

          {/* Product details */}
          <View className="p-4">
            {/* Purchase Points */}
            {!simplified && purchasePoints && (
              <View className="flex-row items-center mb-2">
                <FontAwesome5 name="diamond" size={12} color={innerColor} />
                <Text
                  className="text-xs font-semibold ml-1"
                  style={{ color: innerColor }}
                >
                  {purchasePoints} points
                </Text>
              </View>
            )}

            {/* Rating */}
            {!simplified && productRating > 0 && (
              <View className="flex-row items-center mb-2">
                <FontAwesome5 name="star" size={12} color="#FFD700" />
                <Text className="text-xs text-gray-600 ml-1 font-medium">
                  {productRating.toFixed(1)}
                </Text>
              </View>
            )}

            {/* Product name */}
            <Text
              className="text-base font-semibold text-gray-900 mb-3"
              numberOfLines={simplified ? 1 : 2}
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
                    {!simplified && (
                      <Text className="text-sm text-gray-400 line-through">
                        ${price}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text className="text-lg font-bold text-gray-900">
                    ${price}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: innerColor }}
                activeOpacity={0.8}
                onPress={handleAddToCart}
              >
                <ShoppingBag size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        className="w-40 rounded-lg overflow-hidden shadow-md mx-1 my-2 border border-gray-100"
        style={{ backgroundColor: containerColor }}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <View className="w-full h-48 relative bg-gray-50">
          <Image
            source={{ uri: productImage }}
            className="w-full h-full bg-gray-100"
            resizeMode="cover"
            defaultSource={{ uri: "https://via.placeholder.com/150" }}
            fadeDuration={0}
          />

          <TouchableOpacity
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 items-center justify-center z-10 shadow-sm"
            onPress={handleAddToWishlist}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            activeOpacity={0.7}
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

          {/* Timer badge */}
          {timeLeft && (
            <View className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 flex-row items-center">
              <Clock size={8} color="white" />
              <Text className="text-white text-xs font-bold ml-1">
                {timeLeft}
              </Text>
            </View>
          )}
        </View>

        {/* Product details */}
        <View className="p-2.5">
          {/* Purchase Points */}
          {purchasePoints && (
            <View className="flex-row items-center mb-1">
              <FontAwesome5 name="diamond" size={10} color={innerColor} />
              <Text
                className="text-xs font-semibold ml-1"
                style={{ color: innerColor }}
              >
                {purchasePoints} pts
              </Text>
            </View>
          )}

          {/* Rating */}
          {productRating > 0 && (
            <View className="flex-row items-center mb-1">
              <FontAwesome5 name="star" size={10} color="#FFD700" />
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
          onPress={handleAddToCart}
        >
          <ShoppingBag size={16} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.special_price === nextProps.product.special_price &&
      prevProps.product.end_date === nextProps.product.end_date &&
      prevProps.product.purchase_points === nextProps.product.purchase_points &&
      prevProps.variant === nextProps.variant &&
      prevProps.simplified === nextProps.simplified
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
