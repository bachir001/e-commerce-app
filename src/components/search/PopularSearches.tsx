import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";
import AnimatedFireIcon from "./AnimatedFireIcon";
import { ThemedText } from "../common/ThemedText";
import { FontAwesome5 } from "@expo/vector-icons";
import useGetPopularSearches from "@/hooks/search/useGetPopularSearches";

const PopularSearches = ({ onPressRecentSearch }) => {
  const { data: popularSearches, isLoading: popularSearchesLoading } =
    useGetPopularSearches();

  return (
    <View className="px-4 mb-6">
      <LinearGradient
        colors={["#5E3EBD", "#7C5CE0", "#F9B615"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl p-6 mb-4"
        style={{
          shadowColor: "#5E3EBD",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 12,
          borderRadius: 20,
        }}
      >
        <View className="absolute inset-0 rounded-3xl overflow-hidden">
          <View className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white opacity-10" />
          <View className="absolute bottom-2 left-6 w-8 h-8 rounded-full bg-yellow-300 opacity-20" />
          <View className="absolute top-8 left-12 w-4 h-4 rounded-full bg-white opacity-15" />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-white/20 p-3 rounded-2xl mr-3">
              <AnimatedFireIcon />
            </View>
            <View>
              <Text className="text-white font-bold text-xl">Trending Now</Text>
              <Text className="text-yellow-200 text-sm font-medium">
                🔥 Hot Searches
              </Text>
            </View>
          </View>
          {/* <View className="flex-row items-center bg-white/15 px-3 py-2 rounded-full">
            <AnimatedFireIcon delay={200} />
            <AnimatedFireIcon delay={400} />
            <AnimatedFireIcon delay={600} />
          </View> */}
        </View>
      </LinearGradient>

      <View className="flex flex-col gap-3">
        {popularSearches &&
          popularSearches.map((term: any, index: number) => (
            <TouchableOpacity
              key={`popular-${index}`}
              onPress={() => onPressRecentSearch(term.query)}
              className="active:scale-98"
              style={{ transform: [{ scale: 1 }] }}
            >
              <LinearGradient
                colors={["#FFFFFF", "#FEFBF3", "#FFF8E1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl p-4"
                style={{
                  shadowColor: "#5E3EBD",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 6,
                  borderWidth: 1,
                  borderColor: "#F9B61520",
                  borderRadius: 15,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <LinearGradient
                      colors={["#5E3EBD", "#7C5CE0", "#F9B615"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="p-3 rounded-xl mr-4"
                      style={{
                        shadowColor: "#5E3EBD",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                        borderRadius: 8,
                      }}
                    >
                      <AnimatedFireIcon delay={index * 150} />
                    </LinearGradient>

                    <View className="flex-1">
                      <ThemedText className="text-gray-800 font-bold text-base mb-1">
                        {term.query}
                      </ThemedText>
                      <View className="flex-row items-center">
                        <LinearGradient
                          colors={["#F9B615", "#FFD700"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="px-2 py-1 rounded-full mr-2"
                        >
                          <View className="flex-row items-center">
                            <FontAwesome5
                              name="chart-line"
                              size={10}
                              color="white"
                            />
                            <ThemedText className="text-white text-xs ml-1 font-bold">
                              #{index + 1} TRENDING
                            </ThemedText>
                          </View>
                        </LinearGradient>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    {/* Hot Badge */}
                    <LinearGradient
                      colors={["#FF6B35", "#FF8E53"]}
                      className="px-3 py-1.5 rounded-full mr-3"
                      style={{
                        shadowColor: "#FF6B35",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <View className="flex-row items-center">
                        <FontAwesome5 name="fire" size={10} color="white" />
                        <ThemedText className="text-white text-xs font-bold ml-1">
                          HOT
                        </ThemedText>
                      </View>
                    </LinearGradient>

                    {/* Arrow */}
                    <View className="bg-gray-100 p-2 rounded-full">
                      <FontAwesome5
                        name="chevron-right"
                        size={12}
                        color="#5E3EBD"
                      />
                    </View>
                  </View>
                </View>

                {/* Popularity Indicator */}
                <View className="mt-3 flex-row items-center">
                  <View className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <LinearGradient
                      colors={["#5E3EBD", "#F9B615"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        width: `${Math.max(20, 100 - index * 15)}%`,
                        height: "100%",
                      }}
                    />
                  </View>
                  <ThemedText className="text-xs text-gray-500 ml-2 font-medium">
                    {Math.max(20, 100 - index * 15)}% popularity
                  </ThemedText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

export default PopularSearches;
