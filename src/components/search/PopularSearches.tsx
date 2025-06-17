import { Text, TouchableOpacity, View } from "react-native";

import { ThemedText } from "../common/ThemedText";
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
      <View
        className="rounded-2xl p-5 mb-4"
        style={{
          backgroundColor: "#5E3EBD",
          shadowColor: "#5E3EBD",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View className="absolute top-3 right-3 w-12 h-12 rounded-full bg-white opacity-10" />
        <View className="absolute bottom-2 left-4 w-6 h-6 rounded-full bg-yellow-300 opacity-20" />

        <View className="flex-row items-center">
          <View className="bg-white/20 p-3 rounded-xl mr-3">
            <FontAwesome5 name="fire" size={18} color="#F9B615" />
          </View>
          <View>
            <Text className="text-white font-bold text-xl">Trending Now</Text>
            <Text className="text-yellow-200 text-sm font-medium">
              🔥 Hot Searches
            </Text>
          </View>
        </View>
      </View>

      <View className="space-y-3">
        {popularSearches &&
          popularSearches.map((term: any, index: number) => (
            <TouchableOpacity
              key={`popular-${index}`}
              onPress={() => onPressRecentSearch(term.query)}
              className="active:opacity-80"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 16,
                shadowColor: "#5E3EBD",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
                borderWidth: 1,
                borderColor: "#F3F4F6",
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className="p-3 rounded-xl mr-4"
                    style={{
                      backgroundColor: "#5E3EBD",
                      shadowColor: "#5E3EBD",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <FontAwesome5 name="fire" size={16} color="#F9B615" />
                  </View>

                  <View className="flex-1">
                    <ThemedText className="text-gray-800 font-bold text-base mb-1">
                      {term.query}
                    </ThemedText>
                    <View className="flex-row items-center">
                      <View
                        className="px-3 py-1 rounded-full mr-2"
                        style={{
                          backgroundColor: "#F9B615",
                        }}
                      >
                        <View className="flex-row items-center">
                          <FontAwesome5
                            name="chart-line"
                            size={10}
                            color="white"
                          />
                          <Text className="text-white text-xs ml-1 font-bold">
                            #{index + 1} TRENDING
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View
                    className="px-3 py-1.5 rounded-full mr-3"
                    style={{
                      backgroundColor: "#FF6B35",
                      shadowColor: "#FF6B35",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center">
                      <FontAwesome5 name="fire" size={10} color="white" />
                      <Text className="text-white text-xs font-bold ml-1">
                        HOT
                      </Text>
                    </View>
                  </View>

                  {/* Simple Arrow */}
                  <View className="bg-gray-100 p-2 rounded-full">
                    <FontAwesome5
                      name="chevron-right"
                      size={12}
                      color="#5E3EBD"
                    />
                  </View>
                </View>
              </View>

              <View className="mt-3 flex-row items-center">
                <View className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <View
                    style={{
                      width: `${Math.max(20, 100 - index * 15)}%`,
                      height: "100%",
                      backgroundColor: "#5E3EBD",
                      borderRadius: 3,
                    }}
                  />
                </View>
                <Text className="text-xs text-gray-500 ml-2 font-medium">
                  {Math.max(20, 100 - index * 15)}% popularity
                </Text>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

export default PopularSearches;
