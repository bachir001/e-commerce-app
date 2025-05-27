import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
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
import { SessionContext } from "@/app/_layout";
import Toast from "react-native-toast-message";

interface Governorate {
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
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  // Modal states
  const [showGovernorateModal, setShowGovernorateModal] =
    useState<boolean>(false);
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [showAreaModal, setShowAreaModal] = useState<boolean>(false);

  // Error states
  const [governoratesError, setGovernoratesError] = useState<string>("");
  const [citiesError, setCitiesError] = useState<string>("");
  const [areasError, setAreasError] = useState<string>("");

  //Loading States
  const [governorateLoading, setGovernorateLoading] = useState<boolean>(false);
  const [cityLoading, setCityLoading] = useState<boolean>(false);
  const [areaLoading, setAreaLoading] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const { token, setAddresses, addresses } = useContext(SessionContext);

  const handleCancel = () => {
    router.back();
  };

  const handleGovernorateSelect = async (governorate: Governorate) => {
    setSelectedGovernorate(governorate);
    // Reset
    setSelectedCity(undefined);
    setSelectedArea(undefined);
    setCities([]);
    setAreas([]);

    try {
      setCityLoading(true);
      const response = await axiosApi.get(`/cities/${governorate.code}`);
      if (response.data.status) {
        setCities(response.data.data);
      } else {
        setCitiesError(response.data.message);
      }

      setCityLoading(false);
    } catch (err) {
      console.error("Error fetching cities: ", err);
      setCitiesError("Error fetching cities");
      setCityLoading(false);
    }
  };

  const handleCitySelect = async (city: City) => {
    setSelectedCity(city);
    setSelectedArea(undefined);
    setAreas([]);

    try {
      setAreaLoading(true);
      const response = await axiosApi.get(`/areas/${city.code}`);
      if (response.data.status) {
        setAreas(response.data.data);
      } else {
        setAreasError(response.data.message);
      }

      setAreaLoading(false);
    } catch (err) {
      console.error("Error fetching areas: ", err);
      setAreasError("Error fetching areas");
      setAreaLoading(false);
    }
  };

  const handleAreaSelect = (area: Area) => {
    setSelectedArea(area);
  };

  const handleCreateAddress = async () => {
    try {
      setLoading(true);

      const addressData = {
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
      console.log(addressData);
      console.log(token);
      const HeaderData = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axiosApi.post(
        "addresses/add",
        addressData,
        HeaderData
      );
      console.log(response.data);
      if (response.data.status) {
        Toast.show({
          type: "success",
          text1: "Address created successfully",
          text2: "Your address has been added successfully",
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });

        setAddresses([...addresses, response.data.data]);
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Error creating address",
          text2: response.data.message,
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error("Error creating address: ", err);
      Toast.show({
        type: "error",
        text1: "Error creating address",
        text2: "Something went wrong",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {};

  useEffect(() => {
    const fetchGovernorates = async () => {
      try {
        setGovernorateLoading(true);
        const response = await axiosApi.get("governorates");
        if (response.data.status) {
          setGovernorates(response.data.data);
        } else {
          setGovernoratesError(response.data.message);
        }

        setGovernorateLoading(false);
      } catch (err) {
        console.error("Error fetching governorates: ", err);
        setGovernoratesError("Error fetching governorates");
        setGovernorateLoading(false);
      }
    };

    fetchGovernorates();
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
                value={selectedGovernorate?.name || ""}
                placeholder="Select a governorate"
                onPress={() => setShowGovernorateModal(true)}
                loading={governorateLoading}
              />

              <CustomPicker
                label="City"
                value={selectedCity?.name || ""}
                placeholder="Select a city"
                onPress={() => setShowCityModal(true)}
                disabled={!selectedGovernorate || cityLoading}
                loading={cityLoading}
              />

              <CustomPicker
                label="Area"
                value={selectedArea?.name || ""}
                placeholder="Select an area"
                onPress={() => setShowAreaModal(true)}
                disabled={!selectedCity || areaLoading}
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

                {/* {selectedArea.user_free_delivery === 1 && (
                  <View className="bg-green-50 p-3 rounded-xl">
                    <View className="flex-row items-center">
                      <FontAwesome5
                        name="check-circle"
                        size={16}
                        color="#22C55E"
                      />
                      <Text className="text-green-700 font-medium ml-2">
                        Free Delivery Available
                      </Text>
                    </View>
                  </View>
                )} */}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mb-6">
            {!loading && (
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
              {loading ? (
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
        onSelect={handleAreaSelect}
        onClose={() => setShowAreaModal(false)}
      />
    </SafeAreaView>
  );
}
