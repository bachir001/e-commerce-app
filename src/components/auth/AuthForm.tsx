import {
  View,
  Text,
  TextInput,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react"; // Import useState
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "./AuthHeader";
import AuthButton from "./AuthButton";
import { Link, router } from "expo-router";
import { Colors } from "@/constants/Colors";
import Toast from "react-native-toast-message";

interface AuthParams {
  authType: string;
}

const _paddingHorizontal = 30;
const separatorGap = 4;
const OR_WIDTH = 14;

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

  return (
    <SafeAreaView
      className="bg-white flex-1 pt-16"
      style={{
        paddingHorizontal: _paddingHorizontal,
      }}
    >
      <AuthHeader />

      <View className="mt-8">
        <Text className="text-3xl font-bold text-gray-800 text-center">
          {authType === "sign-up" ? "Create Account" : "Welcome Back"}
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          {authType === "sign-up"
            ? "Join GoCami and discover amazing products"
            : "Sign in to continue your shopping experience"}
        </Text>
      </View>

      {authType === "sign-up" && (
        <>
          {/* Tab Navigation */}
          <View className="flex flex-row mt-10 mb-5 justify-center">
            <Pressable
              onPress={() => setActiveTab("phone")}
              className={`py-3 px-6 rounded-l-xl ${
                activeTab === "phone" ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <Text
                className={`font-semibold ${
                  activeTab === "phone" ? "text-gray-800" : "text-gray-500"
                }`}
              >
                Phone
              </Text>
            </Pressable>
            <TouchableOpacity
              onPress={() => setActiveTab("email")}
              className={`py-3 px-6 rounded-r-xl ${
                activeTab === "email" ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <Text
                className={`font-semibold ${
                  activeTab === "email" ? "text-gray-800" : "text-gray-500"
                }`}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-col gap-5">
            {activeTab === "phone" ? (
              <View className="flex flex-row bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 items-center shadow-sm">
                <Text className="text-sm font-medium text-gray-700 mr-3">
                  +961
                </Text>
                <View
                  style={{
                    width: 1,
                    height: "60%",
                    backgroundColor: "#E5E7EB",
                    marginRight: 10,
                  }}
                />
                <TextInput
                  keyboardType="phone-pad"
                  placeholder="Phone number"
                  className="w-full text-gray-700"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={setMobile}
                />
              </View>
            ) : (
              <TextInput
                keyboardType="email-address"
                placeholder="Email address"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 shadow-sm"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                onChangeText={setEmail}
              />
            )}
            <TouchableOpacity
              style={{
                backgroundColor: Colors.PRIMARY,
              }}
              className={`py-4 rounded-xl shadow-sm`}
              onPress={() => {
                if (activeTab === "email") {
                  if (email !== "" && emailRegex.test(email)) {
                    router.push({
                      pathname: "/auth/confirmation",
                      params: {
                        email,
                      },
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
                    router.push({
                      pathname: "/auth/confirmation",
                      params: {
                        mobile: mobile,
                      },
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
              <Text className="text-center text-white font-semibold">
                Continue
              </Text>
            </TouchableOpacity>
          </View>

          <View
            className="flex flex-row my-8 w-full items-center"
            style={{
              gap: separatorGap,
            }}
          >
            <View
              style={{
                width: linesWidth,
                height: 1,
                backgroundColor: "#E5E7EB",
              }}
            />
            <Text
              className="text-gray-400 text-center font-medium"
              style={{
                fontSize: OR_WIDTH,
              }}
            >
              OR
            </Text>
            <View
              style={{
                width: linesWidth,
                height: 1,
                backgroundColor: "#E5E7EB",
              }}
            />
          </View>
        </>
      )}

      {authType === "sign-in" && <View className="mt-10" />}

      <View className="flex flex-col gap-6">
        {authType === "sign-in" && (
          <AuthButton
            text="Phone/Email"
            icon="mail-outline"
            iconColor="#4B5563"
            href={"/auth/signInAccount"}
          />
        )}
        <AuthButton text="Sign In with Google" icon="logo-google" />
        <AuthButton text="Sign In with Facebook" icon="logo-facebook" />
      </View>

      <View className="bg-gray-50 flex flex-row items-center justify-center absolute bottom-0 left-0 right-0 h-32 border-t border-gray-100">
        {authType === "sign-up" ? (
          <Text className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/signIn"
              replace
              style={{
                color: Colors.PRIMARY,
              }}
              className={`font-semibold`}
            >
              Log In
            </Link>
          </Text>
        ) : (
          <Text className="text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/signUp"
              replace
              style={{
                color: Colors.PRIMARY,
              }}
              className={` font-semibold`}
            >
              Sign Up
            </Link>
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
