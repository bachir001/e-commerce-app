import { Minus, Plus } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const QuantitySelector = React.memo<{
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}>(({ quantity, onIncrement, onDecrement }) => (
  <View className="flex-row items-center border border-gray-300 rounded-lg">
    <TouchableOpacity
      className="w-10 h-10 items-center justify-center"
      onPress={onDecrement}
      disabled={quantity <= 1}
      activeOpacity={0.7}
    >
      <Minus size={20} color={quantity <= 1 ? "#ccc" : "#333"} />
    </TouchableOpacity>
    <Text className="w-10 text-center font-semibold">{quantity}</Text>
    <TouchableOpacity
      className="w-10 h-10 items-center justify-center"
      onPress={onIncrement}
      activeOpacity={0.7}
    >
      <Plus size={20} color="#333" />
    </TouchableOpacity>
  </View>
));

export default QuantitySelector;
