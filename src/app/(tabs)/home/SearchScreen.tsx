import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
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
import { ArrowLeft, Search, X, ChevronRight } from "lucide-react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import PopularSearches from "@/components/search/PopularSearches";
import RecentSearches from "@/components/search/RecentSearches";
import type { Product } from "@/types/globalTypes";
import useGetSearchResults from "@/hooks/search/useGetSearchResults";
import * as SecureStore from "expo-secure-store";
import DotsLoader from "@/components/common/AnimatedLayout";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
        refetch().then(async () => {
          if (!recentSearches.includes(q.trim())) {
            const updatedRecentSearches = [
              q.trim(),
              ...recentSearches.slice(0, 4),
            ];
            setRecentSearches(updatedRecentSearches);
            await SecureStore.setItemAsync(
              "recentSearches",
              JSON.stringify(updatedRecentSearches)
            );
          }
        });
      }, 500),
    [refetch, recentSearches]
  );

  useEffect(() => {
    const getRecentSearches = async () => {
      try {                                                  
        const stored = await SecureStore.getItemAsync("recentSearches");
        if (stored) {
          const parsed = JSON.parse(stored);
          setRecentSearches(parsed);
        }
      } catch (error) {
        console.log("Error loading recent searches:", error);
      }
    };

    getRecentSearches();

    return () => {
      debouncedSearch.cancel();
    };
  }, []);

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

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await SecureStore.setItemAsync("recentSearches", JSON.stringify([]));
  }, []);

  const onPressItem = useCallback((product: Product) => {
    router.push({
      pathname: "/ProductDetails",
      params: { productJSON: JSON.stringify(product) },
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => {
      const hasSpecialPrice =
        item.special_price !== undefined && item.special_price !== null;
      const discount = item.special_price
        ? Math.round(((item.price - item.special_price) / item.price) * 100)
        : 0;

      return (
        <Pressable
          onPress={() => onPressItem(item)}
          className="py-4 px-4 border-b border-gray-100 active:bg-gray-50"
        >
          <View className="flex-row">
            <View className="relative">
              <Image
                source={{ uri: item.image }}
                className="w-20 h-20 rounded-lg bg-gray-100 mr-4"
                resizeMode="cover"
                fadeDuration={0}
              />

              {hasSpecialPrice && discount > 0 && (
                <View className="absolute -top-1 -left-1 bg-red-500 px-1.5 py-0.5 rounded">
                  <ThemedText className="text-white text-xs font-bold">
                    -{discount}%
                  </ThemedText>
                </View>
              )}
            </View>

            <View className="flex-1 justify-center">
              <ThemedText
                variant="semibold"
                className="text-gray-900 mb-1"
                numberOfLines={2}
              >
                {item.name}
              </ThemedText>

              {item.purchase_points && (
                <View className="flex-row items-center mb-1">
                  <FontAwesome5 name="diamond" size={12} color="#5e3ebd" />
                  <ThemedText className="text-xs font-semibold ml-1 text-[#5e3ebd]">
                    {item.purchase_points} points
                  </ThemedText>
                </View>
              )}

              <View className="flex-row items-center">
                {hasSpecialPrice ? (
                  <>
                    <ThemedText className="text-base font-bold text-red-500 mr-2">
                      ${item.special_price.toFixed(2)}
                    </ThemedText>
                    <ThemedText className="text-sm text-gray-400 line-through">
                      ${item.price.toFixed(2)}
                    </ThemedText>
                  </>
                ) : (
                  item.price > 0 && (
                    <ThemedText className="text-base font-semibold text-[#5e3ebd]">
                      ${item.price.toFixed(2)}
                    </ThemedText>
                  )
                )}
              </View>

              {item.rating && item.rating > 0 && (
                <View className="flex-row items-center mt-1">
                  <FontAwesome5 name="star" size={12} color="#FFD700" />
                  <ThemedText className="text-xs text-gray-600 ml-1">
                    {item.rating.toFixed(1)}
                  </ThemedText>
                </View>
              )}
            </View>

            <ChevronRight size={20} color="#9ca3af" className="self-center" />
          </View>
        </Pressable>
      );
    },
    [onPressItem]
  );

  const renderEmptyComponent = useCallback(() => {
    return (
      <View className="pt-4">
        <RecentSearches
          recentSearches={recentSearches}
          onPressRecentSearch={onChangeText}
          onClearAll={clearRecentSearches}
        />
        <PopularSearches onPressRecentSearch={onChangeText} />
      </View>
    );
  }, [recentSearches, onChangeText, clearRecentSearches]);

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
              autoFocus
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
            <DotsLoader size="large" color="#5e3ebd" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={renderEmptyComponent}
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
