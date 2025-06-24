// Optimized cartStore.ts
import { create } from "zustand";
import Toast from "react-native-toast-message";
import { getOrCreateSessionId } from "@/lib/session";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
const API_BASE = "https://api-gocami-test.gocami.com/api";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

interface FetchCartApiResponse {
  status: boolean;
  message: string;
  data: Array<{
    id: string;
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    product_image: string | null;
  }>;
}

interface AddToCartApiResponse {
  status: boolean;
  message: string;
  data: {
    session_id: string;
    user_id: string | null;
  };
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null; // Performance: Track last fetch time
  fetchCart: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity: number,
    action?: "increase" | "decrease"
  ) => Promise<void>;
  clearCart: () => void;
  // Performance: Add method to check if refresh is needed
  needsRefresh: () => boolean;
}

// Performance: Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      lastFetch: null,

      needsRefresh: () => {
        const { lastFetch } = get();
        if (!lastFetch) return true;
        return Date.now() - lastFetch > CACHE_DURATION;
      },

      fetchCart: async () => {
        // Performance: Skip fetch if data is fresh
        const state = get();
        if (!state.needsRefresh() && state.items.length > 0) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const sessionId = await getOrCreateSessionId();
          const controller = new AbortController();

          // Performance: Add timeout to prevent hanging requests
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(`${API_BASE}/cart`, {
            headers: {
              "Content-Type": "application/json",
              "x-session": sessionId,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          const json: FetchCartApiResponse = await res.json();

          if (!json.status) {
            throw new Error(json.message || "Failed to load cart");
          }

          const items: CartItem[] = json.data.map((raw) => ({
            id: raw.id,
            productId: String(raw.product_id),
            name: raw.name,
            price: raw.price,
            quantity: raw.quantity,
            imageUrl: raw.product_image ?? "",
          }));

          set({
            items,
            loading: false,
            lastFetch: Date.now(), // Performance: Update fetch timestamp
          });
        } catch (err: any) {
          if (err.name === "AbortError") {
            console.log("Cart fetch aborted");
            return;
          }

          const msg = err.message || "Unknown error fetching cart";
          set({ loading: false, error: msg });

          // Performance: Only show toast for user-initiated actions
          if (get().items.length === 0) {
            Toast.show({
              type: "error",
              text1: "Error Loading Cart",
              text2: msg,
              position: "bottom",
            });
          }
        }
      },

      addToCart: async (productId, quantity, action) => {
        // Performance: Optimistic update with better state management
        const currentState = get();
        const existingItemIndex = currentState.items.findIndex(
          (i) => i.productId === productId
        );

        // Create optimistic state
        let optimisticItems: CartItem[];

        if (existingItemIndex >= 0) {
          optimisticItems = currentState.items
            .map((item, index) => {
              if (index === existingItemIndex) {
                const newQuantity =
                  action === "increase"
                    ? item.quantity + quantity
                    : action === "decrease"
                    ? Math.max(0, item.quantity - quantity)
                    : quantity;

                return { ...item, quantity: newQuantity };
              }
              return item;
            })
            .filter((item) => item.quantity > 0); // Remove items with 0 quantity
        } else {
          optimisticItems = [
            ...currentState.items,
            {
              id: `temp-${productId}-${Date.now()}`,
              productId,
              name: "Loading…",
              price: 0,
              quantity,
              imageUrl: "",
            },
          ];
        }

        // Apply optimistic update
        set({
          items: optimisticItems,
          error: null,
          loading: true,
        });

        try {
          const sessionId = await getOrCreateSessionId();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const payload: any = {
            product_id: Number(productId),
            quantity,
          };
          if (action) {
            payload.action = action;
          }

          const res = await fetch(`${API_BASE}/cart/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-session": sessionId,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          const json: AddToCartApiResponse = await res.json();

          if (!json.status) {
            // Revert optimistic update on failure
            set({ items: currentState.items, loading: false });

            const message =
              typeof json.message === "string"
                ? json.message
                : JSON.stringify(json.message);
            const isStockErr = message.includes(
              "quantity exceeds available stock"
            );

            Toast.show({
              type: "error",
              text1: isStockErr ? "Out of Stock" : "Error Adding to Cart",
              text2: message,
              position: "bottom",
            });
            return;
          }

          // Success: fetch fresh data and show success message
          await get().fetchCart();
          Toast.show({
            type: "success",
            text1: "Cart Updated",
            text2: "Your cart has been updated successfully.",
            position: "bottom",
          });
        } catch (err: any) {
          if (err.name === "AbortError") {
            console.log("Add to cart aborted");
            return;
          }

          // Revert optimistic update on error
          set({ items: currentState.items, loading: false });

          const msg = err.message || "Unknown error adding to cart";
          set({ error: msg });
          Toast.show({
            type: "error",
            text1: "Error Adding to Cart",
            text2: msg,
            position: "bottom",
          });
        }
      },

      clearCart: () => {
        set({ items: [], error: null, lastFetch: null });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => ({
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      })),
      partialize: (state) => ({
        items: state.items,
        lastFetch: state.lastFetch, // Performance: Persist cache timestamp
      }),
      version: 2, // Increment version due to schema change
    }
  )
);
