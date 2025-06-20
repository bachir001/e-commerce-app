import { View, FlatList } from "react-native";
import type { MegaCategory } from "@/types/globalTypes";
import CircularCategory from "./CircularCategory";
import { useMemo } from "react"; // Import useMemo

export default function CircularCategorylist({
  data,
  numberOfRows,
}: {
  data: any;
  numberOfRows: number;
}) {
  const chunkData = (array: MegaCategory[]): MegaCategory[][] => {
    const chunked: MegaCategory[][] = [];
    for (let i = 0; i < array.length; i += numberOfRows) {
      chunked.push(array.slice(i, i + numberOfRows));
    }
    return chunked;
  };

  const groupedData = useMemo(() => {
    return data ? chunkData(data) : [];
  }, [data, numberOfRows]);

  return (
    <View className="px-4 items-center mt-5">
      <FlatList
        data={groupedData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        ItemSeparatorComponent={() => <View className="w-20" />}
        renderItem={({ item }: { item: MegaCategory[] }) => (
          <View className="flex-col gap-6">
            {item &&
              item.length > 0 &&
              item.map((subItem) => (
                <CircularCategory key={subItem.id} props={subItem} />
              ))}
          </View>
        )}
      />
    </View>
  );
}
