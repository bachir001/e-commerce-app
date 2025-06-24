import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  Pressable,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useCartStore, CartItem } from "@/store/cartStore";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { getOrCreateSessionId } from "@/lib/session";
import DotsLoader from "@/components/common/AnimatedLayout";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Import useSafeAreaInsets

interface BestSellerRaw {
  id: number;
  name: string;
  price: number;
  image: string;
  product_image?: string;
}

interface BestSellersApiResponse {
  status: boolean;
  message: string;
  data: {
    total_results: number;
    results: BestSellerRaw[];
  };
  code: number;
}

interface BestSellerItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function CartScreen(): React.ReactElement {
  const router = useRouter();
  const rawColorScheme = useColorScheme();
  const colorScheme: "light" | "dark" =
    rawColorScheme === "dark" ? "dark" : "light";
  const styles = createStyles(colorScheme);

  const cartItems = useCartStore((s) => s.items);
  const isCartLoading = useCartStore((s) => s.loading);
  const cartErrorMessage = useCartStore((s) => s.error);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const addToCart = useCartStore((s) => s.addToCart);

  const hasFetchedCart = useRef(false);

  useEffect(() => {
    if (!hasFetchedCart.current) {
      fetchCart();
      hasFetchedCart.current = true;
    }
  }, [fetchCart]);

  const [bestSellerItems, setBestSellerItems] = useState<BestSellerItem[]>([]);
  const [isBestSellersLoading, setIsBestSellersLoading] = useState(false);
  const [bestSellersErrorMessage, setBestSellersErrorMessage] = useState<
    string | null
  >(null);
  const bestSellersCache = useRef<BestSellerItem[] | null>(null);

  const insets = useSafeAreaInsets();
  const tabBarHeight = 65;
  const aestheticMarginAboveInsets = 20;
  const tabBarSpace = tabBarHeight + aestheticMarginAboveInsets + insets.bottom;

  useEffect(() => {
    let abortController: AbortController | null = null;

    if (cartItems.length === 0 && !bestSellersCache.current) {
      setIsBestSellersLoading(true);
      setBestSellersErrorMessage(null);
      abortController = new AbortController();

      axios
        .get<BestSellersApiResponse>(
          "https://api-gocami-test.gocami.com/api/best-sellers?page=1&per_page=20",
          { signal: abortController.signal }
        )
        .then((response) => {
          if (!response.data.status) {
            throw new Error(
              response.data.message || "Failed to load best sellers"
            );
          }
          const mapped = response.data.data.results.map((raw) => ({
            id: raw.id.toString(),
            name: raw.name,
            price: raw.price,
            imageUrl: raw.product_image ?? raw.image,
          }));

          bestSellersCache.current = mapped;
          setBestSellerItems(mapped);
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            setBestSellersErrorMessage(
              err instanceof Error ? err.message : "Unknown error"
            );
          }
        })
        .finally(() => {
          setIsBestSellersLoading(false);
        });
    } else if (cartItems.length === 0 && bestSellersCache.current) {
      setBestSellerItems(bestSellersCache.current);
    }

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [cartItems.length]);

