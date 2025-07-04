import { useCallback } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import CarouselImage from "./CarouselImage";
import type React from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MainImageCarouselProps {
  mainCarouselReference: React.RefObject<FlatList<string>>;
  allImages: string[];
  activeImageIndex: number;
  setActiveImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function MainImageCarousel({
  mainCarouselReference,
  allImages,
  activeImageIndex,
  setActiveImageIndex,
}: MainImageCarouselProps): React.ReactElement {
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  const renderCarouselItem: ListRenderItem<string> = useCallback(
    ({ item }) => <CarouselImage uri={item} width={SCREEN_WIDTH} />,
    []
  );

  const handleMainCarouselScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (
        index !== activeImageIndex &&
        index >= 0 &&
        index < allImages.length
      ) {
        setActiveImageIndex(index);
      }
    },
    [activeImageIndex, allImages.length, setActiveImageIndex]
  );

  return (
    <View className="relative">
      <FlatList
        ref={mainCarouselReference}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={allImages}
        keyExtractor={(_, index) => `main-image-${index}`}
        onScroll={handleMainCarouselScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        renderItem={renderCarouselItem}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={1}
      />

      {allImages.length > 1 ? (
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center">
          {allImages.map((_, index: number) => (
            <View
              key={`indicator-${index}`}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === activeImageIndex ? "bg-[#5E3EBD]" : "bg-gray-300"
              }`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
