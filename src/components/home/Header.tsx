import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  ImageBackground,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import Brands from "./Brands";

export default function Header() {
  const router = useRouter();
  const searchBarAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(searchBarAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  const goToSearch = () => {
    router.push("/search");
  };

  return (
    <ImageBackground
      className="flex-1 w-full flex flex-col pt-6 pb-2 bg-gradient-to-b from-white to-gray-50"
      source={require("@/assets/images/CamelBackground.jpg")}
      style={{
        maxHeight: 220,
      }}
    >
      <View className="w-full flex flex-col pt-6 pb-2 bg-gradient-to-b from-white to-gray-50">
        <Brands />

        <View className="px-4 mt-3">
          <Animated.View
            style={{
              transform: [
                {
                  translateY: searchBarAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
              opacity: searchBarAnimation,
            }}
          >
            <TouchableOpacity onPress={goToSearch} activeOpacity={0.95}>
              <View
                className="flex-row items-center justify-between px-4 py-3 rounded-3xl bg-white border border-gray-100"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View className="flex-row items-center flex-1">
                  <Image
                    source={require("@/assets/images/logo.png")}
                    className="w-16 h-5 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-gray-500 font-medium text-sm flex-1">
                    Search products, brands...
                  </Text>
                </View>

                <View
                  className="w-8 h-8 rounded-full items-center justify-center ml-2"
                  style={{ backgroundColor: "#5e3ebd" }}
                >
                  <FontAwesome5 name="search" size={12} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
}
