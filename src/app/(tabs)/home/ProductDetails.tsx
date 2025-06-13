import React from "react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Alert,
  TouchableOpacity,
  Share,
} from "react-native";
import axios, { type AxiosResponse } from "axios";
import { useCartStore } from "@/store/cartStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShoppingBag } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SimilarProduct } from "@/components/product/SimilarProductItem";
import QuantitySelector from "@/components/product/QuantitySelector";
import { Brand, Product } from "@/types/globalTypes";
import ProductHeader from "@/components/product/ProductHeader";
import MainImageCarousel from "@/components/product/MainImageCarousel";
import ThumbnailCarousel from "@/components/product/ThumbnailCarousel";
import ProductInformation from "@/components/product/ProductInformation";
import SimilarProductsSection from "@/components/product/SimilarProductsSection";

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  main_image: string | null;
  category_cover_image: string | null;
  description: string | null;
  subcategories: Category[] & { children: Category[] };
}

interface MainDetail extends Product {
  sku: string;
  video_url: string | null;
  quantity: number;
  value_points: number;
  details: string;
  brand: Brand;
  categories: Category[];
}
interface GetProductApiResponse {
  status: boolean;
  message?: string;
  data: {
    mainDetail: MainDetail;
  };
}

export default function ProductDetailsScreen(): React.ReactElement {
  const { productJSON } = useLocalSearchParams();
  const product =
    typeof productJSON === "string"
      ? (JSON.parse(productJSON) as Product)
      : null;

  const [productDetail, setProductDetail] = useState<MainDetail | null>(null); //for the details that aren't from the product that came with the search
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productLoadingError, setProductLoadingError] = useState<string | null>(
    null
  );

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

  const allImages = useMemo(() => {
    if (!productDetail) return [];
    return [productDetail.image, ...(productDetail.gallery || [])].filter(
      Boolean
    );
  }, [productDetail]);

  const similarProducts = useMemo(
    (): SimilarProduct[] => [
      {
        id: 1,
        name: "Similar Product 1",
        price: (product?.price || 0) * 0.8,
        image: `https://picsum.photos/200/200?random=1`,
      },
      {
        id: 2,
        name: "Similar Product 2",
        price: (product?.price || 0) * 0.9,
        image: `https://picsum.photos/200/200?random=2`,
      },
      {
        id: 3,
        name: "Similar Product 3",
        price: (product?.price || 0) * 1.1,
        image: `https://picsum.photos/200/200?random=3`,
      },
      {
        id: 4,
        name: "Similar Product 4",
        price: (product?.price || 0) * 0.7,
        image: `https://picsum.photos/200/200?random=4`,
      },
    ],
    [product?.price]
  );

  const inStock = useMemo(
    () => (productDetail?.quantity || 0) > 0,
    [productDetail?.quantity]
  );
  const totalPrice = useMemo(
    () => (productDetail?.price || 0) * quantity,
    [productDetail?.price, quantity]
  );

  useEffect(() => {
    async function loadProductDetails(): Promise<void> {
      setIsLoadingProduct(true);
      setProductLoadingError(null);

      try {
        const response: AxiosResponse<GetProductApiResponse> = await axios.get(
          `https://api-gocami-test.gocami.com/api/getProduct/${product?.slug}`
        );
        if (!response.data.status) {
          throw new Error(
            response.data.message ?? "Failed to fetch product details"
          );
        }

        setProductDetail(response.data.data.mainDetail);
      } catch (fetchError: any) {
        setProductLoadingError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unknown error fetching product"
        );
      } finally {
        setIsLoadingProduct(false);
      }
    }

    if (product) {
      loadProductDetails();
    }
  }, [product]);

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
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  if (productLoadingError !== null || product === null) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Oops! Something went wrong
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          {productLoadingError ?? "Product not found"}
        </Text>
        <TouchableOpacity
          className="bg-[#5E3EBD] py-3 px-6 rounded-lg"
          onPress={() => setIsLoadingProduct(true)}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        {allImages?.length > 0 && (
          <MainImageCarousel
            activeImageIndex={activeImageIndex}
            allImages={allImages}
            mainCarouselReference={mainCarouselReference}
            setActiveImageIndex={setActiveImageIndex}
          />
        )}

        {/* Thumbnail Carousel */}
        {allImages?.length > 1 && (
          <ThumbnailCarousel
            allImages={allImages}
            thumbnailCarouselReference={thumbnailCarouselReference}
            activeImageIndex={activeImageIndex}
            handleThumbnailPress={handleThumbnailPress}
          />
        )}

        {/* Product Information */}
        <ProductInformation
          brand={productDetail?.brand}
          categories={productDetail?.categories}
          description={product.description}
          expandedSections={expandedSections}
          highlights={product.highlights}
          inStock={inStock}
          name={product.name}
          price={product.price}
          rating={productDetail?.rating}
          reviews={productDetail?.rating}
          sku={productDetail?.sku}
          toggleSection={toggleSection}
        />

        {/* Similar Products Section */}
        <SimilarProductsSection
          price={productDetail?.price}
          similarProducts={similarProducts}
        />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <QuantitySelector
            quantity={quantity}
            onIncrement={incrementQuantity}
            onDecrement={decrementQuantity}
          />

          <Text className="text-xl font-bold text-[#5E3EBD]">
            ${totalPrice.toFixed(2)}
          </Text>
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
              <ActivityIndicator color="#ffffff" size="small" />
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
    </SafeAreaView>
  );
}
