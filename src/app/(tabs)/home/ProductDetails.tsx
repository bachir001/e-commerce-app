
import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import axios, { AxiosResponse } from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/cartStore';

// -----------------------
// Type Definitions
// -----------------------

interface Category {
  name: string;
}

interface Brand {
  name: string;
}

interface MainDetail {
  name: string;
  sku?: string;
  image: string;
  gallery?: string[];
  price?: number;
  highlights?: string;
  description?: string;
  brand?: Brand;
  categories?: Category[];
  rating?: number;
  quantity?: number;
}

interface GetProductApiResponse {
  status: boolean;
  message?: string;
  data: {
    mainDetail: MainDetail;
  };
}

// -----------------------
// HTML‑strip helper
// -----------------------

function stripHtmlTags(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
}

// -----------------------
// Component
// -----------------------

export default function ProductDetailsScreen(): React.ReactElement {
  // 1. Read route parameter
const { productName, productId } =
  useLocalSearchParams<{
    productName: string;
    productId: string;    // note: params always come in as strings
  }>();

  // 2. Local state for product loading
  const [productDetail, setProductDetail] = useState<MainDetail | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productLoadingError, setProductLoadingError] = useState<string | null>(null);

  // 3. Carousel state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const mainCarouselReference = useRef<FlatList<string>>(null);
  const thumbnailCarouselReference = useRef<FlatList<string>>(null);

  // 4. Pull the `addToCart` action and cart `loading` & `error` flags from Zustand
  const addToCart = useCartStore((state) => state.addToCart);
  const isCartOperationInProgress = useCartStore((state) => state.loading);
  const cartOperationError = useCartStore((state) => state.error);

  // 5. Fetch product details on mount
  useEffect(() => {
    async function loadProductDetails(): Promise<void> {
      setIsLoadingProduct(true);
      setProductLoadingError(null);

      try {
        const response: AxiosResponse<GetProductApiResponse> = await axios.get(
          `https://api-gocami-test.gocami.com/api/getProduct/${productName}`
        );
        if (!response.data.status) {
          throw new Error(response.data.message ?? 'Failed to fetch product details');
        }
        
        setProductDetail(response.data.data.mainDetail);
      } catch (fetchError: any) {
        setProductLoadingError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Unknown error fetching product'
        );
      } finally {
        setIsLoadingProduct(false);
      }
    }

    loadProductDetails();
  }, [productName]);

  // 6. Carousel scroll handler
  function handleMainCarouselScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setActiveImageIndex(index);
  }

  // 7. Thumbnail press handler
  function handleThumbnailPress(index: number): void {
    setActiveImageIndex(index);
    mainCarouselReference.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    thumbnailCarouselReference.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  }

  // 8. Add‑to‑cart handler calls Zustand action
  async function handleAddToCartPress(): Promise<void> {
    if (productDetail === null) {
      return;
    }    
    try {
      await addToCart(productId, 1);
      // Alert.alert('Success', 'Product added to cart.');
    } catch {
      // `cartOperationError` will contain the message set by the store
      Alert.alert('Error', cartOperationError ?? 'Unable to add product to cart');
    }
  }

  // 9. Render loading or error states
  if (isLoadingProduct) {
    return (
      <View style={styles.fullScreenCentered}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (productLoadingError !== null || productDetail === null) {
    return (
      <View style={styles.fullScreenCentered}>
        <Text style={styles.errorText}>
          {productLoadingError ?? 'Product not found'}
        </Text>
      </View>
    );
  }

  // 10. Destructure product details
  const {
    name,
    sku,
    image,
    gallery = [],
    price = 0,
    highlights,
    description,
    brand,
    categories = [],
    rating = 0,
    quantity = 0,
  } = productDetail;

  const allImages: string[] = [image, ...gallery];
  const stockText = quantity > 0 ? 'In Stock' : 'Out of Stock';
  const stockTextStyle = quantity > 0 ? styles.inStockText : styles.outOfStockText;

  // 11. Main render
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Main Image Carousel */}
      <FlatList
        ref={mainCarouselReference}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={allImages}
        keyExtractor={(_, index) => `main-image-${index}`}
        onScroll={handleMainCarouselScroll}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={styles.carouselImageWrapper}>
            <Image
              source={{ uri: item } as ImageSourcePropType}
              style={styles.carouselImage}
              resizeMode="contain"
            />
          </View>
        )}
      />

      {/* Thumbnail Carousel */}
      <FlatList
        ref={thumbnailCarouselReference}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={allImages}
        keyExtractor={(_, index) => `thumbnail-${index}`}
        contentContainerStyle={styles.thumbnailContainer}
        renderItem={({ item, index }) => (
          <Pressable
            style={[
              styles.thumbnailWrapper,
              index === activeImageIndex
                ? styles.thumbnailWrapperActive
                : styles.thumbnailWrapperInactive,
            ]}
            onPress={() => handleThumbnailPress(index)}
          >
            <Image
              source={{ uri: item } as ImageSourcePropType}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          </Pressable>
        )}
      />

      {/* Pagination Indicators */}
      <View style={styles.paginationIndicatorContainer}>
        {allImages.map((_, index) => (
          <View
            key={`indicator-${index}`}
            style={[
              styles.paginationIndicator,
              index === activeImageIndex
                ? styles.paginationIndicatorActive
                : styles.paginationIndicatorInactive,
            ]}
          />
        ))}
      </View>

      {/* Product Information */}
      <View style={styles.productInfoContainer}>
        <Text style={styles.productNameText}>{name}</Text>

        {sku != null && <Text style={styles.skuText}>SKU: {sku}</Text>}

        <View style={styles.ratingRow}>
          {Array.from({ length: 5 }, (_, starIndex) => (
            <Ionicons
              key={`star-${starIndex}`}
              name={starIndex < Math.floor(rating) ? 'star' : 'star-outline'}
              size={20}
              color={starIndex < rating ? '#FFD700' : '#C0C0C0'}
            />
          ))}
          <Text style={styles.ratingValueText}>
            {rating.toFixed(1)}/5.0
          </Text>
        </View>

        <Text style={styles.priceText}>${price.toFixed(2)}</Text>

        <Text style={[styles.stockStatusText, stockTextStyle]}>{stockText}</Text>

        {highlights != null && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitleText}>Highlights</Text>
            <Text style={styles.sectionBodyText}>
              {stripHtmlTags(highlights)}
            </Text>
          </View>
        )}

        {description != null && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitleText}>Description</Text>
            <Text style={styles.sectionBodyText}>
              {stripHtmlTags(description)}
            </Text>
          </View>
        )}

        {brand?.name != null && (
          <Text style={styles.brandText}>
            Brand: <Text style={styles.brandNameText}>{brand.name}</Text>
          </Text>
        )}

        {categories.length > 0 && (
          <Text style={styles.categoryText}>
            Categories: {categories.map((category) => category.name).join(', ')}
          </Text>
        )}

        {/* Add to Cart Button */}
        <Pressable
          style={styles.addToCartButton}
          onPress={handleAddToCartPress}
          disabled={isCartOperationInProgress}
        >
          <Text style={styles.addToCartButtonText}>
            {isCartOperationInProgress ? 'Adding…' : 'Add to Cart'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// -----------------------
// Layout Constants
// -----------------------

const screenWidth: number = Dimensions.get('window').width;

// -----------------------
// Styles
// -----------------------

const styles = StyleSheet.create({
  fullScreenCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 48,
    backgroundColor: '#FFFFFF',
  },
  carouselImageWrapper: {
    width: screenWidth,
    height: screenWidth,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  thumbnailWrapper: {
    marginRight: 12,
    borderWidth: 2,
    borderRadius: 4,
  },
  thumbnailWrapperActive: {
    borderColor: '#5E3EBD',
  },
  thumbnailWrapperInactive: {
    borderColor: '#DDDDDD',
  },
  thumbnailImage: {
    width: 64,
    height: 64,
    borderRadius: 4,
  },
  paginationIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  paginationIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationIndicatorActive: {
    backgroundColor: '#5E3EBD',
  },
  paginationIndicatorInactive: {
    backgroundColor: '#CCCCCC',
  },
  productInfoContainer: {
    paddingHorizontal: 16,
  },
  productNameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  skuText: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingValueText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555555',
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5E3EBD',
    marginBottom: 8,
  },
  stockStatusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  inStockText: {
    color: '#228B22',
  },
  outOfStockText: {
    color: '#B22222',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  sectionBodyText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  brandText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 16,
  },
  brandNameText: {
    fontWeight: '700',
  },
  categoryText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 24,
  },
  addToCartButton: {
    backgroundColor: '#5E3EBD',
    borderRadius: 6,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    color: '#B22222',
  },
});
