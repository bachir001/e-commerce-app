import { useEffect, useState, useMemo } from "react";
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
import type { Address } from "@/app/addresses";
import { Colors } from "@/constants/Colors";
import axiosApi from "@/apis/axiosApi";
import { CustomPicker } from "./CustomPicker";
import { PickerModal } from "./PickerModal";
import AddressInput from "./AddressInput";
import Toast from "react-native-toast-message";
import useAddAddress from "@/hooks/addresses/addAddress";
import { useSessionStore } from "@/store/useSessionStore";
import { useQueryClient } from "@tanstack/react-query";

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

interface AddressFormProps {
  type: "create" | "edit";
  addressParsed?: Address;
  addAddressCallback?: (address: Address) => void;
}

interface LoadingState {
  governorate: boolean;
  city: boolean;
  area: boolean;
}

interface ModalState {
  governorate: boolean;
  city: boolean;
  area: boolean;
}

export default function AddressForm({ type, addressParsed }: AddressFormProps) {
  const router = useRouter();
  const { token, governorates, setGovernorates } = useSessionStore();
  const addAddressMutation = useAddAddress();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: addressParsed?.name || "",
    street: addressParsed?.street || "",
    street2: addressParsed?.street_2 || "",
    isDefault: addressParsed?.is_default === 1,
    status: true,
  });

  // Initialize locations with parsed address data for edit mode
  const [locations, setLocations] = useState<{
    governorate: Governorate | undefined;
    city: City | undefined;
    area: Area | undefined;
  }>(() => {
    if (addressParsed) {
      return {
        governorate:
          addressParsed.governorate_id &&
          addressParsed.governorate &&
          addressParsed.governorate_code
            ? {
                id: addressParsed.governorate_id,
                name: addressParsed.governorate,
                code: addressParsed.governorate_code,
              }
            : undefined,
        city:
          addressParsed.city_id &&
          addressParsed.city &&
          addressParsed.city_code &&
          addressParsed.governorate_id
            ? {
                id: addressParsed.city_id,
                name: addressParsed.city,
                code: addressParsed.city_code,
                governorate_id: addressParsed.governorate_id,
              }
            : undefined,
        area:
          addressParsed.area_id &&
          addressParsed.area &&
          addressParsed.area_code &&
          addressParsed.city_id &&
          addressParsed.area_price !== undefined
            ? {
                id: addressParsed.area_id,
                name: addressParsed.area,
                code: addressParsed.area_code,
                price: addressParsed.area_price,
                city_id: addressParsed.city_id,
                user_free_delivery: addressParsed.user_free_delivery || 0,
              }
            : undefined,
      };
    }
    return {
      governorate: undefined,
      city: undefined,
      area: undefined,
    };
  });

  const [locationData, setLocationData] = useState({
    cities: [] as City[],
    areas: [] as Area[],
  });

  const [loading, setLoading] = useState<LoadingState>({
    governorate: false,
    city: false,
    area: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const [modals, setModals] = useState<ModalState>({
    governorate: false,
    city: false,
    area: false,
  });

  const handleCancel = () => router.back();

  const showToast = () => {
    Toast.show({
      type: "error",
      text1: "Validation Error",
      text2: "Please fill all required fields.",
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  };

  const handleGovernorateSelect = async (governorate: Governorate) => {
    setLocations((prev) => ({ ...prev, governorate: governorate }));
    setLocations((prev) => ({ ...prev, city: undefined }));
    setLocations((prev) => ({ ...prev, area: undefined }));
    setLocationData((prev) => ({ ...prev, cities: [] }));
    setLocationData((prev) => ({ ...prev, areas: [] }));
    await fetchCities(governorate.code);
  };

  const handleCitySelect = async (city: City) => {
    setLocations((prev) => ({ ...prev, city: city }));
    setLocations((prev) => ({ ...prev, area: undefined }));
    setLocationData((prev) => ({ ...prev, areas: [] }));
    await fetchAreas(city.code);
  };

  const fetchGovernorates = async () => {
    try {
      setLoading((prev) => ({ ...prev, governorate: true }));
      const response = await axiosApi.get("/governorates");
      if (response.data.status) {
        setGovernorates(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching governorates: ", err);
    } finally {
      setLoading((prev) => ({ ...prev, governorate: false }));
    }
  };

  const fetchCities = async (code: string) => {
    try {
      setLoading((prev) => ({ ...prev, city: true }));
      const response = await axiosApi.get(`/cities/${code}`);
      if (response.data.status) {
        setLocationData((prev) => ({ ...prev, cities: response.data.data }));
      }
    } catch (err) {
      console.error("Error fetching cities: ", err);
    } finally {
      setLoading((prev) => ({ ...prev, city: false }));
    }
  };

  const fetchAreas = async (code: string) => {
    try {
      setLoading((prev) => ({ ...prev, area: true }));
      const response = await axiosApi.get(`/areas/${code}`);
      if (response.data.status) {
        setLocationData((prev) => ({ ...prev, areas: response.data.data }));
      }
    } catch (err) {
      console.error("Error fetching areas: ", err);
    } finally {
      setLoading((prev) => ({ ...prev, area: false }));
    }
  };

  const handleCreateAddress = async () => {
    const { name, street } = formData;
    const { governorate, city, area } = locations;

    if (!name || !street || !governorate || !city || !area) {
      showToast();
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const addressData = {
      id: tempId,
      name,
      street,
      street_2: formData.street2,
      governorate_id: governorate.id,
      city_id: city.id,
      area_id: area.id,
      is_default: formData.isDefault ? 1 : 0,
      country_id: 1,
      status: formData.status ? 1 : 0,
    };

    await addAddressMutation.mutateAsync(addressData);
  };

  const handleUpdateAddress = async () => {
    setIsLoading(true);
    try {
      const { name, street } = formData;
      const { governorate, city, area } = locations;

      if (!name || !street || !addressParsed?.id) {
        showToast();
        return;
      }

      const addressData = {
        id: addressParsed?.id,
        name,
        street,
        street_2: formData.street2,
        governorate_id: governorate?.id,
        city_id: city?.id,
        area_id: area?.id,
        is_default: formData.isDefault ? 1 : 0,
        country_id: 1,
        status: formData.status ? 1 : 0,
      };

      const response = await axiosApi.post(
        `/addresses/update/${addressParsed.id}?_method=PUT`,
        addressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        await queryClient.invalidateQueries({ queryKey: ["addresses", token] });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Update Failed",
          text2: response.data.message,
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err instanceof Error ? err.message : "An error occurred",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isCreateMode = useMemo(() => type === "create", [type]);

  const deliveryInfo = useMemo(() => {
    if (!locations.area) return null;
    return (
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
              ${locations.area.price.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [locations.area]);

  const pickerValues = useMemo(
    () => ({
      governorate:
        locations.governorate?.name || addressParsed?.governorate || "",
      city:
        locations.city?.name ||
        (!locations.governorate ? addressParsed?.city : "") ||
        "",
      area:
        locations.area?.name ||
        (!locations.city && !locations.governorate
          ? addressParsed?.area
          : "") ||
        "",
    }),
    [locations, addressParsed]
  );

  const pickerDisabled = useMemo(
    () => ({
      city: !addressParsed?.city && (!locations.governorate || loading.city),
      area: !addressParsed?.area && (!locations.city || loading.area),
    }),
    [addressParsed, locations, loading]
  );

  useEffect(() => {
    const initData = async () => {
      if (governorates.length === 0) {
        await fetchGovernorates();
      }

      if (type === "edit" && addressParsed?.governorate_code) {
        await Promise.all([
          fetchCities(addressParsed.governorate_code),
          fetchAreas(addressParsed.city_code),
        ]);
      }
    };

    initData();
  }, [type, addressParsed, governorates.length]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between p-4 bg-white shadow-sm">
        <TouchableOpacity
          onPress={handleCancel}
          className="w-10 h-10 items-center justify-center"
        >
          <FontAwesome5 name="times" size={18} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          {isCreateMode ? "Add Address" : "Edit Address"}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
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
                value={formData.name}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, name: value }))
                }
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
                      value={formData.isDefault}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, isDefault: value }))
                      }
                      trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }}
                      thumbColor={formData.isDefault ? "#6366F1" : "#9CA3AF"}
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-gray-700">
                      Active Status
                    </Text>
                    <Switch
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                      trackColor={{ false: "#E5E7EB", true: "#BBF7D0" }}
                      thumbColor={formData.status ? "#22C55E" : "#9CA3AF"}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

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
                value={formData.street}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, street: value }))
                }
                placeholder="Enter street address"
                headerName="Street Address"
              />

              <AddressInput
                value={formData.street2}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, street2: value }))
                }
                placeholder="Apartment, suite, etc."
                headerName="Street Address 2 (Optional)"
              />

              <CustomPicker
                label="Governorate"
                value={pickerValues.governorate}
                placeholder="Select a governorate"
                onPress={() =>
                  setModals((prev) => ({ ...prev, governorate: true }))
                }
                loading={loading.governorate}
              />

              <CustomPicker
                label="City"
                value={pickerValues.city}
                placeholder="Select a city"
                onPress={() => setModals((prev) => ({ ...prev, city: true }))}
                disabled={pickerDisabled.city}
                loading={loading.city}
              />

              <CustomPicker
                label="Area"
                value={pickerValues.area}
                placeholder="Select an area"
                onPress={() => setModals((prev) => ({ ...prev, area: true }))}
                disabled={pickerDisabled.area}
                loading={loading.area}
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

          {deliveryInfo}

          <View className="flex-row space-x-3 mb-6">
            {!addAddressMutation.isPending ||
              (isLoading && (
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 bg-gray-100 py-4 px-6 rounded-2xl items-center justify-center"
                >
                  <Text className="text-gray-700 font-semibold">Cancel</Text>
                </TouchableOpacity>
              ))}

            <TouchableOpacity
              style={{ backgroundColor: Colors.PRIMARY }}
              className="flex-1 py-4 px-6 rounded-2xl items-center justify-center shadow-sm"
              onPress={isCreateMode ? handleCreateAddress : handleUpdateAddress}
            >
              {addAddressMutation.isPending || isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">
                  {isCreateMode ? "Create Address" : "Update Address"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <PickerModal
        visible={modals.governorate}
        title="Select Governorate"
        items={governorates}
        onSelect={handleGovernorateSelect}
        onClose={() => setModals((prev) => ({ ...prev, governorate: false }))}
      />

      <PickerModal
        visible={modals.city}
        title="Select City"
        items={locationData.cities}
        onSelect={handleCitySelect}
        onClose={() => setModals((prev) => ({ ...prev, city: false }))}
      />

      <PickerModal
        visible={modals.area}
        title="Select Area"
        items={locationData.areas}
        onSelect={(area: Area) =>
          setLocations((prev) => ({ ...prev, area: area }))
        }
        onClose={() => setModals((prev) => ({ ...prev, area: false }))}
      />
    </SafeAreaView>
  );
}
