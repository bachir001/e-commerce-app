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
import { useCartStore, CartItem } from "@/store/cartStore"; // Ensure CartItem is imported
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons"; // For icons
import { getOrCreateSessionId } from "@/lib/session"; // Session utility
import DotsLoader from "@/components/common/AnimatedLayout"; // Custom loading component
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Hook for safe area insets
import Toast from "react-native-toast-message"; // Import Toast for messages
import axiosApi from "@/apis/axiosApi";

// Interface for raw best-seller data from API
interface BestSellerRaw {
  id: number;
  name: string;
  price: number;
  image: string; // Used if product_image is null
  product_image?: string; // Preferred image URL
}

// Interface for best-sellers API response structure
interface BestSellersApiResponse {
  status: boolean;
  message: string;
  data: {
    total_results: number;
    results: BestSellerRaw[];
  };
  code: number;
}

// Interface for mapped best-seller item for UI
interface BestSellerItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function CartScreen(): React.ReactElement {
  const router = useRouter();
  // Determine color scheme (light/dark)
  const rawColorScheme = useColorScheme();
  const colorScheme: "light" | "dark" =
    rawColorScheme === "dark" ? "dark" : "light";
  const styles = createStyles(colorScheme); // Generate styles based on color scheme

  // Zustand cart store selectors
  const cartItems = useCartStore((s) => s.items);
  const isCartLoading = useCartStore((s) => s.loading);
  const cartErrorMessage = useCartStore((s) => s.error);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const addToCart = useCartStore((s) => s.addToCart);

  // Ref to track if cart has been fetched to prevent multiple fetches on mount
  const hasFetchedCart = useRef(false);

  // Fetch cart data on component mount
  useEffect(() => {
    if (!hasFetchedCart.current) {
      fetchCart();
      hasFetchedCart.current = true;
    }
  }, [fetchCart]); // Dependency array to re-run effect if fetchCart changes (unlikely)

  // State for best-seller products
  const [bestSellerItems, setBestSellerItems] = useState<BestSellerItem[]>([]);
  const [isBestSellersLoading, setIsBestSellersLoading] = useState(false);
  const [bestSellersErrorMessage, setBestSellersErrorMessage] = useState<
    string | null
  >(null);
  // Ref to cache best-seller data to avoid re-fetching if cart becomes empty again
  const bestSellersCache = useRef<BestSellerItem[] | null>(null);

  // Get safe area insets for handling notch/dynamic island
  const insets = useSafeAreaInsets();
  const tabBarHeight = 65; // Estimated tab bar height
  const aestheticMarginAboveInsets = 20; // Additional margin for aesthetics
  const tabBarSpace = tabBarHeight + aestheticMarginAboveInsets + insets.bottom; // Total space for tab bar

  // Effect to fetch best sellers when cart is empty
  useEffect(() => {
    let abortController: AbortController | null = null;

    // Only fetch best sellers if cart is empty AND they haven't been cached yet
    if (cartItems.length === 0 && !bestSellersCache.current) {
      setIsBestSellersLoading(true);
      setBestSellersErrorMessage(null); // Clear previous errors
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
          // Map raw API data to BestSellerItem format
          const mapped = response.data.data.results.map((raw) => ({
            id: raw.id.toString(), // Ensure ID is string
            name: raw.name,
            price: raw.price,
            imageUrl: raw.product_image ?? raw.image, // Prefer product_image
          }));

          bestSellersCache.current = mapped; // Cache the fetched data
          setBestSellerItems(mapped);
        })
        .catch((err) => {
          // Ignore if the request was cancelled (e.g., component unmounted)
          if (!axios.isCancel(err)) {
            setBestSellersErrorMessage(
              err instanceof Error ? err.message : "Unknown error"
            );
          }
        })
        .finally(() => {
          setIsBestSellersLoading(false); // End loading regardless of success/failure
        });
    } else if (cartItems.length === 0 && bestSellersCache.current) {
      // If cart is empty but best-sellers are cached, use cached data
      setBestSellerItems(bestSellersCache.current);
    }

