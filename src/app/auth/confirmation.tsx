"use client";

import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useState } from "react";
import axiosApi from "@/apis/axiosApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";

export default function Confirmation() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const {
    email,
    firstName,
    lastName,
    verificationType,
    password,
    selectedGender,
    date,
  } = useLocalSearchParams();

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      console.log("SELECTED GENDER FROM CONFIRM: ", selectedGender);

      const formattedDate =
        typeof date === "string"
          ? new Date(date).toISOString().split("T")[0]
          : "";

      const RequestBody = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        gender_id: "1",
        terms: 1,
        date_of_birth: formattedDate,
        verification_method: verificationType,
      };

      console.log(RequestBody);

      await axiosApi
        .post(`https://api-gocami-test.gocami.com/api/register`, RequestBody)
        .then(async (response) => {
          console.log("HELLO FROM SIGN UP", response.data.data.user);
          if (response.data.status) {
            await AsyncStorage.setItem("signUpToken", response.data.data.token);
            Toast.show({
              type: "success",
              text1: "Register Successful",
              text2: "Please enter verification code",
              position: "top",
              autoHide: true,
              topOffset: 60,
            });

            console.log(selectedGender);
            router.push({
              pathname: "/auth/verification",
              params: {
                firstName,
                lastName,
                email,
                selectedGender,
                date: formattedDate,
                verification_method: verificationType,
                password,
              },
            });
          } else {
            Toast.show({
              type: "error",
              text1: "Register Failed",
              text2: "Account Already Exists",
              position: "top",
              autoHide: false,
              topOffset: 60,
            });
          }
        })
        .catch((response) => {
          console.log(response.status);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: err instanceof Error ? err.message : "An unknown error occurred",
        autoHide: true,
        visibilityTime: 2500,
        topOffset: 60,
      });
    }
  };

  return (
    <View className="flex-1 bg-white p-5">
      <View className="flex-1 justify-center items-center px-5">
        <View className="bg-indigo-50 p-6 rounded-full mb-6">
          <Ionicons name="mail-outline" size={80} color="#4F46E5" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Confirm Your Email
        </Text>

        <Text
          style={{ backgroundColor: Colors.PRIMARY }}
          className={`text-lg font-semibold mb-4 text-center`}
        >
          {email}
        </Text>

        <Text className="text-base text-gray-500 text-center mb-10 leading-6">
          Please confirm that this is the correct email address you want to use
          for your account.
        </Text>

        <View className="flex-row w-full justify-between gap-3">
          {!loading && (
            <TouchableOpacity
              className="flex-1 py-4 bg-gray-100 border border-gray-200 rounded-xl items-center justify-center"
              onPress={handleBack}
            >
              <Text className="text-base font-semibold text-gray-700">
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: Colors.PRIMARY,
            }}
            className={`flex-1 py-4 rounded-xl items-center justify-center`}
            onPress={handleContinue}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
