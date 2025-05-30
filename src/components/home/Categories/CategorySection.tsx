"use client";

import { SessionContext } from "@/app/_layout";
import { useContext } from "react";
import { Dimensions, Image, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import CircularCategorylist from "./CircularCategoryList";
import CategoryHeader from "./CategoryHeader";

interface Slider {
  id: string;
  mobile_image: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const ITEM_WIDTH = SCREEN_WIDTH;
const ITEM_HEIGHT = 200;

interface SliderItemProps {
  item: Slider;
}

const SliderItem = ({ item }: SliderItemProps) => {
  return (
    <View style={{ width: SCREEN_WIDTH, height: 200 }}>
      <Image
        source={{ uri: item.mobile_image }}
        style={{
          width: SCREEN_WIDTH,
          height: 200,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

interface SliderComponentProps {
  sliders: Slider[];
}

const SliderComponent = ({ sliders }: SliderComponentProps) => {
  return (
    <View style={{ width: SCREEN_WIDTH, height: 200 }}>
      <Carousel
        width={ITEM_WIDTH}
        height={ITEM_HEIGHT}
        data={sliders}
        scrollAnimationDuration={500}
        autoPlay={true}
        autoPlayInterval={3000}
        loop
        renderItem={({ item }) => <SliderItem item={item} />}
      />
    </View>
  );
};

export default function App() {
  const { sliders, megaCategories } = useContext(SessionContext);

  return (
    <View style={{ backgroundColor: "#FFF8E1" }} className="max-h-max pb-5">
      <SliderComponent sliders={sliders} />
      <CategoryHeader
        title="All Categories"
        coloredTitle="Enjoy!"
        variant="purple"
      />
      <CircularCategorylist data={megaCategories} numberOfRows={2} />
    </View>
  );
}
