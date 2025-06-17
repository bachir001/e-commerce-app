// src/app/(tabs)/categories/[slug]/[catProds].tsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  ListRenderItemInfo,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import axios from "axios";
import ProductCard, { ProductCardProps } from "@/components/common/ProductCard";
import { ThemedView } from "@/components/common/ThemedView";
import { IconSymbol } from "@/components/common/IconSymbol";
import { ThemedText } from "@/components/common/ThemedText";
import FilterModal from "@/components/FilterModal";
import SortModal from "@/components/SortModal";
import type {
  AvailableFilters,
  SelectedFilters,
  PriceBounds,
} from "@/types/types";
import DotsLoader from "@/components/common/AnimatedLayout";

interface ApiProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  slug: string;
  special_price: number | null;
}

interface ProductResponse {
  status: boolean;
  data: {
    relatedProducts: {
      results: ApiProduct[];
      total_pages: number;
    };
  };
}

export default function CategoryProductsScreen() {
  const { slug, name, model_id } = useLocalSearchParams<{
    slug: string;
    name?: string;
    model_id: string;
  }>();
  const latestFetchId = useRef(0);

  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    filters: {},
    bounds: undefined,
  });
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    selectedByKey: {},
    priceRange: [0, 0],
    sortOption: "default",
  });

  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);

  // Fetch filters with proper type narrowing
  const fetchFilters = useCallback(async () => {
    try {
      const res = await axios.get<{
        status: boolean;
        data: Record<string, unknown>;
      }>(
        `https://newapi.gocami.com/api/filters?model_type=category&model_id=${model_id}`
      );
      const data = res.data.data;
      const filters: Record<
        string,
        { id: number; name: string; code?: string }[]
      > = {};
      let bounds: PriceBounds | undefined;

      for (const [key, raw] of Object.entries(data)) {
        if (key === "categories") continue;

        // Price bounds
        if (
          typeof raw === "object" &&
          raw !== null &&
          "min" in raw &&
          "max" in raw &&
          typeof (raw as any).min === "number" &&
          typeof (raw as any).max === "number"
        ) {
          bounds = {
            priceMin: (raw as any).min,
            priceMax: (raw as any).max,
          };
          continue;
        }

        // Array of filter options
        if (Array.isArray(raw)) {
          const arr = raw as any[];
          if (
            arr.every(
              (v) => v && typeof v.id === "number" && typeof v.name === "string"
            )
          ) {
            filters[key] = arr.map((v) => ({
              id: v.id,
              name: v.name,
              ...(typeof v.code === "string" ? { code: v.code } : {}),
            }));
          }
        }
      }

      setAvailableFilters({ filters, bounds });
      setSelectedFilters({
        selectedByKey: Object.fromEntries(
          Object.keys(filters).map((k) => [k, []])
        ) as Record<string, number[]>,
        priceRange: bounds ? [bounds.priceMin, bounds.priceMax] : [0, 0],
        sortOption: "default",
      });
    } catch (e: any) {
      setError(e.message || "Error fetching filters");
    } finally {
      setFiltersLoaded(true);
    }
  }, [model_id]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // Fetch products when filtersLoaded, page, or selectedFilters change
  const fetchProducts = useCallback(
    async (pageNum: number) => {
      const fetchId = ++latestFetchId.current;
      pageNum === 1 ? setIsLoading(true) : setIsLoadingMore(true);

      const params: Record<string, any> = {
        page: pageNum,
        per_page: 20,
        min_price: selectedFilters.priceRange[0],
        max_price: selectedFilters.priceRange[1],
        sort: selectedFilters.sortOption,
        ...Object.fromEntries(
          Object.entries(selectedFilters.selectedByKey)
            .filter(([, ids]) => ids.length > 0)
            .map(([k, ids]) => [`${k.slice(0, -1)}_id`, ids.join(",")])
        ),
      };

      try {
        const res = await axios.get<ProductResponse>(
          `https://api-gocami-test.gocami.com/api/getCategoryData/${encodeURIComponent(
            slug
          )}/`,
          { params }
        );
        if (fetchId === latestFetchId.current && res.data.status) {
          const mapped = res.data.data.relatedProducts.results.map((item) => ({
            id: item.id,
            name: item.name,
            price:
              item.special_price !== null && item.special_price < item.price
                ? item.special_price
                : item.price,
            description: item.description.replace(/<[^>]+>/g, ""),
            image: item.image,
            slug: item.slug,
            onAddToCart: () => {}, // stable no-op
            isOnSale:
              item.special_price !== null && item.special_price < item.price,
          }));
          setProducts((prev) =>
            pageNum === 1 ? mapped : [...prev, ...mapped]
          );
          setTotalPages(res.data.data.relatedProducts.total_pages);
        }
      } catch (e: any) {
        setError(e.message || "Error fetching products");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [slug, selectedFilters]
  );

  useEffect(() => {
    if (filtersLoaded) {
      fetchProducts(page);
    }
  }, [filtersLoaded, fetchProducts, page, selectedFilters]);

  // Handlers
  const applyFilters = useCallback((newSel: Partial<SelectedFilters>) => {
    setSelectedFilters((sf) => ({ ...sf, ...newSel }));
    setPage(1);
    setProducts([]);
  }, []);
  const resetFilters = useCallback(() => {
    setSelectedFilters({
      selectedByKey: Object.fromEntries(
        Object.keys(availableFilters.filters).map((k) => [k, []])
      ) as Record<string, number[]>,
      priceRange: availableFilters.bounds
        ? [availableFilters.bounds.priceMin, availableFilters.bounds.priceMax]
        : [0, 0],
      sortOption: "default",
    });
    setPage(1);
    setProducts([]);
  }, [availableFilters]);
  const loadMore = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      setPage((p) => p + 1);
    }
  }, [isLoadingMore, page, totalPages]);

  // Renderers
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ProductCardProps>) => (
      <View style={styles.cardContainer}>
        <ProductCard {...item} />
      </View>
    ),
    []
  );
  const renderFooter = useCallback(
    () => (isLoadingMore ? <DotsLoader /> : null),
    [isLoadingMore]
  );
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_HEIGHT,
      offset: CARD_HEIGHT * index,
      index,
    }),
    []
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <DotsLoader size="large" />
      </ThemedView>
    );
  }
  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>
          {error.includes("results") ? "No products found." : error}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: name || "Category" }} />
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFilterVisible(true)}
          >
            <IconSymbol
              name="line.3.horizontal.decrease"
              size={20}
              color="grey"
            />
            <ThemedText style={styles.buttonText}>Filter</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setSortVisible(true)}
          >
            <IconSymbol name="arrow.up.arrow.down" size={20} color="grey" />
            <ThemedText style={styles.buttonText}>Sort</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.slug}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          initialNumToRender={10}
          windowSize={5}
          getItemLayout={getItemLayout}
        />

        <FilterModal
          visible={filterVisible}
          options={availableFilters}
          selected={selectedFilters}
          onApply={applyFilters}
          onReset={resetFilters}
          onClose={() => setFilterVisible(false)}
        />
        <SortModal
          visible={sortVisible}
          selectedOption={selectedFilters.sortOption}
          onSelect={(opt) => applyFilters({ sortOption: opt })}
          onClose={() => setSortVisible(false)}
        />
      </ThemedView>
    </>
  );
}

const CARD_HEIGHT = 320; // approximate card + margin height

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#DDD",
  },
  headerButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  buttonText: { marginLeft: 4, fontSize: 16 },
  listContent: { paddingBottom: 16 },
  columnWrapper: { justifyContent: "space-between" },
  cardContainer: { width: "48%", marginBottom: 16 },
  loadingFooter: { paddingVertical: 16 },
});
