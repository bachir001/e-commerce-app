import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import DotsLoader from "../common/AnimatedLayout";

interface ConfirmationModalProps {
  isVisible: boolean;
  title?: string;
  description: string;
  cancelButtonText?: string;
  confirmButtonText: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  confirmButtonColor?: "red" | "blue" | "green" | "indigo";
  icon?: string;
  iconColor?: string;
  loading?: boolean;
}

export default function ConfirmationModal({
  isVisible,
  title = "Confirm Action",
  description,
  cancelButtonText = "Cancel",
  confirmButtonText,
  onCancel,
  onConfirm,
  confirmButtonColor = "indigo",
  icon = "question-circle",
  iconColor,
  loading = false,
}: ConfirmationModalProps) {
  const getConfirmButtonStyles = () => {
    switch (confirmButtonColor) {
      case "red":
        return "bg-red-500";
      case "blue":
        return "bg-blue-500";
      case "green":
        return "bg-green-500";
      case "indigo":
      default:
        return "bg-indigo-600";
    }
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    switch (confirmButtonColor) {
      case "red":
        return "#EF4444";
      case "blue":
        return "#3B82F6";
      case "green":
        return "#22C55E";
      case "indigo":
      default:
        return "#6366F1";
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onCancel();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center">
              <FontAwesome5 name={icon} size={24} color={getIconColor()} />
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-800 text-center mb-3">
            {title}
          </Text>

          {/* Description */}
          <Text className="text-gray-600 text-center mb-8 leading-6">
            {description}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            {!loading ? (
              <TouchableOpacity
                onPress={onCancel}
                className="flex-1 py-3 px-4 bg-gray-100 rounded-xl items-center justify-center"
              >
                <Text className="font-semibold text-gray-700">
                  {cancelButtonText}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={handleConfirm}
              className={`flex-1 py-3 px-4 ${getConfirmButtonStyles()} rounded-xl items-center justify-center`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="font-semibold text-white">
                  {confirmButtonText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
