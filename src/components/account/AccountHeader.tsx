// components/Header.tsx
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
    <View className="flex flex-col gap-10 bg-white py-5">
      <View className="flex flex-row justify-between pr-5">
        <View className="flex flex-row">
          <Image source={logo} className="w-28 h-8" resizeMode="contain" />
          <Text className="text-xl font-semibold">Go Cami</Text>
        </View>

        <TouchableOpacity>
          <Feather name="settings" size={24} />
        </TouchableOpacity>
      </View>

      <View className="flex flex-row justify-between px-5">
        <View>
          <Text className="text-xl font-semibold">{greeting}</Text>
        </View>

        <TouchableOpacity className="flex-row items-center">
          <Text className="text-xl mr-1">EN {languages[0].flag}</Text>
          <Feather name="chevron-down" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
