import { View } from "react-native";

export default function RelatedCategorySkeleton() {
  return (
    <View className="items-center">
      <View className="w-32 h-36 bg-white/20 border-2 border-white/30 rounded-xl overflow-hidden">
        <View className="flex-1 items-center justify-center p-3">
          <View className="w-full h-full bg-white/30 rounded-lg animate-pulse" />
        </View>
      </View>
      <View className="mt-2 w-32">
        <View className="w-24 h-3 bg-white/30 rounded animate-pulse mb-1" />
        <View className="w-20 h-3 bg-white/30 rounded animate-pulse" />
      </View>
    </View>
  );
}
