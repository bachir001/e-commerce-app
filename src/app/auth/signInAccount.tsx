import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function loginAccount() {
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);

  return (
    <SafeAreaView className="flex-1 bg-white px-16 py-20">
      <View>
        <Text className="text-3xl font-bold">Phone Number</Text>
        <TextInput
          placeholder="Enter Phone Number"
          className="py-4 pl-5 border rounded-lg mt-3"
          keyboardType="phone-pad"
        />

        <Text className="mt-10 text-3xl font-bold">Email</Text>
        <TextInput
          placeholder="Enter Email"
          className="py-4 pl-5 border rounded-lg mt-3"
          keyboardType="email-address"
        />

        <TouchableOpacity className="mt-20 bg-[#5856d6] py-4 rounded-lg">
          <Text className="text-white text-center">Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
