import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

import { router, useRouter } from "expo-router";
import Header from "@/components/account/AccountHeader";
import IconGrid, { type IconGridItem } from "@/components/account/IconGrid";
import Footer from "@/components/account/Footer";
import { SafeAreaView } from "react-native-safe-area-context";

import { FontAwesome5 } from "@expo/vector-icons";
import ContactModal from "@/components/account/ContactModal";
import * as SecureStore from "expo-secure-store";
import { Colors } from "@/constants/Colors";
import { useSessionStore } from "@/store/useSessionStore";
import { logoutOneSignal } from "@/Services/OneSignalService";

const serviceItems = [
  {
    icon: "bell",
    label: "My Notifications",
    onPress: () => router.push("/notifications"),
  },
];

const productItems = [
  {
    icon: "heart",
    label: "Wishlist",
    onPress: () => router.push("/wishlist"),
  },
  {
    icon: "tag",
    label: "Brands",
    onPress: () => router.push("/brands"),
  },
  {
    icon: "shopping-cart",
    label: "Cart",
    onPress: () => router.push("/(tabs)/cart"),
  },
];

const orderItems = [
  {
    icon: "box",
    label: "Picked up",
    onPress: () => router.push("/orders/picked-up"),
  },
  {
    icon: "times-circle",
    label: "Cancelled",
    onPress: () => router.push("/orders/cancelled"),
  },
  {
    icon: "star",
    label: "Reviews",
    onPress: () => router.push("/orders/reviews"),
  },
];

const languages = [{ code: "en", flag: getFlagEmoji("US") }];

function getFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 0x41)
    .map((cp) => String.fromCodePoint(cp))
    .join("");
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, isLogged, setIsLogged, setUser, setToken } = useSessionStore();

  const [isContactModalVisible, setContactModalVisible] = useState(false);

  const openContactSheet = () => {
    setContactModalVisible(true);
  };

  const closeContactModal = () => {
    setContactModalVisible(false);
  };

  const contactItems: IconGridItem[] = useMemo(
    () => [
      {
        icon: "user",
        label: "Sign in",
        onPress: () => router.push("/auth/signIn"),
      },
      {
        icon: "user-plus",
        label: "Sign up",
        onPress: () => router.push("/auth/signUp"),
      },
      {
        icon: "phone",
        label: "Contact",
        onPress: openContactSheet,
      },
    ],
    [router]
  );

  const helpItems: IconGridItem[] = useMemo(
    () => [
      {
        icon: "headset",
        label: "Get Support",
        onPress: () => {},
      },
      {
        icon: "question-circle",
        label: "FAQ",
        onPress: () => {
          /* TODO */
        },
      },
      {
        icon: "file-contract",
        label: "Legal",
        onPress: () => {
          /* TODO */
        },
      },
    ],
    []
  );

  const handleSignOut = async () => {
    logoutOneSignal();

    await Promise.all([
      SecureStore.deleteItemAsync("token"),
      SecureStore.deleteItemAsync("user"),
    ]);
    setUser(null);
    setToken(null);
    setIsLogged(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        <View>
          <Header
            logo={require("@/assets/images/logo.png")}
            greeting={
              !isLogged
                ? "Hello, welcome to Go Cami!"
                : `Hello, ${user?.first_name || "User"}`
            }
            languages={languages}
          />

          {!isLogged ? (
            <View className="mt-4 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
              <IconGrid items={contactItems} />
            </View>
          ) : (
            <>
              <View className="mt-4 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden p-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-semibold text-gray-800 text-lg">
                    Account Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/account/profile/edit")}
                    className="bg-gray-100 px-3 py-1.5 rounded-full"
                  >
                    <Text
                      className={`text-sm font-medium`}
                      style={{ color: Colors.PRIMARY }}
                    >
                      Edit Profile
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center py-2">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-3`}
                  >
                    <FontAwesome5 name="user" size={16} color="#5e3ebd" />
                  </View>
                  <View>
                    <Text className="font-medium text-gray-800">
                      {user?.first_name || "User"} {user?.last_name || ""}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {user?.email || "user@example.com"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/account/addresses")}
                >
                  <View
                    className={`flex-row items-center py-2 px-3 rounded-lg mt-5`}
                    style={{
                      transform: [{ translateX: -10 }],
                      backgroundColor: Colors.PRIMARY,
                    }}
                  >
                    <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                      <FontAwesome5
                        name="map-marker-alt"
                        size={16}
                        color="#5e3ebd"
                      />
                    </View>
                    <View>
                      <Text className="font-medium text-white">Addresses</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <View className="mt-4 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
                <Text className="font-semibold px-6 pt-4 text-gray-800 text-lg">
                  My Products
                </Text>
                <IconGrid items={productItems} />
              </View>

              <View className="mt-4 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
                <Text className="font-semibold px-6 pt-4 text-gray-800 text-lg">
                  My Orders
                </Text>
                <IconGrid items={orderItems} />
              </View>
            </>
          )}

          <View className="mt-4 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
            <Text className="font-semibold px-6 pt-4 text-gray-800 text-lg">
              Help Center
            </Text>
            <IconGrid items={helpItems} />
          </View>

          <View className="mt-4 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
            <Text className="font-semibold px-6 pt-4 text-gray-800 text-lg">
              Services
            </Text>
            <IconGrid items={serviceItems} />
          </View>

          {isLogged && (
            <TouchableOpacity
              onPress={handleSignOut}
              className="mt-4 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden p-4 flex-row items-center"
            >
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="sign-out-alt" size={16} color="#EF4444" />
              </View>
              <Text className="font-medium text-red-500">Sign Out</Text>
            </TouchableOpacity>
          )}

          <Footer
            socials={[
              {
                icon: "facebook",
                url: "https://www.facebook.com/GoCamiShop/",
                brand: true,
              },
              {
                icon: "tiktok",
                url: "https://www.tiktok.com/@gocami.shop?_t=ZS-8wafQeRo9up&_r=1",
                brand: true,
              },
              {
                icon: "linkedin",
                url: "https://www.linkedin.com/company/gocami/posts/?feedView=all",
                brand: true,
              },
              {
                icon: "instagram",
                url: "https://www.instagram.com/gocami.shop/",
                brand: true,
              },
              { icon: "twitter", url: "https://x.com", brand: true },
            ]}
            version="0.1"
          />
        </View>
      </ScrollView>

      <ContactModal
        isVisible={isContactModalVisible}
        onClose={closeContactModal}
      />
    </SafeAreaView>
  );
}
