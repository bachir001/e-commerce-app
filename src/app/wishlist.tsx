import EmptyState from "@/components/common/EmptyList";
import ProductCardWide from "@/components/common/product/ProductCardWide";
import {
  Text,
  View,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Heart, Filter } from "lucide-react-native";
import { useSessionStore } from "@/store/useSessionStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Product } from "@/types/globalTypes";
import { useQuery } from "@tanstack/react-query";
import axiosApi from "@/apis/axiosApi";
import DotsLoader from "@/components/common/AnimatedLayout";
import ErrorState from "@/components/common/ErrorState";

export default function Wishlist() {
  const { token } = useSessionStore();
  const insets = useSafeAreaInsets();

  const {
    data: wishList,
    isLoading,
    isRefetching,
    isError,
    refetch,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["wishlist", token],
    queryFn: async () => {
      if (!token) {
        throw new Error("Authentication token not available.");
      }
      const response = await axiosApi.get("/favorite", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        return [];
      }

      return response.data.data || [];
    },
    enabled: !!token,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const onRefresh = () => {
    refetch();
  };

  const renderHeaderContent = () => (
    <View className="px-6 pb-6" style={{ paddingTop: insets.top + 16 }}>
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: "#f3f0ff" }}
          >
            <Heart size={24} color="#6e3ebd" />
          </View>
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              My Wishlist
            </Text>
            <Text className="text-gray-500 text-sm">
              {wishList ? `${wishList.length} items saved` : ""}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <Filter size={18} color="#6e3ebd" />
        </TouchableOpacity>
      </View>

      <View
        className="p-4 rounded-2xl mb-4"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              Save More, Shop Later
            </Text>
            <Text className="text-sm text-gray-600">
              Keep track of items you love and get notified of price drops
            </Text>
          </View>
          <View
            className="w-12 h-12 rounded-full items-center justify-center ml-4"
            style={{ backgroundColor: "#6e3ebd" }}
          >
            <Heart size={20} color="white" fill="white" />
          </View>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCardWide product={item} />
  );

  const renderFooter = () => {
    if (!wishList || wishList.length === 0) return null;

    return (
      <View className="px-6 py-8">
        <View
          className="p-6 rounded-2xl items-center"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: "#e8f5e8" }}
          >
            <Heart size={24} color="#22c55e" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
            Share Your Wishlist
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            Let friends and family know what you're hoping for
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-full"
            style={{ backgroundColor: "#6e3ebd" }}
          >
            <Text className="text-white font-semibold">Share Wishlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: "#f3f0ff" }}
          ></View>
          <DotsLoader />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ErrorState
          onRetry={refetch}
          title="Failed to load wishlist"
          subtitle={error.message}
        />
      </SafeAreaView>
    );
  }

  if (wishList && wishList.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        {renderHeaderContent()}
        <EmptyState
          title="No items in your wishlist"
          subtitle="Start adding items to your wishlist now!"
          icon="wishlist"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderHeaderContent()}
      <FlatList
        data={wishList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={["#6e3ebd"]}
            tintColor="#6e3ebd"
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}
