import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import useGetCategoriesData from "@/hooks/categories/useGetCategoriesData";
import CategoryItem from "@/components/categories/CategoryItem";
import DotsLoader from "@/components/common/AnimatedLayout";

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  main_image: string;
  category_cover_image: string;
  description: string | null;
  mega_primary?: boolean | null;
  level?: string | null;
}

export interface MainCategory extends Category {
  subcategories?: SubCategory[];
}

export interface SubCategory extends Category {
  children: Category[];
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const EmptyComponent = React.memo(() => (
  <View className="items-center py-12">
    <FontAwesome5 name="search" size={48} color="#D1D5DB" />
    <Text className="text-gray-500 text-lg font-medium mt-4">
      No categories found
    </Text>
    <Text className="text-gray-400 text-sm">Try a different search term</Text>
  </View>
));

const LoadingComponent = React.memo(() => (
  <SafeAreaView className="flex-1 bg-white justify-center items-center">
    <DotsLoader size="large" />
  </SafeAreaView>
));

export default function CategoriesScreen() {
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetCategoriesData();

  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredCategories = useMemo(() => {
    if (!categories || !debouncedSearchQuery.trim()) return categories;

    const query = debouncedSearchQuery.toLowerCase().trim();
    return categories.filter((category: Category) =>
      category.name.toLowerCase().includes(query)
    );
  }, [categories, debouncedSearchQuery]);

  const renderItem = useCallback(
    ({ item }: { item: MainCategory }) => (
      <CategoryItem item={item} color="#5e3ebd" />
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: MainCategory) => item.id.toString(),
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  if (isCategoriesLoading) {
    return <LoadingComponent />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 mb-2">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900">Categories</Text>
            <Text className="text-gray-500 text-base mt-1">
              Discover what you're looking for
            </Text>
          </View>
          <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center">
            <FontAwesome5 name="th-large" size={20} color="#5e3ebd" />
          </View>
        </View>

        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 mb-4">
          <FontAwesome5 name="search" size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-700"
            placeholder="Search categories..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            selectTextOnFocus={false}
          />
          {searchQuery && searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <FontAwesome5 name="times" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {filteredCategories && filteredCategories.length > 0 && (
          <View className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-3 shadow-sm">
                <FontAwesome5 name="layer-group" size={16} color="#5e3ebd" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base">
                  {filteredCategories.length} Categories
                </Text>
                <Text className="text-gray-600 text-sm">
                  {searchQuery
                    ? `Found for "${searchQuery}"`
                    : "Ready to explore"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={3}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        columnWrapperStyle={{
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={9}
        windowSize={5}
        removeClippedSubviews={true}
        legacyImplementation={false}
        disableVirtualization={false}
        updateCellsBatchingPeriod={50}
        keyboardShouldPersistTaps="handled"
        decelerationRate="fast"
      />
    </SafeAreaView>
  );
}
