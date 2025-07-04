import type React from "react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  type FlatList,
  Alert,
  TouchableOpacity,
  Image,
  Share,
} from "react-native";
import { useCartStore } from "@/store/cartStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShoppingBag, Clock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import QuantitySelector from "@/components/product/QuantitySelector";
import type { Brand, Product } from "@/types/globalTypes";
import ProductHeader from "@/components/product/ProductHeader";
import MainImageCarousel from "@/components/product/MainImageCarousel";
import ThumbnailCarousel from "@/components/product/ThumbnailCarousel";
import ProductInformation from "@/components/product/ProductInformation";
import SimilarProductsSection from "@/components/product/SimilarProductsSection";
import useGetRelatedProducts from "@/hooks/products/useGetRelatedProducts";
import axiosApi from "@/apis/axiosApi";
import DotsLoader from "@/components/common/AnimatedLayout";
import type { MainCategory } from "./(tabs)/categories";
import Toast from "react-native-toast-message";
import { useSessionStore } from "@/store/useSessionStore";
import { useQueryClient } from "@tanstack/react-query";
// import Share from "react-native-share";

interface MainDetail extends Product {
  sku: string;
  video_url: string | null;
  value_points: number;
  details: string;
  brand: Brand;
  categories: MainCategory[];
}

