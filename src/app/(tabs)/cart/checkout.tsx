// app/(tabs)/cart/checkout.tsx
import React, { useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useCartStore, CartItem } from "@/store/cartStore";
import { useRouter } from "expo-router";

export default function CheckoutScreen() {
  const router = useRouter();
  const rawScheme = useColorScheme();
  const scheme: "light" | "dark" = rawScheme === "dark" ? "dark" : "light";
  const styles = createStyles(scheme);

  const cartItems = useCartStore((s) => s.items);
  const fetchCart = useCartStore((s) => s.fetchCart);

  // Compute totals
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const quantity = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Refresh cart when leaving this screen
  useEffect(
    () => () => {
      fetchCart();
    },
    [fetchCart]
  );

  function renderRow({ item }: { item: CartItem }) {
    return (
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.productImage}
            fadeDuration={0}
          />
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <Text style={styles.price}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(i) => i.id}
        renderItem={renderRow}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        // Header: Checkout title + Order Summary card
        ListHeaderComponent={() => (
          <>
            <Text style={styles.header}>Checkout</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Summary</Text>
            </View>
          </>
        )}
        // Footer: Cart Totals card
        ListFooterComponent={() => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cart Totals</Text>

            <View style={styles.totalsRow}>
              <Text style={styles.label}>
                {quantity} item{quantity > 1 ? "s" : ""}
              </Text>
              <Text style={styles.value}>${subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.totalsRow}>
              <Text style={styles.label}>Shipping</Text>
              <Text style={styles.value}>Calculated at next step</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalsRow}>
              <Text style={[styles.label, styles.totalLabel]}>Total</Text>
              <Text style={[styles.value, styles.totalValue]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <Pressable 
              style={styles.actionButton}
              onPress={() => router.push('/shipping')}
            >
              <Text style={styles.actionText}>Proceed to Shipping</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get("window").width;
function createStyles(colorScheme: "light" | "dark") {
  const bg =
    colorScheme === "light" ? "#F3E8FF" : Colors[colorScheme].background;
  const txt = Colors[colorScheme].text;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bg,
      padding: 16,
    },
    listContent: {
      paddingBottom: 32,
    },
    header: {
      fontSize: 32,
      fontWeight: "700",
      marginBottom: 16,
      color: txt,
    },
    card: {
      backgroundColor: "#FFF",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 12,
      color: txt,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    productImage: {
      width: 40,
      height: 40,
      borderRadius: 6,
      marginRight: 8,
    },
    name: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      color: txt,
    },
    price: {
      fontSize: 16,
      fontWeight: "600",
      color: "#222",
      marginLeft: 12,
    },
    divider: {
      height: 1,
      backgroundColor: "#EEE",
      marginVertical: 4,
    },
    totalsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 8,
    },
    label: { fontSize: 16, color: txt },
    value: { fontSize: 16, color: txt },
    totalLabel: { fontWeight: "700" },
    totalValue: { fontSize: 18, fontWeight: "700" },
    actionButton: {
      marginTop: 16,
      backgroundColor: "#5E3EBD",
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: "center",
    },
    actionText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  });
}
