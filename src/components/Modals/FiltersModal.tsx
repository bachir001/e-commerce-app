import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import EmptyState from "../common/EmptyList";

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

  const handleCategoryPress = useCallback(
    (categoryId: number) => {
      setSelectedCategoriesId((prevSelected) => {
        const categoryIdIndex = prevSelected.findIndex(
          (selected) => selected === categoryId
        );

        let newSelected: number[];
        if (categoryIdIndex > -1) {
          newSelected = [
            ...prevSelected.slice(0, categoryIdIndex),
            ...prevSelected.slice(categoryIdIndex + 1),
          ];
        } else {
          newSelected = [...prevSelected, categoryId];
        }
        setCategoryIds(newSelected);
        return newSelected;
      });
    },
    [setCategoryIds]
  );

  const handleBrandPress = useCallback(
    (brandId: number) => {
      setSelectedBrandIds((prevSelected) => {
        const brandIdIndex = prevSelected.findIndex(
          (selected) => selected === brandId
        );

        let newSelected: number[];
        if (brandIdIndex > -1) {
          newSelected = [
            ...prevSelected.slice(0, brandIdIndex),
            ...prevSelected.slice(brandIdIndex + 1),
          ];
        } else {
          newSelected = [...prevSelected, brandId];
        }
        setBrandIds(newSelected); // Update parent state
        return newSelected;
      });
    },
    [setBrandIds]
  );

  const handleColorPress = useCallback(
    (colorId: number) => {
      setSelectedColorIds((prevSelected) => {
        const colorIdIndex = prevSelected.findIndex(
          (selected) => selected === colorId
        );

        let newSelected: number[];
        if (colorIdIndex > -1) {
          newSelected = [
            ...prevSelected.slice(0, colorIdIndex),
            ...prevSelected.slice(colorIdIndex + 1),
          ];
        } else {
          newSelected = [...prevSelected, colorId];
        }
        setColorIds(newSelected);
        return newSelected;
      });
    },
    [setColorIds]
  );

  const handleSizePress = useCallback(
    (sizeId: number) => {
      setSelectedSizeIds((prevSelected) => {
        const sizeIdIndex = prevSelected.findIndex(
          (selected) => selected === sizeId
        );

        let newSelected: number[];
        if (sizeIdIndex > -1) {
          newSelected = [
            ...prevSelected.slice(0, sizeIdIndex),
            ...prevSelected.slice(sizeIdIndex + 1),
          ];
        } else {
          newSelected = [...prevSelected, sizeId];
        }
        setSizeIds(newSelected);
        return newSelected;
      });
    },
    [setSizeIds]
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
        <ScrollView
          // Remove maxHeight from ScrollView
          showsVerticalScrollIndicator={false} // Optional: hide scroll indicator if desired
        >
          {/*Categories*/}
          {categories && categories.length > 0 && (
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
                    onPress={() => handleCategoryPress(category.id)}
                  >
                    <Text className="text-sm font-medium text-violet-700">
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/*Brands*/}
          {brands && brands.length > 0 && (
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
                    onPress={() => handleBrandPress(brand.id)}
                  >
                    <Text className="text-sm font-medium text-violet-700">
                      {brand.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/*Colors*/}
          {colors && colors.length > 0 && (
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
                    onPress={() => handleColorPress(color.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/*Sizes*/}
          {sizes && sizes.length > 0 && (
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
                    onPress={() => handleSizePress(size.id)}
                  >
                    <Text className="text-sm font-medium text-violet-700">
                      {size.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default React.memo(FiltersModal);
