import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { Address } from "@/app/(tabs)/account/addresses";
import { Colors } from "@/constants/Colors";

export default function AddressForm({
  type,
  addressParsed,
}: {
  type: "create" | "edit";
  addressParsed?: Address;
}) {
  const router = useRouter();

  // Form states
  const [name, setName] = useState(addressParsed?.name || "");
  const [street, setStreet] = useState(addressParsed?.street || "");
  const [street2, setStreet2] = useState(addressParsed?.street_2 || "");
  const [postalCode, setPostalCode] = useState(
    addressParsed?.postal_code?.toString() || ""
  );
  const [area, setArea] = useState(addressParsed?.area || "");
  const [city, setCity] = useState(addressParsed?.city || "");
  const [governorate, setGovernorate] = useState(
    addressParsed?.governorate || ""
  );
  const [country, setCountry] = useState(addressParsed?.country || "");
  const [deliveryPrice, setDeliveryPrice] = useState(
    addressParsed?.delivery_price?.toString() || ""
  );
  const [freeDelivery, setFreeDelivery] = useState(
    addressParsed?.free_delivery === 1
  );
  const [freeDeliveryPrice, setFreeDeliveryPrice] = useState(
    addressParsed?.free_delivery_price?.toString() || ""
  );
  const [isDefault, setIsDefault] = useState(addressParsed?.is_default === 1);
  const [status, setStatus] = useState(addressParsed?.status === 1);

  const handleCancel = () => {
    router.back();
  };

  //   const handleEdit = () => {
  //     // Prepare the updated address object
  //     const updatedAddress: Address = {
  //       ...addressParsed,
  //       name,
  //       street,
  //       street_2: street2,
  //       postal_code: Number.parseInt(postalCode) || 0,
  //       area,
  //       city,
  //       governorate,
  //       country,
  //       delivery_price: Number.parseFloat(deliveryPrice) || 0,
  //       free_delivery: freeDelivery ? 1 : 0,
  //       free_delivery_price: Number.parseFloat(freeDeliveryPrice) || 0,
  //       is_default: isDefault ? 1 : 0,
  //       status: status ? 1 : 0,
  //     };

  //     // Here you would handle the API call
  //     console.log("Updated address:", updatedAddress);
  //   };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white shadow-sm">
        <TouchableOpacity
          onPress={handleCancel}
          className="w-10 h-10 items-center justify-center"
        >
          <FontAwesome5 name="times" size={18} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Edit Address
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Basic Information */}
          <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="tag" size={16} color="#6366F1" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">
                Basic Information
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Address Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Home, Office"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-700">
                      Set as Default
                    </Text>
                    <Switch
                      value={isDefault}
                      onValueChange={setIsDefault}
                      trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }}
                      thumbColor={isDefault ? "#6366F1" : "#9CA3AF"}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-700">
                      Active Status
                    </Text>
                    <Switch
                      value={status}
                      onValueChange={setStatus}
                      trackColor={{ false: "#E5E7EB", true: "#BBF7D0" }}
                      thumbColor={status ? "#22C55E" : "#9CA3AF"}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Address Details */}
          <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="map-marker-alt" size={16} color="#3B82F6" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">
                Address Details
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </Text>
                <TextInput
                  value={street}
                  onChangeText={setStreet}
                  placeholder="Enter street address"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2 mt-2">
                  Street Address 2 (Optional)
                </Text>
                <TextInput
                  value={street2}
                  onChangeText={setStreet2}
                  placeholder="Apartment, suite, etc."
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="flex-row space-x-3 mt-2">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Area
                  </Text>
                  <TextInput
                    value={area}
                    onChangeText={setArea}
                    placeholder="Area"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </Text>
                  <TextInput
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder="12345"
                    keyboardType="numeric"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View className="flex-row space-x-3 mt-2">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    City
                  </Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Governorate
                  </Text>
                  <TextInput
                    value={governorate}
                    onChangeText={setGovernorate}
                    placeholder="Governorate"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View className="mt-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Country
                </Text>
                <TextInput
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Country"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Delivery Settings */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <FontAwesome5 name="truck" size={16} color="#22C55E" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">
                Delivery Settings
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Delivery Price ($)
                </Text>
                <TextInput
                  value={deliveryPrice}
                  onChangeText={setDeliveryPrice}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-700">
                  Free Delivery Available
                </Text>
                <Switch
                  value={freeDelivery}
                  onValueChange={setFreeDelivery}
                  trackColor={{ false: "#E5E7EB", true: "#BBF7D0" }}
                  thumbColor={freeDelivery ? "#22C55E" : "#9CA3AF"}
                />
              </View>

              {freeDelivery && (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Minimum Order for Free Delivery ($)
                  </Text>
                  <TextInput
                    value={freeDeliveryPrice}
                    onChangeText={setFreeDeliveryPrice}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mb-6">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 bg-gray-100 py-4 px-6 rounded-2xl items-center justify-center"
            >
              <Text className="text-gray-700 font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              //   onPress={handleEdit}
              style={{
                backgroundColor: Colors.PRIMARY,
              }}
              className={`flex-1 py-4 px-6 rounded-2xl items-center justify-center shadow-sm`}
            >
              <Text className="text-white font-semibold">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
