// Optimized cartStore.ts with all type definitions
import { create } from "zustand";
import Toast from "react-native-toast-message";
import { getOrCreateSessionId } from "@/lib/session";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

const API_BASE = "https://api-gocami-test.gocami.com/api";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

// Define missing response interfaces
interface CartItemResponse {
  id: string;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  product_image: string | null;
}

interface FetchCartApiResponse {
  status: boolean;
  message: string;
  data: CartItemResponse[];
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
  lastFetch: number | null;
  fetchCart: (force?: boolean) => Promise<void>;
  addToCart: (
    productId: string,
    quantity: number,
    action?: "increase" | "decrease"
  ) => Promise<void>;
  clearCart: () => void;
  needsRefresh: () => boolean;
}

// Helper function to extract a readable error message
function getErrorMessage(error: any): string {
  if (error.name === "AbortError") {
    return "Network request timed out. Please check your internet connection.";
  }
  if (error.message) {
    return error.message;
  }
  // If it's an object, try to stringify it for more details
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch (e) {
      return "An unknown error occurred [object stringify failed]";
    }
  }
  return String(error || "An unknown error occurred.");
}


export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      lastFetch: null,

      needsRefresh: () => {
        const { lastFetch } = get();
        // Return true if no lastFetch or if cache duration has passed
        return !lastFetch || Date.now() - lastFetch > CACHE_DURATION;
      },

      fetchCart: async (force = false) => {
        const state = get();
        // If not forced, cache is valid, and items exist, don't fetch
        if (!force && !state.needsRefresh() && state.items.length > 0) {
          return;
        }

        set({ loading: true, error: null }); // Set loading true at the start
        try {
          const sessionId = await getOrCreateSessionId();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

          const res = await fetch(`${API_BASE}/cart`, {
            headers: {
              "Content-Type": "application/json",
              "x-session": sessionId,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId); // Clear timeout on successful response

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }

          const json: FetchCartApiResponse = await res.json();
          if (!json.status) throw new Error(json.message || "Failed to load cart");

          // Map raw API response data to CartItem type
          const items: CartItem[] = json.data.map((raw: CartItemResponse) => ({
            id: raw.id,
            productId: String(raw.product_id), // Ensure productId is string
            name: raw.name,
            price: raw.price,
            quantity: raw.quantity,
            imageUrl: raw.product_image ?? "", // Handle null product_image
          }));

          set({ items, loading: false, lastFetch: Date.now() }); // Update state on success
        } catch (err: any) {
          const msg = getErrorMessage(err); // Use the helper to get message
          set({ loading: false, error: msg }); // Set loading false and update error
          
          // Show toast only if there are no items in the cart to avoid excessive toasts
          if (get().items.length === 0) {
            Toast.show({
              type: "error",
              text1: "Cart Error",
              text2: msg,
              position: "bottom",
            });
          }
        }
      },

      addToCart: async (productId, quantity, action) => {
        const prevState = get(); // Capture current state for potential revert

        // Find existing item in cart
        const existingIndex = prevState.items.findIndex(
          (i) => i.productId === productId
        );

        // Create optimistic state update for UI responsiveness
        let optimisticItems: CartItem[];
        if (existingIndex >= 0) {
          optimisticItems = prevState.items.map((item, idx) => {
            if (idx !== existingIndex) return item; // Return other items as is
            // Calculate new quantity based on action
            const newQty =
              action === "increase"
                ? item.quantity + quantity
                : action === "decrease"
                ? Math.max(1, item.quantity - quantity) // Ensure quantity doesn't go below 1
                : quantity; // For direct set quantity
            return { ...item, quantity: newQty };
          });
        } else {
          // Add new temporary item if not existing
          optimisticItems = [
            ...prevState.items,
            {
              id: `temp-${Date.now()}`, // Temporary ID for optimistic item
              productId,
              name: "Loading...", // Placeholder name
              price: 0, // Placeholder price
              quantity,
              imageUrl: "", // Placeholder image
            },
          ];
        }

        // Apply optimistic update immediately
        set({
          items: optimisticItems,
          loading: true, // Show loading indicator
          error: null,
          lastFetch: null, // Invalidate cache to force fresh fetch after API call
        });

        try {
          const sessionId = await getOrCreateSessionId();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

          const res = await fetch(`${API_BASE}/cart/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-session": sessionId,
            },
            body: JSON.stringify({
              product_id: Number(productId), // Ensure product_id is number for API
              quantity,
              ...(action && { action }), // Conditionally add action to body
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId); // Clear timeout on successful response

          // Handle HTTP errors from the API
          if (!res.ok) {
            let errorMsg = `HTTP ${res.status}`;

            // Specific handling for 422 (Validation errors)
            if (res.status === 422) {
              try {
                const errorBody = await res.json();
                errorMsg = errorBody.message || "Validation failed";
              } catch {
                errorMsg = "Invalid request data"; // Fallback if JSON parsing fails
              }
            }
            // Specific handling for 500 (Server errors)
            else if (res.status === 500) {
              errorMsg = "Server error, please try again later";
            }

            throw new Error(errorMsg); // Throw error to be caught below
          }

          const json: AddToCartApiResponse = await res.json();
          if (!json.status) {
            throw new Error(json.message || "Failed to add item");
          }

          // SUCCESS: Force a fresh cart fetch from the server to reflect actual state
          await get().fetchCart(true);

          Toast.show({
            type: "success",
            text1: "Cart Updated",
            position: "bottom",
          });
        } catch (err: any) {
          const msg = getErrorMessage(err); // Use the helper to get message
          
          // Revert to the previous state only if there was a definitive error that
          // means the optimistic update was incorrect.
          // For network issues, it's better to show an error and let user retry.
          set({ ...prevState, loading: false, error: msg }); // Revert state and set loading false

          const isStockErr = msg.includes("exceeds available stock");

          Toast.show({
            type: "error",
            text1: isStockErr ? "Out of Stock" : "Cart Error",
            text2: msg,
            position: "bottom",
          });
        } finally {
          // Ensure loading state is always turned off
          set({ loading: false });
        }
      },

      clearCart: () => set({ items: [], error: null, lastFetch: null }),
    }),
    {
      name: "cart-storage", // Name for the storage key
      storage: createJSONStorage(() => ({
        // Use Expo SecureStore for persistent, secure storage
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      })),
      // Partialize state to only persist 'items' and 'lastFetch'
      partialize: (state) => ({
        items: state.items,
        lastFetch: state.lastFetch,
      }),
      version: 3, // Bump version for migration if schema changes
    }
  )
);
