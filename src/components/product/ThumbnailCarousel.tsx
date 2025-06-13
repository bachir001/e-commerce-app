import { useCallback } from "react";
import { FlatList, ListRenderItem } from "react-native";
import ThumbnailImage from "./ThumbnailImage";

export default function ThumbnailCarousel({
  thumbnailCarouselReference,
  allImages,
  activeImageIndex,
  handleThumbnailPress,
}) {
  const renderThumbnailItem: ListRenderItem<string> = useCallback(
    ({ item, index }) => (
      <ThumbnailImage
        uri={item}
        index={index}
        isActive={index === activeImageIndex}
        onPress={handleThumbnailPress}
      />
    ),
    [activeImageIndex, handleThumbnailPress]
  );

  return (
    <FlatList
      ref={thumbnailCarouselReference}
      horizontal
      showsHorizontalScrollIndicator={false}
      data={allImages}
      keyExtractor={(_, index) => `thumbnail-${index}`}
      contentContainerStyle={{
        paddingVertical: 16,
        paddingHorizontal: 16,
      }}
      renderItem={renderThumbnailItem}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={7}
    />
  );
}
