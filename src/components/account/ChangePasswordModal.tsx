import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import DotsLoader from "../common/AnimatedLayout";

interface ChangePasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (value: string) => void;
  onSave: () => void;
  loading?: boolean;
}

export default function ChangePasswordModal({
  isVisible,
  onClose,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  onSave,
  loading = false,
}: ChangePasswordModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFormValid =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmNewPassword.length > 0;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={{ justifyContent: "flex-end", margin: 0 }}
      backdropOpacity={0.6}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View className="bg-white rounded-t-3xl overflow-hidden">
        {/* Drag Indicator */}
        <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-6" />

        <View className="px-6 pb-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="lock" size={18} color="#5e3ebd" />
              </View>
              <View>
                <Text className="text-xl font-bold text-gray-800">
                  Change Password
                </Text>
                <Text className="text-sm text-gray-500">
                  Update your account security
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <FontAwesome5 name="times" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="space-y-5">
            {/* Current Password */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Current Password
              </Text>
              <View className="relative">
                <TextInput
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-3.5"
                >
                  <FontAwesome5
                    name={showCurrentPassword ? "eye-slash" : "eye"}
                    size={16}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View className="mt-3">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                New Password
              </Text>
              <View className="relative">
                <TextInput
                  secureTextEntry={!showNewPassword}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-3.5"
                >
                  <FontAwesome5
                    name={showNewPassword ? "eye-slash" : "eye"}
                    size={16}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {newPassword.length > 0 && (
                <View className="mt-2">
                  <View className="flex-row items-center">
                    <View
                      className={`w-2 h-2 rounded-full mr-2 ${
                        newPassword.length >= 8 ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <Text
                      className={`text-xs ${
                        newPassword.length >= 8
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      At least 8 characters
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Confirm New Password */}
            <View className="mt-3">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </Text>
              <View className="relative">
                <TextInput
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChangeText={(text: string) => {
                    setConfirmNewPassword(text);
                  }}
                  className={`bg-gray-50 border rounded-xl px-4 py-3.5 pr-12 text-gray-800 ${
                    confirmNewPassword.length > 0 &&
                    newPassword !== confirmNewPassword
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5"
                >
                  <FontAwesome5
                    name={showConfirmPassword ? "eye-slash" : "eye"}
                    size={16}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {confirmNewPassword.length > 0 &&
                newPassword !== confirmNewPassword && (
                  <View className="flex-row items-center mt-2">
                    <FontAwesome5
                      name="exclamation-circle"
                      size={12}
                      color="#EF4444"
                    />
                    <Text className="text-xs text-red-500 ml-1">
                      Passwords do not match
                    </Text>
                  </View>
                )}
            </View>
          </View>

          {/* Security Tips */}
          <View className="bg-blue-50 p-4 rounded-xl mt-6">
            <View className="flex-row items-start">
              <FontAwesome5 name="info-circle" size={16} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-blue-800 mb-1">
                  Security Tips
                </Text>
                <Text className="text-xs text-blue-600 leading-4">
                  Use a strong password with uppercase, lowercase, numbers, and
                  special characters.
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mt-6">
            {!loading && (
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-gray-100 py-4 px-6 rounded-2xl items-center justify-center"
                disabled={loading}
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                if (isFormValid && newPassword === confirmNewPassword) {
                  onSave();
                }
              }}
              disabled={
                !isFormValid || loading || newPassword !== confirmNewPassword
              }
              style={{
                backgroundColor: Colors.PRIMARY,
              }}
              className={`flex-1 py-4 px-6 rounded-2xl items-center justify-center`}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <DotsLoader size="small" color="white" />
                </View>
              ) : (
                <Text className="text-white font-semibold">
                  Update Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
