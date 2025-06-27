import { ChevronDown, ChevronUp } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

function stripHtmlTags(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}

const ExpandableSection = React.memo<{
  title: string;
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}>(({ title, content, isExpanded, onToggle, icon }) => (
  <>
    <Pressable
      className="flex-row justify-between items-center py-3"
      onPress={onToggle}
      android_ripple={{ color: "#f0f0f0" }}
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="text-lg font-bold text-gray-900 ml-2">{title}</Text>
      </View>
      {isExpanded ? (
        <ChevronUp size={20} color="#333" />
      ) : (
        <ChevronDown size={20} color="#333" />
      )}
    </Pressable>
    {isExpanded ? (
      <Text className="text-gray-700 leading-6 mb-4">
        {stripHtmlTags(content)}
      </Text>
    ) : null}
  </>
));

export default ExpandableSection;