    // Cleanup function for abort controller
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [cartItems.length]); // Re-run effect when cartItems length changes

  // Callback to handle removing an item from the cart
  const handleRemove = useCallback(
    async (cartItemId: string) => {
      try {
        const sessionId = await getOrCreateSessionId(); // Get session ID

        await axiosApi.delete("cart/remove", {
          headers: {
            "Content-Type": "application/json",
            "x-session": sessionId,
          },
          data: { cart_item_id: cartItemId }, // Send item ID in request body
        });

        await fetchCart(true); // Force re-fetch cart to update UI
        Toast.show({
          type: "success",
          text1: "Item Removed",
          position: "top",
          topOffset: 60,
        });
      } catch (err) {
        console.error("Error removing item:", err);
        Toast.show({
          type: "error",
          text1: "Remove Error",
          text2: "Couldn't remove item from cart",
          position: "top",
          topOffset: 60,
        });
      }
    },
    [fetchCart] // Dependency on fetchCart to ensure it's up-to-date
  );

  // Render function for individual cart item row
  const renderCartRow = useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={styles.cartItemContainer}>
        <Image
          fadeDuration={0}
          source={{ uri: item.imageUrl }} // Use item.imageUrl directly
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
            // Decrease quantity or remove item if quantity is 1
            onPress={() =>
              item.quantity > 1
                ? addToCart(item.productId, 1, "decrease")
                : handleRemove(item.id)
            }
            // Disable button if quantity is 1 or cart is loading
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

          {/* Show DotsLoader when cart is loading for a specific item */}
          {isCartLoading ? (
            <DotsLoader />
          ) : (
            <Text style={styles.qtyText}>{item.quantity}</Text>
          )}
          <Pressable
            onPress={() => addToCart(item.productId, 1, "increase")}
            disabled={isCartLoading} // Disable while cart is loading
          >
            <Text style={styles.qtyButton}>+</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => handleRemove(item.id)}
          disabled={isCartLoading}
        >
          <MaterialIcons name="delete-outline" size={24} color="#E53935" />
        </Pressable>
      </View>
    ),
    [styles, addToCart, handleRemove, isCartLoading] // Dependencies for useCallback
  );

  // Render function for individual best-seller card
  const renderBestSellerCard = useCallback(
    ({ item }: { item: BestSellerItem }) => (
      <View style={styles.bestSellerCard}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.bestSellerImage}
          fadeDuration={0}
        />
        <Text style={styles.bestSellerName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.bestSellerPrice}>${item.price.toFixed(2)}</Text>
        <Pressable
          style={styles.bestSellerButton}
          onPress={() => addToCart(item.id, 1)}
          disabled={isCartLoading} // Disable while cart is loading
        >
          <Text style={styles.bestSellerButtonText}>Add to Cart</Text>
        </Pressable>
      </View>
    ),
    [styles, addToCart, isCartLoading] // Dependencies for useCallback
  );

  // Memoized calculation of total cart cost
  const totalCartCost = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cartItems] // Re-calculate when cartItems change
  );

  // Key extractors for FlatList optimization
  const cartKeyExtractor = useCallback((item: CartItem) => item.id, []);
  const bestSellerKeyExtractor = useCallback(
    (item: BestSellerItem) => item.id,
    []
  );

  // Item separator component for FlatList
  const ItemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [styles]
  );

  // Conditional rendering based on cart error message
  if (cartErrorMessage) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: {cartErrorMessage}</Text>
      </View>
    );
  }

  // Conditional rendering for empty cart state
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
            fadeDuration={0}
          />
          <Text style={styles.emptyBasketText}>Your cart is empty</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Check These Products</Text>
          {isBestSellersLoading && <ActivityIndicator />}
          {bestSellersErrorMessage ? (
            <Text style={styles.errorText}>
              Error: {bestSellersErrorMessage}
            </Text>
          ) : null}
          {!isBestSellersLoading && !bestSellersErrorMessage ? (
            <FlatList
              data={bestSellerItems}
              horizontal // Horizontal scrolling
              showsHorizontalScrollIndicator={false}
              keyExtractor={bestSellerKeyExtractor}
              renderItem={renderBestSellerCard}
              contentContainerStyle={styles.bestSellersListContainer}
              removeClippedSubviews={true} // Performance optimization
              maxToRenderPerBatch={5}
              windowSize={10}
              initialNumToRender={5}
              getItemLayout={(data, index) => ({
                length: 140, // Fixed item width for layout calculation
                offset: 140 * index,
                index,
              })}
            />
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  // Main rendering for non-empty cart
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
              onPress={() => router.navigate("/cart/checkout")}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </Pressable>
          </View>
        }
        removeClippedSubviews={true} // Performance optimization
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
}

const BRAND = "#5E3EBD"; // Primary brand color
const screenWidth = Dimensions.get("window").width; // Get screen width for responsive sizing

// Function to create StyleSheet based on color scheme
export function createStyles(colorScheme: "light" | "dark") {
  const backgroundColor = Colors[colorScheme].background;
  const textColor = Colors[colorScheme].text;

  return StyleSheet.create({
    qtyButtonDisabled: { color: "#CCC" }, // Style for disabled quantity buttons
    mainContainer: { flex: 1, backgroundColor, paddingTop: 16 }, // Main container style
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
    details: { flex: 1 }, // Flex to take available space
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
