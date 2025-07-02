import InfiniteList from "@/components/common/InfiniteList";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeaturedPage() {
  const { pageName, slug } = useLocalSearchParams();
  useEffect(() => {
    console.log(slug);
  }, []);
  return (
    <SafeAreaView>
      <Text>{pageName}</Text>
      <InfiniteList
        isBrand={false}
        color="#5e3ebd"
        slug={Array.isArray(slug) ? slug[0] : slug}
        isFeatured
      />
    </SafeAreaView>
  );
}
