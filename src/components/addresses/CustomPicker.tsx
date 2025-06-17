import { FontAwesome5 } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import DotsLoader from "../common/AnimatedLayout";

interface CustomPickerProps {
  label: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
  placeholder: string;
  loading?: boolean;
}

export function CustomPicker({
  label,
  value,
  onPress,
  disabled = false,
  placeholder,
  loading = false,
}: CustomPickerProps) {
  return (
    <View className="mb-4 mt-3">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        className={`flex-row items-center justify-between px-4 py-3.5 rounded-xl border ${
          disabled
            ? "bg-gray-100 border-gray-200 opacity-50"
            : "bg-gray-50 border-gray-200 active:bg-gray-100"
        }`}
        disabled={disabled}
      >
        {loading ? (
          <DotsLoader size="small" color="#5e3ebd" />
        ) : (
          <Text
            className={`flex-1 ${value ? "text-gray-800" : "text-gray-400"}`}
          >
            {value || placeholder}
          </Text>
        )}
        <FontAwesome5
          name="chevron-down"
          size={14}
          color={disabled ? "#D1D5DB" : "#6B7280"}
        />
      </TouchableOpacity>
    </View>
  );
}
