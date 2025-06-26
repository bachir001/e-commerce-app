import { View, Text } from "react-native";
import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { Address } from ".";

export default function DeliveryInformation({
  addressParsed,
  showDeliveryInformation = true,
}: {
  addressParsed: Address;
  showDeliveryInformation?: boolean;
}) {
  return (
    <View className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
          <FontAwesome5 name="truck" size={16} color="#22C55E" />
        </View>
        <Text className="text-lg font-semibold text-gray-800">Delivery</Text>
      </View>

      <View className="space-y-3">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-600">Delivery Price</Text>
          <Text className="text-gray-800 font-semibold">
            ${addressParsed.delivery_price.toFixed(2)}
          </Text>
        </View>

        {showDeliveryInformation && (
          <View>
            {addressParsed.free_delivery === 1 ? (
              <View className="bg-green-50 p-3 rounded-xl">
                <View className="flex-row items-center">
                  <FontAwesome5 name="check-circle" size={16} color="#22C55E" />
                  <Text className="text-green-700 font-medium ml-2">
                    Free Delivery Available
                  </Text>
                </View>
                <Text className="text-green-600 text-sm mt-1">
                  On orders above $
                  {addressParsed.free_delivery_price.toFixed(2)}
                </Text>
              </View>
            ) : (
              <View className="bg-gray-50 p-3 rounded-xl">
                <Text className="text-gray-600">
                  Free delivery not available for this address
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
