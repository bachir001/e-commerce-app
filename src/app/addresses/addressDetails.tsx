import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { Address } from ".";
import { Colors } from "@/constants/Colors";
import DeliveryInformation from "./deliveryInformation";

export default function AddressDetails() {
  const { address } = useLocalSearchParams();
  const router = useRouter();
  const addressParsed: Address = JSON.parse(address as string);

  const handleEdit = () => {
    router.push({
      pathname: "/addresses/editAddress",
      params: {
        address: JSON.stringify(addressParsed),
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 bg-white shadow-sm">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 items-center justify-center"
          >
            <FontAwesome5 name="arrow-left" size={18} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Address Details
          </Text>
          <TouchableOpacity
            onPress={handleEdit}
            className="w-10 h-10 items-center justify-center"
          >
            <FontAwesome5 name="edit" size={18} color="#6366F1" />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          {/* Address Name & Default Status */}
          <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">
                {addressParsed.name}
              </Text>
              {addressParsed.is_default === 1 && (
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-medium text-sm">
                    Default
                  </Text>
                </View>
              )}
            </View>

            {addressParsed.status === 1 ? (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-600 font-medium">Active</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <Text className="text-red-600 font-medium">Inactive</Text>
              </View>
            )}
          </View>

          {/* Address Information */}
          <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View
                style={{ backgroundColor: Colors.PRIMARY }}
                className={`w-10 h-10 rounded-full items-center justify-center mr-3`}
              >
                <FontAwesome5 name="map-marker-alt" size={16} color="white" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">
                Location
              </Text>
            </View>

            <View className="space-y-3">
              <View>
                <Text className="text-sm text-gray-500 mb-1">
                  Street Address
                </Text>
                <Text className="text-gray-800 font-medium">
                  {addressParsed.street}
                </Text>
                {addressParsed.street_2 && (
                  <Text className="text-gray-600 mt-1">
                    {addressParsed.street_2}
                  </Text>
                )}
              </View>

              <View className="flex-row space-x-4 mt-2">
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">Area</Text>
                  <Text className="text-gray-800 font-medium">
                    {addressParsed.area}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">
                    Postal Code
                  </Text>
                  <Text className="text-gray-800 font-medium">
                    {addressParsed.postal_code}
                  </Text>
                </View>
              </View>

              <View className="flex-row space-x-4 mt-2">
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">City</Text>
                  <Text className="text-gray-800 font-medium">
                    {addressParsed.city}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-500 mb-1">
                    Governorate
                  </Text>
                  <Text className="text-gray-800 font-medium">
                    {addressParsed.governorate}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-sm text-gray-500 mb-1 mt-2">Country</Text>
                <Text className="text-gray-800 font-medium">
                  {addressParsed.country}
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Information */}
          <DeliveryInformation addressParsed={addressParsed} />

          {/* Action Buttons */}
          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleEdit}
              style={{ backgroundColor: Colors.PRIMARY }}
              className={` py-4 px-6 rounded-2xl flex-row items-center justify-center shadow-sm`}
            >
              <FontAwesome5 name="edit" size={16} color="white" />
              <Text className="text-white font-semibold ml-2">
                Edit Address
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-100 py-4 px-6 rounded-2xl flex-row items-center justify-center">
              <FontAwesome5 name="map" size={16} color="#6B7280" />
              <Text className="text-gray-700 font-semibold ml-2">
                View on Map
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-gray-100 rounded-2xl p-4 mt-4">
            <Text className="text-sm text-gray-500 mb-2">
              Address Information
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-xs text-gray-400">
                ID: {addressParsed.id}
              </Text>
              <Text className="text-xs text-gray-400">
                User Address ID: {addressParsed.user_address_id}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
