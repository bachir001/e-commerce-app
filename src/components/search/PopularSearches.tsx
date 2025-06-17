import { Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import useGetPopularSearches from "@/hooks/search/useGetPopularSearches";

const PopularSearches = ({
  onPressRecentSearch,
}: {
  onPressRecentSearch: any;
}) => {
  const { data: popularSearches, isLoading: popularSearchesLoading } =
    useGetPopularSearches();

  return (
    <View className="px-4 mb-6">
      {/* Clean Header */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <FontAwesome5 name="fire" size={16} color="#5E3EBD" />
          <Text className="text-gray-900 font-bold text-lg ml-2">
            Trending Searches
          </Text>
        </View>
        <Text className="text-gray-500 text-sm">Popular right now</Text>
      </View>

      {/* Minimal List */}
      <View className="space-y-2">
        {popularSearches &&
          popularSearches.map((term: any, index: number) => (
            <TouchableOpacity
              key={`popular-${index}`}
              onPress={() => onPressRecentSearch(term.query)}
              className="active:bg-gray-50"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: "#F1F5F9",
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  {/* Simple Number Badge */}
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{
                      backgroundColor: index < 3 ? "#5E3EBD" : "#F1F5F9",
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: index < 3 ? "white" : "#64748B",
                      }}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-base">
                      {term.query}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-0.5">
                      Trending search
                    </Text>
                  </View>
                </View>

                {/* Simple Arrow */}
                <FontAwesome5 name="chevron-right" size={14} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

export default PopularSearches;
