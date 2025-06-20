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

interface MainDetail extends Product {
  sku: string;
  video_url: string | null;
  quantity: number;
  value_points: number;
  details: string;
  brand: Brand;
  categories: MainCategory[];
}

export default function ProductDetailsScreen(): React.ReactElement {
  const { productJSON } = useLocalSearchParams();
  const product =
    typeof productJSON === "string"
      ? (JSON.parse(productJSON) as Product)
      : null;

  const {
    data: relatedProducts,
    isLoading: relatedProductsLoading,
    isError: relatedProductsError,
  } = useGetRelatedProducts(product?.slug || "");

  const [productDetail, setProductDetail] = useState<MainDetail | null>(null);
  const [productDetailLoading, setProductDetailLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

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

  const inStock = useMemo(
    () => (productDetail?.quantity || 0) > 0,
    [productDetail?.quantity]
  );

  const priceData = useMemo(() => {
    const currentProduct = productDetail || product;
    if (!currentProduct) return null;

    const regularPrice = currentProduct.price || 0;
    const specialPrice = currentProduct.special_price;
    const hasSpecialPrice = specialPrice !== undefined && specialPrice !== null;
    const finalPrice = hasSpecialPrice ? specialPrice : regularPrice;
    const discount = hasSpecialPrice
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
    return productDetail?.purchase_points || product?.purchase_points || null;
  }, [productDetail?.purchase_points, product?.purchase_points]);

  useEffect(() => {
    const endDate = productDetail?.end_date || product?.end_date;
    if (!endDate) return;

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
        setTimeLeft("");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [productDetail?.end_date, product?.end_date]);

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
    [activeImageIndex, product?.id]
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
  }, [productDetail, product?.id, quantity, addToCart, cartOperationError]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
  }, []);

  const shareProduct = useCallback(async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `Check out ${product.name} on our store!`,
        url: `https://yourstore.com/product/${product.name}`,
      });
    } catch (error) {
      console.error("Error sharing product:", error);
    }
  }, [product, product?.name]);

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
      setProductDetailLoading(true);
      try {
        const response = await axiosApi.get(`getProduct/${product?.slug}`);
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
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        {/* Header */}
        <ProductHeader
          isFavorite={isFavorite}
          shareProduct={shareProduct}
          toggleFavorite={toggleFavorite}
        />

        {/* Main Image Carousel */}
        <MainImageCarousel
          activeImageIndex={activeImageIndex}
          allImages={
            productDetailLoading ||
            (!productDetailLoading && productDetail?.gallery?.length === 0)
              ? [product?.image]
              : [product?.image, ...(productDetail?.gallery ?? [])]
          }
          mainCarouselReference={mainCarouselReference}
          setActiveImageIndex={setActiveImageIndex}
        />

        {/* Thumbnail Carousel */}
        <ThumbnailCarousel
          allImages={
            productDetailLoading
              ? null
              : !productDetailLoading && productDetail?.gallery?.length === 0
              ? [product?.image]
              : [product?.image, ...(productDetail?.gallery ?? [])]
          }
          thumbnailCarouselReference={thumbnailCarouselReference}
          activeImageIndex={activeImageIndex}
          handleThumbnailPress={handleThumbnailPress}
          productDetailLoading={productDetailLoading}
        />

        {/* Price and Discount Information */}
        <View className="px-4 py-4 bg-white">
          {/* Purchase Points */}
          {purchasePoints && (
            <View className="flex-row items-center mb-3 bg-purple-50 px-3 py-2 rounded-lg">
              <FontAwesome5 name="diamond" size={16} color="#5E3EBD" />
              <Text className="text-purple-700 font-semibold ml-2">
                Earn {purchasePoints} points with this purchase
              </Text>
            </View>
          )}

          {/* Discount Timer */}
          {timeLeft && priceData?.hasSpecialPrice && (
            <View className="flex-row items-center mb-3 bg-red-50 px-3 py-2 rounded-lg">
              <Clock size={16} color="#EF4444" />
              <Text className="text-red-600 font-semibold ml-2">
                🔥 Limited Time: {timeLeft}
              </Text>
            </View>
          )}

          {/* Price Display */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              {priceData?.hasSpecialPrice ? (
                <View>
                  <View className="flex-row items-center mb-1">
                    <Text className="text-3xl font-bold text-red-500">
                      ${priceData.specialPrice?.toFixed(2)}
                    </Text>
                    {priceData.discount > 0 && (
                      <View className="ml-3 bg-red-500 px-2 py-1 rounded">
                        <Text className="text-white text-sm font-bold">
                          -{priceData.discount}% OFF
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-lg text-gray-400 line-through">
                    ${priceData.regularPrice.toFixed(2)}
                  </Text>
                  {priceData?.specialPrice && (
                    <Text className="text-green-600 font-semibold">
                      You save $
                      {(
                        priceData.regularPrice - priceData.specialPrice
                      ).toFixed(2)}
                    </Text>
                  )}
                </View>
              ) : (
                <Text className="text-3xl font-bold text-[#5E3EBD]">
                  ${priceData?.regularPrice.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Product Information */}
        <ProductInformation
          brand={productDetail?.brand}
          categories={productDetail?.categories}
          description={product?.description}
          expandedSections={expandedSections}
          highlights={product?.highlights}
          inStock={inStock}
          name={product?.name}
          price={product?.price}
          rating={productDetail?.rating}
          reviews={productDetail?.rating}
          sku={productDetail?.sku}
          toggleSection={toggleSection}
        />

        {/* Similar Products Section */}
        <SimilarProductsSection similarProducts={relatedProducts} />
      </ScrollView>

      {/* Bottom Action Bar */}
      {!productDetail ? (
        <View className="bg-white border-t border-gray-200 px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            {/* Quantity Selector Skeleton */}
            <View className="w-24 h-10 rounded-md bg-[#e0d7f5]"></View>

            {/* Price Skeleton */}
            <View className="w-16 h-6 rounded bg-[#e0d7f5]"></View>
          </View>

          {/* Add to Cart Button Skeleton */}
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
                  <Text className="text-sm text-gray-400 line-through">
                    ${(priceData.regularPrice * quantity).toFixed(2)}
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
