import { View, Text, TextInput } from "react-native";
import React from "react";

interface AddressInputProps {
  value: string;
  onChangeText: (name: string) => void;
  placeholder: string;
  headerName: string;
}

export default function AddressInput({
  value,
  onChangeText,
  placeholder,
  headerName,
}: AddressInputProps) {
  return (
    <View className="mt-3">
      <Text className="text-sm font-medium text-gray-700 mb-2">
        {headerName}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}
