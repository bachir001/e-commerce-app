import React from "react";
import { Image, ImageSourcePropType, TouchableOpacity } from "react-native";

const THUMBNAIL_SIZE = 64;

const ThumbnailImage = React.memo<{
  uri: string;
  index: number;
  isActive: boolean;
  onPress: (index: number) => void;
}>(({ uri, index, isActive, onPress }) => (
  <TouchableOpacity
    className={`mr-3 border-2 rounded-lg overflow-hidden ${
      isActive ? "border-[#5E3EBD]" : "border-gray-200"
    }`}
    onPress={() => onPress(index)}
    activeOpacity={0.7}
  >
    <Image
      source={{ uri } as ImageSourcePropType}
      style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
      resizeMode="cover"
      fadeDuration={200}
    />
  </TouchableOpacity>
));

export default ThumbnailImage;
