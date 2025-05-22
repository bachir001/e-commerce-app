import { View, Text, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface Language {
  code: string;
  flag: any;
}

interface HeaderProps {
  logo: any;
  greeting: string;
  languages: Language[];
}

export default function AccountHeader({
  logo,
  greeting,
  languages,
}: HeaderProps) {
  return (
    <View className="bg-white px-4 py-5 shadow-sm">
      <View className="flex flex-row justify-between items-center mb-6">
        <View className="flex flex-row items-center">
          <Image source={logo} className="w-28 h-8 mr-2" resizeMode="contain" />
          <Text className="text-xl font-bold text-gray-800">Go Cami</Text>
        </View>

        <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
          <Feather name="settings" size={20} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-semibold text-gray-800">
            {greeting}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Discover our services
          </Text>
        </View>

        <TouchableOpacity className="flex-row items-center bg-gray-50 px-3 py-2 rounded-full">
          <Text className="font-medium mr-1">EN {languages[0].flag}</Text>
          <Feather name="chevron-down" size={16} color="#4B5563" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
