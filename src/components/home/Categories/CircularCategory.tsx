import React, { memo, useRef } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import type { MegaCategory } from "@/types/globalTypes";
import { router } from "expo-router";
import { colorMap, niche } from "@/components/categories/CategoryItem";

interface CircularCategoryProps {
  props: MegaCategory;
}

function CircularCategory({ props }: CircularCategoryProps) {
  return (
    <TouchableOpacity
      className="items-center"
      onPress={() => {
        router.push({
          pathname: "mega",
          params: {
            slug: String(props.slug),
            color: colorMap[props.slug as niche] || "5e3ebd",
            id: String(props.id),
          },
        });
      }}
    >
      <View
        className="
          w-[70px] h-[70px]
          rounded-[30px]
          bg-white
          items-center justify-center
          border-2 border-[#5e3ebd]
          shadow-md shadow-[#5e3ebd]/15
          elevation-3
        "
      >
        <Image
          source={{ uri: props.mega_mobile_bg }}
          className="w-[60px] h-[60px] rounded-[25px]"
          resizeMode="cover"
          fadeDuration={0}
        />
      </View>

      <Text
        className="
          text-center
          font-bold
          text-[#1f2937]
          mt-1.5
          text-[11px] leading-[14px]
          max-w-[65px]
        "
        numberOfLines={2}
      >
        {props.name}
      </Text>
    </TouchableOpacity>
  );
}

export default memo(CircularCategory);
