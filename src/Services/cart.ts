// // src/Services/cart.ts
// import client from './api';

// export interface CartItem {
//   productId: string;
//   quantity: number;
//   // …other fields
// }

// export async function readCart(): Promise<CartItem[]> {
//   const { data } = await client.get<{ items: CartItem[] }>('/cart');
//   return data.items;
// }

// export async function addToCart(productId: string): Promise<CartItem[]> {
//   await client.post('/cart/add', { productId });
//   return readCart();
// }
