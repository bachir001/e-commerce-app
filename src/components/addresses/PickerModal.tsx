import Modal from "react-native-modal";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface PickerModalProps {
  visible: boolean;
  title: string;
  items: Array<{ id: number; name: string }>;
  onSelect: (item: any) => void;
  onClose: () => void;
}

export function PickerModal({
  visible,
  title,
  items,
  onSelect,
  onClose,
}: PickerModalProps) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={{ justifyContent: "flex-end", margin: 0 }}
      backdropOpacity={0.6}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      propagateSwipe={true}
    >
      <View className="bg-white rounded-t-3xl overflow-hidden">
        {/* Drag Indicator */}
        <View className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
          <View>
            <Text className="text-xl font-bold text-gray-800">{title}</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Choose from the options below
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <FontAwesome5 name="times" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-2">
            {items.length === 0 ? (
              <View className="py-12 items-center">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <FontAwesome5 name="inbox" size={24} color="#9CA3AF" />
                </View>
                <Text className="text-gray-500 text-center">
                  No options available
                </Text>
              </View>
            ) : (
              items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className={`flex-row items-center py-4 px-4 rounded-xl mb-2 active:bg-indigo-50 ${
                    index === items.length - 1 ? "mb-6" : ""
                  }`}
                  style={{ backgroundColor: "transparent" }}
                >
                  <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-4">
                    <FontAwesome5
                      name="map-marker-alt"
                      size={14}
                      color="#6366F1"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium text-lg">
                      {item.name}
                    </Text>
                  </View>
                  <FontAwesome5
                    name="chevron-right"
                    size={14}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
