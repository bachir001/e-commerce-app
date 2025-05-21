// app/types/expo-router.d.ts
declare global {
    namespace ExpoRouter {
      interface RouteMap {
        // Your existing routes
        '/': undefined;
        '/(tabs)/explore': undefined;
        // Add dynamic route type
        '/product/[id]': {
          id: string;
        };
        // Add catch-all route type if needed
        '/[...missing]': { missing: string[] };
        '/(tabs)/home/productDetails': { name: string };
      }
    }
  }