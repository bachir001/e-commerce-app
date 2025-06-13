import { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  Pressable,
  Image,
  type ListRenderItemInfo,
  TouchableOpacity,
} from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { debounce } from "lodash";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  X,
  Star,
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";
import { Product } from "@/types/globalTypes";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "summer dress",
    "men's shoes",
    "wireless headphones",
  ]);
  const inputRef = useRef<TextInput>(null);
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  // Popular search terms
  const popularSearches = useMemo(
    () => [
      "New arrivals",
      "Summer collection",
      "Sale items",
      "Accessories",
      "Dresses",
    ],
    []
  );

  // Memoize debounced search
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

          // Add to recent searches
          if (!recentSearches.includes(q.trim())) {
            setRecentSearches((prev) => [q.trim(), ...prev.slice(0, 4)]);
          }
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 500),
    [recentSearches]
  );

  // Stable handler for text changes
  const onChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  // Clear search input
  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }, []);

  // Stable navigation handler
  const onPressItem = useCallback(
    (product: Product) => {
      router.push({
        pathname: "/(tabs)/home/ProductDetails",
        params: { productJSON: JSON.stringify(product) },
      });
    },
    [router]
  );

  // Handle recent search press
  const onPressRecentSearch = useCallback(
    (term: string) => {
      setQuery(term);
      debouncedSearch(term);
    },
    [debouncedSearch]
  );

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  // Memoized renderItem
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Product>) => (
      <Pressable
        onPress={() => onPressItem(item)}
        className="py-4 px-4 border-b border-gray-100 active:bg-gray-50"
        accessibilityRole="button"
        accessibilityLabel={`Go to ${item}`}
      >
        <View className="flex-row">
          <Image
            source={{ uri: item.image }}
            className="w-20 h-20 rounded-lg bg-gray-100 mr-4"
          />
          <View className="flex-1 justify-center">
            <ThemedText
              variant="semibold"
              className="text-gray-900 mb-1"
              numberOfLines={1}
            >
              {item.name}
            </ThemedText>
            {/* Rating */}
            {item.rating && (
              <View className="flex-row items-center mb-1.5">
                <Star size={14} color="#FFB800" fill="#FFB800" />
                <ThemedText className="text-xs text-gray-600 ml-1">
                  {item.rating.toFixed(1)}
                </ThemedText>
              </View>
            )}

            {item.price > 0 && !isNaN(item.price) && (
              <ThemedText className="text-base font-semibold text-[#5e3ebd]">
                ${item.price.toFixed(2)}
              </ThemedText>
            )}
          </View>
          <ChevronRight size={20} color="#9ca3af" className="self-center" />
        </View>
      </Pressable>
    ),
    [onPressItem]
  );

  // Render recent searches
  const renderRecentSearches = useMemo(() => {
    if (recentSearches.length === 0) return null;

    return (
      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-3">
          <ThemedText variant="semibold" className="text-gray-800">
            Recent Searches
          </ThemedText>
          <TouchableOpacity onPress={clearRecentSearches}>
            <ThemedText className="text-sm text-[#5e3ebd]">
              Clear all
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap">
          {recentSearches.map((term, index) => (
            <TouchableOpacity
              key={`recent-${index}`}
              onPress={() => onPressRecentSearch(term)}
              className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2"
            >
              <ThemedText className="text-sm text-gray-800">{term}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [recentSearches, clearRecentSearches, onPressRecentSearch]);

  // Render popular searches
  const renderPopularSearches = useMemo(() => {
    return (
      <View className="px-4 mb-6">
        <View className="flex-row items-center mb-3">
          <TrendingUp size={16} color="#5e3ebd" />
          <ThemedText variant="semibold" className="text-gray-800 ml-1.5">
            Popular Searches
          </ThemedText>
        </View>

        <View className="flex-row flex-wrap">
          {popularSearches.map((term, index) => (
            <TouchableOpacity
              key={`popular-${index}`}
              onPress={() => onPressRecentSearch(term)}
              className="bg-[#5e3ebd10] border border-[#5e3ebd20] rounded-full px-3 py-1.5 mr-2 mb-2"
            >
              <ThemedText className="text-sm text-[#5e3ebd]">{term}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [popularSearches, onPressRecentSearch]);

  // Empty component
  const emptyComponent = useMemo(() => {
    if (query && query.length >= 3) {
      return (
        <View className="items-center justify-center py-12">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Search size={24} color="#9ca3af" />
          </View>
          <ThemedText className="text-gray-500 text-center mb-1">
            No results found
          </ThemedText>
          <ThemedText className="text-gray-400 text-sm text-center">
            Try a different search term
          </ThemedText>
        </View>
      );
    }

    return (
      <View className="pt-4">
        {renderRecentSearches}
        {renderPopularSearches}
      </View>
    );
  }, [query, renderRecentSearches, renderPopularSearches]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1 rounded-full"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-3 py-2 ml-3">
            <Search size={18} color="#9ca3af" />
            <TextInput
              ref={inputRef}
              autoFocus
              className="flex-1 text-base px-2 py-0"
              placeholder="Search products, brands..."
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={onChangeText}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="p-1">
                <X size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#5e3ebd" />
            <ThemedText className="text-gray-500 mt-3">Searching...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={emptyComponent}
            contentContainerStyle={{ flexGrow: 1 }}
            initialNumToRender={10}
            windowSize={5}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
