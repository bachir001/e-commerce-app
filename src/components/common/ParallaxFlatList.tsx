import { ReactElement } from 'react';
import {
  StyleSheet,
  FlatList,
  ListRenderItem,
  FlatListProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  ScrollHandlerProcessed,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/common/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 0;
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

type ParallaxFlatListProps<ItemT> = Omit<
  FlatListProps<ItemT>,
  'ListHeaderComponent' | 'onScroll'
> & {
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
};

export function ParallaxFlatList<ItemT>({
  data,
  renderItem,
  // this prop is now optional:
  keyExtractor: propKeyExtractor,
  getItemLayout: propGetItemLayout,
  headerImage,
  headerBackgroundColor,
  ...flatListProps
}: ParallaxFlatListProps<ItemT>) {
  const colorScheme = useColorScheme() ?? 'light';
  const bottom = useBottomTabOverflow();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(e => {
    scrollY.value = e.contentOffset.y;
  });

  return (
    <ThemedView style={styles.container}>
      <AnimatedFlatList
        {...(flatListProps as any)}           // avoid TS error on other props
        data={data}
        renderItem={renderItem as ListRenderItem<any>}
        // robust keyExtractor: user‑supplied → item.key → index
        keyExtractor={(item, index) => {
          if (propKeyExtractor) {
            return propKeyExtractor(item as ItemT, index);
          }
          const k = (item as any).key;
          return k != null ? String(k) : index.toString();
        }}
        getItemLayout={
          propGetItemLayout
            ? (d, i) => propGetItemLayout(d as ArrayLike<ItemT>, i)
            : undefined
        }
        onScroll={scrollHandler as ScrollHandlerProcessed<Record<string, unknown>>}
        scrollEventThrottle={16}
        contentContainerStyle={[
          flatListProps.contentContainerStyle,
          { paddingBottom: bottom },
        ]}
        scrollIndicatorInsets={{ bottom }}
        ListHeaderComponent={
          <Animated.View
            style={[
              styles.header,
              { backgroundColor: headerBackgroundColor[colorScheme] },
            ]}
          >
            {headerImage}
          </Animated.View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: HEADER_HEIGHT,
  },
});