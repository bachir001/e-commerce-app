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
import React, { useContext, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import axiosApi from "@/apis/axiosApi";
import { SessionContext } from "../_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";

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

  const { setUser, setToken, setIsLogged } = useContext(SessionContext);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      //post login with body
      const RequestBody: LoginBody = {
        password,
      };

      if (email.length >= 1) RequestBody.email = email;
      if (phoneNumber.length >= 1) RequestBody.mobile = phoneNumber;

      await axiosApi
        .post("https://api-gocami-test.gocami.com/api/login", RequestBody)
        .then(async (response) => {
          console.log("HELLO USER FROM LOGIN\n\n", response.data.data.user);
          if (response.data.status) {
            await Promise.all([
              AsyncStorage.setItem("token", response.data.data.token),
              AsyncStorage.setItem(
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
              visibilityTime: 3000,
            });
            router.replace("/(tabs)/home");
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
        visibilityTime: 3000,
      });
    }
  };

  const keyboardAvoidingBehavior = Platform.OS === "ios" ? "padding" : "height";

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />

      <Image
        source={require("@/assets/images/logo.png")}
        resizeMode="contain"
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [
              { translateY: 300 },
              { rotate: "-10deg" },
              { scale: 1.1 },
            ],
            opacity: 0.7,
            width: 400,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      />

      <SafeAreaView className="flex-1 px-16 py-20">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={keyboardAvoidingBehavior}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <Text className="text-4xl font-bold">
            Sign in with{" "}
            {email.length >= 1
              ? "email"
              : phoneNumber.length >= 1
              ? "phone"
              : "email"}
          </Text>
          <Text className="mt-2 text-sm">Start using GoCami's features!</Text>
          <View
            style={{
              transform: [{ translateY: 50 }],
              position: "relative",
            }}
          >
            <Text className="mt-10 text-sm font-bold">Email</Text>
            <TextInput
              placeholder="Enter Email"
              className="py-4 pl-5 border border-gray-200 rounded-lg mt-2 bg-white shadow-sm"
              keyboardType="email-address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              editable={phoneNumber.length === 0}
            />

            <Text className="text-sm font-bold mt-10">Phone Number</Text>
            <View className="flex flex-row mt-2 bg-white border border-gray-200 rounded-xl px-4 py-3.5 items-center shadow-sm">
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
                className="w-full text-gray-700 mt-2"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                editable={email.length === 0}
                onChangeText={setPhoneNumber}
              />
            </View>

            {(email.length >= 1 || phoneNumber.length >= 1) && (
              <View>
                <Text className="text-sm font-bold mt-10">Password</Text>
                <TextInput
                  placeholder="Enter Password"
                  className="py-4 pl-5 border border-gray-200 rounded-lg mt-2 bg-white shadow-sm"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            )}

            {password.length >= 1 && (
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.PRIMARY,
                }}
                className={`mt-5 py-4 rounded-lg shadow-sm`}
                onPress={handleLogin}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-center">Sign In</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>

        <View className="bg-gray-50 flex flex-row items-center justify-center absolute bottom-0 left-0 right-0 h-32 border-t border-gray-100">
          <Text className="text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/signUp"
              replace
              style={{
                color: Colors.PRIMARY,
              }}
              className="font-semibold"
            >
              Sign Up
            </Link>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
