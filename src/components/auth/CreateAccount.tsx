import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "./AuthHeader";
import { CREATE_INPUTS } from "@/constants/createInputs";
import { Link, useRouter } from "expo-router";

export default function CreateAccount() {
  const router = useRouter();
  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{
        paddingHorizontal: 30,
      }}
    >
      <AuthHeader />

      <View className="mt-8">
        <Text className="text-3xl font-bold ">Create GoCami Account</Text>
      </View>

      <View className="flex flex-col mt-10">
        {CREATE_INPUTS.map((createInput, index) => (
          <View key={index}>
            <Text className="text-lg mb-2">{createInput.label}</Text>
            <TextInput
              secureTextEntry={createInput.isPassword}
              placeholder={createInput.placeholder}
              keyboardType={
                createInput.keyboardType ? createInput.keyboardType : "default"
              }
              className="mb-5 border-b border-purple-600"
            />
          </View>
        ))}

        <Text className="text-sm">
          By signing up to GoCami you agree to{" "}
          <Link href="" className="text-red-600 font-bold">
            Terms and Conditions
          </Link>
        </Text>

        <TouchableOpacity className="py-4 text-center mt-5 bg-[#5856d6] rounded-lg">
          <Text className="text-center text-white font-bold">Sign Up</Text>
        </TouchableOpacity>

        <View className="text-sm mt-5 flex flex-row items-center">
          <Text className="text-sm">Already have an account? </Text>
          <Pressable onPress={() => router.back()} className="font-bold">
            <Text className="font-bold text-sm">Sign In</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