  const handleRemove = useCallback(
    async (cartItemId: string) => {
      try {
        const sessionId = await getOrCreateSessionId();
        const formData = new FormData();
        formData.append("cart_item_id", cartItemId);
        formData.append("_method", "DELETE");

        await axios.post(
          "https://api-gocami-test.gocami.com/api/cart/remove",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "x-session": sessionId,
            },
          }
        );

        await fetchCart();
      } catch (err) {
        console.error("Error removing item:", err);
      }
    },
    [fetchCart]
  );

  const renderCartRow = useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={styles.cartItemContainer}>
        <Image
          source={{ uri: (item as any).imageUrl }}
          style={styles.productImage}
        />
        <View style={styles.details}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <Pressable
            onPress={() =>
              item.quantity > 1
                ? addToCart(item.productId, 1, "decrease")
                : handleRemove(item.id)
            }
            disabled={item.quantity <= 1 || isCartLoading}
          >
            <Text
              style={[
                styles.qtyButton,
                (item.quantity <= 1 || isCartLoading) &&
                  styles.qtyButtonDisabled,
              ]}
            >
              –
            </Text>
          </Pressable>

          {isCartLoading ? (
            <DotsLoader />
          ) : (
            <Text style={styles.qtyText}>{item.quantity}</Text>
          )}
          <Pressable onPress={() => addToCart(item.productId, 1, "increase")}>
            <Text style={styles.qtyButton}>+</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => handleRemove(item.id)}>
          <MaterialIcons name="delete-outline" size={24} color="#E53935" />
        </Pressable>
      </View>
    ),
    [styles, addToCart, handleRemove, isCartLoading]
  );

  const renderBestSellerCard = useCallback(
    ({ item }: { item: BestSellerItem }) => (
      <View style={styles.bestSellerCard}>
        <Image source={{ uri: item.imageUrl }} style={styles.bestSellerImage} />
        <Text style={styles.bestSellerName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.bestSellerPrice}>${item.price.toFixed(2)}</Text>
        <Pressable
          style={styles.bestSellerButton}
          onPress={() => addToCart(item.id, 1)}
        >
          <Text style={styles.bestSellerButtonText}>Add to Cart</Text>
        </Pressable>
      </View>
    ),
    [styles, addToCart]
  );

  const totalCartCost = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cartItems]
  );

  const cartKeyExtractor = useCallback((item: CartItem) => item.id, []);
  const bestSellerKeyExtractor = useCallback(
    (item: BestSellerItem) => item.id,
    []
  );

  const ItemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [styles]
  );

  if (cartErrorMessage) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: {cartErrorMessage}</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView
        style={[styles.mainContainer, { paddingBottom: tabBarSpace }]}
      >
        <View style={styles.centeredContainer}>
          <Image
            source={require("@/assets/images/empty_basket.png")}
            style={styles.emptyBasketImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyBasketText}>Your cart is empty</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Check These Products</Text>
          {isBestSellersLoading && <ActivityIndicator />}
          {bestSellersErrorMessage && (
            <Text style={styles.errorText}>
              Error: {bestSellersErrorMessage}
            </Text>
          )}
          {!isBestSellersLoading && !bestSellersErrorMessage && (
            <FlatList
              data={bestSellerItems}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={bestSellerKeyExtractor}
              renderItem={renderBestSellerCard}
              contentContainerStyle={styles.bestSellersListContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
              getItemLayout={(data, index) => ({
                length: 140,
                offset: 140 * index,
                index,
              })}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.mainContainer, { paddingBottom: tabBarSpace }]}
    >
      <FlatList
        data={cartItems}
        keyExtractor={cartKeyExtractor}
        renderItem={renderCartRow}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={<Text style={styles.cartTitle}>Your Cart</Text>}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Subtotal</Text>
              <Text style={styles.footerValue}>
                ${totalCartCost.toFixed(2)}
              </Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Shipping</Text>
              <Text style={styles.footerValue}>Calculated at checkout</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.footerRow}>
              <Text style={[styles.footerLabel, styles.totalLabel]}>Total</Text>
              <Text style={[styles.footerValue, styles.totalValue]}>
                ${totalCartCost.toFixed(2)}
              </Text>
            </View>

            <Pressable
              style={styles.checkoutButton}
              onPress={() => router.push("/cart/checkout")}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </Pressable>
          </View>
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
}

const BRAND = "#5E3EBD";
const screenWidth = Dimensions.get("window").width;

export function createStyles(colorScheme: "light" | "dark") {
  const backgroundColor = Colors[colorScheme].background;
  const textColor = Colors[colorScheme].text;

  return StyleSheet.create({
    qtyButtonDisabled: { color: "#CCC" },
    mainContainer: { flex: 1, backgroundColor, paddingTop: 16 },
    centeredContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      backgroundColor,
    },
    cartTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: textColor,
      margin: 16,
    },
    cartItemContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      backgroundColor,
    },
    productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
    details: { flex: 1 },
    productName: {
      fontSize: 16,
      fontWeight: "500",
      color: textColor,
      marginBottom: 4,
    },
    productPrice: { fontSize: 14, fontWeight: "600", color: BRAND },
    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#CCC",
      borderRadius: 4,
      paddingHorizontal: 8,
      marginRight: 12,
    },
    qtyButton: {
      fontSize: 18,
      width: 24,
      textAlign: "center",
      color: textColor,
    },
    qtyText: { fontSize: 16, width: 24, textAlign: "center", color: textColor },
    itemSeparator: { height: 1, backgroundColor: "#EEE" },
    footer: { padding: 16, backgroundColor },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 4,
    },
    footerLabel: { fontSize: 16, color: textColor },
    footerValue: { fontSize: 16, color: textColor },
    divider: { height: 1, backgroundColor: "#DDD", marginVertical: 12 },
    totalLabel: { fontWeight: "700" },
    totalValue: { fontSize: 18, fontWeight: "700" },
    checkoutButton: {
      marginTop: 16,
      backgroundColor: BRAND,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: "center",
    },
    checkoutText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    emptyBasketImage: {
      width: screenWidth * 0.6,
      height: screenWidth * 0.6,
      marginBottom: 24,
    },
    emptyBasketText: { fontSize: 20, color: textColor, marginBottom: 0 },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "600",
      color: textColor,
      marginLeft: 16,
      marginBottom: 12,
    },
    bestSellersListContainer: { paddingHorizontal: 16 },
    bestSellerCard: {
      width: 140,
      backgroundColor,
      borderRadius: 8,
      marginRight: 12,
      padding: 8,
    },
    bestSellerImage: {
      width: "100%",
      height: 80,
      borderRadius: 4,
      marginBottom: 8,
    },
    bestSellerName: {
      fontSize: 14,
      fontWeight: "500",
      color: textColor,
      marginBottom: 4,
    },
    bestSellerPrice: {
      fontSize: 16,
      fontWeight: "600",
      color: textColor,
      marginBottom: 8,
    },
    bestSellerButton: {
      backgroundColor: BRAND,
      borderRadius: 4,
      paddingVertical: 6,
    },
    bestSellerButtonText: {
      color: "#FFFFFF",
      textAlign: "center",
      fontSize: 14,
      fontWeight: "600",
    },
    errorText: { color: "red", fontSize: 16, marginTop: 8 },
  });
}
