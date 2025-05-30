import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import type { MegaCategory } from "@/types/globalTypes";

interface CircularCategoryProps {
  props: MegaCategory;
}

export default function CircularCategory({ props }: CircularCategoryProps) {
  return (
    <TouchableOpacity>
      <View style={styles.circleContainer}>
        <Image
          source={{ uri: props.mega_mobile_bg }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.categoryName} numberOfLines={2}>
        {props.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circleContainer: {
    width: 70,
    height: 70,
    borderRadius: 30,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#5e3ebd",
    shadowColor: "#5e3ebd",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 25,
  },
  categoryName: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 6,
    fontSize: 11,
    lineHeight: 14,
    maxWidth: 65,
  },
});
