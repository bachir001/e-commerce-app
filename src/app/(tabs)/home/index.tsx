import React, { useContext, useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import { ParallaxFlatList } from "@/components/common/ParallaxFlatList";
import { HeaderView } from "@/components/common/HeaderView";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/common/IconSymbol";
import ProductsList from "@/components/ProductList";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionContext } from "@/app/_layout";
import { storage } from "@/Services/mmkv";

export default function HomeScreen() {
  // const rawScheme = useColorScheme();
  // const scheme = rawScheme === "dark" ? "dark" : "light";

  const { setIsLogged } = useContext(SessionContext);

  const sections = useMemo(
    () => [
      { key: "header", element: <HeaderView /> },
      {
        key: "title",
        element: (
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={styles.titleText}>
              New Arrivals
            </ThemedText>
          </ThemedView>
        ),
      },
      { key: "products", element: <ProductsList /> },
    ],
    []
  );

  useEffect(() => {
    const checkForToken = async () => {
      const token_ = storage.getString("token");
      const userJSON = storage.getString("user");

      console.log(userJSON);

      let parsedUser;
      if (typeof userJSON === "string") {
        parsedUser = JSON.parse(userJSON);
      }

      if (token_ !== null && typeof token_ === "string") {
        setIsLogged(true);
        // setToken(token_);
        // setUser(parsedUser);
      }
    };

    checkForToken();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ParallaxFlatList<(typeof sections)[0]>
        data={sections}
        renderItem={({ item }) => item.element}
        keyExtractor={(item) => item.key}
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="sparkles"
            style={styles.headerImage}
          />
        }
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    position: "absolute",
    bottom: -90,
    left: -35,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 25,
    marginLeft: 0,
    marginTop: 0,
  },
  contentContainer: {
    paddingHorizontal: 0,
    paddingBottom: 48,
  },
});
