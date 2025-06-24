import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import Header from "@/components/home/Header";
import CategorySection from "@/components/home/Categories/CategorySection";
import { FlatList, View } from "react-native";
import SpecificSection from "@/components/home/Sections/SpecificSection";
import { HOMEPAGE_SECTIONS } from "@/constants/HomePageSections";
import { Colors } from "@/constants/Colors";
import FeaturedSection from "@/components/home/Sections/FeaturedSection";
import ProductInfiniteList from "@/components/common/ProductInfiniteList";
import { useSessionStore } from "@/store/useSessionStore";
import { useAppDataStore } from "@/store/useAppDataStore";

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
  const { setIsLogged, setUser, setToken } = useSessionStore();
  const { newArrivals } = useAppDataStore();

  const [visibleSections, setVisibleSections] = useState([
    HOME_SCREEN_DATA_STRUCTURE[0],
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingSectionId, setLoadingSectionId] = useState<string | null>(null);
  const [showInfiniteList, setShowInfiniteList] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  const isBusy = useRef(false);
  const flatListRef = useRef<FlatList>(null);

  const checkForToken = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const userJSON = await SecureStore.getItemAsync("user");

      if (token) {
        setIsLogged(true);
        setToken(token);
        if (userJSON) {
          setUser(JSON.parse(userJSON));
        }
      }
    } catch (error) {
      console.error("Token check error:", error);
    }
  }, [tokenChecked]);

  useEffect(() => {
    checkForToken();
  }, [checkForToken]);

  const handleSectionLoading = useCallback(
    (sectionId: string, isLoading: boolean) => {
      if (!isLoading && loadingSectionId === sectionId) {
        setLoadingSectionId(null);
        isBusy.current = false;
      }
    },
    [loadingSectionId]
  );

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
              setLoading={(loading: boolean) =>
                handleSectionLoading(item.id, loading)
              }
            />
          );
        case "specific":
          return (
            <SpecificSection
              {...sectionData}
              color={Colors[item.id as keyof typeof Colors] || Colors.PRIMARY}
              setLoading={(loading: boolean) =>
                handleSectionLoading(item.id, loading)
              }
            />
          );
        default:
          return null;
      }
    },
    [handleSectionLoading]
  );

  const handleEndReached = useCallback(() => {
    if (currentIndex < HOME_SCREEN_DATA_STRUCTURE.length - 1) {
      loadMoreSections();
    } else if (!showInfiniteList) {
      setShowInfiniteList(true);
    }
  }, [currentIndex, loadMoreSections, showInfiniteList]);

  const ListHeader = useMemo(
    () => (
      <View style={{ flex: 1, width: "100%" }}>
        <Header />
        <CategorySection />
        {newArrivals && newArrivals?.length > 0 && (
          <FeaturedSection list={true} type="new-arrivals" />
        )}
      </View>
    ),
    [newArrivals]
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
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        initialNumToRender={1}
        windowSize={5}
        extraData={loadingSectionId}
        removeClippedSubviews={false}
        ListFooterComponent={
          showInfiniteList && !loadingSectionId ? (
            <View style={{ marginTop: 20 }}>
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
