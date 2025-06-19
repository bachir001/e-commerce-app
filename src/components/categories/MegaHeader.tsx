import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function MegaHeader({
  name,
  bgColor,
  subCount,
}: {
  name: string;
  bgColor: string;
  subCount?: number;
}) {
  return (
    <LinearGradient
      colors={[bgColor, `${bgColor}CC`, `${bgColor}99`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ height: 160 }}
      className="px-6 py-8 justify-center items-center relative"
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
      >
        <FontAwesome5 name="arrow-left" size={16} color="white" />
      </TouchableOpacity>

      <View className="items-center">
        <Text className="font-bold text-3xl text-white text-center mb-2">
          {name}
        </Text>
        <Text className="text-white/80 text-base text-center">
          {subCount || 0} subcategories available
        </Text>
      </View>

      <View className="absolute top-16 right-8 w-20 h-20 rounded-full bg-white/10" />
      <View className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-white/15" />
    </LinearGradient>
  );
}
