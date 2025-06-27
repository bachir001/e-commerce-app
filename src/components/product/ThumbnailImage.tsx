// components/product/ThumbnailImage.tsx
import type React from "react";
import { Image, TouchableOpacity } from "react-native";

interface ThumbnailImageProps {
  uri: string;
  index: number;
  isActive: boolean;
  onPress: (index: number) => void;
}

export default function ThumbnailImage({
  uri,
  index,
  isActive,
  onPress,
}: ThumbnailImageProps): React.ReactElement {
  return (
    <TouchableOpacity onPress={() => onPress(index)} activeOpacity={0.7}>
      <Image
        source={{ uri }}
        className={`w-16 h-16 rounded-md ${
          isActive ? "border-2 border-[#5E3EBD]" : "border border-gray-200"
        }`}
        resizeMode="cover"
        fadeDuration={0}
      />
    </TouchableOpacity>
  );
}
