import { View, Text } from "react-native";
import React from "react";

export default function ProductSkeleton() {
  return (
    <View
      className="w-40 bg-white rounded-lg p-3 shadow-sm"
      style={{ height: 230 }}
    >
      {/* Top Row Skeleton */}
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <View className="w-8 h-3 bg-gray-200 rounded animate-pulse" />
        </View>

        <View className="flex-row items-center gap-2">
          <View className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
          <View className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
        </View>
      </View>

      {/* Product Image Skeleton */}
      <View className="items-center mb-3">
        <View className="w-24 h-24 bg-gray-200 rounded animate-pulse" />
      </View>

      {/* Product Name Skeleton */}
      <View className="mb-2">
        <View className="w-full h-4 bg-gray-200 rounded animate-pulse mb-1" />
        <View className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
      </View>

      {/* Rating Skeleton */}
      <View className="flex-row items-center mb-3">
        <View className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
        <View className="w-8 h-3 bg-gray-200 rounded animate-pulse ml-1" />
      </View>

      {/* Price and Cart Skeleton */}
      <View className="flex-row justify-between items-center">
        <View>
          <View className="w-12 h-4 bg-gray-200 rounded animate-pulse mb-1" />
          <View className="w-10 h-3 bg-gray-200 rounded animate-pulse" />
        </View>

        <View className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </View>
    </View>
  );
}
