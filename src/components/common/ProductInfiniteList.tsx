import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Dimensions,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import ProductCard from "./product/ProductCard";
import type { Product } from "@/types/globalTypes";
import DotsLoader from "./AnimatedLayout";
import EmptyState from "./EmptyList";
import ErrorState from "./ErrorState";
import axiosApi from "@/apis/axiosApi";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;
const ITEM_MARGIN = 16;

interface HomeInfiniteListProps {
  slug: string;
  color: string;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const HomeInfiniteList = ({
  slug,
  color,
  onEndReached,
  onRefresh,
  refreshing = false,
}: HomeInfiniteListProps) => {
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

    if (refreshing) {
    } else if (page === 1) {
      setIsLoading(true);
      setIsLoadingMore(false);
    } else {
      setIsLoadingMore(true);
      setIsLoading(false);
    }
    setError(null);

    const params = {
      page,
      per_page: 20,
    };

    try {
      const response = await axiosApi.get(
        `/getCategoryData/${encodeURIComponent(slug)}/`,
        {
          params: params,
        }
      );

      if (!isMountedRef.current || fetchId !== latestFetchId.current) return;

      if (response.data.status) {
        const newProducts = response.data.data.relatedProducts?.results || [];
        const newTotalPages =
          response.data.data.relatedProducts?.total_pages || 1;

        if (page === 1) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }
        setTotalPages(newTotalPages);
      } else {
        setError(response.data.message || "Failed to load products.");
        setProducts([]);
        setTotalPages(1);
      }
    } catch (e) {
      if (isMountedRef.current && fetchId === latestFetchId.current) {
        setError((e as Error).message || "An unexpected error occurred.");
        setProducts([]);
        setTotalPages(1);
      }
    } finally {
      if (isMountedRef.current && fetchId === latestFetchId.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [slug, page, refreshing]);

  useEffect(() => {
    isMountedRef.current = true;
    setPage(1);
    setProducts([]);
    setTotalPages(1);
    setError(null);
    latestFetchId.current = 0;
    fetchProducts();
    return () => {
      isMountedRef.current = false;
    };
  }, [slug]);

  useEffect(() => {
    if (page > 1) {
      fetchProducts();
    }
  }, [page, fetchProducts]);

  useEffect(() => {
    if (refreshing) {
      setPage(1);
      setProducts([]);
      setError(null);
      latestFetchId.current = 0;
      fetchProducts();
    }
  }, [refreshing, fetchProducts]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && !refreshing && page < totalPages) {
      setPage((prev) => prev + 1);
    } else if (page >= totalPages && onEndReached) {
      onEndReached();
    }
  }, [isLoading, isLoadingMore, refreshing, page, totalPages, onEndReached]);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      setPage(1);
      setProducts([]);
      setError(null);
      latestFetchId.current = 0;
      fetchProducts();
    }
  }, [onRefresh, fetchProducts]);

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

  const keyExtractor = useCallback((item: Product) => item.id.toString(), []);

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View className="py-5 items-center">
          <ActivityIndicator size="large" color={color} />
        </View>
      );
    }

    if (!isLoading && products.length > 0 && page >= totalPages) {
      return (
        <View className="py-5 items-center">
          <Text className="text-[#5e3ebd] text-center py-5 text-base font-semibold">
            You're all caught up!
          </Text>
        </View>
      );
    }

    return null;
  }, [isLoadingMore, isLoading, page, totalPages, products.length, color]);

  if (error) {
    return <ErrorState onRetry={handleRefresh} subtitle={error} />;
  }

  if (isLoading && products.length === 0 && !refreshing) {
    return (
      <View className="py-5 items-center">
        <DotsLoader color={color} />
      </View>
    );
  }

  // if (!isLoading && !refreshing && products.length === 0) {
  //   return <EmptyState />;
  // }

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: "space-between",
        marginBottom: ITEM_MARGIN,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
      }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={3}
      removeClippedSubviews={false}
      scrollEnabled={false}
      nestedScrollEnabled={false}
    />
  );
};

export default HomeInfiniteList;
