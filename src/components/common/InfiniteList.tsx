import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Dimensions,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/globalTypes";
import axios from "axios";
import DotsLoader from "./AnimatedLayout";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;
const ITEM_HEIGHT = 340;
const ITEM_MARGIN = 16;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: ITEM_MARGIN,
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  endMessage: {
    padding: 16,
    backgroundColor: "#10B981",
    borderRadius: 16,
    alignItems: "center",
  },
  endMessageText: {
    color: "white",
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

const InfiniteList = ({
  slug,
  color,
  paramsProp,
}: {
  slug: string;
  color: string;
  paramsProp?: any;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestFetchId = useRef(0);
  const isMountedRef = useRef(true);

  const fetchProducts = useCallback(async () => {
    const fetchId = ++latestFetchId.current;

    // Show loading state for initial page load
    if (page === 1) {
      setIsLoading(true);
    } else if (page > 1) {
      setIsLoadingMore(true);
    }

    try {
      const response = await axios.get(
        `https://api-gocami-test.gocami.com/api/getCategoryData/${encodeURIComponent(
          slug
        )}/`,
        {
          params: {
            page,
            per_page: 20,
            ...(paramsProp || {}),
          },
        }
      );

      if (!isMountedRef.current || fetchId !== latestFetchId.current) return;

      if (response.data.status) {
        const newProducts = response.data.data.relatedProducts.results;
        if (page === 1) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }
        setTotalPages(response.data.data.relatedProducts.total_pages);
      }
    } catch (e: any) {
      if (isMountedRef.current && fetchId === latestFetchId.current) {
        setError(e.message || "Error fetching products");
      }
    } finally {
      if (isMountedRef.current && fetchId === latestFetchId.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [slug, page, paramsProp]);

  useEffect(() => {
    isMountedRef.current = true;

    // Reset state for new fetch
    setPage(1);
    setProducts([]);
    setTotalPages(1);
    setError(null);

    return () => {
      isMountedRef.current = false;
    };
  }, [slug, paramsProp]);

  useEffect(() => {
    if (isMountedRef.current) {
      fetchProducts();
    }
  }, [page]);

  // Trigger fetch when params change and page is 1
  useEffect(() => {
    if (isMountedRef.current && page === 1 && products.length === 0) {
      fetchProducts();
    }
  }, [paramsProp, products.length]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, isLoadingMore, page, totalPages]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={{ width: ITEM_WIDTH, marginBottom: ITEM_MARGIN }}>
        <ProductCard
          product={item}
          variant="grid"
          innerColor={color}
          simplified
        />
      </View>
    ),
    [color]
  );

  const keyExtractor = useCallback(
    (item: Product) => `${item.id}-${item.slug}`,
    []
  );

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="large" color={color} />
        </View>
      );
    }

    if (!isLoading && page >= totalPages && products.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text
            style={[
              {
                color: "#5e3ebd",
                textAlign: "center",
                paddingVertical: 20,
                fontSize: 16,
                fontWeight: "600",
              },
            ]}
          >
            You're all caught up!
          </Text>
        </View>
      );
    }

    return null;
  }, [isLoadingMore, isLoading, page, totalPages, products.length, color]);

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.footerContainer}>
        <DotsLoader color={color} />
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.contentContainer}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
    />
  );
};

export default InfiniteList;
