import { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking, // Make sure to import Linking for phone/email if you use them
} from "react-native";
import { useRouter } from "expo-router";
import Header from "@/components/account/AccountHeader";
import IconGrid, { type IconGridItem } from "@/components/account/IconGrid";
import Footer from "@/components/account/Footer";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionContext, UserContext } from "@/app/_layout";
import { FontAwesome5 } from "@expo/vector-icons";
import ContactModal from "@/components/account/ContactModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const { isLogged, setIsLogged, user } = useContext(SessionContext);

  const [isContactModalVisible, setContactModalVisible] = useState(false);

  // let user;
  // if (storage.getString("user") !== null) {
  //   user = JSON.parse(storage.getString("user")!);
  // }

  const openContactSheet = () => {
    setContactModalVisible(true);
  };

  const closeContactModal = () => {
    setContactModalVisible(false);
  };

  const languages = useMemo(
    () => [{ code: "en", flag: getFlagEmoji("US") }],
    []
  );

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

  const productItems: IconGridItem[] = useMemo(
    () => [
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
    ],
    [router]
  );

  const orderItems: IconGridItem[] = useMemo(
    () => [
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
    ],
    [router]
  );

  const helpItems: IconGridItem[] = useMemo(
    () => [
      {
        icon: "headset",
        label: "Get Support",
        onPress: () => {
          /* TODO */
        },
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
    await Promise.all([
      AsyncStorage.removeItem("token"),
      AsyncStorage.removeItem("user"),
    ]);
    // setUser(null);
    // setToken(null);
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
                    onPress={() => router.push("/profile/edit")}
                    className="bg-gray-100 px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-sm font-medium text-indigo-600">
                      Edit Profile
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center py-2">
                  <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                    <FontAwesome5 name="user" size={16} color="#6366F1" />
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
