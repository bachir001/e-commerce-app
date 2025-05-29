import React, { useContext, useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionContext } from "@/app/_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/home/Header";
import CategorySection from "@/components/home/Categories/CategorySection";
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
    <SafeAreaView className="flex-1">
      <Header />
      <CategorySection />
    </SafeAreaView>
  );
}
