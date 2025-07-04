import { View, Text, Image, TouchableOpacity } from "react-native";
import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import type { Product } from "@/types/globalTypes";
import { Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import axiosApi from "@/apis/axiosApi";
import { useSessionStore } from "@/store/useSessionStore";
import ProductCardWide from "./ProductCardWide";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";

interface Props {
  product: Product;
  innerColor?: string;
  containerColor?: string;
  variant?: "default" | "grid" | "wide";
  simplified?: boolean;
}

const ProductCard = React.memo(
  ({
    product,
    innerColor = "#5e3ebd",
    containerColor = "white",
    variant = "default",
    simplified = false,
  }: Props) => {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const { isLogged, token } = useSessionStore();
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
      staleTime: 5 * 60 * 1000,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: true,
    });

    const isPressable = useRef(true);

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
      const endDate = product.end_date;

      const hasSpecialPrice =
        specialPrice !== undefined &&
        specialPrice !== null &&
        Number(specialPrice) < Number(price);
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

    const addToCart = useCartStore((state) => state.addToCart);
    const cartOperationError = useCartStore((state) => state.error);
    
    useEffect(() => {
      if (!productData?.endDate) {
        setTimeLeft("");
        return;
      }

      const calculateTimeLeft = () => {
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

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 60 * 1000);

      return () => clearInterval(interval);
    }, [productData?.endDate]);

    useEffect(() => {
      if (wishListFromQuery && product) {
        const isInWishlist = wishListFromQuery.some(
          (item: Product) => item.id === product.id
        );
        setIsFavorite(isInWishlist);
      }
    }, [wishListFromQuery, product]);

    useEffect(() => {
      return () => {
        isPressable.current = true;
      };
    }, []);

    const navigateToProductDetails = useCallback(() => {
      if (!isPressable.current) return;
      isPressable.current = false;
      console.log("PUSHED: " + isFavorite);
      router.push({
        pathname: "/ProductDetails",
        params: {
          productJSON: JSON.stringify(product),
          favorite: String(isFavorite),
        },
      });

      setTimeout(() => {
        isPressable.current = true;
      }, 1500);
    }, [router, product]);

    const handleAddToCart = useCallback(async () => {
      
     if (!product || !product.id) return;    
     
     if (product.quantity<=0) {
                   Toast.show({
                  type: "error",
                  text1: "Add to Cart",
                  text2: `Out Of Stock`,
                  autoHide: true,
                  visibilityTime: 1500,
                  topOffset: 60,
                });
                return;
     }  
    
     try {
          await addToCart(String(product.id), 1);
          Toast.show({
                  type: "success",
                  text1: "Add to Cart",
                  text2: `${productData?.productName} added to cart (placeholder).`,
                  autoHide: true,
                  visibilityTime: 1500,
                  topOffset: 60,
                });
        } catch {
             Toast.show({
                  type: "error",
                  text1: "Add to Cart",
                  text2: `${cartOperationError}`,
                  autoHide: true,
                  visibilityTime: 1500,
                  topOffset: 60,
                });
        }

    }, [productData?.productName]);

    const handleAddToWishlist = useCallback(async () => {
      if (!isLogged) {
        router.navigate("/auth/signInAccount");
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
          queryClient.invalidateQueries({ queryKey: ["wishlist", token] });

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
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to update wishlist.",
            autoHide: true,
            visibilityTime: 2000,
            topOffset: 60,
          });
          setIsFavorite(isCurrentlyFavorite);
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
    } = productData;

    if (variant === "wide") {
      return (
        <ProductCardWide
          product={product}
          innerColor={innerColor}
          containerColor={containerColor}
          simplified={simplified}
        />
      );
    }

    const isSimplifiedOrGrid = simplified || variant === "grid";

    return (
      <TouchableOpacity
        className={`rounded-lg overflow-hidden ${
          isSimplifiedOrGrid
            ? "bg-white"
            : "w-44 shadow-md mx-1 my-2 border border-gray-100"
        }`}
        style={{ backgroundColor: containerColor }}
        activeOpacity={0.95}
        onPress={navigateToProductDetails}
      >
        <View className="w-full h-48 relative bg-gray-50">
          <Image
            source={{ uri: productImage }}
            className={`w-full h-full ${
              isSimplifiedOrGrid ? "" : "bg-gray-100"
            }`}
            resizeMode="cover"
            defaultSource={{
              uri: "https://gocami.gonext.tech/images/common/no-image.png",
            }}
            fadeDuration={0}
          />

          {!product?.has_variants ? (
            <TouchableOpacity
              className={`absolute top-3 right-3 rounded-full bg-white/90 items-center justify-center ${
                isSimplifiedOrGrid ? "w-8 h-8" : "w-7 h-7 z-10 shadow-sm"
              }`}
              onPress={handleAddToWishlist}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name="heart"
                size={16}
                color={isFavorite ? "#ffb500" : "#666"}
                solid={isFavorite}
              />
            </TouchableOpacity>
          ) : null}

          {!simplified && hasSpecialPrice && discount > 0 ? (
            <View
              className={`absolute top-3 left-3 px-2 py-1 rounded-full ${
                isSimplifiedOrGrid ? "bg-red-500" : "px-1.5 py-0.5 rounded"
              }`}
              style={!isSimplifiedOrGrid ? { backgroundColor: "#e4344f" } : {}}
            >
              <Text className="text-white text-xs font-bold">
                {discount > 0 ? `-${discount}%` : null}
              </Text>
            </View>
          ) : null}

          {!simplified && timeLeft ? (
            <View
              className={`absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/70 flex-row items-center ${
                isSimplifiedOrGrid
                  ? ""
                  : "bottom-2 left-2 px-1.5 py-0.5 rounded"
              }`}
            >
              <Clock size={isSimplifiedOrGrid ? 10 : 8} color="white" />
              <Text className="text-white text-xs font-bold ml-1">
                {timeLeft ? `${timeLeft} left` : "Sale ended"}
              </Text>
            </View>
          ) : null}
        </View>

        <View className={`p-4 ${isSimplifiedOrGrid ? "" : "p-2.5"}`}>
          {!simplified && purchasePoints ? (
            <View
              className={`flex-row items-center mb-2 ${
                isSimplifiedOrGrid ? "" : "mb-1"
              }`}
            >
              <Text
                className={`text-xs font-semibold ml-1 ${
                  isSimplifiedOrGrid ? "" : "ml-1"
                }`}
                style={{ color: innerColor }}
              >
                {purchasePoints ? purchasePoints : null}{" "}
                {isSimplifiedOrGrid ? "points" : "pts"}
              </Text>
            </View>
          ) : null}

          {!simplified && productRating > 0 ? (
            <View
              className={`flex-row items-center mb-2 ${
                isSimplifiedOrGrid ? "" : "mb-1"
              }`}
            >
              <FontAwesome5
                name="star"
                size={isSimplifiedOrGrid ? 12 : 10}
                color="#FFD700"
              />
              <Text
                className={`text-xs text-gray-600 ml-1 font-medium ${
                  isSimplifiedOrGrid ? "" : "ml-0.5"
                }`}
              >
                {productRating ? productRating.toFixed(1) : null}
              </Text>
            </View>
          ) : null}

          <Text
            className={`font-semibold text-gray-900 mb-3 ${
              isSimplifiedOrGrid ? "text-base" : "text-sm mb-1"
            }`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {productName ? productName : null}
          </Text>

          {isSimplifiedOrGrid ? (
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                {hasSpecialPrice ? (
                  <View>
                    <Text
                      className="text-lg font-bold"
                      style={{ color: "#FF4757" }}
                    >
                      {specialPrice ? `$${specialPrice}` : null}
                    </Text>
                    {!simplified ? (
                      <Text className="text-sm text-gray-400 line-through">
                        {price ? `$${price}` : null}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <Text className="text-lg font-bold text-gray-900">
                    {price ? `$${price}` : null}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: innerColor }}
                activeOpacity={0.8}
                onPress={handleAddToCart}
              >
                <FontAwesome5 name="shopping-bag" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center">
              {hasSpecialPrice ? (
                <>
                  <Text
                    className="text-sm font-bold mr-1.5"
                    style={{ color: "#e4344f" }}
                  >
                    {specialPrice ? `$${specialPrice}` : null}
                  </Text>
                  <Text className="text-xs text-gray-400 line-through">
                    {price ? `$${price}` : null}
                  </Text>
                </>
              ) : (
                <Text className="text-sm font-bold text-gray-900">
                  {price ? `$${price}` : null}
                </Text>
              )}
            </View>
          )}
        </View>

        {!isSimplifiedOrGrid ? (
          <TouchableOpacity
            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full items-center justify-center shadow-sm"
            style={{ backgroundColor: innerColor }}
            activeOpacity={0.8}
            onPress={handleAddToCart}
          >
            <FontAwesome5 name="shopping-bag" size={16} color="#fff" />
          </TouchableOpacity>
        ) : null}
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
      prevProps.simplified === nextProps.simplified &&
      prevProps.innerColor === nextProps.innerColor &&
      prevProps.containerColor === nextProps.containerColor
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
