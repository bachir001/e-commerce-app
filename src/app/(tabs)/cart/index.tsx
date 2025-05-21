// src/app/tabs/cart.tsx

import React, { useEffect, useState, useCallback, memo } from 'react';
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
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useCartStore, CartItem } from '@/store/cartStore';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { getOrCreateSessionId } from '@/lib/session';

interface BestSellerItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function CartScreen(): React.ReactElement {
  const router = useRouter();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const styles = createStyles(colorScheme);

  // Cart state & actions
  const cartItems = useCartStore(s => s.items);
  const cartError = useCartStore(s => s.error);
  const fetchCart = useCartStore(s => s.fetchCart);
  const addToCart = useCartStore(s => s.addToCart);

  // Per-item updating set
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Best-sellers
  const [bestSellers, setBestSellers] = useState<BestSellerItem[]>([]);
  const [isBestLoading, setBestLoading] = useState(false);
  const [bestError, setBestError] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => { fetchCart(); }, [fetchCart]);

  // Load best sellers only if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      setBestLoading(true);
      setBestError(null);
      axios
        .get('https://api-gocami-test.gocami.com/api/best-sellers?page=1&per_page=20')
        .then(res => {
          if (!res.data.status) throw new Error(res.data.message);
          const mapped: BestSellerItem[] = res.data.data.results.map((r: any) => ({
            id: String(r.id),
            name: r.name,
            price: r.price,
            imageUrl: r.product_image ?? r.image,
          }));
          setBestSellers(mapped);
        })
        .catch(err => setBestError(err.message || 'Unknown error'))
        .finally(() => setBestLoading(false));
    }
  }, [cartItems]);

  // Helper to wrap any cart-update action
  const performUpdate = useCallback(
    async (itemId: string, action: () => Promise<void>) => {
      setUpdatingItems(prev => new Set(prev).add(itemId));
      try {
        await action();
        await fetchCart();
      } finally {
        setUpdatingItems(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [fetchCart]
  );

  const handleRemove = useCallback(
    (id: string) =>
      performUpdate(id, async () => {
        const sessionId = await getOrCreateSessionId();
        const form = new FormData();
        form.append('cart_item_id', id);
        form.append('_method', 'DELETE');
        await axios.post('https://api-gocami-test.gocami.com/api/cart/remove', form, {
          headers: { 'Content-Type': 'multipart/form-data', 'x-session': sessionId }
        });
      }),
    [performUpdate]
  );

  const changeQuantity = useCallback(
    (item: CartItem, delta: number) =>
      performUpdate(item.id, () =>
        addToCart(item.productId, Math.abs(delta), delta > 0 ? 'increase' : 'decrease')
      ),
    [addToCart, performUpdate]
  );


  if (cartError) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error: {cartError}</Text>
      </View>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.centeredContainer}>
          <Image
            source={require('@/assets/images/empty_basket.png')}
            style={styles.emptyBasketImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyBasketText}>Your cart is empty</Text>
        </View>
        <Text style={styles.sectionTitle}>Check These Products</Text>
        {isBestLoading && <ActivityIndicator />}
        {bestError && <Text style={styles.errorText}>Error: {bestError}</Text>}
        {!isBestLoading && !bestError && (
          <FlatList
            data={bestSellers}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <BestSellerCard
                item={item}
                onAdd={() =>
                  changeQuantity(
                    { id: item.id, productId: item.id, name: item.name, price: item.price, quantity: 0, imageUrl: item.imageUrl },
                    +1
                  )
                }
              />
            )}
            contentContainerStyle={styles.bestSellersListContainer}
            extraData={updatingItems}
          />
        )}
      </SafeAreaView>
    );
  }

  // Calculate total
  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            isUpdating={updatingItems.has(item.id)}
            onDecrease={() =>
              item.quantity > 1
                ? changeQuantity(item, -1)
                : handleRemove(item.id)
            }
            onIncrease={() => changeQuantity(item, +1)}
            onRemove={() => handleRemove(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        ListHeaderComponent={<Text style={styles.cartTitle}>Your Cart</Text>}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Subtotal</Text>
              <Text style={styles.footerValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Shipping</Text>
              <Text style={styles.footerValue}>Calculated at checkout</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.footerRow}>
              <Text style={[styles.footerLabel, styles.totalLabel]}>Total</Text>
              <Text style={[styles.footerValue, styles.totalValue]}>${total.toFixed(2)}</Text>
            </View>
            <Pressable
              style={styles.checkoutButton}
              onPress={() => router.push('/cart/checkout')}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </Pressable>
          </View>
        }
        extraData={updatingItems}
      />
    </SafeAreaView>
  );
}

