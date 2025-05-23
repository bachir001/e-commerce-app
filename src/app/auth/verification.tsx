"use client";

import { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Clipboard,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosApi from "@/apis/axiosApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SessionContext } from "../_layout";

export default function Verification() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const { user, setUser, setToken, setIsLogged } = useContext(SessionContext);

  const {
    firstName,
    lastName,
    email,
    selectedGender,
    date,
    verification_method,
    password,
  } = useLocalSearchParams();

  const inputRefs = useRef<Array<TextInput | null>>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  const [verificationCode, setVerificationCode] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [timeLeft, setTimeLeft] = useState(600);
  const [isExpired, setIsExpired] = useState(false);

  const handleChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = text;
    setVerificationCode(newVerificationCode);

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      index > 0 &&
      verificationCode[index] === ""
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = async (index: number) => {
    try {
      const content = await Clipboard.getString();

      if (/^\d{6}$/.test(content)) {
        const digits = content.split("");
        setVerificationCode(digits);

        inputRefs.current[5]?.focus();
      }
    } catch (error) {
      console.error("Failed to paste text: ", error);
    }
  };

  const handleSubmit = async () => {
    const code = verificationCode.join("");
    if (code.length === 6) {
      console.log("Submitting verification code:", code);
      setLoading(true);
      const RequestBody = {
        verification_code: code,
      };

      const signUpToken = await AsyncStorage.getItem("signUpToken");

      await axiosApi
        .post("https://api-gocami-test.gocami.com/api/verify", RequestBody, {
          headers: {
            Authorization: `Bearer ${signUpToken}`,
          },
        })
        .then(async (response) => {
          console.log(response.status);
          if (response.status === 200) {
            await AsyncStorage.removeItem("signUpToken");
          }
        })
        .then(async () => {
          //automatic login by taking his information
          //pass email and body
          const RequestBody = {
            email,
            password,
          };
          await axiosApi
            .post("https://api-gocami-test.gocami.com/api/login", RequestBody)
            .then(async (response) => {
              if (response.data.status) {
                // const userJSON = JSON.stringify(response.data.data.user);
                setUser(response.data.data.user);
                setToken(response.data.data.token);
                setIsLogged(true);
                router.replace("/(tabs)/home");
              }
            });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Show error if code is incomplete
      console.log("Please enter a complete verification code");
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Request a new code
  const requestNewCode = () => {
    setTimeLeft(600);
    setIsExpired(false);
    setVerificationCode(["", "", "", "", "", ""]);
    // Here you would typically call your API to request a new code
    console.log("Requesting new verification code");
  };

  return (
    <View className="flex-1 bg-white p-5">
      <TouchableOpacity className="mt-5 p-2" onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View className="flex-1 justify-center items-center px-5">
        <View className="bg-indigo-50 p-6 rounded-full mb-6">
          <Ionicons name="shield-checkmark-outline" size={80} color="#6366F1" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Verification Code
        </Text>

        <Text className="text-base text-gray-500 text-center mb-8 leading-6">
          We've sent a verification code to{" "}
          <Text className="font-semibold text-indigo-600">{email}</Text>
        </Text>

        {/* Verification code inputs */}
        <View className="flex-row justify-between w-full mb-8">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              className="w-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 mx-1"
              maxLength={1}
              keyboardType="number-pad"
              value={verificationCode[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => {
                if (Platform.OS === "web") {
                  handlePaste(index);
                }
              }}
              onPaste={() => handlePaste(index)}
            />
          ))}
        </View>

        {/* Timer */}
        <View className="mb-8 items-center">
          {isExpired ? (
            <TouchableOpacity onPress={requestNewCode}>
              <Text className="text-indigo-600 font-semibold">
                Request New Code
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="items-center">
              <Text className="text-gray-500 mb-1">Code expires in</Text>
              <Text className="text-xl font-semibold text-indigo-600">
                {formatTime(timeLeft)}
              </Text>
            </View>
          )}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center justify-center ${
            verificationCode.join("").length === 6 && !isExpired
              ? "bg-indigo-600"
              : "bg-gray-300"
          }`}
          onPress={handleSubmit}
          disabled={verificationCode.join("").length !== 6 || isExpired}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-base font-semibold text-white">Verify</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
