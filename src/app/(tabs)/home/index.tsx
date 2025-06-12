import React, {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionContext } from "@/app/_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/home/Header";
import CategorySection from "@/components/home/Categories/CategorySection";
import {
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import SpecificSection from "@/components/home/Sections/SpecificSection";
import { HOMEPAGE_SECTIONS } from "@/constants/HomePageSections";
import { Colors } from "@/constants/Colors";
import FeaturedSection from "@/components/home/Sections/FeaturedSection";
import ProductInfiniteList from "@/components/common/ProductInfiniteList";

//Data structure without the top sections and the initial section to render
const HOME_SCREEN_DATA_STRUCTURE = [
  {
    id: "beautyAndHealth",
    type: "specific",
  },
  {
    id: "medicalEquipment",
    type: "specific",
  },
  {
    id: "bestSellers",
    type: "featured",
  },
  {
    id: "agriculture",
    type: "specific",
  },
  {
    id: "hardwareAndFasteners",
    type: "specific",
  },
  {
    id: "homeAndLiving",
    type: "specific",
  },
  {
    id: "sportsAndOutdoors",
    type: "specific",
  },
];

export default function HomeScreen(): JSX.Element {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error("SessionContext is null. Make sure the provider is set.");
  }

  const { setIsLogged, setUser, setToken, newArrivals } = session;
  const [visibleSections, setVisibleSections] = useState([
    HOME_SCREEN_DATA_STRUCTURE[0],
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingSectionId, setLoadingSectionId] = useState<string | null>(null);
  const [loadMoreProducts, setLoadMoreProducts] = useState(false);
  const isBusy = useRef(false);
  const flatListRef = useRef<FlatList>(null);

  const checkForToken = useCallback(async () => {
    const token_ = await AsyncStorage.getItem("token");
    const userJSON = await AsyncStorage.getItem("user");
    let parsedUser;
    if (typeof userJSON === "string") {
      parsedUser = JSON.parse(userJSON);
    }

    if (token_ !== null && typeof token_ === "string") {
      setIsLogged(true);
      setToken(token_);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    checkForToken();
  }, [checkForToken]);

  const loadMoreSections = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (isBusy.current) return;

    if (loadingSectionId !== null) return;

    const nextSectionIndex = currentIndex + 1;
    if (nextSectionIndex >= HOME_SCREEN_DATA_STRUCTURE.length) {
      return; // No more sections to load
    }

    // Set busy flag immediately
    isBusy.current = true;

    const newSection = HOME_SCREEN_DATA_STRUCTURE[nextSectionIndex];
    setLoadingSectionId(newSection.id);

    setVisibleSections((prev) => [...prev, newSection]);

    setCurrentIndex(nextSectionIndex);
  }, [currentIndex, loadingSectionId]);

  const handleLoadComplete = useCallback(() => {
    setLoadMoreProducts(false);
  }, []);

  const handleSectionLoading = useCallback(
    (sectionId: string, isLoading: boolean) => {
      if (!isLoading) {
        if (loadingSectionId === sectionId) {
          setLoadingSectionId(null);
          isBusy.current = false;
        }
      } else {
        if (loadingSectionId === sectionId) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }
    },
    [loadingSectionId]
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof HOME_SCREEN_DATA_STRUCTURE)[0] }) => {
      const sectionData =
        HOMEPAGE_SECTIONS[item.id as keyof typeof HOMEPAGE_SECTIONS];

      if (!sectionData) {
        return <Text>Section not found</Text>;
      }

      switch (item.type) {
        case "featured":
          return (
            <FeaturedSection
              {...sectionData}
              setLoading={(loading: boolean) => {
                handleSectionLoading(item.id, loading);
              }}
            />
          );
        case "specific":
          return (
            <SpecificSection
              {...sectionData}
              color={
                Colors[item.id as keyof typeof HOMEPAGE_SECTIONS] ||
                Colors.PRIMARY
              }
              setLoading={(loading: boolean) => {
                handleSectionLoading(item.id, loading);
              }}
            />
          );
        default:
          return <Text>Unknown section type</Text>;
      }
    },
    [handleSectionLoading]
  );

  return (
    <SafeAreaView>
      <FlatList
        ref={flatListRef}
        data={visibleSections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (currentIndex < HOME_SCREEN_DATA_STRUCTURE.length - 1) {
            loadMoreSections();
          } else {
            setLoadMoreProducts(true);
          }
        }}
        ListHeaderComponent={
          <View style={{ flex: 1, width: "100%" }}>
            <Header />
            <CategorySection />

            {newArrivals !== undefined &&
              newArrivals !== null &&
              newArrivals.length > 0 && (
                <FeaturedSection list={true} type="new-arrivals" />
              )}
          </View>
        }
        initialNumToRender={1}
        windowSize={10}
        onEndReachedThreshold={0.1}
        removeClippedSubviews={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        ListFooterComponent={
          currentIndex >= HOME_SCREEN_DATA_STRUCTURE.length - 1 &&
          loadingSectionId === null ? (
            <View className="w-full mt-4">
              <ProductInfiniteList
                type="categoryData"
                url="getCategoryData/beauty-health"
                loadMoreProducts={loadMoreProducts}
                onLoadComplete={handleLoadComplete}
              />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
