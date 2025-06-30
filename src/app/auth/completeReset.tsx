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
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { passwordRegex } from "@/components/auth/CreateAccount";
import axiosApi from "@/apis/axiosApi";

export default function CompletePasswordReset() {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const keyboardAvoidingBehavior = Platform.OS === "ios" ? "padding" : "height";

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in both password fields.",
        position: "top",
        autoHide: true,
        topOffset: 60,
        visibilityTime: 2000,
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match.",
        position: "top",
        autoHide: true,
        topOffset: 60,
        visibilityTime: 2000,
      });
      setLoading(false);
      return;
    }

    if (passwordRegex.test(password) === false) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "Password must be at least 8 characters long, include uppercase and lowercase letters, and at least one special character.",
        position: "top",
        autoHide: true,
        topOffset: 60,
        visibilityTime: 2000,
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    const RequestBody = {
      password: password,
      password_confirmation: confirmPassword,
    };

    try {
      const response = await axiosApi.post("/password/reset", RequestBody);

      if (response.status === 200) {
        router.replace("/(tabs)/account");
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Password updated successfully.",
          position: "top",
          autoHide: true,
          topOffset: 60,
          visibilityTime: 1000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.data.message || "Failed to update password.",
          position: "top",
          autoHide: true,
          topOffset: 60,
          visibilityTime: 2000,
        });
      }
    } catch (err) {
      console.error("Error updating password:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update password. Please try again.",
        position: "top",
        autoHide: true,
        topOffset: 60,
        visibilityTime: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

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
              <Ionicons name="key" size={32} color={Colors.PRIMARY} />
            </View>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Create New Password
            </Text>
            <Text className="text-gray-600 text-center text-base leading-6 px-4">
              Your new password must be different from your previous password.
            </Text>
          </View>

          <View className="flex-1">
            <View className="mb-6">
              <Text className="text-sm font-bold text-gray-800 mb-3">
                New Password
              </Text>
              <View
                className="flex-row items-center px-5 py-4 rounded-2xl border"
                style={{
                  backgroundColor: "white",
                  borderColor:
                    password.length > 0
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
                  placeholder="Enter new password"
                  className="flex-1 text-gray-800 text-base"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="ml-3"
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-sm font-bold text-gray-800 mb-3">
                Confirm Password
              </Text>
              <View
                className="flex-row items-center px-5 py-4 rounded-2xl border"
                style={{
                  backgroundColor: "white",
                  borderColor:
                    confirmPassword.length > 0
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
                  placeholder="Confirm new password"
                  className="flex-1 text-gray-800 text-base"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="ml-3"
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className="py-4 rounded-2xl mb-6"
              onPress={handleUpdatePassword}
              style={{
                backgroundColor:
                  password.length > 0 && confirmPassword.length > 0 && !loading
                    ? Colors.PRIMARY
                    : "rgba(110, 62, 189, 0.3)",
                shadowColor: Colors.PRIMARY,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity:
                  password.length > 0 && confirmPassword.length > 0 && !loading
                    ? 0.3
                    : 0,
                shadowRadius: 16,
                elevation:
                  password.length > 0 && confirmPassword.length > 0 && !loading
                    ? 8
                    : 0,
              }}
              disabled={
                loading || password.length === 0 || confirmPassword.length === 0
              }
            >
              <Text className="text-white text-center font-bold text-base">
                {loading ? "Updating..." : "Update Password"}
              </Text>
            </TouchableOpacity>

            <View
              className="p-4 rounded-2xl"
              style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
                <Text className="text-green-600 font-semibold ml-2">
                  Password Requirements
                </Text>
              </View>
              <Text className="text-green-600 text-sm leading-5">
                • At least 8 characters long{"\n"}• Include uppercase and
                lowercase letters{"\n"}• Include at least one number{"\n"}•
                Include at least one special character
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
