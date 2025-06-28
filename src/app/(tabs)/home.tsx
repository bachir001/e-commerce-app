import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SafeAreaView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  FlatList,
  View,
  Platform,
} from "react-native";
import Header from "@/components/home/Header";
import CategorySection from "@/components/home/Categories/CategorySection";
import SpecificSection from "@/components/home/Sections/SpecificSection";
import { HOMEPAGE_SECTIONS } from "@/constants/HomePageSections";
import { Colors } from "@/constants/Colors";
import FeaturedSection from "@/components/home/Sections/FeaturedSection";
import ProductInfiniteList from "@/components/common/ProductInfiniteList";
import { useSessionStore } from "@/store/useSessionStore";
import { useAppDataStore } from "@/store/useAppDataStore";
import { useUiStore } from "@/store/useUiStore";
import { useWishlist } from "@/hooks/home/topSection";

const HOME_SCREEN_DATA_STRUCTURE = [
  { id: "beautyAndHealth", type: "specific" },
  { id: "medicalEquipment", type: "specific" },
  { id: "bestSellers", type: "featured" },
  { id: "agriculture", type: "specific" },
  { id: "hardwareAndFasteners", type: "specific" },
  { id: "homeAndLiving", type: "specific" },
  { id: "sportsAndOutdoors", type: "specific" },
];

export default function HomeScreen() {
  const { token } = useSessionStore();
  const { newArrivals } = useAppDataStore();
  const { showTabBar, hideTabBar } = useUiStore();
  const wishlistQuery = useWishlist(token);

  const [visibleSections, setVisibleSections] = useState([
    HOME_SCREEN_DATA_STRUCTURE[0],
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingSectionId, setLoadingSectionId] = useState<string | null>(null);
  const [showInfiniteList, setShowInfiniteList] = useState(false);

  const isBusy = useRef(false);
  const flatListRef =
    useRef<FlatList<(typeof HOME_SCREEN_DATA_STRUCTURE)[0]>>(null);
  const lastScrollY = useRef(0);
  const lastAction = useRef<"hide" | "show" | null>(null);

  const loadMoreSections = useCallback(() => {
    if (isBusy.current || loadingSectionId !== null) return;
    const nextSectionIndex = currentIndex + 1;
    if (nextSectionIndex >= HOME_SCREEN_DATA_STRUCTURE.length) {
      setShowInfiniteList(true);
      return;
    }
    isBusy.current = true;
    const newSection = HOME_SCREEN_DATA_STRUCTURE[nextSectionIndex];
    setLoadingSectionId(newSection.id);
    setVisibleSections((prev) => [...prev, newSection]);
    setCurrentIndex(nextSectionIndex);
  }, [currentIndex, loadingSectionId]);

  const handleSectionLoading = useCallback(
    (sectionId: string, isLoading: boolean) => {
      if (!isLoading && loadingSectionId === sectionId) {
        setLoadingSectionId(null);
        isBusy.current = false;
        if (currentIndex < HOME_SCREEN_DATA_STRUCTURE.length - 1) {
          setTimeout(() => {
            if (flatListRef.current) handleEndReached();
          }, 100);
        } else if (!showInfiniteList) setShowInfiniteList(true);
      }
    },
    [loadingSectionId, currentIndex, showInfiniteList]
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof HOME_SCREEN_DATA_STRUCTURE)[0] }) => {
      const sectionData =
        HOMEPAGE_SECTIONS[item.id as keyof typeof HOMEPAGE_SECTIONS];
      if (!sectionData) return null;
      switch (item.type) {
        case "featured":
          return (
            <FeaturedSection
              {...sectionData}
              setLoading={(loading) => handleSectionLoading(item.id, loading)}
            />
          );
        case "specific":
          return (
            <SpecificSection
              {...sectionData}
              color={
                typeof Colors[item.id as keyof typeof Colors] === "string"
                  ? (Colors[item.id as keyof typeof Colors] as string)
                  : (Colors[item.id as keyof typeof Colors] as any)
                      ?.background || Colors.PRIMARY
              }
              setLoading={(loading) => handleSectionLoading(item.id, loading)}
            />
          );
        default:
          return null;
      }
    },
    [handleSectionLoading]
  );

  const handleEndReached = useCallback(() => {
    if (currentIndex < HOME_SCREEN_DATA_STRUCTURE.length - 1)
      loadMoreSections();
    else if (!showInfiniteList) setShowInfiniteList(true);
  }, [currentIndex, loadMoreSections, showInfiniteList]);

  const ListHeader = useMemo(
    () => (
      <View style={{ flex: 1, width: "100%" }}>
        <Header />
        <CategorySection />
        {newArrivals && newArrivals?.length > 0 && (
          <FeaturedSection list={true} {...HOMEPAGE_SECTIONS.newArrivals} />
        )}
      </View>
    ),
    [newArrivals]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      if (currentScrollY <= 0) {
        if (lastAction.current !== "show") {
          showTabBar();
          lastAction.current = "show";
        }
        lastScrollY.current = currentScrollY;
        return;
      }
      const scrollingDown = currentScrollY > lastScrollY.current;
      if (scrollingDown && lastAction.current !== "hide") {
        hideTabBar();
        lastAction.current = "hide";
      } else if (!scrollingDown && lastAction.current !== "show") {
        showTabBar();
        lastAction.current = "show";
      }
      lastScrollY.current = currentScrollY;
    },
    [hideTabBar, showTabBar]
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={visibleSections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        initialNumToRender={1}
        windowSize={5}
        extraData={loadingSectionId}
        removeClippedSubviews={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 16 }}
        ListFooterComponent={
          showInfiniteList && !loadingSectionId ? (
            <View
              style={{
                marginTop: 20,
                paddingBottom: Platform.OS === "ios" ? 40 : 25,
              }}
            >
              <ProductInfiniteList
                type="categoryData"
                url="getCategoryData/beauty-health"
              />
            </View>
          ) : null
        }
        decelerationRate="fast"
      />
    </SafeAreaView>
  );
}
