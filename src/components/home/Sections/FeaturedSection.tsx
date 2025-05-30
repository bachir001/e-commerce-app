"use client";

import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import axiosApi from "@/apis/axiosApi";
import type { Product } from "@/types/globalTypes";
import ProductCard from "@/components/common/ProductCard";
import ProductSkeleton from "@/components/common/ProductSkeleton";

interface FeaturedSectionProps {
  title: string;
  description: string;
  fetchParams?: {
    per_page: number;
    page: number;
    sort: string;
  };
  type: string;
  onViewMorePress?: () => void;
}

export default function FeaturedSection({
  title,
  description,
  fetchParams,
  type,
  onViewMorePress,
}: FeaturedSectionProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        console.log("HEYYY FROM ", type);

        const params = new URLSearchParams();

        if (fetchParams) {
          for (const key in fetchParams) {
            const isOwn = fetchParams.hasOwnProperty(key);
            if (
              isOwn &&
              fetchParams[key as keyof typeof fetchParams] !== undefined
            ) {
              params.append(
                key,
                String(fetchParams[key as keyof typeof fetchParams])
              );
            }
          }
        }

        const queryString = params.toString();
        const url = `${type}${queryString ? `?${queryString}` : ""}`;

        const response = await axiosApi.get(url);
        console.log(response.data.data.results);
        if (response.data.status) {
          setData(response.data.data.results);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, fetchParams]);

  const renderProduct = ({ item }: { item: Product }) => {
    if (loading) {
      return <ProductSkeleton />;
    }

    return (
      <View className="mr-3">
        <ProductCard product={item} loading={loading} />
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#5e3ebd", "#8b7bd8", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="py-4"
    >
      {/* Header Section */}
      <View className="flex-row justify-between items-start px-4 mb-4">
        <View className="flex-1 mr-4">
          <Text className="text-white text-xl font-bold mb-1">{title}</Text>
          <Text className="text-white/80 text-sm">{description}</Text>
        </View>

        <TouchableOpacity
          onPress={onViewMorePress}
          className="bg-white/20 px-3 py-2"
        >
          <Text className="text-white font-semibold text-sm">View More</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={data}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View className="w-2" />}
      />
    </LinearGradient>
  );
}
