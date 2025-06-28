import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useState } from "react";
import axiosApi from "@/apis/axiosApi";
import * as SecureStore from "expo-secure-store";
import { Colors } from "@/constants/Colors";
import DotsLoader from "@/components/common/AnimatedLayout";

export default function Confirmation() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { email, mobile } = useLocalSearchParams(); //either email or mobile will be available

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      const RequestBody: any = {};

      if (email) {
        RequestBody.email = email;
      }

      if (mobile) {
        RequestBody.mobile = `961${mobile}`;
      }

      console.log(mobile);

      await axiosApi
        .post(`/register`, RequestBody)
        .then(async (response) => {
          if (response.status === 200) {
            router.navigate({
              pathname: "/auth/verification",
              params: {
                email,
                mobile: `961${mobile}`,
              },
            });
          } else {
            Toast.show({
              type: "error",
              text1: "Register Failed",
              text2: response.data.message || "An unknown error occurred",
              position: "top",
              autoHide: true,
              topOffset: 60,
              visibilityTime: 1000,
            });
          }
        })
        .catch((err) => {
          Toast.show({
            type: "error",
            text1: "Failed",
            text2:
              err instanceof Error ? err.message : "An unknown error occurred",
            position: "top",
            autoHide: true,
            visibilityTime: 2000,
            topOffset: 60,
          });
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
        visibilityTime: 2000,
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
          {email !== undefined
            ? "Confirm Your Email"
            : "Confirm Your Phone Number"}
        </Text>

        <Text
          style={{ color: Colors.PRIMARY }}
          className={`text-lg font-semibold mb-4 text-center`}
        >
          {email !== undefined
            ? email.toString()
            : mobile !== undefined
            ? `+961 ${mobile.toString()}`
            : "No contact information provided"}
        </Text>

        <Text className="text-base text-gray-500 text-center mb-10 leading-6">
          Please confirm that this is the correct email address you want to use
          for your account.
        </Text>

        <View className="flex-row w-full justify-between gap-3">
          {!loading ? (
            <TouchableOpacity
              className="flex-1 py-4 bg-gray-100 border border-gray-200 rounded-xl items-center justify-center"
              onPress={handleBack}
            >
              <Text className="text-base font-semibold text-gray-700">
                Back
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={{
              backgroundColor: Colors.PRIMARY,
            }}
            className={`flex-1 py-4 rounded-xl items-center justify-center`}
            onPress={handleContinue}
          >
            {loading ? (
              <DotsLoader size="small" color="white" />
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
