import { View, Text, TextInput } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "./AuthHeader";
import { CREATE_INPUTS } from "@/constants/createInputs";

export default function CreateAccount() {
  return (
    <SafeAreaView
      className="flex-1 bg-white pt-20"
      style={{
        paddingHorizontal: 30,
      }}
    >
      <AuthHeader />

      <View className="mt-8">
        <Text className="text-3xl font-bold text-center">
          Create GoCami Account
        </Text>
      </View>

      <View className="flex flex-col mt-10">
        {CREATE_INPUTS.map((createInput) => (
          <View>
            <Text>{createInput.label}</Text>
            <TextInput
              secureTextEntry={createInput.isPassword}
              placeholder={createInput.placeholder}
              keyboardType={
                createInput.keyboardType ? createInput.keyboardType : "default"
              }
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
