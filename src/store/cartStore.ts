// Optimized cartStore.ts with all type definitions
import { create } from "zustand";
import Toast from "react-native-toast-message";
import { getOrCreateSessionId } from "@/lib/session";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

//process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

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
  if (typeof error === "object" && error !== null) {
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
          if (!json.status)
            throw new Error(json.message || "Failed to load cart");

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
              position: "top",
              autoHide: true,
              visibilityTime: 2000,
              topOffset: 60,
            });
          }
        }
      },

      addToCart: async (productId, quantity, action) => {
        const prevState = get(); // Capture current state for potential revert
        let exceedQuantity = false; // Declare in function scope

        // Find existing item in cart
        const existingIndex = prevState.items.findIndex(
          (i) => i.productId === productId
        );

        // Create optimistic state update
        let optimisticItems: CartItem[];
        if (existingIndex >= 0) {
          optimisticItems = prevState.items.map((item, idx) => {
            if (idx !== existingIndex) return item;
            const newQty =
              action === "increase"
                ? item.quantity + quantity
                : action === "decrease"
                ? Math.max(1, item.quantity - quantity)
                : quantity;
            return { ...item, quantity: newQty };
          });
        } else {
          optimisticItems = [
            ...prevState.items,
            {
              id: `temp-${Date.now()}`,
              productId,
              name: "Loading...",
              price: 0,
              quantity,
              imageUrl: "",
            },
          ];
        }

        // Apply optimistic update
        set({
          items: optimisticItems,
          loading: true,
          lastFetch: null,
        });

        try {
          const sessionId = await getOrCreateSessionId();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10_000);

          const res = await fetch(`${API_BASE}/cart/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-session": sessionId,
            },
            body: JSON.stringify({
              product_id: Number(productId),
              quantity,
              ...(action && { action }),
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            let errorMsg = `HTTP ${res.status}`;
            
            if (res.status === 405) {
              exceedQuantity = true; // Set flag for out-of-stock
              errorMsg = "Product Exceed The Available Quantity";
            } else if (res.status === 422) {
              try {
                const body = await res.json();
                errorMsg = body.message || "Validation failed";
              } catch {
                errorMsg = "Invalid request data";
              }
            } else if (res.status === 500) {
              console.log(res,"res");
              
              errorMsg = "Unknown server error, could be related to stock Quantity";
            }

            throw new Error(errorMsg);
          }

          const json: AddToCartApiResponse = await res.json();
          if (!json.status) {
            throw new Error(json.message || "Failed to add item");
          }

          // On success, re-fetch cart
          await get().fetchCart(true);
          Toast.show({
            type: "success",
            text1: "Cart Updated",
            position: "top",
            visibilityTime: 2000,
            topOffset: 50,
          });
        } catch (err: any) {
          // Show specific out-of-stock toast
          if (exceedQuantity) {
            Toast.show({
              type: "error",
              text1: "Out of Stock",
              text2: "Product Exceed The Available Quantity",
              position: "top",
              visibilityTime: 2000,
              topOffset: 50,
            });
          } 
          // Show generic error toast
          else {
            const msg = getErrorMessage(err);
            Toast.show({
              type: "error",
              text1: "Cart Error",
              text2: msg,
              position: "top",
              visibilityTime: 2000,
              topOffset: 50,
            });
          }

          // Revert to previous state
          set({
            items: prevState.items,
            loading: false,
            lastFetch: prevState.lastFetch,
          });
        } finally {
          // Ensure loading is always disabled
          set((state) => ({ ...state, loading: false }));
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