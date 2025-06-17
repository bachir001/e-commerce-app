import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useCallback, useContext } from "react";
import { SessionContext } from "@/app/_layout";
import { Brand } from "@/types/globalTypes";
import { useBrands } from "@/hooks/home/topSection";

const { width: screenWidth } = Dimensions.get("window");

const itemWidth = (screenWidth - 60) / 2;

function BrandComponent({ name, image, slug, id }: Brand) {
  return (
    <TouchableOpacity
      className="mx-2 bg-white rounded-xl overflow-hidden"
      style={{
        width: itemWidth,
        height: 60,
        shadowColor: "#5e3ebd",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <View className="flex-1 items-center justify-center p-2">
        {image ? (
          <Image
            source={{ uri: image }}
            className="w-20 h-20 mb-1"
            resizeMode="contain"
          />
        ) : (
          <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mb-1">
            <Text className="text-gray-400 font-bold text-xs">
              {name.charAt(0)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function Brands() {
  const { data: brands, isLoading: loadingBrands } = useBrands();

  const renderItem = useCallback(
    ({ item }: { item: Brand }) => {
      return (
        <BrandComponent
          name={item.name}
          image={item.image}
          white_image={item.white_image}
          slug={item.slug}
          id={item.id}
          backgroundColor={item.backgroundColor}
        />
      );
    },
    [brands]
  );

  const ItemSeparatorComponent = useCallback(() => {
    return <View className="w-2" />;
  }, []);

  return (
    <View className="py-2">
      <FlatList
        data={brands ? brands : []}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        snapToInterval={screenWidth - 20}
        decelerationRate="fast"
        contentContainerStyle={contentContainerStyle}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    </View>
  );
}

const contentContainerStyle = {
  paddingHorizontal: 10,
};
