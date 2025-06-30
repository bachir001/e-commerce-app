import { useCallback } from "react";
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import ThumbnailImage from "./ThumbnailImage";
import { LinearGradient } from "expo-linear-gradient";
import type React from "react";

interface ThumbnailCarouselProps {
  thumbnailCarouselReference: React.RefObject<FlatList<string>>;
  allImages: string[];
  activeImageIndex: number;
  handleThumbnailPress: (index: number) => void;
  productDetailLoading: boolean;
}

export default function ThumbnailCarousel({
  thumbnailCarouselReference,
  allImages,
  activeImageIndex,
  handleThumbnailPress,
  productDetailLoading,
}: ThumbnailCarouselProps): React.ReactElement {
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

  const renderSkeletonThumbnail = useCallback(
    () => (
      <View style={styles.skeletonThumbnail}>
        <LinearGradient
          colors={["#e1e1e1", "#f5f5f5", "#e1e1e1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    ),
    []
  );

  return (
    <FlatList
      ref={thumbnailCarouselReference}
      horizontal
      showsHorizontalScrollIndicator={false}
      data={productDetailLoading ? Array(5).fill(null) : allImages}
      keyExtractor={(_, index) => `thumbnail-${index}`}
      contentContainerStyle={{
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 8,
      }}
      renderItem={
        productDetailLoading ? renderSkeletonThumbnail : renderThumbnailItem
      }
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={7}
    />
  );
}

const styles = StyleSheet.create({
  skeletonThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: "#e1e1e1",
    marginRight: 8,
    aspectRatio: 1,
    overflow: "hidden",
  },
});
