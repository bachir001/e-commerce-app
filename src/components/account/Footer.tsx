// components/Footer.tsx
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof FontAwesome5>["name"];

interface Social {
  icon: IconName;
  url: string;
  /** set true for brand icons (facebook, tiktok, etc.) */
  brand?: boolean;
}

export default function Footer({
  socials,
  version,
}: {
  socials: Social[];
  version: string;
}) {
  return (
    <View className="flex flex-col items-center bg-white mt-2 pt-20 h-full">
      <View className="flex flex-row justify-around mb-2 w-full">
        {socials.map((s) => (
          <TouchableOpacity key={s.icon} onPress={() => Linking.openURL(s.url)}>
            <FontAwesome5
              name={s.icon}
              size={24}
              {...(s.brand ? { brand: true } : {})}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text className="text-sm text-gray-500 mt-5">Version. {version}</Text>
    </View>
  );
}
