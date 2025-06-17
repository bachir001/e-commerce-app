// src/app/components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Pressable,
  Text,
  ActivityIndicator,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import DotsLoader from "./common/AnimatedLayout";

interface MegaCategory {
  id: number;
  name: string;
  slug: string;
  level: string;
  mega_primary: boolean;
  mega_bg: string;
  mega_mobile_bg: string;
  mega_title: string;
  mega_title_color: string;
  mega_description: string;
  mega_description_color: string;
}

export default function Sidebar() {
  const router = useRouter();
  const [cats, setCats] = useState<MegaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<{
        status: boolean;
        message: string;
        data: MegaCategory[];
        code: number;
      }>("https://api-gocami-test.gocami.com/api/getMegaCategories")
      .then((res) => {
        if (!res.data.status) {
          throw new Error(res.data.message || "Unknown API error");
        }
        setCats(res.data.data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <DotsLoader size="small" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">
          Unable to load categories:{"\n"}
          {error}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="bg-gray"
      contentContainerStyle={{ paddingVertical: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Static Categories Item */}
      <Pressable
        key="categories-all"
        onPress={() => router.push("/(tabs)/categories")}
        className="px-3 py-2 mb-1"
      >
        <Text className="text-sm font-medium">Categories</Text>
      </Pressable>

      {/* Dynamic Categories from API */}
      {cats.map((cat) => (
        <Pressable
          key={cat.id}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/categories/[slug]",
              params: { slug: cat.slug },
            })
          }
          className="px-3 py-2 mb-1"
        >
          <Text className="text-sm font-medium">{cat.name}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