// --- Subcomponents ---

const CartItemRow = memo(function CartItemRow({
  item,
  isUpdating,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartItem;
  isUpdating: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const styles = createStyles(scheme);

  return (
    <View style={styles.cartItemContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.details}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>

      <View style={styles.quantityContainer}>
        <Pressable onPress={onDecrease} disabled={isUpdating} style={styles.qtyPressable}>
          <Text style={styles.qtyButton}>–</Text>
        </Pressable>

        {isUpdating ? (
          <ActivityIndicator size="small" style={styles.qtySpinner} />
        ) : (
          <Text style={styles.qtyText}>{item.quantity}</Text>
        )}

        <Pressable onPress={onIncrease} disabled={isUpdating} style={styles.qtyPressable}>
          <Text style={styles.qtyButton}>+</Text>
        </Pressable>
      </View>

      <Pressable onPress={onRemove} disabled={isUpdating} style={styles.removePressable}>
        <MaterialIcons name="delete-outline" size={24} color="#E53935" />
      </Pressable>
    </View>
  );
});

const BestSellerCard = memo(function BestSellerCard({
  item,
  onAdd,
}: {
  item: BestSellerItem;
  onAdd: () => void;
}) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const styles = createStyles(scheme);

  return (
    <View style={styles.bestSellerCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.bestSellerImage} />
      <Text style={styles.bestSellerName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.bestSellerPrice}>${item.price.toFixed(2)}</Text>
      <Pressable style={styles.bestSellerButton} onPress={onAdd}>
        <Text style={styles.bestSellerButtonText}>Add to Cart</Text>
      </Pressable>
    </View>
  );
});

// --- Styles (unchanged) ---
const BRAND = '#5E3EBD';
const screenWidth = Dimensions.get('window').width;

export function createStyles(colorScheme: 'light' | 'dark') {
  const bg = Colors[colorScheme].background;
  const text = Colors[colorScheme].text;

  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: bg,
      paddingTop: 16,
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      backgroundColor: bg,
    },
    cartTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: text,
      margin: 16,
    },
    cartItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: bg,
    },
    productImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
    },
    details: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: '500',
      color: text,
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: BRAND,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#CCC',
      borderRadius: 4,
      paddingHorizontal: 8,
      marginRight: 12,
    },

    qtyPressable: {
      padding: 4,
    },
    qtyButton: {
      fontSize: 18,
      width: 24,
      textAlign: 'center',
      color: text,
    },
    qtyText: {
      fontSize: 16,
      width: 24,
      textAlign: 'center',
      color: text,
    },
    qtySpinner: {
      width: 24,
      height: 24,
    },
    removePressable: {
      padding: 8,
    },
    itemSeparator: {
      height: 1,
      backgroundColor: '#EEE',
    },
    footer: {
      padding: 16,
      backgroundColor: bg,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    footerLabel: {
      fontSize: 16,
      color: text,
    },
    footerValue: {
      fontSize: 16,
      color: text,
    },
    divider: {
      height: 1,
      backgroundColor: '#DDD',
      marginVertical: 12,
    },
    totalLabel: {
      fontWeight: '700',
    },
    totalValue: {
      fontSize: 18,
      fontWeight: '700',
    },
    checkoutButton: {
      marginTop: 16,
      backgroundColor: BRAND,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
    },
    checkoutText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
    emptyBasketImage: {
      width: screenWidth * 0.6,
      height: screenWidth * 0.6,
      marginBottom: 24,
    },
    emptyBasketText: {
      fontSize: 20,
      color: text,
      marginBottom: 0,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: text,
      marginLeft: 16,
      marginBottom: 12,
    },
    bestSellersListContainer: {
      paddingHorizontal: 16,
    },
    bestSellerCard: {
      width: 140,
      backgroundColor: bg,
      borderRadius: 8,
      marginRight: 12,
      padding: 8,
    },
    bestSellerImage: {
      width: '100%',
      height: 80,
      borderRadius: 4,
      marginBottom: 8,
    },
    bestSellerName: {
      fontSize: 14,
      fontWeight: '500',
      color: text,
      marginBottom: 4,
    },
    bestSellerPrice: {
      fontSize: 16,
      fontWeight: '600',
      color: text,
      marginBottom: 8,
    },
    bestSellerButton: {
      backgroundColor: BRAND,
      borderRadius: 4,
      paddingVertical: 6,
    },
    bestSellerButtonText: {
      color: '#FFF',
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '600',
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      marginTop: 8,
    },
  });
}
