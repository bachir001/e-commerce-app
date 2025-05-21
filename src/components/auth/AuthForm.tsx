import {
  View,
  Text,
  TextInput,
  Button,
  Pressable,
  Dimensions,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "./AuthHeader";
import AuthButton from "./AuthButton";
import { Link } from "expo-router";

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
      className="bg-white flex-1 pt-20 "
      style={{
        paddingHorizontal: _paddingHorizontal,
      }}
    >
      <AuthHeader />

      <View className="mt-8">
        <Text className="text-3xl font-bold text-center">
          {authType === "sign-up" ? "Sign Up for GoCami" : "Sign In to GoCami"}
        </Text>
      </View>

      {authType === "sign-up" && (
        <>
          <View className="flex flex-col gap-5 mt-10">
            <View className="flex flex-row px-5 py-2 bg-gray-200 items-center">
              <Text className="text-sm font-bold mr-3">+961</Text>
              <View
                style={{
                  width: 1,
                  height: "60%",
                  backgroundColor: "black",
                  marginRight: 6,
                }}
              />
              <TextInput
                keyboardType="phone-pad"
                placeholder="Phone number"
                className="w-full"
              />
            </View>
            <Pressable className="py-4 bg-[#5856d6] rounded-lg">
              <Text className="text-center text-white">Continue</Text>
            </Pressable>
          </View>

          <View
            className="flex flex-row mt-5 mb-5 w-full items-center"
            style={{
              gap: separatorGap,
            }}
          >
            <View
              style={{
                width: linesWidth,
                height: 1,
                backgroundColor: "black",
              }}
            />
            <Text
              className="text-gray-400 text-center"
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
                backgroundColor: "black",
              }}
            />
          </View>
        </>
      )}

      {authType === "sign-in" && <View className="mt-10" />}

      <View className="flex flex-col gap-10">
        <AuthButton
          text="Continue with Email"
          icon="mail-outline"
          iconColor="black"
        />
        {/* <AuthButton text="Sign In with Facebook" icon="logo-google" />
        <AuthButton text="Sign In with Google" icon="logo-facebook" /> */}
        <AuthButton
          text="Continue with Whatsapp"
          icon="logo-whatsapp"
          iconColor="green"
        />
      </View>

      <View className="bg-gray-100 flex flex-row items-center justify-center absolute bottom-0 left-0 right-0 h-40">
        {authType === "sign-up" ? (
          <Text>
            Already have an account?{" "}
            <Link
              href="/auth/signIn"
              replace
              className="text-[#5856d6] font-bold"
            >
              Log In
            </Link>
          </Text>
        ) : (
          <Text>
            Don't have an account?{" "}
            <Link
              href="/auth/sign-up"
              replace
              className="text-[#5856d6] font-bold"
            >
              Sign Up
            </Link>
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
