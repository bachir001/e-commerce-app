import { View } from "react-native";

const CategorySkeleton = () => {
  return (
    <View className="flex-1 mx-2 mb-6" style={{ maxWidth: "30%" }}>
      <View className="aspect-square rounded-2xl bg-gray-200 mb-3" />

      <View className="items-center">
        <View className="w-16 h-3 bg-gray-200 rounded mb-1" />
        <View className="w-12 h-2 bg-gray-200 rounded" />
      </View>
    </View>
  );
};

export const CategoriesSkeletonGrid = () => {
  return (
    <View className="px-4">
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between mb-4">
          {Array.from({ length: 3 }).map((_, colIndex) => (
            <CategorySkeleton key={`${rowIndex}-${colIndex}`} />
          ))}
        </View>
      ))}
    </View>
  );
};

export default CategorySkeleton;
