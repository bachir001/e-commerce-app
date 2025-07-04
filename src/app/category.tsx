import axiosApi from "@/apis/axiosApi";
import InfiniteList from "@/components/common/InfiniteList";
import FiltersModal from "@/components/Modals/FiltersModal";
import createIdParams from "@/Services/parameterObjectCreator";
import createCategoryIdsParams from "@/Services/parameterObjectCreator";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

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

interface Params {
  sort: string;
  categories?: string | number;
  category_id?: number;
  brand_id?: string | number;
  color_id?: string | number;
  size_id?: string | number;
  attribute_type_id?: string | number;
}

export default function Category() {
  const insets = useSafeAreaInsets();
  const { slug, color, id, brand } = useLocalSearchParams();
  const [query, setQuery] = useState("");

  const [activeTab, setActiveTab] = useState<"sort" | "filters" | null>(null);
  const [selectedSortOption, setSelectedSortOption] = useState("default");

  const [loading, setLoading] = useState(false);

  //filters
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [attributes, setAttributes] = useState([]);

  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1);

  //selected Filters
  const [categoryIds, setCategoryIds] = useState<any[]>([]);
  const [brandIds, setBrandIds] = useState<any[]>([]);
  const [colorIds, setColorIds] = useState<any[]>([]);
  const [sizeIds, setSizeIds] = useState<any[]>([]);
  const [attributeIds, setAttributeIds] = useState<any[]>([]);

  const handleSortOptionPress = (paramValue: string) => {
    setSelectedSortOption(paramValue);
    setActiveTab(null);
  };

  const paramsProp = useMemo(() => {
    const categoryIdParams = createIdParams(categoryIds, "categories");
    const brandIdParams = createIdParams(brandIds, "brand_id");
    const colorIdParams = createIdParams(colorIds, "color_id");
    const sizeIdParams = createIdParams(sizeIds, "size_id");
    const attributeIdParams = createIdParams(attributeIds, "attribute_type_id");

    const params: Params = {
      sort: selectedSortOption ? selectedSortOption : "default",
    };

    if (categoryIdParams?.categories) {
      params.categories = categoryIdParams.categories;
    }

    if (categoryIdParams?.id) {
      params.category_id = categoryIdParams.id;
    }

    if (brandIdParams?.brand_id) {
      params.brand_id = brandIdParams.brand_id ? brandIdParams.brand_id : 0;
    }

    if (colorIdParams?.color_id) {
      params.color_id = colorIdParams.color_id ? colorIdParams.color_id : 0;
    }

    if (sizeIdParams?.size_id) {
      params.size_id = sizeIdParams.size_id ? sizeIdParams.size_id : 0;
    }

    if (attributeIdParams?.attribute_type_id) {
      params.attribute_type_id = attributeIdParams.attribute_type_id
        ? attributeIdParams.attribute_type_id
        : 0;
    }

    return params;
  }, [
    selectedSortOption,
    categoryIds,
    brandIds,
    colorIds,
    sizeIds,
    attributeIds,
  ]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        const response = await axiosApi.get(
          `/filters?model_id=${Number(id)}&model_type=${
            brand ? "brand" : "category"
          }`
        );

        if (response.status === 200) {
          if (response.data.data.categories) {
            setCategories(response.data.data.categories);
          }

          if (response.data.data.prices) {
            setMinValue(response.data.data.prices.min);
            setMaxValue(response.data.data.prices.max);
          }

          if (response.data.data.brands) {
            setBrands(response.data.data.brands);
          }

          if (response.data.data.colors) {
            setColors(response.data.data.colors);
          }

          if (response.data.data.sizes) {
            setSizes(response.data.data.sizes);
          }

          if (response.data.data.attributes) {
            setAttributes(response.data.data.attributes);
          }
        }
      } catch (err) {
        Toast.show({
          topOffset: 60,
          position: "top",
          autoHide: true,
          visibilityTime: 1000,
          type: "error",
          text1: "Failed to fetch Filters",
          text2:
            err && typeof err === "object" && "message" in err
              ? String((err as any).message)
              : "An unknown error occurred",
        });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [id, brand]);

  useEffect(() => {
    setActiveTab(null);
  }, [categoryIds, brandIds, colorIds, sizeIds, attributeIds]);

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View
        className="bg-white pb-4 shadow-sm"
        style={{
          paddingTop: Platform.OS === "android" ? 8 : 0,
        }}
      >
        <View
          className="flex-row items-center bg-gray-100 rounded-lg mx-4 mt-2 px-3 py-2 border border-gray-200"
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
          {query.length > 0 ? (
            <TouchableOpacity
              onPress={() => setQuery("")}
              className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center ml-1"
              activeOpacity={0.7}
            >
              <FontAwesome5 name="times" size={10} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="flex-row justify-between items-center mx-4 mt-4">
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
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <FontAwesome5 name="filter" size={14} color="white" />
                  <Text className="text-white font-bold text-sm ml-2">
                    Filters
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View className="h-px bg-gray-200 mt-4 mx-4" />
      </View>

      {activeTab === "sort" ? (
        <View
          className="bg-white rounded-b-lg shadow-lg mx-4"
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
      ) : null}

      <InfiniteList
        slug={Array.isArray(slug) ? slug[0] : slug ?? ""}
        color={Array.isArray(color) ? color[0] : color ?? ""}
        paramsProp={paramsProp}
        setActiveTab={(tab: string) =>
          setActiveTab(tab as "sort" | "filters" | null)
        }
        isBrand={
          brand !== undefined && brand !== null && typeof brand === "string"
        }
      />

      <FiltersModal
        isVisible={activeTab === "filters" && !loading}
        onClose={() => {
          setActiveTab(null);
        }}
        categories={categories}
        setCategoryIds={setCategoryIds}
        minVal={minValue}
        maxVal={maxValue}
        brands={brands}
        setBrandIds={setBrandIds}
        colors={colors}
        setColorIds={setColorIds}
        sizes={sizes}
        setSizeIds={setSizeIds}
        attributes={attributes}
        setAttributeIds={setAttributeIds}
      />
    </View>
  );
}
