// cartStore.ts
import { create } from "zustand";
import Toast from "react-native-toast-message";
import { getOrCreateSessionId } from "@/lib/session";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

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
  loadingItems: string[]; // Track loading item IDs
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
      loadingItems: [], // New array for loading item IDs
      error: null,
      lastFetch: null,

      needsRefresh: () => {
        const { lastFetch } = get();
        return !lastFetch || Date.now() - lastFetch > CACHE_DURATION;
      },

      fetchCart: async (force = false) => {
        // ... existing implementation (unchanged) ...
      },

      addToCart: async (productId, quantity, action) => {
        const prevState = get();
        let exceedQuantity = false;
        
        // Generate temporary ID for new items
        const temporaryId = `temp-${Date.now()}`;
        
        // Find existing item in cart
        const existingIndex = prevState.items.findIndex(
          (item) => item.productId === productId
        );
        
        // Determine item ID for loading tracking
        const itemId = existingIndex >= 0 
          ? prevState.items[existingIndex].id 
          : temporaryId;

        // Add to loadingItems immediately
        set({
          loadingItems: [...prevState.loadingItems, itemId]
        });

        // Create optimistic state update
        let optimisticItems: CartItem[];
        if (existingIndex >= 0) {
          optimisticItems = prevState.items.map((item, index) => {
            if (index !== existingIndex) return item;
            const newQuantity = 
              action === "increase"
                ? item.quantity + quantity
                : action === "decrease"
                ? Math.max(1, item.quantity - quantity)
                : quantity;
            return { ...item, quantity: newQuantity };
          });
        } else {
          optimisticItems = [
            ...prevState.items,
            {
              id: temporaryId,
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
          lastFetch: null,
        });

        try {
          const sessionId = await getOrCreateSessionId();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10_000);

          const response = await fetch(`${API_BASE}/cart/add`, {
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

          if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            
            if (response.status === 405) {
              exceedQuantity = true;
              errorMessage = "Product Exceed The Available Quantity";
            } else if (response.status === 422) {
              try {
                const body = await response.json();
                errorMessage = body.message || "Validation failed";
              } catch {
                errorMessage = "Invalid request data";
              }
            } else if (response.status === 500) {
              errorMessage = "Unknown server error, could be related to stock Quantity";
            }

            throw new Error(errorMessage);
          }

          const json: AddToCartApiResponse = await response.json();
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
        } catch (error: any) {
          if (exceedQuantity) {
            Toast.show({
              type: "error",
              text1: "Out of Stock",
              text2: "Product Exceed The Available Quantity",
              position: "top",
              visibilityTime: 2000,
              topOffset: 50,
            });
          } else {
            const message = getErrorMessage(error);
            Toast.show({
              type: "error",
              text1: "Cart Error",
              text2: message,
              position: "top",
              visibilityTime: 2000,
              topOffset: 50,
            });
          }

          // Revert to previous state
          set({
            items: prevState.items,
            lastFetch: prevState.lastFetch,
          });
        } finally {
          // Remove from loadingItems when done
          set((state) => ({
            loadingItems: state.loadingItems.filter(id => id !== itemId)
          }));
        }
      },
      
      clearCart: () => set({ 
        items: [], 
        loadingItems: [], 
        error: null, 
        lastFetch: null 
      }),
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
        lastFetch: state.lastFetch,
      }),
      version: 3,
    }
  )
);