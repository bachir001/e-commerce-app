import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionContext } from "@/app/_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/home/Header";
import CategorySection from "@/components/home/Categories/CategorySection";
import { View, FlatList, ScrollView } from "react-native";
import {
  HOMEPAGE_SECTIONS,
  HomePageSectionProp,
} from "@/constants/HomePageSections";
import FeaturedSection from "@/components/home/Sections/FeaturedSection";

export default function HomeScreen() {
  const { setIsLogged, setUser, setToken } = useContext(SessionContext);
  const [viewableItems, setViewableItems] = useState({});

  useEffect(() => {
    const checkForToken = async () => {
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
    };

    checkForToken();
  }, []);

  const onViewableItemsChanged = useCallback(
    ({
      viewableItems: currentViewableItems,
    }: {
      viewableItems: { item: HomePageSectionProp; isViewable: boolean }[];
    }) => {
      const newViewableState = {};
      currentViewableItems.forEach((item) => {
        if (item.isViewable) {
          newViewableState[item.item.id] = true;
        }
      });
      setViewableItems(newViewableState);
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    waitForInteraction: true,
  });

  const renderItem = useCallback(
    ({ item }: { item: HomePageSectionProp }) => {
      switch (item.type) {
        case "header":
          return <Header />;
        case "all-categories":
          return <CategorySection />;
        case "best-sellers":
          return (
            <FeaturedSection
              description={item.description!}
              title={item.title!}
              type={item.type}
              fetchParams={item.fetchParams}
            />
          );
        case "new-arrivals":
          return (
            <FeaturedSection
              description={item.description!}
              title={item.title!}
              type={item.type}
              fetchParams={item.fetchParams}
            />
          );

        default:
          return null;
      }
    },
    [viewableItems]
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView style={{ flex: 1 }}>
        <Header />
        <CategorySection />
        <FeaturedSection
          description="Best Sellers"
          title="Best Sellers"
          type="best-sellers"
          fetchParams={{
            per_page: 15,
            sort: "price_high_low",
            page: 1,
          }}
        />
        <FeaturedSection
          description="New Arrivals"
          title="New Arrivals"
          type="new-arrivals"
          fetchParams={{
            per_page: 15,
            sort: "price_high_low",
            page: 1,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
