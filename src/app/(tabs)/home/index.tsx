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
  const { setIsLogged, setUser, setToken } = useContext(SessionContext);
  const [visibleSections, setVisibleSections] = useState(
    HOME_SCREEN_DATA_STRUCTURE.slice(0, 2)
  );

  const [currentIndex, setCurrentIndex] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false); // Renamed for clarity

  const isBusy = useRef(false);

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

  const loadMore = useCallback(() => {
    if (isBusy.current || loadingMore) return;

    if (currentIndex >= HOME_SCREEN_DATA_STRUCTURE.length - 1) return;

    isBusy.current = true;
    setLoadingMore(true);

    // Simulate loading delay to show indicator
    setTimeout(() => {
      const newSections = HOME_SCREEN_DATA_STRUCTURE.slice(
        currentIndex + 1,
        currentIndex + 2
      );

      setVisibleSections((prev) => [...prev, ...newSections]);
      setCurrentIndex((prev) => prev + 1);
      setLoadingMore(false);
      isBusy.current = false;
    }, 300); // Small delay to show loading indicator
  }, [currentIndex, loadingMore]);

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
              setLoading={() => {}} // Remove individual loading management
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
              setLoading={() => {}} // Remove individual loading management
            />
          );
        default:
          return <Text>Unknown section type</Text>;
      }
    },
    []
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }, [loadingMore]);

  return (
    <SafeAreaView>
      <FlatList
        data={visibleSections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        ListHeaderComponent={
          <>
            <Header />
            <CategorySection />
          </>
        }
        ListFooterComponent={renderFooter}
        initialNumToRender={2}
        windowSize={10}
        onEndReachedThreshold={0.1}
        // Removed getItemLayout to prevent jumping
        removeClippedSubviews={false}
        scrollEnabled={!scrollDisabled}
        // Add these props to improve performance and reduce jumping
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
    </SafeAreaView>
  );
}
