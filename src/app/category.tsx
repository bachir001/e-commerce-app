import axiosApi from "@/apis/axiosApi";
import SortOptions from "@/components/categories/SortOptions";
import InfiniteList from "@/components/common/InfiniteList";
import FiltersModal from "@/components/Modals/FiltersModal";
import type {
  AttributesFilter,
  BrandFilter,
  CategoryFilter,
  ColorFilter,
  DiscountFilter,
  PriceFilter,
  SizeFilter,
} from "@/types/filters";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Modal from "react-native-modal";

export default function Category() {
  const { slug, id, color } = useLocalSearchParams();
  const [query, setQuery] = useState("");

  const [activeTab, setActiveTab] = useState<"sort" | "filters" | null>(null);
  const [selectedSortOption, setSelectedSortOption] = useState("default");

  const [loading, setLoading] = useState(false);

  const [brands, setBrands] = useState<BrandFilter[]>([
    { id: 1, name: "Apple", total: 45 },
    { id: 2, name: "Samsung", total: 32 },
    { id: 3, name: "Nike", total: 28 },
  ]);
  const [categories, setCategories] = useState<CategoryFilter[]>([
    {
      id: 1,
      name: "Electronics",
      total: 120,
      subcategories: [
        { id: 11, name: "Phones", total: 45, children: [] },
        { id: 12, name: "Laptops", total: 30, children: [] },
      ],
    },
  ]);
  const [prices, setPrices] = useState<PriceFilter>({ min: "", max: "" });
  const [discounts, setDiscounts] = useState<DiscountFilter>({
    min: "",
    max: "",
  });

  const [colors, setColors] = useState<ColorFilter[]>([
    { id: 1, name: "Red", code: "#FF0000" },
    { id: 2, name: "Blue", code: "#0000FF" },
    { id: 3, name: "Green", code: "#00FF00" },
  ]);
  const [sizes, setSizes] = useState<SizeFilter[]>([
    { id: 1, name: "Small", code: "S" },
    { id: 2, name: "Medium", code: "M" },
    { id: 3, name: "Large", code: "L" },
  ]);
  const [attributes, setAttributes] = useState<AttributesFilter[]>([
    {
      id: 1,
      name: "Material",
      options: [
        { id: 1, name: "Cotton", code: "cotton" },
        { id: 2, name: "Polyester", code: "polyester" },
      ],
    },
  ]);
  const [availableRatings] = useState<number[]>([5, 4, 3, 2, 1]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  const [isVisible, setIsVisible] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [key: number]: number[];
  }>({});

  const handleSortOptionPress = (paramValue: string) => {
    setSelectedSortOption(paramValue);
    setActiveTab(null);
  };

  const handleApplyFilters = () => {
    console.log("Applying Filters:", {
      prices,
      discounts,
      selectedRatings,
      selectedBrands,
      selectedCategories,
      selectedColors,
      selectedSizes,
      selectedAttributes,
    });
    setIsVisible(false);
  };

  const handleClearAllFilters = () => {
    setPrices({ min: "", max: "" });
    setDiscounts({ min: "", max: "" });
    setSelectedRatings([]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedAttributes({});
    console.log("All filters cleared.");
  };

  const paramsProp = useMemo(() => {
    const params: { [key: string]: any } = {
      sort: selectedSortOption,
    };

    if (prices.min) params.price_min = prices.min;
    if (prices.max) params.price_max = prices.max;
    if (discounts.min) params.discount_min = discounts.min;
    if (discounts.max) params.discount_max = discounts.max;
    if (selectedRatings.length > 0) params.ratings = selectedRatings.join(",");
    if (selectedBrands.length > 0) params.brands = selectedBrands.join(",");
    if (selectedCategories.length > 0)
      params.categories = selectedCategories.join(",");
    if (selectedColors.length > 0) params.colors = selectedColors.join(",");
    if (selectedSizes.length > 0) params.sizes = selectedSizes.join(",");

    const attributeParams = Object.entries(selectedAttributes)
      .map(([attrId, optionIds]) =>
        optionIds.length > 0 ? `attr_${attrId}=${optionIds.join(",")}` : ""
      )
      .filter(Boolean)
      .join("&");

    if (attributeParams) {
      params.attributes = attributeParams;
    }

    return params;
  }, [
    selectedSortOption,
    prices,
    discounts,
    selectedRatings,
    selectedBrands,
    selectedCategories,
    selectedColors,
    selectedSizes,
    selectedAttributes,
  ]);

  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      try {
        const response = await axiosApi.get(
          `filters?model_id=${Number(id)}&model_type=category`
        );

        console.log(response);

        if (response.status === 200) {
          setBrands(response.data.data.brands);
          setCategories(response.data.data.categories);
          setPrices(response.data.data.prices);
          setDiscounts(response.data.data.discounts);
          setColors(response.data.data.colors);
          setSizes(response.data.data.sizes);
          setAttributes(response.data.data.attributes);
          // setRatings(response.data.data.ratings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

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
              setIsVisible(true);
            }}
          >
            {!loading ? (
              <View className="flex-row items-center justify-center py-3 px-4">
                <FontAwesome5 name="filter" size={14} color="white" />
                <Text className="text-white font-bold text-sm ml-2">
                  Filters
                </Text>
              </View>
            ) : (
              <ActivityIndicator color="white" size="small" />
            )}
          </TouchableOpacity>
        </View>

        <View className="h-px bg-gray-200 mt-4 mx-4" />
      </View>

      {activeTab === "sort" && (
        <SortOptions
          handleSortOptionPress={handleSortOptionPress}
          selectedSortOption={selectedSortOption}
        />
      )}

      <InfiniteList
        slug={Array.isArray(slug) ? slug[0] : slug ?? ""}
        color={Array.isArray(color) ? color[0] : color ?? ""}
        paramsProp={paramsProp}
      />

      <FiltersModal
        isVisible={isVisible && !loading}
        setIsVisible={setIsVisible}
        prices={prices}
        setPrices={setPrices}
        discounts={discounts}
        setDiscounts={setDiscounts}
        ratings={availableRatings}
        selectedRatings={selectedRatings}
        setSelectedRatings={setSelectedRatings}
        brands={brands}
        selectedBrands={selectedBrands}
        setSelectedBrands={setSelectedBrands}
        categories={categories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        colors={colors}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        sizes={sizes}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes} // <--- Add this line!
        attributes={attributes}
        selectedAttributes={selectedAttributes}
        setSelectedAttributes={setSelectedAttributes}
        onApplyFilters={handleApplyFilters}
        onClearAll={handleClearAllFilters}
      />
    </SafeAreaView>
  );
}
