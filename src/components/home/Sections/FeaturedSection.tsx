import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ProductCard from "@/components/common/ProductCard";
import ProductSkeleton from "@/components/common/ProductSkeleton";
import { useFeaturedSection } from "@/hooks/home/featuredSections";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { HomePageSectionProp } from "@/constants/HomePageSections";
import { set } from "lodash";
import { Colors } from "react-native/Libraries/NewAppScreen";
import AnimatedLoader from "@/components/common/AnimatedLayout";
import { SessionContext } from "@/app/_layout";

interface FeaturedSectionProps extends HomePageSectionProp {
  onViewMorePress?: () => void;
  list?: any;
  setLoading?: (loading: boolean) => void;
}

const MemoizedProductItem = React.memo(
  ({ item, innerColor }: { item: any; innerColor: string }) => (
    <View className="mr-3">
      <ProductCard product={item} innerColor={innerColor} />
    </View>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.innerColor === nextProps.innerColor
    );
  }
);

let controller = new AbortController();
let signal = controller.signal;

const FeaturedSection = React.memo(
  ({
    title,
    description,
    fetchParams,
    type,
    startFromLeft = false,
    onViewMorePress,
    list,
    setLoading,
  }: FeaturedSectionProps) => {
    const { data, isLoading } = useFeaturedSection(
      type,
      fetchParams,
      list ? false : true
    );

    const session = useContext(SessionContext);

    if (!session) {
      throw new Error("SessionContext is null. Make sure the provider is set.");
    }

    const { newArrivals } = session;

    // Memoize the renderItem function
    const renderProductItem = useCallback(
      ({ item }: { item: any }) => (
        <MemoizedProductItem item={item} innerColor="#5e3ebd" />
      ),
      []
    );

    // Memoize the keyExtractor function
    const keyExtractor = useCallback(
      (item: any, index: number) => `${item.id}-${index}`,
      []
    );

    // Memoize the ItemSeparatorComponent
    const ItemSeparatorComponent = useCallback(
      () => <View className="w-2" />,
      []
    );

    useEffect(() => {
      const loadingState = isLoading;
      setLoading?.(loadingState);

      return () => {
        if (loadingState) {
          setLoading?.(false);
        }
      };
    }, [isLoading, setLoading]);

    if (isLoading) {
      return (
        <AnimatedLoader
          color={Colors.PRIMARY}
          text={`Loading ${title} Products`}
        />
      );
    }

    return (
      <LinearGradient
        colors={["#5e3ebd", "#8b7bd8", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="py-4 mt-5 mb-10"
        style={{
          marginLeft: startFromLeft ? 0 : 20,
          marginRight: startFromLeft ? 20 : 0,
          borderTopLeftRadius: startFromLeft ? 0 : 25,
          borderTopRightRadius: startFromLeft ? 25 : 0,
          borderBottomRightRadius: startFromLeft ? 25 : 0,
        }}
      >
        <View className="flex-row justify-between items-start px-4 mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-white text-3xl font-bold mb-1">{title}</Text>
            <Text className="text-white/80 text-lg">{description}</Text>
          </View>

          <TouchableOpacity
            onPress={onViewMorePress}
            className={`bg-white/20 px-3 py-2 ${startFromLeft && "rounded-lg"}`}
          >
            <Text className="text-white font-semibold text-sm">View More</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={list ? newArrivals : data}
          renderItem={renderProductItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={ItemSeparatorComponent}
          initialNumToRender={2} // Further reduced
          maxToRenderPerBatch={3} // Reduced batch size
          windowSize={5} // Reduced window size
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={100} // Add batching
          getItemLayout={(data, index) => ({
            length: 176,
            offset: 176 * index,
            index,
          })}
        />
        {/* )} */}
      </LinearGradient>
    );
  },
  // Enhanced comparison for FeaturedSection
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.description === nextProps.description &&
      prevProps.type === nextProps.type &&
      prevProps.startFromLeft === nextProps.startFromLeft &&
      JSON.stringify(prevProps.fetchParams) ===
        JSON.stringify(nextProps.fetchParams)
    );
  }
);

export default FeaturedSection;
