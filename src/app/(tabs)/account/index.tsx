import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Header from "@/components/account/AccountHeader";
import IconGrid, { type IconGridItem } from "@/components/account/IconGrid";
import Footer from "@/components/account/Footer";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper: generate Unicode flag emoji from ISO country code
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

  // Memoize language options so we don't recreate on every render
  const languages = useMemo(
    () => [
      { code: "en", flag: getFlagEmoji("US") },
      // { code: 'fr', flag: getFlagEmoji('FR') },
    ],
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
        onPress: () => {
          /* TODO */
        },
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View>
        <Header
          logo={require("@/assets/images/logo.png")}
          greeting="Hello, welcome to Go Cami!"
          languages={languages}
        />

        <View className="mt-4 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <IconGrid items={contactItems} />
        </View>

        <View className="mt-4 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <Text className="font-semibold px-6 pt-4 text-gray-800 text-lg">
            Help Center
          </Text>
          <IconGrid items={helpItems} />
        </View>

        <Footer
          socials={[
            {
              icon: "facebook",
              url: "https://www.facebook.com/GoCamiShop/",
              brand: true,
            },
            { icon: "tiktok", url: "https://tiktok.com", brand: true },
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
  },
  gridSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 12,
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: "bold",
  },
  spacer: {
    flex: 1,
  },
});
