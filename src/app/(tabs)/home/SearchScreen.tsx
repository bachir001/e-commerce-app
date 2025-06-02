// src/app/search/SearchScreen.tsx
import React, { useState, useCallback, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  Pressable,
  Image,
  ListRenderItemInfo,
} from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { debounce } from "lodash";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface SearchResult {
  id: number;
  name: string;
  image: string;
  price: number;
  slug: string;
  type?: "product" | "category" | "brand" | "seller";
  count?: number;
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  // 1. Memoize debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        if (q.trim().length < 3) {
          setResults([]);
          return;
        }
        setLoading(true);
        try {
          const res = await fetch(
            `https://api-gocami-test.gocami.com/api/search?q=${encodeURIComponent(
              q.trim()
            )}`
          );
          if (!res.ok) throw new Error();
          const data = await res.json();
          setResults(data.data?.results ?? []);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 500),
    []
  );

  // 2. Stable handler for text changes
  const onChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  // 3. Stable navigation handler
  const onPressItem = useCallback(
    (slug: string) => {
      router.push({
        pathname: "/(tabs)/home/ProductDetails",
        params: { productName: slug },
      });
    },
    [router]
  );

  // 4. Memoized renderItem
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SearchResult>) => (
      <Pressable
        onPress={() => onPressItem(item.slug)}
        style={({ pressed }) => [styles.resultItem, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Go to ${item.name}`}
      >
        <View style={styles.resultContent}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.textContainer}>
            <ThemedText style={styles.name}>{item.name}</ThemedText>
            {item.type && (
              <View style={styles.typeRow}>
                <ThemedText style={styles.type}>{item.type}</ThemedText>
                {item.count != null && (
                  <View style={styles.badge}>
                    <ThemedText style={styles.count}>{item.count}</ThemedText>
                  </View>
                )}
              </View>
            )}
            {item.price > 0 && !isNaN(item.price) && (
              <ThemedText style={styles.price}>
                ${item.price.toFixed(2)}
              </ThemedText>
            )}
          </View>
        </View>
      </Pressable>
    ),
    [onPressItem]
  );

  // 5. Memoize empty component
  const emptyComponent = useMemo(
    () => (
      <ThemedText style={styles.emptyText}>
        {query ? "No results found" : "Start typing to search"}
      </ThemedText>
    ),
    [query]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.tint + "20" },
            ]}
          >
            <TextInput
              autoFocus
              style={styles.input}
              placeholder="Search..."
              placeholderTextColor={colors.text + "80"}
              value={query}
              onChangeText={onChangeText}
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={emptyComponent}
            contentContainerStyle={styles.list}
            initialNumToRender={10}
            windowSize={5}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingTop: 2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginLeft: 12,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  loader: { marginTop: 20 },
  list: { paddingBottom: 20 },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  pressed: { opacity: 0.6 },
  resultContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: "500", marginBottom: 4, color: "#333" },
  typeRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  type: { fontSize: 14, color: "#666" },
  badge: {
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  count: { fontSize: 12, color: "#333" },
  price: { fontSize: 16, fontWeight: "600", color: "#7b23cd" },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.5,
    color: "#666",
  },
});
