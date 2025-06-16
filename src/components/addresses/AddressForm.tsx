import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import type { Address } from "@/app/(tabs)/account/addresses";
import { Colors } from "@/constants/Colors";
import axiosApi from "@/apis/axiosApi";
import { CustomPicker } from "./CustomPicker";
import { PickerModal } from "./PickerModal";
import AddressInput from "./AddressInput";
import Toast from "react-native-toast-message";
import useAddAddress from "@/hooks/addresses/addAddress";
import { useSessionStore } from "@/store/useSessionStore";

export interface Governorate {
  id: number;
  name: string;
  code: string;
}

interface City {
  id: number;
  name: string;
  code: string;
  governorate_id: number;
}

interface Area {
  id: number;
  name: string;
  code: string;
  price: number;
  city_id: number;
  user_free_delivery: number;
}

export default function AddressForm({
  type,
  addressParsed,
}: {
  type: "create" | "edit";
  addressParsed?: Address;
  addAddressCallback?: (address: Address) => void;
}) {
  const router = useRouter();

  // Form states
  const [name, setName] = useState(addressParsed?.name || "");
  const [street, setStreet] = useState(addressParsed?.street || "");
  const [street2, setStreet2] = useState(addressParsed?.street_2 || "");

  const [isDefault, setIsDefault] = useState(addressParsed?.is_default === 1);
  const [status, setStatus] = useState(true);

  // Selected location states
  const [selectedGovernorate, setSelectedGovernorate] = useState<
    Governorate | undefined
  >();
  const [selectedCity, setSelectedCity] = useState<City | undefined>();
  const [selectedArea, setSelectedArea] = useState<Area | undefined>();

  // Location data
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  // Modal states
  const [showGovernorateModal, setShowGovernorateModal] =
    useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [showAreaModal, setShowAreaModal] = useState<boolean>(false);

  //Loading States
  const [governorateLoading, setGovernorateLoading] = useState<boolean>(false);
  const [cityLoading, setCityLoading] = useState<boolean>(false);
  const [areaLoading, setAreaLoading] = useState<boolean>(false);

  const { token, governorates, setGovernorates } = useSessionStore((state) => ({
    token: state.token,
    governorates: state.governorates,
    setGovernorates: state.setGovernorates,
  }));

  const addAddressMutation = useAddAddress();

  const handleCancel = () => {
    router.back();
  };

  //SELECTION
  const handleGovernorateSelect = async (governorate: Governorate) => {
    setSelectedGovernorate(governorate);
    // Reset
    setSelectedCity(undefined);
    setSelectedArea(undefined);
    setCities([]);
    setAreas([]);

    fetchCities(governorate.code);
  };

  const handleCitySelect = async (city: City) => {
    setSelectedCity(city);
    setSelectedArea(undefined);
    setAreas([]);

    fetchAreas(city.code);
  };

  //ACTIONS
  const handleCreateAddress = async () => {
    if (
      !name ||
      !street ||
      !selectedGovernorate ||
      !selectedCity ||
      !selectedArea
    ) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill all required fields.",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    const addressData = {
      id: tempId,
      name,
      street,
      street_2: street2,
      governorate_id: selectedGovernorate?.id,
      city_id: selectedCity?.id,
      area_id: selectedArea?.id,
      is_default: isDefault ? 1 : 0,
      country_id: 1,
      status: status ? 1 : 0,
    };

    await addAddressMutation.mutateAsync(addressData);
  };

  const handleUpdateAddress = async () => {};

  //FETCHING
  const fetchGovernorates = async () => {
    try {
      setGovernorateLoading(true);
      const response = await axiosApi.get("governorates");
      if (response.data.status) {
        setGovernorates(response.data.data);
      }

      setGovernorateLoading(false);
    } catch (err) {
      console.error("Error fetching governorates: ", err);
      setGovernorateLoading(false);
    }
  };

  const fetchCities = async (code: string) => {
    try {
      setCityLoading(true);
      const response = await axiosApi.get(`cities/${code}`);

      console.log("CITIESSS:", response.data.data);

      if (response.data.status) {
        setCities(response.data.data);
      }

      setCityLoading(false);
    } catch (err) {
      console.error("Error fetching cities: ", err);
      setCityLoading(false);
    }
  };

  const fetchAreas = async (code: string) => {
    try {
      setAreaLoading(true);
      const response = await axiosApi.get(`/areas/${code}`);
      if (response.data.status) {
        setAreas(response.data.data);
      }

      setAreaLoading(false);
    } catch (err) {
      console.error("Error fetching areas: ", err);
      setAreaLoading(false);
    }
  };

  useEffect(() => {
    if (governorates.length === 0) {
      fetchGovernorates();
    }

    if (type === "edit") {
      if (addressParsed?.governorate_code) {
        Promise.all([
          fetchCities(addressParsed?.governorate_code),
          fetchAreas(addressParsed?.city_code),
        ]);
      }
    }
  }, []);

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
          {type === "create" ? "Add Address" : "Edit Address"}
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
              <AddressInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Home, Office"
                headerName="Address Name"
              />

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
              <AddressInput
                value={street}
                onChangeText={setStreet}
                placeholder="Enter street address"
                headerName="Street Address"
              />

              <AddressInput
                value={street2}
                onChangeText={setStreet2}
                placeholder="Apartment, suite, etc."
                headerName="Street Address 2 (Optional)"
              />

              {/* Location Pickers */}
              <CustomPicker
                label="Governorate"
                value={
                  selectedGovernorate?.name || addressParsed?.governorate || ""
                }
                placeholder="Select a governorate"
                onPress={() => setShowGovernorateModal(true)}
                loading={governorateLoading}
              />

              <CustomPicker
                label="City"
                value={
                  selectedCity?.name ||
                  (!selectedGovernorate ? addressParsed?.city : "") ||
                  ""
                }
                placeholder="Select a city"
                onPress={() => setShowCityModal(true)}
                disabled={
                  !addressParsed?.city && (!selectedGovernorate || cityLoading)
                }
                loading={cityLoading}
              />

              <CustomPicker
                label="Area"
                value={
                  selectedArea?.name ||
                  (!selectedCity && !selectedGovernorate
                    ? addressParsed?.area
                    : "") ||
                  ""
                }
                placeholder="Select an area"
                onPress={() => setShowAreaModal(true)}
                disabled={
                  !addressParsed?.area && (!selectedCity || areaLoading)
                }
                loading={areaLoading}
              />

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Country
                </Text>
                <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800">
                  <Text>Lebanon</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Delivery Settings */}
          {selectedArea && (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <FontAwesome5 name="truck" size={16} color="#22C55E" />
                </View>
                <Text className="text-lg font-semibold text-gray-800">
                  Delivery Information
                </Text>
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">Delivery Price</Text>
                  <Text className="text-gray-800 font-semibold">
                    ${selectedArea.price.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mb-6">
            {!addAddressMutation.isPending && (
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-gray-100 py-4 px-6 rounded-2xl items-center justify-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{ backgroundColor: Colors.PRIMARY }}
              className="flex-1 py-4 px-6 rounded-2xl items-center justify-center shadow-sm"
              onPress={() => {
                if (type === "create") {
                  handleCreateAddress();
                } else {
                  handleUpdateAddress();
                }
              }}
            >
              {addAddressMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">
                  {type === "create" ? "Create Address" : "Update Address"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Picker Modals */}
      <PickerModal
        visible={showGovernorateModal}
        title="Select Governorate"
        items={governorates}
        onSelect={handleGovernorateSelect}
        onClose={() => setShowGovernorateModal(false)}
      />

      <PickerModal
        visible={showCityModal}
        title="Select City"
        items={cities}
        onSelect={handleCitySelect}
        onClose={() => setShowCityModal(false)}
      />

      <PickerModal
        visible={showAreaModal}
        title="Select Area"
        items={areas}
        onSelect={(area: Area) => {
          setSelectedArea(area);
        }}
        onClose={() => setShowAreaModal(false)}
      />
    </SafeAreaView>
  );
}
