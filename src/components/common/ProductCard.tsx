
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/store/cartStore';

export interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  description: string;
  image: string | ImageSourcePropType;
}

const ProductCard = ({
  id,
  name,
  slug,
  price,
  description,
  image,
}: ProductCardProps) => {
  const router = useRouter();

  const fetchCart = useCartStore((s) => s.fetchCart);
  const addToCart = useCartStore((s) => s.addToCart);

  const handleProductPress = (id:number) => {
    router.push({
      pathname: '/(tabs)/home/ProductDetails' as const,
      params: { productName: slug , productId:id},
    });
  };

  const handleAddToCart = (productId:string) =>{
        addToCart(productId,1);
  }

  return (
    <Pressable 
      style={styles.container}
      onPress={ ()=> handleProductPress(id)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          style ={styles.productImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description} numberOfLines={2}> {description}</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
          <Pressable 
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.buttonPressed
            ]}
          >
            <Ionicons name="cart" size={25} color="red" onPress={()=> handleAddToCart(id.toString())}/>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 4, // Reduced margin
    width: '95%', // Take full width of parent
    // Remove maxWidth: 300
  },
  imageContainer: {
    padding: 5,
    backgroundColor: '#F8F8F8',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  detailsContainer: {
    padding: 16,
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4444',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 1,
  },
  saleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  reviewCount: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  description: {
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

export default ProductCard;