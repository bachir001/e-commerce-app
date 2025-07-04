import { useState, useRef, useEffect } from "react";
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
import * as SecureStore from "expo-secure-store";
import { Colors } from "@/constants/Colors";
import { useSessionStore } from "@/store/useSessionStore";
import DotsLoader from "@/components/common/AnimatedLayout";
import Toast from "react-native-toast-message";

export default function Verification() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  // const { setIsLogged } = useSessionStore();
  const { email, mobile, isReset } = useLocalSearchParams();

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
  const [lastResendTime, setLastResendTime] = useState(0);

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
      setLoading(true);
      const RequestBody: any = {};

      if (isReset) {
        RequestBody.code = code;
      } else {
        RequestBody.verification_code = code;
      }

      const emailParam = Array.isArray(email) ? email[0] : email;
      const mobileParam = Array.isArray(mobile) ? mobile[0] : mobile;

      if (emailParam) RequestBody.email = emailParam;
      if (mobileParam) RequestBody.mobile = mobileParam;

      const url: string = isReset ? "/password/verify-code" : "/verify-code";
      console.log(RequestBody);
      await axiosApi
        .post(url, RequestBody)
        .then((response) => {
          console.log(response.data);
          if (response.status === 200) {
            if (!isReset) {
              router.navigate({
                pathname: "/auth/createAccount",
                params: {
                  email: email?.toString() || "",
                  mobile: mobile?.toString() || "",
                },
              });
            } else {
              router.navigate({
                pathname: "/auth/completeReset",
              });
            }
          } else {
            Toast.show({
              type: "error",
              text1: "Verification Failed",
              text2: response.data.message || "An unknown error occurred",
              position: "top",
              autoHide: true,
              visibilityTime: 1000,
              topOffset: 60,
            });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleResendCode = async () => {
    const now = Date.now();
    if (now - lastResendTime < 30000) {
      Toast.show({
        type: "info",
        text1: "Please wait",
        text2: "You can request a new code in 30 seconds",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    console.log("Resending code...");

    try {
      setResendLoading(true);
      const RequestBody: any = {};

      if (email) {
        RequestBody.email = email;
        if (isReset) {
          RequestBody.verification_method = "email";
        }
      }

      if (mobile) {
        RequestBody.mobile = mobile;
        if (isReset) {
          RequestBody.verification_method = "whatsapp";
        }
      }

      console.log("Request Body:", RequestBody);

      let url: string;
      if (isReset) {
        url = "/password/forgot";
      } else {
        url = "/register";
      }

      await axiosApi
        .post(url, RequestBody)
        .then((response) => {
          if (response.status === 200) {
            Toast.show({
              type: "success",
              text1: "Code Resent",
              text2: "A new verification code has been sent",
              position: "top",
              visibilityTime: 2000,
              topOffset: 60,
            });
            setTimeLeft(600);
            setIsExpired(false);
            setVerificationCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            setLastResendTime(now);
          }
        })
        .catch((error) => {
          Toast.show({
            type: "error",
            text1: "Failed to Resend",
            text2: error.response?.data?.message || "An error occurred",
            position: "top",
            visibilityTime: 2000,
            topOffset: 60,
          });
        });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to resend verification code",
        position: "top",
        visibilityTime: 2000,
        topOffset: 60,
      });
    } finally {
      setResendLoading(false);
    }
  };

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
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
          <Text className={`font-semibold`} style={{ color: Colors.PRIMARY }}>
            {email}
          </Text>
        </Text>

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
            />
          ))}
        </View>

        <View className="mb-8 items-center">
          {isExpired ? (
            <View className="items-center">
              <Text className="text-gray-500 mb-2">Didn't receive a code?</Text>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendLoading}
                accessibilityLabel="Resend verification code"
                accessibilityHint="Sends a new verification code to your email or phone"
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color={Colors.PRIMARY} />
                ) : (
                  <Text
                    className={`font-semibold`}
                    style={{ color: Colors.PRIMARY }}
                  >
                    Resend Verification Code
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center">
              <Text className="text-gray-500 mb-1">Code expires in</Text>
              <Text
                style={{ color: Colors.PRIMARY }}
                className={`text-xl font-semibold`}
              >
                {formatTime(timeLeft)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center justify-center ${
            verificationCode.join("").length === 6 && !isExpired
              ? `bg-[#5e3ebd]`
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
