import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import axiosApi from "@/apis/axiosApi";
import * as SecureStore from "expo-secure-store";
import { Colors } from "@/constants/Colors";

import ChangePasswordModal from "@/components/account/ChangePasswordModal";
import { useSessionStore } from "@/store/useSessionStore";
import DotsLoader from "@/components/common/AnimatedLayout";
interface UpdateBody {
  first_name?: string;
  last_name?: string;
  mobile?: string;
  date_of_birth?: string;
}

export default function EditProfile() {
  const { user, token, setUser } = useSessionStore();

  const [firstName, setFirstName] = useState<string>(user?.first_name ?? "");
  const [lastName, setLastName] = useState<string>(user?.last_name ?? "");
  const [mobile, setMobile] = useState<string | null>(user?.mobile ?? "");
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(
    user?.date_of_birth ?? ""
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [passLoading, setPassLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  const router = useRouter();

  const handlePasswordChange = async () => {
    try {
      setPassLoading(true);

      const response = await axiosApi.post(
        "users-data/update",
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        Toast.show({
          type: "success",
          text1: "Password Updated",
          text2: "Your password has been changed successfully.",
          topOffset: 60,
          autoHide: true,
          visibilityTime: 1000,
        });
        setIsModalVisible(false);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Failed to update password",
        topOffset: 60,
        autoHide: true,
        visibilityTime: 2000,
      });
    } finally {
      setPassLoading(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const handleEdit = async () => {
    try {
      const updateBody: UpdateBody = {};

      if (firstName !== user?.first_name) updateBody.first_name = firstName;

      if (lastName !== user?.last_name) updateBody.last_name = lastName;

      if (mobile !== user?.mobile && mobile !== null)
        updateBody.mobile = mobile;

      if (dateOfBirth !== user?.date_of_birth && dateOfBirth !== null)
        updateBody.date_of_birth = dateOfBirth;

      // const genderId = gender === "Female" ? 2 : 1;
      // if (genderId !== user.gender_id) updateBody.gender_id = genderId;

      const objectValues = Object.values(updateBody);

      const noChange = objectValues.every((input) => input === null);

      if (noChange) {
        Toast.show({
          type: "error",
          text1: "Cannot update",
          text2: "Provide new values",
          autoHide: true,
          visibilityTime: 2000,
          topOffset: 60,
        });
      } else {
        try {
          setLoading(true);

          await axiosApi
            .post("users-data/update", updateBody, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then(async (response) => {
              if (response.data.status) {
                Toast.show({
                  type: "success",
                  text1: "Update Success",
                  text2: `Updated ${firstName}'s profile!`,
                  autoHide: true,
                  visibilityTime: 1000,
                  topOffset: 60,
                });

                const updatedUserData = {
                  ...user,
                  ...(updateBody.first_name !== undefined && {
                    first_name: updateBody.first_name,
                  }),
                  ...(updateBody.last_name !== undefined && {
                    last_name: updateBody.last_name,
                  }),
                  ...(updateBody.mobile !== undefined && {
                    mobile: updateBody.mobile,
                  }),
                  ...(updateBody.date_of_birth !== undefined && {
                    date_of_birth: updateBody.date_of_birth,
                  }),
                };

                setUser(updatedUserData);

                await SecureStore.setItemAsync(
                  "user",
                  JSON.stringify(updatedUserData)
                );

                router.replace("/(tabs)/account");
              }
            })
            .finally(() => {
              setLoading(false);
            });
        } catch (err) {
          console.error(err);
          Toast.show({
            type: "error",
            text1: "Cannot update",
            text2: "Error updating profile",
            autoHide: true,
            visibilityTime: 2000,
            topOffset: 60,
          });
        }
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Cannot update profile",
        topOffset: 60,
        autoHide: true,
        visibilityTime: 2000,
      });
    }
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <FontAwesome5 name="arrow-left" size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Edit Profile
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: Colors.PRIMARY }}
          className={`px-4 py-2 rounded-lg`}
          onPress={() => {
            handleEdit();
          }}
        >
          {loading ? (
            <DotsLoader size="small" color="white" />
          ) : (
            <Text className="text-white font-medium text-sm">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                First Name
              </Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Enter first name"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2 mt-5">
                Last Name
              </Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Enter last name"
              />
            </View>

            <Text className="text-sm font-medium text-gray-700 mb-2 mt-5">
              Mobile Number
            </Text>
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
                value={mobile ?? ""}
                onChangeText={setMobile}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2 mt-5">
                Date of Birth
              </Text>
              <TouchableOpacity className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
                <Text className="text-gray-800">{dateOfBirth}</Text>
                <FontAwesome5 name="calendar-alt" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Account Actions
          </Text>

          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-100"
            onPress={() => {
              setIsModalVisible(true);
            }}
          >
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <FontAwesome5 name="key" size={16} color="#3B82F6" />
            </View>
            <Text className="flex-1 text-gray-800">Change Password</Text>
            <FontAwesome5 name="chevron-right" size={14} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
              <FontAwesome5 name="bell" size={16} color="#10B981" />
            </View>
            <Text className="flex-1 text-gray-800">Notification Settings</Text>
            <FontAwesome5 name="chevron-right" size={14} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3">
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
              <FontAwesome5 name="trash" size={16} color="#EF4444" />
            </View>
            <Text className="flex-1 text-red-500">Delete Account</Text>
            <FontAwesome5 name="chevron-right" size={14} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ChangePasswordModal
        isVisible={isModalVisible}
        onClose={onCloseModal}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmNewPassword={confirmNewPassword}
        setConfirmNewPassword={setConfirmNewPassword}
        onSave={handlePasswordChange}
        loading={passLoading}
      />
    </SafeAreaView>
  );
}
