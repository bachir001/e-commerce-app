import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import EmptyState from "../common/EmptyList";

type PressType = "brands" | "colors" | "sizes" | "categories";

function FiltersModal({
  isVisible,
  onClose,
  categories,
  setCategoryIds,
  minVal,
  maxVal,
  brands,
  setBrandIds,
  colors,
  setColorIds,
  sizes,
  setSizeIds,
}: {
  isVisible: boolean;
  onClose: () => void;
  categories: any[];
  setCategoryIds: (ids: number[]) => void;
  minVal: number;
  maxVal: number;
  brands: any[];
  setBrandIds: (ids: number[]) => void;
  colors: any[];
  setColorIds: (ids: number[]) => void;
  sizes: any[];
  setSizeIds: (ids: number[]) => void;
}) {
  const [selectedCategoriesId, setSelectedCategoriesId] = useState<number[]>(
    []
  );

  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const [selectedSizeIds, setSelectedSizeIds] = useState<number[]>([]);

  const handlePress = useCallback(
    (id: number, type: PressType) => {
      let selectedArray: any[] = [];
      let setFunction: Function;
      let currentComponentSetterFunction: Function;
      if (type === "brands") {
        selectedArray = selectedBrandIds;
        setFunction = setBrandIds;
        currentComponentSetterFunction = setSelectedBrandIds;
      } else if (type === "categories") {
        selectedArray = selectedCategoriesId;
        setFunction = setCategoryIds;
        currentComponentSetterFunction = setSelectedCategoriesId;
      } else if (type === "colors") {
        selectedArray = selectedColorIds;
        setFunction = setColorIds;
        currentComponentSetterFunction = setSelectedColorIds;
      } else if (type === "sizes") {
        selectedArray = selectedSizeIds;
        setFunction = setSizeIds;
        currentComponentSetterFunction = setSelectedSizeIds;
      } else {
        return;
      }

      const idIndex = selectedArray.findIndex((selected) => selected === id);

      let newSelected = selectedArray.includes(id)
        ? selectedArray.filter((item) => item !== id)
        : [...selectedArray, id];

      currentComponentSetterFunction(newSelected);
      setFunction(newSelected);
    },
    [
      setCategoryIds,
      setColorIds,
      setSizeIds,
      setBrandIds,
      selectedBrandIds,
      selectedCategoriesId,
      selectedColorIds,
      selectedSizeIds,
    ]
  );

  useEffect(() => {
    console.log(brands);
  }, [categories]);

  if (!categories && !brands && !colors && !sizes) {
    return (
      <EmptyState
        title="No Filters"
        subtitle="There are no filters for this category"
      />
    );
  }

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
      backdropOpacity={0.6}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View
        className="bg-white p-5 rounded-t-xl"
        style={{
          maxHeight: 600,
          flexShrink: 1,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/*Categories*/}
          {categories && categories.length > 0 ? (
            <View className="mb-5">
              <Text className="text-lg font-bold mb-2.5 text-gray-800">
                Categories
              </Text>
              <View className="flex flex-row flex-wrap gap-2">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`py-2 px-4 rounded-full bg-gray-50 border border-gray-200 ${
                      selectedCategoriesId.includes(category.id)
                        ? "bg-yellow-400"
                        : ""
                    }`}
                    activeOpacity={0.7}
                    onPress={() => handlePress(category.id, "categories")}
                  >
                    <Text className="text-sm font-medium text-violet-700">
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/*Brands*/}
          {brands && brands.length > 0 ? (
            <View className="mb-5">
              <Text className="text-lg font-bold mb-2.5 text-gray-800">
                Brands
              </Text>
              <View className="flex flex-row flex-wrap gap-2">
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    className={`py-2 px-4 rounded-full bg-gray-50 border border-gray-200 ${
                      selectedBrandIds.includes(brand.id) ? "bg-yellow-400" : ""
                    }`}
                    activeOpacity={0.7}
                    onPress={() => handlePress(brand.id, "brands")}
                  >
                    <Text className="text-sm font-medium text-violet-700">
                      {brand.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/*Colors*/}
          {colors && colors.length > 0 ? (
            <View className="mb-5">
              <Text className="text-lg font-bold mb-2.5 text-gray-800">
                Colors
              </Text>
              <View className="flex flex-row flex-wrap gap-2 mt-2.5">
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color.id}
                    className={`w-10 h-10 rounded-full border border-gray-300 items-center justify-center transition-transform duration-200 ${
                      selectedColorIds.includes(color.id)
                        ? "scale-125 border-2 "
                        : ""
                    }`}
                    style={{ backgroundColor: color.code }}
                    activeOpacity={0.7}
                    onPress={() => handlePress(color.id, "colors")}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/*Sizes*/}
          {sizes && sizes.length > 0 ? (
            <View className="mb-5">
              <Text className="text-lg font-bold mb-2.5 text-gray-800">
                Sizes
              </Text>
              <View className="flex flex-row flex-wrap gap-2">
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size.id}
                    className={`py-2 px-4 rounded-full bg-gray-50 border border-gray-200 ${
                      selectedSizeIds.includes(size.id) ? "bg-yellow-400" : ""
                    }`}
                    activeOpacity={0.7}
                    onPress={() => handlePress(size.id, "sizes")}
                  >
                    <Text className="text-sm font-medium text-violet-700">
                      {size.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default React.memo(FiltersModal);