export default function ProductDetailsScreen({}): React.ReactElement {
  const { productJSON, favorite } = useLocalSearchParams();
  const product = useMemo(
    () =>
      typeof productJSON === "string"
        ? (JSON.parse(productJSON) as Product)
        : null,
    [productJSON]
  );

  const { token, isLogged, user } = useSessionStore();

  const {
    data: relatedProducts,
    isLoading: relatedProductsLoading,
    isError: relatedProductsError,
  } = useGetRelatedProducts(product?.slug || "");

  const queryClient = useQueryClient();

  const [productDetail, setProductDetail] = useState<MainDetail | null>(null);
  const [productDetailLoading, setProductDetailLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const mainCarouselReference = useRef<FlatList<string>>(null);
  const thumbnailCarouselReference = useRef<FlatList<string>>(null);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    highlights: false,
    shipping: false,
  });

  const addToCart = useCartStore((state) => state.addToCart);
  const isCartOperationInProgress = useCartStore((state) => state.loading);
  const cartOperationError = useCartStore((state) => state.error);

  const inStock = useMemo(() => {
    const qty = productDetail?.quantity ?? product?.quantity ?? 0;
    return qty > 0;
  }, [productDetail?.quantity, product?.quantity]);

  const priceData = useMemo(() => {
    if (!product) return null;
    const currentProduct = productDetail || product;

    const regularPrice = currentProduct.price || 0;
    const specialPrice = currentProduct.special_price;
    const hasSpecialPrice = specialPrice != null && specialPrice > 0;
    const finalPrice = hasSpecialPrice ? specialPrice : regularPrice;
    const discount =
      hasSpecialPrice && regularPrice > 0
        ? Math.round(((regularPrice - specialPrice) / regularPrice) * 100)
        : 0;

    return {
      regularPrice,
      specialPrice,
      hasSpecialPrice,
      finalPrice,
      discount,
      totalPrice: finalPrice * quantity,
    };
  }, [productDetail, product, quantity]);

  const purchasePoints = useMemo(() => {
    return productDetail?.purchase_points ?? product?.purchase_points ?? null;
  }, [productDetail?.purchase_points, product?.purchase_points]);

  const endDate = useMemo(() => {
    return productDetail?.end_date ?? product?.end_date;
  }, [productDetail?.end_date, product?.end_date]);

  useEffect(() => {
    if (!endDate) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(endDate).getTime();
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
          setTimeLeft(`${days} days ${hours} hours left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours} hours ${minutes} minutes left`);
        } else {
          setTimeLeft(`${minutes} minutes left`);
        }
      } else {
        setTimeLeft(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [endDate]);

  const handleThumbnailPress = useCallback(
    (index: number): void => {
      if (index === activeImageIndex) return;

      setActiveImageIndex(index);
      mainCarouselReference.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
      thumbnailCarouselReference.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    },
    [activeImageIndex]
  );

  const handleAddToCartPress = useCallback(async (): Promise<void> => {
    if (!product || !product.id) return;

    try {
      await addToCart(String(product.id), quantity);
      Alert.alert("Success", "Product added to cart");
    } catch {
      Alert.alert(
        "Error",
        cartOperationError ?? "Unable to add product to cart"
      );
    }
  }, [product, quantity, addToCart, cartOperationError]);

  const shareProduct = useCallback(async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `Check out ${product.name} on our store!`,
        url: `https://yourstore.com/product/${product.slug}`,
      });
    } catch (error) {
      console.error("Error sharing product:", error);
    }
  }, [product]);

  const toggleSection = useCallback(
    (section: keyof typeof expandedSections) => {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    },
    []
  );

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }, []);

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!product?.slug) return;

      if (favorite === "true") {
        setIsFavorite(true);
      }

      setProductDetailLoading(true);
      try {
        const response = await axiosApi.get(`/getProduct/${product.slug}`);
        if (response.status === 200) {
          setProductDetail(response.data.data.mainDetail);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setProductDetailLoading(false);
      }
    };

    fetchProductDetail();

    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [product?.slug]);

  const toggleFavorite = useCallback(async () => {
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
        user_id: number;
      } = {
        user_id: Number(user?.id),
      };

      if (productDetail?.has_variants) {
        WishListBody.product_detail_id = Number(product?.product_detail_id);
      } else {
        WishListBody.product_id = Number(product?.id);
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
  }, [isLogged, token, product, isFavorite, user, productDetail, queryClient]);

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-500">Product not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        <ProductHeader
          isFavorite={isFavorite}
          shareProduct={shareProduct}
          toggleFavorite={toggleFavorite}
        />

        <MainImageCarousel
          activeImageIndex={activeImageIndex}
          allImages={
            productDetailLoading
              ? ([product.image].filter(Boolean) as string[])
              : ([product.image, ...(productDetail?.gallery || [])].filter(
                  Boolean
                ) as string[])
          }
          mainCarouselReference={mainCarouselReference}
          setActiveImageIndex={setActiveImageIndex}
        />

        <ThumbnailCarousel
          allImages={
            productDetailLoading
              ? ([product.image].filter(Boolean) as string[])
              : ([product.image, ...(productDetail?.gallery || [])].filter(
                  Boolean
                ) as string[])
          }
          thumbnailCarouselReference={thumbnailCarouselReference}
          activeImageIndex={activeImageIndex}
          handleThumbnailPress={handleThumbnailPress}
          productDetailLoading={productDetailLoading}
        />

        <View className="px-4 py-4 bg-white">
          {purchasePoints ? (
            <View className="flex-row items-center mb-3 bg-purple-50 px-3 py-2 rounded-lg">
              <Text className="text-purple-700 font-semibold ml-2">
                Earn {purchasePoints} points with this purchase
              </Text>
            </View>
          ) : null}

          {timeLeft !== null && priceData?.hasSpecialPrice ? (
            <View className="flex-row items-center mb-3 bg-red-50 px-3 py-2 rounded-lg">
              <Clock size={16} color="#EF4444" />
              <Text className="text-red-600 font-semibold ml-2">
                🔥 Limited Time: {timeLeft}
              </Text>
            </View>
          ) : null}

          <View className="mb-4">
            {priceData?.hasSpecialPrice ? (
              <View className="flex-row items-center justify-between">
                <View>
                  <View className="flex-row items-center">
                    <Text className="text-3xl font-bold text-red-500">
                      ${priceData.specialPrice?.toFixed(2)}
                    </Text>
                    {priceData.discount > 0 ? (
                      <View className="ml-3 bg-red-500 px-2 py-1 rounded">
                        <Text className="text-white text-sm font-bold">
                          -{priceData.discount}% OFF
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-lg text-gray-400 line-through mr-2">
                      ${priceData.regularPrice.toFixed(2)}
                    </Text>
                    {priceData.hasSpecialPrice &&
                    priceData.specialPrice !== null &&
                    priceData.specialPrice !== undefined ? (
                      <Text className="text-green-600 font-semibold">
                        Save $
                        {(
                          priceData.regularPrice - priceData.specialPrice
                        ).toFixed(2)}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Text className="text-xl font-bold text-red-500">
                  ${priceData.totalPrice.toFixed(2)}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-between">
                <Text className="text-3xl font-bold text-[#5E3EBD]">
                  ${priceData?.regularPrice.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <ProductInformation
          brand={productDetail?.brand}
          categories={productDetail?.categories}
          description={productDetail?.description ?? product.description}
          expandedSections={expandedSections}
          highlights={productDetail?.highlights ?? product.highlights}
          inStock={inStock}
          name={product.name}
          rating={productDetail?.rating ?? product.rating}
          reviews={productDetail?.reviews ?? product.reviews}
          sku={productDetail?.sku ?? product.sku}
          toggleSection={toggleSection}
          productDetailLoading={productDetailLoading}
        />

        <SimilarProductsSection similarProducts={relatedProducts} />
      </ScrollView>

      {productDetailLoading ? (
        <View className="bg-white border-t border-gray-200 px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="w-24 h-10 rounded-md bg-[#e0d7f5]"></View>
            <View className="w-16 h-6 rounded bg-[#e0d7f5]"></View>
          </View>

          <View className="w-full rounded-xl py-4 px-6 flex-row items-center justify-center bg-[#e0d7f5]">
            <View className="w-5 h-5 rounded-full bg-[#d0c4f0] mr-2"></View>
            <View className="w-24 h-5 rounded bg-[#d0c4f0]"></View>
          </View>
        </View>
      ) : (
        <View className="bg-white border-t border-gray-200 px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <QuantitySelector
              quantity={quantity}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
            />

            <View className="items-end">
              {priceData?.hasSpecialPrice ? (
                <View className="items-end">
                  <Text className="text-xl font-bold text-red-500">
                    ${priceData.totalPrice.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <Text className="text-xl font-bold text-[#5E3EBD]">
                  ${priceData?.totalPrice.toFixed(2)}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            className="w-full"
            onPress={handleAddToCartPress}
            disabled={isCartOperationInProgress || !inStock}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={inStock ? ["#5E3EBD", "#7d5ee6"] : ["#cccccc", "#999999"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-xl py-4 px-6 flex-row items-center justify-center"
            >
              {isCartOperationInProgress ? (
                <DotsLoader color="#ffffff" size="small" />
              ) : (
                <>
                  <ShoppingBag size={20} color="#fff" />
                  <Text className="text-white font-bold text-lg ml-2">
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
