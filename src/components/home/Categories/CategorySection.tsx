import { SessionContext } from "@/app/_layout";
import { MegaCategory } from "@/types/contextTypes";
import React, { useContext } from "react";
import { Dimensions, FlatList, Image, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import CircularCategorylist from "./CircularCategoryList";

interface Slider {
  id: string;
  mobile_image: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("screen");
const ITEM_WIDTH = SCREEN_WIDTH;
const ITEM_HEIGHT = ITEM_WIDTH * 0.6;

interface SliderItemProps {
  item: Slider;
}

const SliderItem = ({ item }: SliderItemProps) => {
  return (
    <View style={{ overflow: "hidden", width: SCREEN_WIDTH }}>
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
    <View style={{ width: SCREEN_WIDTH }}>
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
    <View style={{ backgroundColor: "#FFF8E1", flex: 1 }}>
      <SliderComponent sliders={sliders} />
      <CircularCategorylist data={megaCategories} numberOfRows={2} />
    </View>
  );
}
