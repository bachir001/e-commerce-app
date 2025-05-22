import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "./AuthHeader";
import { CREATE_INPUTS } from "@/constants/createInputs";
import { Link, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";
import Toast from "react-native-toast-message";

const passwordRegex: RegExp =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function CreateAccount() {
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedGender, setSelectedGender] = useState(1);
  const [termAccepted, setTermAccepted] = useState(true);
  const [date, setDate] = useState(new Date());
  const [mobile, setMobile] = useState("");

  const validateSignUp = (): string => {
    const messages: string[] = [];

    if (!email || !firstName || !lastName || !selectedGender || !termAccepted) {
      messages.push("Values are missing!");
    }

    if (firstName.length < 3)
      messages.push("First name must be 3 characters long or more");

    if (lastName.length < 3)
      messages.push("Last name must be 3 characters long or more");

    if (email.length < 1 || !email.includes("@"))
      messages.push("Invalid email");

    if (!passwordRegex.test(password)) messages.push("Invalid Password");

    if (password !== confirmPassword) messages.push("Passwords do not match");

    if (!termAccepted)
      messages.push("You cannot sign up without accepting to the terms!");

    // if(mobile.length < )

    if (messages.length >= 1) return messages[0];

    return "Success";
  };

  const goToConfirmation = () => {
    const validationResult = validateSignUp();
    if (validationResult !== "Success") {
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        text2: validationResult,
        position: "top",
        autoHide: false,
        topOffset: 60,
      });

      return;
    }

    router.push({
      pathname: "/auth/confirmation",
      params: {
        verificationType: "email",
        email,
        firstName,
        lastName,
        password,
        selectedGender,
        date: date.toISOString(),
      },
    });
  };

  // const createAccount = async () => {
  //   const validationResult = validateSignUp();
  // if (validationResult !== "Success") {
  //   Toast.show({
  //     type: "error",
  //     text1: "Sign Up Failed",
  //     text2: validationResult,
  //     position: "top",
  //     autoHide: false,
  //     topOffset: 60,
  //   });
  // }

  //   setLoading(true);
  //   await axios
  //     .post(`${process.env.BACKEND_BASE_URL}/register`, {
  //       first_name: firstName,
  //       last_name: lastName,
  //       email,
  //       password,
  //       gender_id: selectedGender,
  //       terms: 1,
  //       date_of_birth: date,
  //     })
  //     .then((response) => {
  //       if (response.data.status) {
  //         Toast.show({
  //           type: "success",
  //           text1: "",
  //           text2: validationResult,
  //           position: "top",
  //           autoHide: false,
  //           topOffset: 60,
  //         });
  //       }
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShow(true);
    setMode("date");
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
              Create Account
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
                {createInput.isCalendar ? (
                  <Pressable onPress={showDatepicker}>
                    <View className="flex flex-row justify-between items-center w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-sm">
                      <Text className="text-gray-700">
                        {date.toLocaleDateString()}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#6366F1"
                      />
                    </View>

                    {show && (
                      <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={mode}
                        is24Hour={true}
                        onChange={onChange}
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                      />
                    )}
                  </Pressable>
                ) : createInput.isGender ? (
                  <View className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden w-full">
                    <Picker
                      selectedValue={selectedGender}
                      onValueChange={(itemValue) =>
                        setSelectedGender(itemValue)
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
                      else if (createInput.label === "Email") setEmail(text);
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
                <Link href="" className="text-indigo-600 font-medium">
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
                className="py-4 text-center mt-2 bg-indigo-600 rounded-xl shadow-md"
                onPress={() => {
                  goToConfirmation();
                }}
              >
                <Text className="text-center text-white font-semibold">
                  Create Account
                </Text>
              </TouchableOpacity>
            )}

            <View className="mt-6 flex flex-row justify-center items-center">
              <Text className="text-sm text-gray-600">
                Already have an account?{" "}
              </Text>
              <Pressable onPress={() => router.back()}>
                <Text className="font-medium text-indigo-600 text-sm">
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
