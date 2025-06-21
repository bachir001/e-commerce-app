import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { Slider } from "expo-av";

export default function FiltersModal({
  isVisible,
  onClose,
  categories,
  setCategoryIds,
  minVal,
  maxVal,
}: {
  isVisible: boolean;
  onClose: () => void;
  categories: any[];
  setCategoryIds: (ids: number[]) => void;
  minVal: number;
  maxVal: number;
}) {
  const [selectedCategoriesId, setSelectedCategoriesId] = useState<number[]>(
    []
  );
  const [sliderValue, setSliderValue] = useState(minVal);

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
      <View style={styles.container}>
        <View style={styles.handleIndicator} />

        {/* Categories */}
        {categories && categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategoriesId.includes(category.id) &&
                      styles.selectedCategory,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <Text style={styles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Price Range */}
        {/* <View style={styles.section}>
          <Text style={styles.label}>Price Range:</Text>
          <Text style={styles.valueText}>
            Current Value: {sliderValue.toFixed(2)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={minVal}
            maximumValue={maxVal}
            value={sliderValue}
            onValueChange={setSliderValue}
            thumbTintColor="#facc15"
            minimumTrackTintColor="#5e3ebd"
            maximumTrackTintColor="#e9ecef"
          />
        </View> */}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    alignSelf: "center",
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#343a40",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  selectedCategory: {
    backgroundColor: "#facc15",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5e3ebd",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#495057",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#5e3ebd",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
