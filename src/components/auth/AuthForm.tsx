import {
  View,
  Text,
  TextInput,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AuthHeader from "./AuthHeader";
import AuthButton from "./AuthButton";
import { Link, router } from "expo-router";
import { Colors } from "@/constants/Colors";
import Toast from "react-native-toast-message";

interface AuthParams {
  authType: string;
}

const _paddingHorizontal = 24;
const separatorGap = 6;
const OR_WIDTH = 16;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex =
  /^(?:[14569]\d{6}|3\d{6}|7(?:[01]\d{5}|[2-57]\d{5}|6[013-9]\d{4}|8[7-9]\d{4}|9[1-3]\d{4})|8(?:[02-9]\d{5}|1[2-46-8]\d{4}))$/;

export default function AuthForm({ authType = "sign-up" }: AuthParams) {
  const { linesWidth } = React.useMemo(() => {
    const contentSize = Dimensions.get("screen").width - _paddingHorizontal * 2;
    return {
      linesWidth: (contentSize - OR_WIDTH - separatorGap * 2) / 2,
    };
  }, []);

  const [activeTab, setActiveTab] = useState("phone");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: "#fafafa",
        paddingHorizontal: _paddingHorizontal,
        paddingBottom: insets.bottom,
        paddingTop: insets.top,
      }}
    >
      <View className="pt-12">
        <AuthHeader />
      </View>

      <View className="mt-12 mb-8">
        <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
          {authType === "sign-up" ? "Create Account" : "Welcome Back"}
        </Text>
        <Text className="text-gray-600 text-center text-base leading-6">
          {authType === "sign-up"
            ? "Join GoCami and discover amazing products"
            : "Sign in to continue your shopping experience"}
        </Text>
      </View>

      {authType === "sign-up" ? (
        <>
          <View
            className="flex-row mb-8 p-1 rounded-2xl"
            style={{
              backgroundColor: "rgba(110, 62, 189, 0.08)",
            }}
          >
            <Pressable
              onPress={() => setActiveTab("phone")}
              className={`flex-1 py-3 px-4 rounded-xl`}
              style={{
                backgroundColor:
                  activeTab === "phone"
                    ? "rgba(110, 62, 189, 1)"
                    : "transparent",
              }}
            >
              <Text
                className={`font-semibold text-center ${
                  activeTab === "phone" ? "text-white" : "text-gray-700"
                }`}
              >
                Phone
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("email")}
              className={`flex-1 py-3 px-4 rounded-xl`}
              style={{
                backgroundColor:
                  activeTab === "email"
                    ? "rgba(110, 62, 189, 1)"
                    : "transparent",
              }}
            >
              <Text
                className={`font-semibold text-center ${
                  activeTab === "email" ? "text-white" : "text-gray-700"
                }`}
              >
                Email
              </Text>
            </Pressable>
          </View>

          <View className="mb-8">
            {activeTab === "phone" ? (
              <View
                className="flex-row items-center px-5 py-4 rounded-2xl border"
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
                  onChangeText={setMobile}
                />
              </View>
            ) : (
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
                  keyboardType="email-address"
                  placeholder="Email address"
                  className="text-gray-800 text-base"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  onChangeText={setEmail}
                />
              </View>
            )}

            <TouchableOpacity
              className="mt-6 py-4 rounded-2xl"
              style={{
                backgroundColor: Colors.PRIMARY,
                shadowColor: Colors.PRIMARY,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
              onPress={() => {
                if (activeTab === "email") {
                  if (email !== "" && emailRegex.test(email)) {
                    router.navigate({
                      pathname: "/auth/confirmation",
                      params: { email },
                    });
                  } else {
                    Toast.show({
                      type: "error",
                      autoHide: true,
                      visibilityTime: 2000,
                      text1: "Invalid Email Address",
                      text2: "Please check the format and try again.",
                      topOffset: 60,
                    });
                  }
                } else {
                  if (mobile !== "" && mobile.length === 8) {
                    router.navigate({
                      pathname: "/auth/confirmation",
                      params: { mobile: mobile },
                    });
                  } else {
                    Toast.show({
                      type: "error",
                      autoHide: true,
                      visibilityTime: 2000,
                      text1: "Invalid Phone Number",
                      text2: "Please enter a valid phone number.",
                      topOffset: 60,
                    });
                  }
                }
              }}
            >
              <Text className="text-center text-white font-bold text-base">
                Continue
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className="flex-row items-center mb-8"
            style={{ gap: separatorGap }}
          >
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "rgba(110, 62, 189, 0.2)",
              }}
            />
            <View
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: "rgba(110, 62, 189, 0.08)" }}
            >
              <Text
                className="text-gray-500 font-medium"
                style={{ fontSize: 14 }}
              >
                OR
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "rgba(110, 62, 189, 0.2)",
              }}
            />
          </View>
        </>
      ) : null}

      {authType === "sign-in" && <View className="mt-12" />}

      <View className="flex-col gap-4 mb-8">
        {authType === "sign-in" ? (
          <AuthButton
            text="Phone/Email"
            icon="mail-outline"
            iconColor="#4B5563"
            href={"/auth/signInAccount"}
          />
        ) : null}
        <AuthButton text="Sign In with Google" icon="logo-google" />
        <AuthButton text="Sign In with Facebook" icon="logo-facebook" />
      </View>

      <View
        className="absolute bottom-0 left-0 right-0 items-center justify-center py-8"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderTopWidth: 1,
          borderTopColor: "rgba(110, 62, 189, 0.1)",
        }}
      >
        {authType === "sign-up" ? (
          <Text className="text-gray-600 text-base">
            Already have an account?{" "}
            <Link
              href="/auth/signIn"
              replace
              style={{ color: Colors.PRIMARY }}
              className="font-bold"
            >
              Log In
            </Link>
          </Text>
        ) : (
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
        )}
      </View>
    </View>
  );
}
