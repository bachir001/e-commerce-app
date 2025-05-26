"use client";

import { View, Text, TextInput, Pressable, Dimensions } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "./AuthHeader";
import AuthButton from "./AuthButton";
import { Link } from "expo-router";
import { Colors } from "@/constants/Colors";

interface AuthParams {
  authType: string;
}

const _paddingHorizontal = 30;
const separatorGap = 4;
const OR_WIDTH = 14;

export default function AuthForm({ authType = "sign-up" }: AuthParams) {
  const { linesWidth } = React.useMemo(() => {
    const contentSize = Dimensions.get("screen").width - _paddingHorizontal * 2;
    return {
      linesWidth: (contentSize - OR_WIDTH - separatorGap * 2) / 2,
    };
  }, []);

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
          <View className="flex flex-col gap-5 mt-10">
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
              />
            </View>
            <Pressable
              style={{
                backgroundColor: Colors.PRIMARY,
              }}
              className={`py-4 rounded-xl shadow-sm`}
            >
              <Text className="text-center text-white font-semibold">
                Continue
              </Text>
            </Pressable>
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
        <AuthButton
          text={authType === "sign-up" ? "Continue with Email" : "Phone/Email"}
          icon="mail-outline"
          iconColor="#4B5563"
          href={
            authType === "sign-up"
              ? "/auth/createAccount"
              : "/auth/signInAccount"
          }
        />
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
