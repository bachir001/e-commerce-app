import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { SetStateAction, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "./AuthHeader";
import { CREATE_INPUTS } from "@/constants/createInputs";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";
import Toast from "react-native-toast-message";
import { Colors } from "@/constants/Colors";
import axiosApi from "@/apis/axiosApi";
import { useSessionStore } from "@/store/useSessionStore";
import { loginOneSignal } from "@/Services/OneSignalService";
import { updateUserTags } from "@/Services/notificationService";
import * as SecureStore from "expo-secure-store";

interface CompleteSignUp {
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  terms: 1;
  gender_id: 1 | 2;
  email?: string;
  mobile?: string;
}

const passwordRegex: RegExp =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function CreateAccount() {
  const { setIsLogged, setToken, setUser } = useSessionStore();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const { email, mobile } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedGender, setSelectedGender] = useState<1 | 2>(1);
  const [termAccepted, setTermAccepted] = useState(true);

  const validateSignUp = (): string => {
    const messages: string[] = [];

    if (!firstName || !lastName || !selectedGender || !termAccepted) {
      messages.push("All fields are required!");
    }

    if (firstName.length < 3)
      messages.push("First name must be 3 characters long or more");

    if (lastName.length < 3)
      messages.push("Last name must be 3 characters long or more");

    // if (
    //   (email !== undefined && email.length < 1) ||
    //   (email !== undefined && !email.includes("@"))
    // )
    //   messages.push("Invalid email format");

    if (!passwordRegex.test(password))
      messages.push(
        "Password must be at least 8 characters long, include an uppercase letter and a special character."
      );

    if (password !== confirmPassword) messages.push("Passwords do not match");

    if (!termAccepted)
      messages.push("You must accept the terms and conditions to sign up!");

    if (messages.length >= 1) return messages[0];

    return "Success";
  };

  const handleCompleteSignUp = async () => {
    const validationResult = validateSignUp();
    if (validationResult !== "Success") {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: validationResult,
        position: "top",
        autoHide: true,
        topOffset: 60,
        visibilityTime: 2000,
      });
      return;
    }

    const RequestBody: CompleteSignUp = {
      password: password,
      password_confirmation: confirmPassword,
      first_name: firstName,
      last_name: lastName,
      gender_id: selectedGender,
      terms: 1,
    };

    const emailParam = Array.isArray(email) ? email[0] : email;
    const mobileParam = Array.isArray(mobile) ? mobile[0] : mobile;

    if (emailParam) RequestBody.email = emailParam;
    if (mobileParam) RequestBody.mobile = mobileParam;

    try {
      setLoading(true);
      const response = await axiosApi.post(
        `https://api-gocami-test.gocami.com/api/register/complete`,
        RequestBody
      );

      if (response.status === 200) {
        const LoginBody: any = {
          password,
        };

        if (emailParam) LoginBody.email = emailParam;
        if (mobileParam) LoginBody.mobile = mobileParam;

        const loginResponse = await axiosApi.post(
          "https://api-gocami-test.gocami.com/api/login",
          LoginBody
        );

        if (loginResponse.data.status) {
          await loginOneSignal(loginResponse.data.data.user.id.toString());
          await updateUserTags(loginResponse.data.data.user);

          await Promise.all([
            SecureStore.setItemAsync("token", loginResponse.data.data.token),
            SecureStore.setItemAsync(
              "user",
              JSON.stringify(loginResponse.data.data.user)
            ),
          ]);
          setIsLogged(true);
          setUser(loginResponse.data.data.user);
          setToken(loginResponse.data.data.token);

          Toast.show({
            type: "success",
            text1: "Registration Successful",
            text2: "Please enter verification code",
            position: "top",
            autoHide: true,
            visibilityTime: 1000,
            topOffset: 60,
            onHide: () => {
              router.replace("/(tabs)/home");
            },
          });
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: response.data.message || "Account Already Exists",
          position: "top",
          autoHide: true,
          topOffset: 60,
          visibilityTime: 1000,
        });
      }
    } catch (err: any) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.response?.data?.message || "An unexpected error occurred.",
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
    <SafeAreaView
      className="flex-1 bg-gradient-to-b from-white to-gray-50 pb-20"
      style={{
        paddingHorizontal: 30,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <AuthHeader />

          <View className="mt-8">
            <Text className="text-3xl font-bold text-gray-800">
              Complete Sign Up
            </Text>
            <Text className="text-gray-500 mt-2">
              Join GoCami and start your journey
            </Text>
          </View>

          <View className="flex flex-col mt-8">
            {CREATE_INPUTS.map((createInput, index) => (
              <View key={index} className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  {createInput.label}
                </Text>

                {createInput.isGender ? (
                  <View className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden w-full">
                    <Picker
                      selectedValue={selectedGender}
                      onValueChange={(itemValue: SetStateAction<number>) =>
                        setSelectedGender(itemValue as 1 | 2)
                      }
                      mode={Platform.OS === "android" ? "dropdown" : "dialog"}
                      className="w-full h-full text-gray-700"
                      itemStyle={
                        Platform.OS === "ios"
                          ? {
                              fontSize: 16,
                              color: "#333",
                            }
                          : {}
                      }
                    >
                      <Picker.Item label="Male" value={1} />
                      <Picker.Item label="Female" value={2} />
                    </Picker>
                  </View>
                ) : createInput.isMobile ? (
                  <View className="flex flex-row bg-white border border-gray-200 rounded-xl px-4 py-3.5 items-center shadow-sm">
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
                      value={mobile}
                      onChangeText={(text) => setMobile(text)}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                ) : (
                  <TextInput
                    secureTextEntry={createInput.isPassword}
                    placeholder={createInput.placeholder}
                    keyboardType={
                      createInput.keyboardType
                        ? createInput.keyboardType
                        : "default"
                    }
                    value={
                      createInput.label === "First Name"
                        ? firstName
                        : createInput.label === "Last Name"
                        ? lastName
                        : createInput.label === "Email"
                        ? email
                        : createInput.label === "Password"
                        ? password
                        : ""
                    }
                    onChangeText={(text) => {
                      if (createInput.label === "First Name")
                        setFirstName(text);
                      else if (createInput.label === "Last Name")
                        setLastName(text);
                      else if (createInput.label === "Password")
                        setPassword(text);
                    }}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 shadow-sm"
                    placeholderTextColor="#9CA3AF"
                  />
                )}
              </View>
            ))}

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </Text>
              <TextInput
                secureTextEntry={true}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-700 shadow-sm"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="flex flex-row justify-between items-center gap-2 mb-6">
              <Text className="text-sm text-gray-600">
                Agree to{" "}
                <Link
                  href=""
                  style={{
                    color: Colors.PRIMARY,
                  }}
                  className={`font-medium`}
                >
                  Terms and Conditions
                </Link>
              </Text>
              <Checkbox
                disabled={false}
                color={termAccepted ? "#6366F1" : undefined}
                value={termAccepted}
                onValueChange={(newValue) => setTermAccepted(newValue)}
              />
            </View>

            {termAccepted && (
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.PRIMARY,
                }}
                className={`py-4 text-center mt-2 rounded-xl shadow-md`}
                onPress={handleCompleteSignUp}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center text-white font-semibold">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <View className="mt-6 flex flex-row justify-center items-center">
              <Text className="text-sm text-gray-600">
                Already have an account?{" "}
              </Text>
              <Pressable onPress={() => router.back()}>
                <Text
                  style={{
                    color: Colors.PRIMARY,
                  }}
                  className={`font-medium text-sm`}
                >
                  Sign In
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
