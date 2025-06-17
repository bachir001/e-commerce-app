import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface RecentSearchesProps {
  recentSearches: string[];
  onPressRecentSearch: (term: string) => void;
  onClearAll: () => void;
}

const RecentSearches = ({
  recentSearches,
  onPressRecentSearch,
  onClearAll,
}: RecentSearchesProps) => {
  if (!recentSearches || recentSearches.length === 0) return null;

  return (
    <View className="px-4 mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <FontAwesome5 name="clock" size={14} color="#64748B" />
          <Text className="text-gray-700 font-semibold text-base ml-2">
            Recent Searches
          </Text>
        </View>
        <TouchableOpacity onPress={onClearAll} className="px-2 py-1">
          <Text className="text-gray-500 text-sm">Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Search Items */}
      <View className="space-y-2">
        {recentSearches.slice(0, 5).map((term, index) => (
          <TouchableOpacity
            key={`recent-${index}`}
            onPress={() => onPressRecentSearch(term)}
            className="active:bg-gray-50"
            style={{
              backgroundColor: "#FAFAFA",
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: "#F1F5F9",
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center mr-3">
                  <FontAwesome5 name="search" size={10} color="#64748B" />
                </View>
                <Text
                  className="text-gray-800 font-medium text-base flex-1"
                  numberOfLines={1}
                >
                  {term}
                </Text>
              </View>
              <FontAwesome5
                name="arrow-up"
                size={12}
                color="#CBD5E1"
                style={{ transform: [{ rotate: "45deg" }] }}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default RecentSearches;
