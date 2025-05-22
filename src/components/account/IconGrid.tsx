import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  type AccessibilityRole,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof FontAwesome5>["name"];

export interface IconGridItem {
  icon: IconName;
  label: string;
  onPress: () => void;
  /** set to true for brand icons (facebook, tiktok, etc.) */
  brand?: boolean;
}

interface IconGridProps {
  items: IconGridItem[];
}

const IconGrid: React.FC<IconGridProps> = React.memo(({ items }) => {
  return (
    <View className="flex flex-row justify-between items-center py-6 px-6">
      {items.map((it) => (
        <TouchableOpacity
          key={it.label}
          onPress={it.onPress}
          accessibilityRole={"button" as AccessibilityRole}
          accessibilityLabel={it.label}
          className="flex flex-col items-center"
        >
          <View className="w-14 h-14 bg-gray-50 rounded-full items-center justify-center mb-2">
            <FontAwesome5
              name={it.icon}
              size={22}
              color="#6366F1"
              {...(it.brand ? { brand: true } : {})}
            />
          </View>
          <Text className="text-sm font-medium text-gray-700">{it.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

export default IconGrid;
