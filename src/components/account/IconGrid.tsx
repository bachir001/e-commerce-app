// components/IconGrid.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AccessibilityRole,
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
    <View className="flex flex-row justify-between items-center bg-white px-16 py-10">
      {items.map((it) => (
        <TouchableOpacity
          key={it.label}
          onPress={it.onPress}
          accessibilityRole={"button" as AccessibilityRole}
          accessibilityLabel={it.label}
          className="flex flex-col items-center gap-2"
        >
          <FontAwesome5
            name={it.icon}
            size={26}
            color="#555"
            {...(it.brand ? { brand: true } : {})}
          />
          <Text className="text-sm">{it.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

export default IconGrid;

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16, // was mb-4
//   },
//   button: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   label: {
//     marginTop: 4,    // was mt-1
//     fontSize: 16,    // was text-base
//     color: '#333',
//   },
// });
