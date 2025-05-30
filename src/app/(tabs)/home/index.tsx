import React, { useContext, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionContext } from "@/app/_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/home/Header";
import CategorySection from "@/components/home/Categories/CategorySection";
import { ScrollView } from "react-native";

import FeaturedSection from "@/components/home/Sections/FeaturedSection";

export default function HomeScreen() {
  const { setIsLogged, setUser, setToken } = useContext(SessionContext);

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
