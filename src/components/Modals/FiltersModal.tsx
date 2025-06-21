import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

export default function FiltersModal({
  isVisible,
  onClose,
  categories,
  setCategoryIds,
}) {
  const [selectedCategoriesId, setSelectedCategoriesId] = useState<any[]>([]);

  const handleCategoryPress = (categoryId: number) => {
    const categoryIdIndex = selectedCategoriesId.findIndex(
      (selected) => selected === categoryId
    );

    if (categoryIdIndex > -1) {
      const newSelected = [
        ...selectedCategoriesId.slice(0, categoryIdIndex),
        ...selectedCategoriesId.slice(categoryIdIndex + 1),
      ];
      setSelectedCategoriesId(newSelected);
      setCategoryIds(newSelected);
    } else {
      setSelectedCategoriesId([...selectedCategoriesId, categoryId]);
      setCategoryIds([...selectedCategoriesId, categoryId]);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={{ justifyContent: "flex-end", margin: 0 }}
      backdropOpacity={0.6}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View className="bg-white py-10 px-10">
        <View className="flex flex-row justify-center">
          <View className="h-2 w-16 bg-gray-300 rounded-xl justify-center" />
        </View>
        {/*Categories*/}
        {categories && categories.length > 0 && (
          <View className="mt-5">
            <Text className="font-bold text-xl mb-3">Categories</Text>
            <View className="flex flex-row flex-wrap gap-2">
              {categories.map((category: any) => (
                <TouchableOpacity
                  key={category.id}
                  className="py-2 px-4 rounded-full border border-gray-200"
                  style={{
                    backgroundColor: selectedCategoriesId.includes(category.id)
                      ? "#facc15"
                      : "#f8f9fa",
                    borderColor: "#e9ecef",
                  }}
                  activeOpacity={0.7}
                  onPress={() => {
                    handleCategoryPress(category.id);
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: "#6e3ebd" }}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
