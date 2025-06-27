import React from "react";
import { Image, View, type ImageSourcePropType } from "react-native";

const IMAGE_HEIGHT = 400;

const CarouselImage = React.memo<{ uri: string; width: number }>(
  ({ uri, width }) => (
    <View
      style={{ width, height: IMAGE_HEIGHT }}
      className="bg-gray-50 justify-center items-center"
    >
      <Image
        source={{ uri } as ImageSourcePropType}
        className="w-full h-full"
        resizeMode="contain"
        fadeDuration={0}
        loadingIndicatorSource={{
          uri: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        }}
      />
    </View>
  )
);

export default CarouselImage;
