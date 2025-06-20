import { FontAwesome5 } from "@expo/vector-icons";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";

export default function FiltersModal({
  isVisible,
  setIsVisible,
  prices,
  setPrices,
  discounts,
  setDiscounts,
  ratings,
  selectedRatings,
  setSelectedRatings,
  brands,
  selectedBrands,
  setSelectedBrands,
  categories,
  selectedCategories,
  setSelectedCategories,
  colors,
  selectedColors,
  setSelectedColors,
  sizes,
  selectedSizes,
  setSelectedSizes,
  attributes,
  selectedAttributes,
  setSelectedAttributes,
  onApplyFilters,
  onClearAll,
}) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => setIsVisible(false)}
      onSwipeComplete={() => setIsVisible(false)}
      swipeDirection={["down"]}
      style={{ justifyContent: "flex-end", margin: 0 }}
      backdropOpacity={0.6}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View className="bg-white rounded-t-3xl max-h-[85%]">
        <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />

        <View className="flex-row items-center justify-between px-6 pb-4 border-b border-gray-100">
          <Text className="text-xl font-bold text-gray-900">Filters</Text>
          <TouchableOpacity
            onPress={() => setIsVisible(false)}
            className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
          >
            <FontAwesome5 name="times" size={14} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {prices && (
            <View className="py-6 border-b border-gray-50">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Price Range
              </Text>
              <View className="flex-row space-x-3">
                <TouchableOpacity className="flex-1">
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Min Price
                  </Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <TextInput
                      className="text-gray-900 text-base"
                      placeholder="$0"
                      value={prices.min}
                      onChangeText={(text) =>
                        setPrices((prev) => ({ ...prev, min: text }))
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1">
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Max Price
                  </Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <TextInput
                      className="text-gray-900 text-base"
                      placeholder="$999"
                      value={prices.max}
                      onChangeText={(text) =>
                        setPrices((prev) => ({ ...prev, max: text }))
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {discounts && (
            <View className="py-6 border-b border-gray-50">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Discount Range
              </Text>
              <View className="flex-row space-x-3">
                <TouchableOpacity className="flex-1">
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Min Discount (%)
                  </Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <TextInput
                      className="text-gray-900 text-base"
                      placeholder="0"
                      value={discounts.min}
                      onChangeText={(text) =>
                        setDiscounts((prev) => ({ ...prev, min: text }))
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1">
                  <Text className="text-sm font-medium text-gray-600 mb-2">
                    Max Discount (%)
                  </Text>
                  <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <TextInput
                      className="text-gray-900 text-base"
                      placeholder="100"
                      value={discounts.max}
                      onChangeText={(text) =>
                        setDiscounts((prev) => ({ ...prev, max: text }))
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {categories && categories.length > 0 && (
            <View className="py-6 border-b border-gray-50">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Categories
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`px-4 py-2 rounded-full border-2 ${
                      (selectedCategories || []).includes(category.id)
                        ? "bg-indigo-600 border-indigo-600"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => {
                      setSelectedCategories((prev) =>
                        prev.includes(category.id)
                          ? prev.filter((id) => id !== category.id)
                          : [...prev, category.id]
                      );
                    }}
                  >
                    <Text
                      className={`font-medium ${
                        (selectedCategories || []).includes(category.id)
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {category.name} ({category.total})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {categories.some(
                (cat) => cat.subcategories && cat.subcategories.length > 0
              ) && (
                <View className="mt-4">
                  <Text className="text-base font-medium text-gray-700 mb-3">
                    Subcategories
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {categories
                      .flatMap((cat) => cat.subcategories || [])
                      .map((sub) => (
                        <TouchableOpacity
                          key={sub.id}
                          className={`px-3 py-1.5 rounded-full border ${
                            (selectedCategories || []).includes(sub.id)
                              ? "bg-indigo-100 border-indigo-300"
                              : "bg-gray-50 border-gray-200"
                          }`}
                          onPress={() => {
                            setSelectedCategories((prev) =>
                              prev.includes(sub.id)
                                ? prev.filter((id) => id !== sub.id)
                                : [...prev, sub.id]
                            );
                          }}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              (selectedCategories || []).includes(sub.id)
                                ? "text-indigo-700"
                                : "text-gray-600"
                            }`}
                          >
                            {sub.name} ({sub.total})
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {brands && brands.length > 0 && (
            <View className="py-6 border-b border-gray-50">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Brands
              </Text>
              <View className="space-y-3">
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    className="flex-row items-center py-2"
                    onPress={() => {
                      setSelectedBrands((prev) =>
                        prev.includes(brand.id)
                          ? prev.filter((id) => id !== brand.id)
                          : [...prev, brand.id]
                      );
                    }}
                  >
                    <View
                      className={`w-5 h-5 rounded border-2 mr-3 ${
                        (selectedBrands || []).includes(brand.id)
                          ? "bg-indigo-600 border-indigo-600"
                          : "border-gray-300"
                      } items-center justify-center`}
                    >
                      {(selectedBrands || []).includes(brand.id) && (
                        <FontAwesome5 name="check" size={10} color="white" />
                      )}
                    </View>
                    <Text className="text-gray-700 font-medium flex-1">
                      {brand.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      ({brand.total})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {colors && colors.length > 0 && (
            <View className="py-6 border-b border-gray-50">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Colors
              </Text>
              <View className="flex-row flex-wrap gap-4">
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color.id}
                    className="items-center"
                    onPress={() => {
                      setSelectedColors((prev) =>
                        prev.includes(color.id)
                          ? prev.filter((id) => id !== color.id)
                          : [...prev, color.id]
                      );
                    }}
                  >
                    <View className="relative">
                      <View
                        className={`w-14 h-14 rounded-full border-4 ${
                          (selectedColors || []).includes(color.id)
                            ? "border-indigo-600"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: color.code }}
                      />
                      {(selectedColors || []).includes(color.id) && (
                        <View className="absolute inset-0 rounded-full items-center justify-center">
                          <View className="w-6 h-6 bg-white rounded-full items-center justify-center">
                            <FontAwesome5
                              name="check"
                              size={12}
                              color="#4F46E5"
                            />
                          </View>
                        </View>
                      )}
                    </View>
                    <Text
                      className="text-xs text-gray-600 mt-2 text-center max-w-[60px]"
                      numberOfLines={1}
                    >
                      {color.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {ratings && ratings.length > 0 && (
            <View className="py-6 border-b border-gray-50">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Rating
              </Text>
              <View className="space-y-3">
                {ratings.map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    className="flex-row items-center justify-between py-2"
                    onPress={() => {
                      setSelectedRatings((prev) =>
                        prev.includes(rating)
                          ? prev.filter((r) => r !== rating)
                          : [...prev, rating]
                      );
                    }}
                  >
                    <View className="flex-row items-center">
                      <View className="flex-row mr-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesome5
                            key={star}
                            name="star"
                            size={16}
                            color={star <= rating ? "#FFD700" : "#E5E7EB"}
                            style={{ marginRight: 2 }}
                          />
                        ))}
                      </View>
                      <Text className="text-gray-700 font-medium">& up</Text>
                    </View>
                    <View
                      className={`w-5 h-5 rounded border-2 ${
                        (selectedRatings || []).includes(rating)
                          ? "bg-indigo-600 border-indigo-600"
                          : "border-gray-300"
                      } items-center justify-center`}
                    >
                      {(selectedRatings || []).includes(rating) && (
                        <FontAwesome5 name="check" size={10} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {sizes && sizes.length > 0 && (
            <View className="py-6 border-b border-gray-50">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Sizes
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size.id}
                    onPress={() => {
                      setSelectedSizes((prev) =>
                        prev.includes(size.id)
                          ? prev.filter((id) => id !== size.id)
                          : [...prev, size.id]
                      );
                    }}
                  >
                    <View
                      className={`w-12 h-12 rounded-lg border-2 ${
                        (selectedSizes || []).includes(size.id)
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 bg-white"
                      } items-center justify-center`}
                    >
                      <Text
                        className={`font-semibold ${
                          (selectedSizes || []).includes(size.id)
                            ? "text-indigo-600"
                            : "text-gray-700"
                        }`}
                      >
                        {size.code}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {attributes && attributes.length > 0 && (
            <View className="py-6">
              {attributes.map((attribute) => (
                <View key={attribute.id} className="mb-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-4">
                    {attribute.name}
                  </Text>
                  <View className="space-y-3">
                    {attribute.options.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        className="flex-row items-center py-2"
                        onPress={() => {
                          setSelectedAttributes((prev) => {
                            const currentOptions = prev[attribute.id] || [];
                            const newOptions = currentOptions.includes(
                              option.id
                            )
                              ? currentOptions.filter((id) => id !== option.id)
                              : [...currentOptions, option.id];
                            return { ...prev, [attribute.id]: newOptions };
                          });
                        }}
                      >
                        <View
                          className={`w-5 h-5 rounded border-2 mr-3 ${
                            (selectedAttributes[attribute.id] || []).includes(
                              option.id
                            )
                              ? "bg-indigo-600 border-indigo-600"
                              : "border-gray-300"
                          } items-center justify-center`}
                        >
                          {(selectedAttributes[attribute.id] || []).includes(
                            option.id
                          ) && (
                            <FontAwesome5
                              name="check"
                              size={10}
                              color="white"
                            />
                          )}
                        </View>
                        <Text className="text-gray-700 font-medium flex-1">
                          {option.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View className="px-6 py-4 border-t border-gray-100 bg-white">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-lg py-4 items-center"
              onPress={onClearAll}
            >
              <Text className="text-gray-700 font-semibold">Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-indigo-600 rounded-lg py-4 items-center"
              onPress={onApplyFilters}
            >
              <Text className="text-white font-semibold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
