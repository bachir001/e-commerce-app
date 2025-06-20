import InfiniteList from "@/components/common/InfiniteList";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const sortOptions = [
  { id: "default", label: "Default", icon: "list", paramValue: "default" },
  {
    id: "price-low",
    label: "Price: Low to High",
    icon: "sort-amount-up",
    paramValue: "price_low_high",
  },
  {
    id: "price-high",
    label: "Price: High to Low",
    icon: "sort-amount-down",
    paramValue: "price_high_low",
  },
  { id: "rating", label: "Highest Rating", icon: "star", paramValue: "rating" },
  { id: "newest", label: "Newest First", icon: "clock", paramValue: "newest" },
];

export default function Category() {
  const { slug, color } = useLocalSearchParams();
  const [query, setQuery] = useState("");

  const [activeTab, setActiveTab] = useState<"sort" | "filters" | null>(null);
  const [selectedSortOption, setSelectedSortOption] = useState("default");

  const handleSortOptionPress = (paramValue: string) => {
    setSelectedSortOption(paramValue);
    setActiveTab(null);
  };

  const paramsProp = useMemo(() => {
    const params = {
      sort: selectedSortOption,
    };

    return params;
  }, [selectedSortOption]);

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      style={{
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <View className="bg-white pb-4 shadow-sm ">
        <View
          className="flex-row items-center bg-gray-100 rounded-lg mx-4 mt-4 px-3 py-2 border border-gray-200"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-2">
            <FontAwesome5 name="search" size={14} color="#6B7280" />
          </View>
          <TextInput
            className="flex-1 text-gray-800 text-sm font-medium"
            placeholder="Search in this category..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            selectTextOnFocus={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center ml-1"
              activeOpacity={0.7}
            >
              <FontAwesome5 name="times" size={10} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row justify-between items-center mx-4 mt-4 ">
          <TouchableOpacity
            className={`flex-1 mr-2 rounded-lg ${
              activeTab === "sort" ? "bg-indigo-700" : "bg-indigo-600"
            }`}
            activeOpacity={0.8}
            style={{
              shadowColor: "#5E3EBD",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => {
              setActiveTab((prev) => (prev === "sort" ? null : "sort"));
            }}
          >
            <View className="flex-row items-center justify-center py-3 px-4">
              <FontAwesome5 name="sort-amount-down" size={14} color="white" />
              <Text className="text-white font-bold text-sm ml-2">
                Sort: {selectedSortOption}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 ml-2 rounded-lg ${
              activeTab === "filters" ? "bg-yellow-600" : "bg-yellow-500"
            }`}
            activeOpacity={0.8}
            style={{
              shadowColor: "#F9B615",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => {
              setActiveTab((prev) => (prev === "filters" ? null : "filters"));
            }}
          >
            <View className="flex-row items-center justify-center py-3 px-4">
              <FontAwesome5 name="filter" size={14} color="white" />
              <Text className="text-white font-bold text-sm ml-2">Filters</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="h-px bg-gray-200 mt-4 mx-4" />
      </View>

      {activeTab === "sort" && (
        <View
          className=" bg-white rounded-b-lg shadow-lg mx-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSortOptionPress(option.paramValue)}
              className={`flex-row items-center py-3 px-6 ${
                selectedSortOption === option.id ? "bg-gray-100" : ""
              }`}
            >
              <FontAwesome5
                name={option.icon as any}
                size={16}
                color={selectedSortOption === option.id ? "#5E3EBD" : "#6B7280"}
                style={{ marginRight: 12 }}
              />
              <Text
                className={`text-base ${
                  selectedSortOption === option.id
                    ? "font-semibold text-[#5E3EBD]"
                    : "text-gray-800"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <InfiniteList
        slug={Array.isArray(slug) ? slug[0] : slug ?? ""}
        color={Array.isArray(color) ? color[0] : color ?? ""}
        paramsProp={paramsProp}
      />
    </SafeAreaView>
  );
}
