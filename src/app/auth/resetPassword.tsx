import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import axiosApi from "@/apis/axiosApi";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex =
  /^(?:[14569]\d{6}|3\d{6}|7(?:[01]\d{5}|[2-57]\d{5}|6[013-9]\d{4}|8[7-9]\d{4}|9[1-3]\d{4})|8(?:[02-9]\d{5}|1[2-46-8]\d{4}))$/;

export default function ResetPassword() {
  const [email, setEmail] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      if (email.length > 0 && !emailRegex.test(email)) {
        Toast.show({
          type: "error",
          text1: "Invalid Email",
          text2: "Please enter a valid email address.",
          topOffset: 60,
          visibilityTime: 2000,
        });
        setLoading(false);
        return;
      }

      if (email.length === 0 && mobile.length === 0) {
        Toast.show({
          type: "error",
          text1: "Input Required",
          text2: "Please enter either your email or phone number.",
          topOffset: 60,
          visibilityTime: 2000,
        });
        setLoading(false);
        return;
      }

      const RequestBody: any = {};

      if (email.length > 0) {
        RequestBody.email = email;
        RequestBody.verification_method = "email";
      }

      if (mobile.length > 0) {
        RequestBody.mobile = mobile;
        RequestBody.verification_method = "whatsapp";
      }

      const response = await axiosApi.post("/password/forgot", RequestBody);

      if (response.status === 200) {
        router.replace({
          pathname: "/auth/verification",
          params: {
            isReset: "true",
            email: email.length > 0 ? email : undefined,
            mobile: mobile.length > 0 ? mobile : undefined,
          },
        });
      }
    } catch (err) {
      console.error("Error during password reset:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while processing your request.",
        topOffset: 60,
        visibilityTime: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const keyboardAvoidingBehavior = Platform.OS === "ios" ? "padding" : "height";

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Reset Password",
          headerStyle: { backgroundColor: "#fafafa" },
          headerTitleStyle: { color: "#111827", fontWeight: "bold" },
          headerTintColor: Colors.PRIMARY,
        }}
      />

      <SafeAreaView className="flex-1 px-6">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={keyboardAvoidingBehavior}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View className="pt-8 pb-12">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-6 self-center"
              style={{ backgroundColor: "rgba(110, 62, 189, 0.1)" }}
            >
              <Ionicons name="lock-closed" size={32} color={Colors.PRIMARY} />
            </View>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Forgot Password?
            </Text>
            <Text className="text-gray-600 text-center text-base leading-6 px-4">
              Don't worry! Enter your email or phone number and we'll send you a
              reset link.
            </Text>
          </View>

          <View className="flex-1">
            <View className="mb-6">
              <Text className="text-sm font-bold text-gray-800 mb-3">
                Email Address
              </Text>
              <View
                className="px-5 py-4 rounded-2xl border"
                style={{
                  backgroundColor:
                    email.length === 0 && mobile.length > 0
                      ? "rgba(243, 244, 246, 0.5)"
                      : "white",
                  borderColor:
                    email.length > 0
                      ? "rgba(110, 62, 189, 0.3)"
                      : "rgba(110, 62, 189, 0.15)",
                  shadowColor: "rgba(110, 62, 189, 0.1)",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <TextInput
                  placeholder="Enter your email address"
                  className="text-gray-800 text-base"
                  keyboardType="email-address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (text.length > 0) {
                      setMobile("");
                    }
                  }}
                  editable={mobile.length === 0}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="items-center mb-6">
              <View
                className="px-4 py-2 rounded-full"
                style={{ backgroundColor: "rgba(110, 62, 189, 0.08)" }}
              >
                <Text className="text-gray-500 font-medium text-sm">OR</Text>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-sm font-bold text-gray-800 mb-3">
                Phone Number
              </Text>
              <View
                className="flex-row items-center px-5 py-4 rounded-2xl border"
                style={{
                  backgroundColor:
                    mobile.length === 0 && email.length > 0
                      ? "rgba(243, 244, 246, 0.5)"
                      : "white",
                  borderColor:
                    mobile.length > 0
                      ? "rgba(110, 62, 189, 0.3)"
                      : "rgba(110, 62, 189, 0.15)",
                  shadowColor: "rgba(110, 62, 189, 0.1)",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <View
                  className="px-3 py-2 rounded-lg mr-3"
                  style={{ backgroundColor: "rgba(110, 62, 189, 0.1)" }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: Colors.PRIMARY }}
                  >
                    +961
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    height: 24,
                    backgroundColor: "rgba(110, 62, 189, 0.2)",
                    marginRight: 12,
                  }}
                />
                <TextInput
                  keyboardType="phone-pad"
                  placeholder="Phone number"
                  className="flex-1 text-gray-800 text-base"
                  placeholderTextColor="#9CA3AF"
                  value={mobile}
                  onChangeText={(text) => {
                    setMobile(text);
                    if (text.length > 0) {
                      setEmail("");
                    }
                  }}
                  editable={email.length === 0}
                />
              </View>
            </View>

            <TouchableOpacity
              className="py-4 rounded-2xl mb-6"
              style={{
                backgroundColor:
                  (email.length > 0 || mobile.length > 0) && !loading
                    ? Colors.PRIMARY
                    : "rgba(110, 62, 189, 0.3)",
                shadowColor: Colors.PRIMARY,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity:
                  (email.length > 0 || mobile.length > 0) && !loading ? 0.3 : 0,
                shadowRadius: 16,
                elevation:
                  (email.length > 0 || mobile.length > 0) && !loading ? 8 : 0,
              }}
              onPress={handleResetPassword}
              disabled={loading || (email.length === 0 && mobile.length === 0)}
            >
              <Text className="text-white text-center font-bold text-base">
                {loading ? "Sending..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>

            <View
              className="p-4 rounded-2xl"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text className="text-blue-600 font-semibold ml-2">
                  Reset Instructions
                </Text>
              </View>
              <Text className="text-blue-600 text-sm leading-5">
                {email.length > 0
                  ? "We'll send a password reset link to your email address."
                  : mobile.length > 0
                  ? "We'll send a verification code to your phone number."
                  : "Choose email or phone to receive reset instructions."}
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
