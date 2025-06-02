// src/store/cartStore.ts
import { create } from "zustand";
import Toast from "react-native-toast-message";
import { getOrCreateSessionId } from "@/lib/session";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  fetchCart: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity: number,
    action?: "increase" | "decrease"
  ) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const sessionId = await getOrCreateSessionId();
          const res = await fetch(`${API_BASE}/cart`, {
            headers: {
              "Content-Type": "application/json",
              "x-session": sessionId,
            },
          });
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

          set({ items, loading: false });
        } catch (err: any) {
          const msg = err.message || "Unknown error fetching cart";
          set({ loading: false, error: msg });
          Toast.show({
            type: "error",
            text1: "Error Loading Cart",
            text2: msg,
            position: "bottom",
          });
        }
      },

      addToCart: async (productId, quantity, action) => {
        set((state) => {
          const idx = state.items.findIndex((i) => i.productId === productId);
          if (idx >= 0) {
            const newItems = [...state.items];
            newItems[idx] = {
              ...newItems[idx],
              quantity:
                action === "increase"
                  ? newItems[idx].quantity + quantity
                  : action === "decrease"
                  ? Math.max(0, newItems[idx].quantity - quantity)
                  : quantity,
              imageUrl: newItems[idx].imageUrl,
            };
            return { items: newItems, error: null, loading: true };
          }
          return {
            items: [
              ...state.items,
              {
                id: `temp-${productId}`,
                productId,
                name: "Loading…",
                price: 0,
                quantity,
                imageUrl: "",
              },
            ],
            error: null,
            loading: true,
          };
        });

        try {
          const sessionId = await getOrCreateSessionId();
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
          });
          const json: AddToCartApiResponse = await res.json();

          if (!json.status) {
            const message =
              typeof json.message === "string"
                ? json.message
                : JSON.stringify(json.message);
            const isStockErr = message.includes(
              "quantity exceeds available stock"
            );
            Toast.show({
              type: isStockErr ? "error" : "error",
              text1: isStockErr ? "Out of Stock" : "Error Adding to Cart",
              text2: message,
              position: "bottom",
            });
            set({ loading: false });
            return;
          }

          await get().fetchCart();
          Toast.show({
            type: "success",
            text1: "Cart Updated",
            text2: "Your cart has been updated successfully.",
            position: "bottom",
          });
        } catch (err: any) {
          const msg = err.message || "Unknown error adding to cart";
          set({ loading: false, error: msg });
          Toast.show({
            type: "error",
            text1: "Error Adding to Cart",
            text2: msg,
            position: "bottom",
          });
        }
      },

      clearCart: () => {
        set({ items: [], error: null });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
      version: 1,
    }
  )
);
