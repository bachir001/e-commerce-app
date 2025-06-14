import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { debounce } from "lodash";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, X, Star, ChevronRight } from "lucide-react-native";
import PopularSearches from "@/components/search/PopularSearches";
import { Product } from "@/types/globalTypes";
import useGetSearchResults from "@/hooks/search/useGetSearchResults";

const startTime = performance.now();

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // const inputRef = useRef<TextInput>(null);
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  const {
    data: results,
    isLoading: loading,
    isError: resultsError,
    refetch,
  } = useGetSearchResults(query);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        if (q.trim().length < 3) {
          return;
        }
        refetch();
      }, 500),
    [refetch]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const onChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  const onPressItem = useCallback((product: Product) => {
    router.push({
      pathname: "/(tabs)/home/ProductDetails",
      params: { productJSON: JSON.stringify(product) },
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <Pressable
        onPress={() => onPressItem(item)}
        className="py-4 px-4 border-b border-gray-100 active:bg-gray-50"
      >
        <View className="flex-row">
          <Image
            source={{ uri: item.image }}
            className="w-20 h-20 rounded-lg bg-gray-100 mr-4"
            resizeMode="cover"
            fadeDuration={0}
          />
          <View className="flex-1 justify-center">
            <ThemedText variant="semibold" className="text-gray-900 mb-1">
              {item.name}
            </ThemedText>
            {item.price > 0 && (
              <ThemedText className="text-base font-semibold text-[#5e3ebd]">
                ${item.price}
              </ThemedText>
            )}
          </View>
          <ChevronRight size={20} color="#9ca3af" className="self-center" />
        </View>
      </Pressable>
    ),
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ThemedView className="flex-1">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-1 rounded-full"
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-3 py-2 ml-3">
            <Search size={18} color="#9ca3af" />
            <TextInput
              // ref={inputRef}
              // autoFocus
              className="flex-1 text-base px-2 py-0"
              placeholder="Search products, brands..."
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={onChangeText}
            />
            {query && query.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="p-1">
                <X size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#5e3ebd" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <View className="pt-4">
                {/* {renderRecentSearches} */}
                <PopularSearches onPressRecentSearch={onChangeText} />
              </View>
            }
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const endTime = performance.now();
console.log(`Execution time SEARCH: ${endTime - startTime}ms`);
