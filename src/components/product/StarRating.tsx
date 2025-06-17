import { Star } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

const StarRating = React.memo<{ rating: number; reviews: number }>(
  ({ rating, reviews }) => (
    <View className="flex-row items-center mb-4">
      <View className="flex-row">
        {Array.from({ length: 5 }, (_, starIndex) => (
          <Star
            key={`star-${starIndex}`}
            size={16}
            color="#FFD700"
            fill={starIndex < Math.floor(rating) ? "#FFD700" : "transparent"}
          />
        ))}
      </View>
      <Text className="text-sm text-gray-600 ml-2">
        {rating && rating.toFixed(1)} ({reviews} reviews)
      </Text>
    </View>
  )
);

export default StarRating;
