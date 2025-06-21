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
  loadingFooter: {
    marginVertical: 20,
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

  const fetchProducts = useCallback(async () => {
    const fetchId = ++latestFetchId.current;
    page === 1 ? setIsLoading(true) : setIsLoadingMore(true);

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

      if (fetchId !== latestFetchId.current) return;

      if (response.data.status) {
        console.log(response.request);
        const newProducts = response.data.data.relatedProducts.results;
        setProducts((prev) =>
          page === 1 ? newProducts : [...prev, ...newProducts]
        );
        setTotalPages(response.data.data.relatedProducts.total_pages);
      }
    } catch (e: any) {
      setError(e.message || "Error fetching products");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [slug, page, paramsProp]);

  useEffect(() => {
    console.log(paramsProp);
    let ignore = false;

    if (!ignore) {
      fetchProducts();
    }

    return () => {
      ignore = true;
    };
  }, [fetchProducts, paramsProp]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [isLoadingMore, page, totalPages]);

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
              styles.endMessageText,
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

  if (isLoading) {
    return (
      <View style={styles.footerContainer}>
        <DotsLoader color={color} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.endMessage}>
          <Text style={styles.endMessageText}>Oops!</Text>
          <Text style={styles.endMessageText}>
            {error || "Something went wrong"}
          </Text>
        </View>
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
      // getItemLayout={getItemLayout}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
    />
  );
};

export default InfiniteList;
