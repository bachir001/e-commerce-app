import { View, Text, TouchableOpacity, Linking } from "react-native";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";

interface ContactModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ContactModal({
  isVisible,
  onClose,
}: ContactModalProps) {
  const openWhatsApp = () => {
    const phoneNumber = "+961 81204085";
    const message = "Hello! I need help with GoCami.";
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;

    Linking.openURL(whatsappUrl).catch(() => {
      const webWhatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;
      Linking.openURL(webWhatsappUrl);
    });

    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={{ justifyContent: "flex-end", margin: 0 }}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View className="bg-white rounded-t-3xl overflow-hidden">
        <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-6" />

        <View className="px-6 pb-8">
          <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
            Contact Us
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            We're here to help you
          </Text>

          <TouchableOpacity
            onPress={openWhatsApp}
            className="bg-green-500 flex-row items-center justify-center py-4 px-6 rounded-2xl mb-6 shadow-sm"
          >
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
              <FontAwesome5 name="whatsapp" size={20} color="#22C55E" brand />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-lg">
                Chat on WhatsApp
              </Text>
              <Text className="text-green-100 text-sm">
                Get instant support
              </Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-100 py-4 px-6 rounded-2xl items-center justify-center"
          >
            <Text className="text-gray-600 font-medium text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
