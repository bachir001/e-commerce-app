import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import axiosApi from "@/apis/axiosApi";
import * as SecureStore from "expo-secure-store";
import { Colors } from "@/constants/Colors";
import { useSessionStore } from "@/store/useSessionStore";
import DotsLoader from "@/components/common/AnimatedLayout";
import { loginOneSignal } from "@/Services/OneSignalService";
import { updateUserTags } from "@/Services/notificationService";

interface LoginBody {
  email?: string;
  mobile?: string;
  password: string;
}

export default function loginAccount() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { setIsLogged } = useSessionStore();

  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const RequestBody: LoginBody = {
        password,
      };

      if (email.length >= 1) RequestBody.email = email;
      if (phoneNumber.length >= 1) RequestBody.mobile = `961${phoneNumber}`;

      await axiosApi
        .post("https://api-gocami-test.gocami.com/api/login", RequestBody)
        .then(async (response) => {
          if (response.data.status) {
            loginOneSignal(response.data.data.user.id.toString());
            await new Promise((resolve) => setTimeout(resolve, 300));
            await updateUserTags(response.data.data.user);
            await Promise.all([
              SecureStore.setItemAsync("token", response.data.data.token),
              SecureStore.setItemAsync(
                "user",
                JSON.stringify(response.data.data.user)
              ),
            ]);

            setIsLogged(true);
            Toast.show({
              type: "success",
              text1: "Login Successful",
              text2: `Welcome back ${response.data.data.user.first_name}`,
              autoHide: true,
              visibilityTime: 1000,
              topOffset: 60,
              position: "top",
              onHide: () => {
                router.replace("/(tabs)/home");
              },
            });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      let errorMessage = "An unexpected error occurred";
      if (err && typeof err === "object" && "message" in err) {
        errorMessage = String((err as { message: unknown }).message);
      }
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
        autoHide: true,
        visibilityTime: 1000,
        topOffset: 60,
      });
    }
  };

  const keyboardAvoidingBehavior = Platform.OS === "ios" ? "padding" : "height";

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "rgba(110, 62, 189, 0.03)",
          },
        ]}
      />

      <Image
        fadeDuration={0}
        source={require("@/assets/images/logo.png")}
        resizeMode="contain"
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [
              { translateY: 280 },
              { rotate: "-8deg" },
              { scale: 0.9 },
            ],
            opacity: 0.08,
            width: 350,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      />

      <SafeAreaView className="flex-1 px-6">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={keyboardAvoidingBehavior}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View className="pt-16 pb-8">
            <Text className="text-4xl font-bold text-gray-900 mb-3">
              Sign in with{" "}
              <Text style={{ color: Colors.PRIMARY }}>
                {email.length >= 1
                  ? "email"
                  : phoneNumber.length >= 1
                  ? "phone"
                  : "email"}
              </Text>
            </Text>
            <Text className="text-gray-600 text-base leading-6">
              Start using GoCami's amazing features!
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
                    email.length === 0 && phoneNumber.length > 0
                      ? "rgba(243, 244, 246, 0.5)"
                      : "white",
                  borderColor: "rgba(110, 62, 189, 0.15)",
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
                  onChangeText={setEmail}
                  editable={phoneNumber.length === 0}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-bold text-gray-800 mb-3">
                Phone Number
              </Text>
              <View
                className="flex-row items-center px-5 py-4 rounded-2xl border"
                style={{
                  backgroundColor:
                    phoneNumber.length === 0 && email.length > 0
                      ? "rgba(243, 244, 246, 0.5)"
                      : "white",
                  borderColor: "rgba(110, 62, 189, 0.15)",
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
                  value={phoneNumber}
                  editable={email.length === 0}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            {(email.length >= 1 || phoneNumber.length >= 1) && (
              <View className="mb-8">
                <Text className="text-sm font-bold text-gray-800 mb-3">
                  Password
                </Text>
                <View
                  className="px-5 py-4 rounded-2xl border"
                  style={{
                    backgroundColor: "white",
                    borderColor: "rgba(110, 62, 189, 0.15)",
                    shadowColor: "rgba(110, 62, 189, 0.1)",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <TextInput
                    placeholder="Enter your password"
                    className="text-gray-800 text-base"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}

            {password.length >= 1 && (
              <TouchableOpacity
                className="py-4 rounded-2xl mb-6"
                style={{
                  backgroundColor: Colors.PRIMARY,
                  shadowColor: Colors.PRIMARY,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <DotsLoader size="small" color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-base">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>

        <View
          className="absolute bottom-0 left-0 right-0 items-center justify-center py-8"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderTopWidth: 1,
            borderTopColor: "rgba(110, 62, 189, 0.1)",
          }}
        >
          <Text className="text-gray-600 text-base">
            Don't have an account?{" "}
            <Link
              href="/auth/signUp"
              replace
              style={{ color: Colors.PRIMARY }}
              className="font-bold"
            >
              Sign Up
            </Link>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
