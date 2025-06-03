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
  ActivityIndicator,
  FlatList,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  Text,
} from "react-native";
import FeaturedSection from "@/components/home/Sections/FeaturedSection";
import { HOMEPAGE_SECTIONS } from "@/constants/HomePageSections";
import SpecificSection from "@/components/home/Sections/SpecificSection";
import { Colors } from "@/constants/Colors";
import ProductInfiniteList from "@/components/common/ProductInfiniteList";

// Types
interface SectionLayout {
  y: number;
  height: number;
}

interface SectionConfig {
  id: string;
  component: "featured" | "specific" | "infinite";
  props: any;
}

interface LazySectionProps {
  section: SectionConfig;
  shouldLoad: boolean;
  onLayout: (event: LayoutChangeEvent) => void;
}

const COMPONENT_HEIGHT_ESTIMATES = {
  featured: 550,
  specific: 550,
};

const SECTIONS_CONFIG: SectionConfig[] = [
  {
    id: "beautyAndHealth",
    component: "specific",
    props: {
      ...HOMEPAGE_SECTIONS.beautyAndHealth,
      color: Colors.BeautyAndHealth,
    },
  },
  {
    id: "medicalEquipment",
    component: "specific",
    props: {
      ...HOMEPAGE_SECTIONS.medicalEquipment,
      color: Colors.MedicalEquipment,
    },
  },
  {
    id: "bestSellers",
    component: "featured",
    props: { ...HOMEPAGE_SECTIONS.bestSellers },
  },
  {
    id: "agriculture",
    component: "specific",
    props: {
      ...HOMEPAGE_SECTIONS.agriculture,
      color: Colors.Agriculture,
    },
  },
  {
    id: "hardwareAndFasteners",
    component: "specific",
    props: {
      ...HOMEPAGE_SECTIONS.hardwareAndFasteners,
      color: Colors.Hardware,
    },
  },
  {
    id: "homeAndLiving",
    component: "specific",
    props: {
      ...HOMEPAGE_SECTIONS.homeAndLiving,
      color: Colors.PRIMARY,
    },
  },
  {
    id: "sportsAndOutdoors",
    component: "specific",
    props: {
      ...HOMEPAGE_SECTIONS.sportsAndOutdoors,
      color: Colors.Hardware,
    },
  },
  {
    id: "allProducts",
    component: "infinite",
    props: {
      type: "categoryData",
      url: "getCategoryData/beauty-health",
    },
  },
];

const LazySection: React.FC<LazySectionProps> = ({
  section,
  shouldLoad,
  onLayout,
}) => {
  const [actualHeight, setActualHeight] = useState<number | null>(null);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setActualHeight(height);
      onLayout(event);
    },
    [onLayout]
  );

  if (!shouldLoad) {
    const height =
      actualHeight ||
      (section.component === "infinite"
        ? 0
        : COMPONENT_HEIGHT_ESTIMATES[section.component]);
    return (
      <View
        style={{
          height: height,
          backgroundColor: "transparent",
        }}
        onLayout={onLayout}
      />
    );
  }

  if (section.component === "featured") {
    return <FeaturedSection {...section.props} onLayout={handleLayout} />;
  } else if (section.component === "specific") {
    return <SpecificSection {...section.props} onLayout={handleLayout} />;
  } else {
    return <ProductInfiniteList {...section.props} />;
  }
};

export default function HomeScreen(): JSX.Element {
  const { setIsLogged, setUser, setToken, newArrivals } =
    useContext(SessionContext);
  const [loadedSections, setLoadedSections] = useState<Set<string>>(
    new Set() // Start with empty set since newArrivals is now in header
  );
  const [isLoadingNewSections, setIsLoadingNewSections] = useState(false);
  const sectionRefs = useRef<Record<string, SectionLayout>>({});
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

  const handleSectionLayout = useCallback(
    (sectionId: string) => (event: LayoutChangeEvent) => {
      const { y, height } = event.nativeEvent.layout;
      sectionRefs.current[sectionId] = { y, height };
    },
    []
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isLoadingNewSections) return;

      const scrollY = event.nativeEvent.contentOffset.y;
      const viewportHeight = event.nativeEvent.layoutMeasurement.height;

      const loadThreshold = 50;

      const sortedSections = Object.entries(sectionRefs.current).sort(
        ([, a], [, b]) => a.y - b.y
      );

      let hasNewSectionsToLoad = false;
      const sectionsToLoad = new Set<string>();

      sortedSections.forEach(([sectionId, layout], index) => {
        if (!loadedSections.has(sectionId)) {
          const sectionTop = layout.y;
          const distanceToSection = sectionTop - (scrollY + viewportHeight);

          if (distanceToSection <= loadThreshold) {
            hasNewSectionsToLoad = true;
            sectionsToLoad.add(sectionId);

            if (index + 1 < sortedSections.length) {
              const nextSectionId = sortedSections[index + 1][0];
              sectionsToLoad.add(nextSectionId);
            }
          }
        }
      });

      if (hasNewSectionsToLoad) {
        setIsLoadingNewSections(true);

        const currentScrollY = scrollY;

        setTimeout(() => {
          setLoadedSections((prev) => {
            const newSet = new Set([...prev, ...sectionsToLoad]);
            return newSet;
          });

          setTimeout(() => {
            setIsLoadingNewSections(false);
          }, 100);
        }, 300);
      }
    },
    [loadedSections, isLoadingNewSections]
  );

  useEffect(() => {
    if (SECTIONS_CONFIG.length > 0) {
      setLoadedSections(new Set([SECTIONS_CONFIG[0].id]));
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SectionConfig }) => (
      <LazySection
        key={item.id}
        section={item}
        shouldLoad={loadedSections.has(item.id)}
        onLayout={handleSectionLayout(item.id)}
      />
    ),
    [loadedSections, handleSectionLayout]
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={SECTIONS_CONFIG}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Header />
            <CategorySection />
            <FeaturedSection
              {...HOMEPAGE_SECTIONS.newArrivals}
              list={newArrivals}
            />
          </>
        }
        renderItem={renderItem}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      />
    </SafeAreaView>
  );
}
