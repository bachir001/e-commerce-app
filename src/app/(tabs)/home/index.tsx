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
} from "react-native";
import FeaturedSection from "@/components/home/Sections/FeaturedSection";
import { HOMEPAGE_SECTIONS } from "@/constants/HomePageSections";
import SpecificSection from "@/components/home/Sections/SpecificSection";
import { Colors } from "@/constants/Colors";

const { height: screenHeight } = Dimensions.get("window");

// Types
interface SectionLayout {
  y: number;
  height: number;
}

interface SectionConfig {
  id: string;
  component: "featured" | "specific";
  props: any; // You can make this more specific based on your section props
}

interface LazySectionProps {
  section: SectionConfig;
  shouldLoad: boolean;
  onLayout: (event: LayoutChangeEvent) => void;
}

// Define all your sections with metadata
const SECTIONS_CONFIG: SectionConfig[] = [
  {
    id: "newArrivals",
    component: "featured",
    props: { ...HOMEPAGE_SECTIONS.newArrivals },
  },
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
];

// Lazy wrapper component for sections
const LazySection: React.FC<LazySectionProps> = ({
  section,
  shouldLoad,
  onLayout,
}) => {
  if (!shouldLoad) {
    return (
      <View
        style={{ minHeight: 200 }} // Placeholder height
        onLayout={onLayout}
      />
    );
  }

  if (section.component === "featured") {
    return <FeaturedSection {...section.props} />;
  } else {
    return <SpecificSection {...section.props} />;
  }
};

export default function HomeScreen(): JSX.Element {
  const { setIsLogged, setUser, setToken } = useContext(SessionContext);
  const [loadedSections, setLoadedSections] = useState<Set<string>>(
    new Set(["newArrivals"])
  ); // Load first section immediately
  const sectionRefs = useRef<Record<string, SectionLayout>>({});

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
      const scrollY = event.nativeEvent.contentOffset.y;
      const viewportHeight = event.nativeEvent.layoutMeasurement.height;

      // Load sections that are about to become visible (within 300px)
      const loadThreshold = 100;

      Object.entries(sectionRefs.current).forEach(([sectionId, layout]) => {
        if (!loadedSections.has(sectionId)) {
          const sectionTop = layout.y;
          const sectionBottom = layout.y + layout.height;

          // Check if section is about to be visible
          if (sectionTop <= scrollY + viewportHeight + loadThreshold) {
            setLoadedSections((prev) => new Set([...prev, sectionId]));
          }
        }
      });
    },
    [loadedSections]
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={[{ key: "content" }]}
        renderItem={() => (
          <View>
            <Header />
            <CategorySection />
            {SECTIONS_CONFIG.map((section) => (
              <LazySection
                key={section.id}
                section={section}
                shouldLoad={loadedSections.has(section.id)}
                onLayout={handleSectionLayout(section.id)}
              />
            ))}
          </View>
        )}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
