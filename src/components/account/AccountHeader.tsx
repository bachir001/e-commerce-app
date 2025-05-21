// components/Header.tsx
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";  
interface Language { code: string; flag: any; }
interface HeaderProps {
  logo: any;
  greeting: string;
  languages: Language[];
}

export default function AccountHeader({ logo, greeting, languages }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-6">
      <Image source={logo} className="w-32 h-8" resizeMode="contain" />
      <Text className="text-xl font-semibold">Go Cami</Text>

      <TouchableOpacity>
        <Feather name="settings" size={24} />
      </TouchableOpacity>

      <View className="absolute left-0 right-0 top-12 items-center">
        <Text className="text-xl font-semibold">{greeting}</Text>
      </View>

      <TouchableOpacity className="flex-row items-center">
        <Text className="text-xl mr-1">EN {languages[0].flag}</Text>
        <Feather name="chevron-down" size={16} />
      </TouchableOpacity>
    </View>
  );
}
