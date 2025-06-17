import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ParallaxFlatList } from "@/components/common/ParallaxFlatList";
import { Collapsible } from "@/components/Collapsible";
import { ThemedText } from "@/components/common/ThemedText";
import { ThemedView } from "@/components/common/ThemedView";
import { IconSymbol } from "@/components/common/IconSymbol";
import { Link } from "expo-router";
import DotsLoader from "@/components/common/AnimatedLayout";

interface Banner {
  text: string | null;
  link: string;
  image: string;
}
interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  banners: Banner[];
}
interface RelatedCategory {
  id: number;
  name: string;
  slug: string;
  children?: RelatedCategory[];
}
interface CategorySection {
  categoryInfo: CategoryInfo;
  relatedCategories: RelatedCategory[];
}

export default function CategoriesScreen() {
  const [sectionsData, setSectionsData] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const trimLongWords = (text: string) => {
    const maxLength = 9;
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  useEffect(() => {
    fetch("https://newapi.gocami.com/api/categories-menu")
      .then((res) => res.json())
      .then((json) => {
        if (json.status) setSectionsData(json.data);
        else setError("Failed to load categories");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  const headerImage = (
    <IconSymbol
      size={310}
      color="#808080"
      name="chevron.left.forwardslash.chevron.right"
      style={styles.headerImage}
    />
  );

  if (loading)
    return (
      <ThemedView style={styles.center}>
        <DotsLoader />
      </ThemedView>
    );
  if (error)
    return (
      <ThemedView style={styles.center}>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );

  const items = [
    {
      key: "page-title",
      element: (
        <View style={styles.titleContainer}>
          <ThemedText type="title">Categories</ThemedText>
        </View>
      ),
    },
    ...sectionsData.flatMap((section) => {
      const { categoryInfo, relatedCategories } = section;
      const banner = categoryInfo.banners[0]; // use only first image
      return [
        {
          key: `header-${categoryInfo.id}`,
          element: (
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="subtitle">{categoryInfo.name}</ThemedText>
            </ThemedView>
          ),
        },
        banner && {
          key: `banner-${categoryInfo.id}`,
          element: (
            <TouchableOpacity
              style={styles.singleBannerWrapper}
              onPress={() => {
                /* navigate to banner.link */
              }}
            >
              <ImageBackground
                source={{ uri: banner.image }}
                resizeMode="cover"
                style={styles.singleBanner}
              >
                {banner.text && (
                  <View style={styles.bannerOverlay}>
                    <ThemedText style={styles.bannerText}>
                      {banner.text}
                    </ThemedText>
                  </View>
                )}
              </ImageBackground>
            </TouchableOpacity>
          ),
        },
        {
          key: `related-${categoryInfo.id}`,
          element: (
            <Collapsible title="Related Categories">
              <View style={styles.grid}>
                {relatedCategories.map((rc) => (
                  <Link
                    key={rc.id}
                    href={{
                      pathname: "/(tabs)/categories/[slug]/[catProds]",
                      params: {
                        slug: rc.slug, // Add the missing slug parameter
                        catProds: rc.slug,
                        name: rc.name,
                        model_id: categoryInfo.id, // ← here!
                      },
                    }}
                    asChild
                  >
                    <TouchableOpacity
                      key={rc.id}
                      style={styles.card}
                      onPress={() => {
                        /* navigate */
                      }}
                      onLongPress={() => Alert.alert(rc.name)} // Shows full name in a popup
                    >
                      <ThemedText style={styles.cardText}>
                        {trimLongWords(rc.name)}
                      </ThemedText>
                    </TouchableOpacity>
                  </Link>
                ))}
              </View>
            </Collapsible>
          ),
        },
      ].filter(Boolean as any);
    }),
  ];

  return (
    <ParallaxFlatList<(typeof items)[0]>
      data={items}
      renderItem={({ item }) => item.element}
      keyExtractor={(item) => item.key}
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={headerImage}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerImage: { position: "absolute", bottom: -90, left: -35 },
  titleContainer: { marginBottom: 16 },
  sectionHeader: { marginTop: 24, marginBottom: 8 },
  singleBannerWrapper: {
    alignSelf: "center",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  singleBanner: { width: 200, height: 100, justifyContent: "flex-end" },
  bannerOverlay: { backgroundColor: "rgba(0,0,0,0.4)", padding: 6 },
  bannerText: { color: "#fff", fontWeight: "600" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
    marginBottom: 12,
  },
  cardText: { textAlign: "center", fontWeight: "500", fontSize: 12 },
});
