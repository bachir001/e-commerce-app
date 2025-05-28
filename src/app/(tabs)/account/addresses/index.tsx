import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import axiosApi from "@/apis/axiosApi";
import { SessionContext } from "@/app/_layout";
import { Colors } from "@/constants/Colors";
import ConfirmationModal from "@/components/Modals/ConfirmationModal";

export interface Address {
  id: number;
  user_address_id: number;
  is_default: number;
  name: string;
  street: string;
  street_2: string;
  postal_code: number;
  area: string;
  city: string;
  governorate: string;
  country: string;
  delivery_price: number;
  free_delivery: number;
  free_delivery_price: number;
  status: number;
}

export default function AddressPage() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const { token, addresses, setAddresses } = useContext(SessionContext);

  // const addresses: Address[] = [
  //   {
  //     id: 1,
  //     name: "Home",
  //     street: "123 Main Street",
  //     area: "Downtown",
  //     city: "Beirut",
  //   },
  //   {
  //     id: 2,
  //     name: "Work",
  //     street: "456 Business Ave",
  //     area: "Business District",
  //     city: "Beirut",
  //   },
  //   {
  //     id: 3,
  //     name: "Mom's House",
  //     street: "789 Family Road",
  //     area: "Residential Area",
  //     city: "Jounieh",
  //   },
  // ];

  const handleEdit = (address: Address) => {
    router.push({
      pathname: "/(tabs)/account/addresses/editAddress",
      params: {
        address: JSON.stringify(address),
      },
    });
  };

  const handleShowAll = (address: Address) => {
    router.push({
      pathname: "/(tabs)/account/addresses/addressDetails",
      params: {
        address: JSON.stringify(address),
      },
    });
  };

  const handleAddAddress = () => {
    router.push("/(tabs)/account/addresses/addAddress");
  };

  const handleDelete = async (address: Address) => {
    try {
      setDeleteLoading(true);

      const HeaderData = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      console.log(token);
      const response = await axiosApi.post(
        `addresses/remove/${address.id}}?_method=DELETE`,
        {},
        HeaderData
      );
      console.log(response.data);
      if (response.data.status) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Address deleted successfully",
          autoHide: true,
          visibilityTime: 2000,
          topOffset: 60,
        });

        setAddresses(
          addresses.filter((address_: Address) => address_.id !== address.id)
        );
      }

      setDeleteLoading(false);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong",
        autoHide: true,
        visibilityTime: 2000,
        topOffset: 60,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        setLoading(true);
        const response = await axiosApi.get("addresses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status) {
          const sortedDefault = [...response.data.data].sort(
            (a, b) => b.is_default - a.is_default
          );

          setAddresses(sortedDefault);
        }

        setLoading(false);
      } catch (err) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong",
          autoHide: true,
          visibilityTime: 2000,
          topOffset: 60,
        });
      }
    };

    fetchUserAddresses();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <FontAwesome5 name="arrow-left" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">My Addresses</Text>
        </View>
      </View>

      {/* Address List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="5e3ebd" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
        >
          {addresses.length > 0 && addresses != null ? (
            addresses.map((address: Address) => (
              <View
                key={address.id}
                className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
              >
                {address.is_default === 1 ? (
                  <View className="bg-green-100 p-3">
                    <Text className="text-xs font-medium text-green-600">
                      Default Address
                    </Text>
                  </View>
                ) : null}
                <View className="p-4">
                  {/* Address Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View
                        style={{ backgroundColor: Colors.PRIMARY }}
                        className={`w-10 h-10 rounded-full items-center justify-center mr-3`}
                      >
                        <FontAwesome5
                          name="map-marker-alt"
                          size={16}
                          color="white"
                        />
                      </View>
                      <Text className="text-lg font-semibold text-gray-800">
                        {address.name}
                      </Text>
                    </View>
                    <View className="flex flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => handleEdit(address)}
                        className="bg-gray-100 px-3 py-1.5 rounded-full"
                      >
                        <Text className="text-sm font-medium text-gray-600">
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-red-100 px-3 py-1.5 rounded-full"
                        onPress={() => {
                          setSelectedAddress(address);
                          setDeleteModalVisible(true);
                        }}
                      >
                        <Text className="text-sm font-medium text-gray-600">
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Address Details */}
                  <View className="ml-13 mb-3">
                    <Text className="text-gray-700 mb-1">{address.street}</Text>
                    <Text className="text-gray-500 text-sm">
                      {address.area}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {address.city}
                    </Text>
                  </View>

                  {/* Show All Button, this is because the current page's component ony displays the necessary details */}
                  <View className="flex flex-row items-center justify-between">
                    <TouchableOpacity
                      onPress={() => handleShowAll(address)}
                      className="ml-13 flex-row items-center"
                    >
                      <Text
                        style={{ color: Colors.PRIMARY }}
                        className={`font-medium text-sm mr-1`}
                      >
                        Show all details
                      </Text>
                      <FontAwesome5
                        name="chevron-right"
                        size={12}
                        color="#6366F1"
                      />
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                      <View
                        className={`w-2 h-2 ${
                          address.status === 1 ? "bg-green-500" : "bg-red-500"
                        } rounded-full mr-2`}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            // Empty State
            <View className="flex-1 justify-center items-center py-20">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <FontAwesome5 name="map-marker-alt" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500 text-lg font-medium mb-2">
                No addresses yet
              </Text>
              <Text className="text-gray-400 text-center">
                Add your first address to get started
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Add Address Button */}
      <View className="px-4 pb-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleAddAddress}
          style={{ backgroundColor: Colors.PRIMARY }}
          className={` flex-row items-center justify-center py-4 rounded-2xl shadow-sm`}
        >
          <FontAwesome5 name="plus" size={16} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">
            Add Address
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        isVisible={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
        }}
        onConfirm={() => {
          if (selectedAddress != null) {
            handleDelete(selectedAddress);
          }
        }}
        confirmButtonColor="red"
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        description="Are you sure you want to delete this address?"
        title="Delete Address"
        icon="trash-alt"
        loading={deleteLoading}
      />
    </SafeAreaView>
  );
}
