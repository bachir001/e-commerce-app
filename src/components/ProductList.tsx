// ProductsList.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import ProductCard, { ProductCardProps } from "@/components/common/ProductCard";
import axios from "axios";

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Add to cart handler
  const handleAddToCart = (productId: number) => {
    // Add your cart logic here
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://api-gocami-test.gocami.com/api/new-arrivals?per_page=50"
        );

        // Handle API response errors
        if (!response.data.status) {
          throw new Error(response.data.message || "Failed to fetch products");
        }

        // Correct data mapping based on API response structure
        const results = response.data?.data?.results || [];

        const fetchedProducts: ProductCardProps[] = results.map(
          (item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description.replace(/<[^>]+>/g, ""), // Remove HTML tags
            image: item.image,
            slug: item.slug,
            isOnSale: item.special_price > 0 && item.special_price < item.price,
            onAddToCart: () => handleAddToCart(item.id),
          })
        );

        setProducts(fetchedProducts);
      } catch (err: any) {
        // Handle Axios errors
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <Text style={styles.message}>Loading products...</Text>;
  }

  if (error) {
    return <Text style={styles.message}>Error fetching products: {error}</Text>;
  }

  return (
    <View style={styles.gridContainer}>
      {products.map((item) => (
        <View key={item.id.toString()} style={styles.cardWrapper}>
          <ProductCard
            id={item.id}
            name={item.name}
            slug={item.slug}
            price={item.price}
            description={item.description}
            image={item.image}
            // onAddToCart={item.onAddToCart}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  cardWrapper: {
    width: "48%", // This will create 2-column layout
    marginBottom: 16,
  },
  message: {
    textAlign: "center",
    marginVertical: 0,
  },
});

export default ProductsList;
