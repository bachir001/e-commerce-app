import { View, Text, Image, TouchableOpacity } from "react-native";
import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import type { Product } from "@/types/globalTypes";
import { Heart, ShoppingBag, Star, Package } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import axiosApi from "@/apis/axiosApi";
import { useSessionStore } from "@/store/useSessionStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Props {
  product: Product;
  innerColor?: string;
  containerColor?: string;
  onPress?: () => void;
}

const ProductCardWide = React.memo(
  ({ product, innerColor = "#6e3ebd", containerColor = "white" }: Props) => {
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const { isLogged, token } = useSessionStore();
    const isPressable = useRef(true);

    const queryClient = useQueryClient();

    const { data: wishListFromQuery } = useQuery<Product[], Error>({
      queryKey: ["wishlist", token],
      queryFn: async () => {
        if (!token) {
          return [];
        }
        const response = await axiosApi.get("/favorite", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.data || [];
      },
      enabled: !!token,
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60,
    });

    useEffect(() => {
      if (wishListFromQuery && product) {
        const isInWishlist = wishListFromQuery.some(
          (item) => item.id === product.id
        );
        setIsFavorite(isInWishlist);
      }
    }, [wishListFromQuery, product]);

    const productData = useMemo(() => {
      if (!product) return null;

      const productName = product.name || "Untitled Product";
      const productImage =
        product.image ||
        product.product_image ||
        "https://gocami.gonext.tech/images/common/no-image.png";
      const productRating = product.rating ? Number(product.rating) : 0;
      const price = product.price ? String(product.price) : "0.00";
      const specialPrice = product.special_price
        ? String(product.special_price)
        : undefined;
      const purchasePoints = product.purchase_points || null;
      const description = product.description || "";
      const highlights = product.highlights || "";
      const reviews = product.reviews || 0;
      const discount = product.discount || 0;
      const quantity = product.quantity || 0;
      const showCounter = product.show_counter;

      const hasSpecialPrice =
        specialPrice !== undefined && specialPrice !== null;
      const calculatedDiscount = hasSpecialPrice
        ? Math.round(
            ((Number(price) - Number(specialPrice)) / Number(price)) * 100
          )
        : discount;

      return {
        productName,
        productImage,
        productRating,
        price,
        specialPrice,
        hasSpecialPrice,
        discount: calculatedDiscount,
        purchasePoints,
        description,
        highlights,
        reviews,
        quantity,
        showCounter,
      };
    }, [product]);

    const onPressProductCard = useCallback(() => {
      console.log(product);
      if (!isPressable.current) return;
      isPressable.current = false;
      router.push({
        pathname: "/ProductDetails",
        params: { productJSON: JSON.stringify(product) },
      });

      setTimeout(() => {
        isPressable.current = true;
      }, 1500);
    }, [router, product]);

    const handleAddToCart = useCallback(() => {
      Toast.show({
        type: "info",
        text1: "Add to Cart",
        text2: `${productData?.productName} added to cart (placeholder).`,
        autoHide: true,
        visibilityTime: 1500,
        topOffset: 60,
      });
    }, [productData?.productName]);

    const handleAddToWishlist = useCallback(async () => {
      if (!isLogged) {
        Toast.show({
          type: "error",
          text1: "Login Required",
          text2: "Please log in to add products to your wishlist.",
          autoHide: true,
          visibilityTime: 2000,
          topOffset: 60,
        });
        return;
      }

      setIsFavorite((prev) => !prev);
      const isCurrentlyFavorite = isFavorite;

      try {
        const WishListBody: {
          product_detail_id?: number;
          product_id?: number;
        } = {};

        if (product.has_variants) {
          WishListBody.product_detail_id = Number(product.id);
        } else {
          WishListBody.product_id = Number(product.id);
        }

        const endpoint = isCurrentlyFavorite
          ? `/favorite/remove?_method=DELETE`
          : `/favorite/add`;

        const response = await axiosApi.post(endpoint, WishListBody, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: isCurrentlyFavorite
              ? "Product removed from wishlist."
              : "Product added to wishlist.",
            autoHide: true,
            visibilityTime: 1000,
            topOffset: 60,
          });

          queryClient.invalidateQueries({ queryKey: ["wishlist", token] });
        } else {
          setIsFavorite(isCurrentlyFavorite);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to update wishlist.",
            autoHide: true,
            visibilityTime: 2000,
            topOffset: 60,
          });
        }
      } catch (err) {
        console.error("Error updating wishlist:", err);
        setIsFavorite(isCurrentlyFavorite);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to update wishlist.",
          autoHide: true,
          visibilityTime: 2000,
          topOffset: 60,
        });
      }
    }, [isLogged, token, product, isFavorite]);

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
      reviews,
      quantity,
      showCounter,
    } = productData;

    return (
      <TouchableOpacity
        className="flex-row mb-4"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(110, 62, 189, 0.1)",
        }}
        activeOpacity={0.9}
        onPress={onPressProductCard}
      >
        <View className="w-36 h-36 relative bg-gray-50 flex-none">
          <Image
            source={{ uri: productImage }}
            className="w-full h-full"
            resizeMode="cover"
            defaultSource={{
              uri: "https://gocami.gonext.tech/images/common/no-image.png",
            }}
            fadeDuration={0}
          />

          <View
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            }}
          />

          {hasSpecialPrice && discount > 0 ? (
            <View
              className="absolute top-3 left-3 px-2 py-1"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.9)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Text className="text-white text-xs font-bold">-{discount}%</Text>
            </View>
          ) : null}

          {quantity > 0 && quantity <= 10 ? (
            <View
              className="absolute top-3 right-3 px-2 py-1 flex-row items-center"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.9)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Package size={10} color="white" />
              <Text className="text-white text-xs font-bold ml-1">
                {quantity} left
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-1 p-4 justify-between">
          <View>
            <View className="flex-row items-center justify-between mb-2">
              {purchasePoints ? (
                <View
                  className="flex-row items-center px-2 py-1"
                  style={{
                    backgroundColor: `rgba(110, 62, 189, 0.1)`,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    className="text-xs font-semibold ml-1"
                    style={{ color: innerColor }}
                  >
                    {purchasePoints} pts
                  </Text>
                </View>
              ) : null}

              {product.has_variants ? (
                <View
                  className="px-2 py-1"
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    borderRadius: 12,
                  }}
                >
                  <Text className="text-xs font-semibold text-green-600">
                    Multiple Options
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              className="text-lg font-bold text-gray-900 mb-2"
              numberOfLines={2}
            >
              {productName}
            </Text>

            {productRating > 0 ? (
              <View className="flex-row items-center mb-2">
                <View className="flex-row items-center mr-3">
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text className="text-sm text-gray-700 ml-1 font-medium">
                    {productRating.toFixed(1)}
                  </Text>
                </View>
                {reviews > 0 ? (
                  <Text className="text-xs text-gray-500">
                    ({reviews} reviews)
                  </Text>
                ) : null}
              </View>
            ) : null}

            {productData.highlights || productData.description ? (
              <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                {productData.highlights || productData.description}
              </Text>
            ) : null}
          </View>

          <View>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                {hasSpecialPrice ? (
                  <View className="flex-row items-center">
                    <Text
                      className="text-xl font-bold mr-2"
                      style={{ color: "#FF4757" }}
                    >
                      ${specialPrice}
                    </Text>
                    <Text className="text-sm text-gray-400 line-through">
                      ${price}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-xl font-bold text-gray-900">
                    ${price}
                  </Text>
                )}
              </View>

              <View className="flex-row items-center">
                {!product?.has_variants ? (
                  <TouchableOpacity
                    className="w-11 h-11 items-center justify-center mr-3"
                    style={{
                      backgroundColor: isFavorite
                        ? "rgba(255, 181, 0, 0.15)"
                        : "rgba(107, 114, 128, 0.1)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 22,
                      borderWidth: 1,
                      borderColor: isFavorite
                        ? "rgba(255, 181, 0, 0.3)"
                        : "rgba(107, 114, 128, 0.2)",
                    }}
                    onPress={handleAddToWishlist}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5
                      name="heart"
                      size={16}
                      color={isFavorite ? "#ffb500" : "#6b7280"}
                      solid={isFavorite}
                    />
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  className="w-11 h-11 items-center justify-center"
                  style={{
                    backgroundColor: `rgba(110, 62, 189, 0.9)`,
                    backdropFilter: "blur(8px)",
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: "rgba(110, 62, 189, 0.3)",
                  }}
                  activeOpacity={0.8}
                  onPress={handleAddToCart}
                >
                  <ShoppingBag size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {quantity > 0 || showCounter ? (
              <View
                className="flex-row items-center justify-between px-3 py-2"
                style={{
                  backgroundColor: "rgba(110, 62, 189, 0.05)",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "rgba(110, 62, 189, 0.1)",
                }}
              >
                <Text className="text-xs text-gray-600 font-medium">
                  Stock Status
                </Text>
                <Text
                  className="text-xs font-bold"
                  style={{
                    color:
                      quantity > 10
                        ? "#22c55e"
                        : quantity > 0
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                >
                  {quantity > 10
                    ? "In Stock"
                    : quantity > 0
                    ? `${quantity} left`
                    : "Out of Stock"}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.special_price === nextProps.product.special_price &&
      prevProps.product.purchase_points === nextProps.product.purchase_points &&
      prevProps.product.quantity === nextProps.product.quantity
    );
  }
);

ProductCardWide.displayName = "ProductCardWide";

export default ProductCardWide;
