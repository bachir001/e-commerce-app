// components/product/CarouselImage.tsx
import type React from "react";
import { Image, Dimensions } from "react-native";

interface CarouselImageProps {
  uri: string;
  width: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function CarouselImage({
  uri,
  width,
}: CarouselImageProps): React.ReactElement {
  return (
    <Image
      source={{ uri }}
      style={{ width, height: SCREEN_HEIGHT * 0.4 }}
      resizeMode="contain"
      fadeDuration={0}
    />
  );
}
