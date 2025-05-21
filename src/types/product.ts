export type Product = {
    id: number;
    title: string;
    price: number;
    description: string;
    category?: string;
    image: string;
    rating?: {
      rate: number;
      count: number;
    };
  };
  // Add Expo Router type definitions
  declare global {
    namespace ExpoRouter {
      interface RouteMap {
        '/product/[id]': { id: string };
      }
    }
  }