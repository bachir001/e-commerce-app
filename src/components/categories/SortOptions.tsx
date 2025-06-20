import { FontAwesome5 } from "@expo/vector-icons";
import { View } from "lucide-react-native";
import { Text, TouchableOpacity } from "react-native";

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

export default function SortOptions({
  selectedSortOption,
  handleSortOptionPress,
}) {
  return (
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
  );
}
