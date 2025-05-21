import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import axios from 'axios';
import { ThemedText } from '@/components/common/ThemedText';

interface RelatedCategory { id: number; name: string; slug: string; image: string | null }
interface MegaData {
  categoryInfo: { mega_bg: string; mega_mobile_bg: string; mega_title: string; mega_title_color: string; mega_description: string; mega_description_color: string };
  relatedCategories: RelatedCategory[];
}

export default function MegaCategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [data, setData] = useState<MegaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get<{ status: boolean; data: MegaData }>(`https://api-gocami-test.gocami.com/api/getMegaCategory/${slug}`)
      .then(res => {
        if (!res.data.status) throw new Error('API error');
        setData(res.data.data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <ActivityIndicator style={styles.full} />;
  if (error) return <Text style={[styles.full, styles.error]}>{error}</Text>;
  if (!data) return null;

  const { categoryInfo, relatedCategories } = data;

  return (
    <FlatList
      data={relatedCategories}
      keyExtractor={i => i.id.toString()}
      numColumns={3}
      columnWrapperStyle={styles.colWrap}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View>
          <ImageBackground source={{ uri: categoryInfo.mega_bg }} style={styles.hero}>
            <View style={styles.overlay}>
              <Text style={[styles.title, { color: categoryInfo.mega_title_color }]}>{categoryInfo.mega_title}</Text>
              <Text style={[styles.desc, { color: categoryInfo.mega_description_color }]}>{categoryInfo.mega_description}</Text>
            </View>
          </ImageBackground>
          <Text style={styles.sectionHeader}>More in this category</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Link
          href={{
            pathname: '/(tabs)/categories/[slug]/[catProds]',
            params: { slug, catProds: item.slug, name: item.name, model_id: item.id },
          }}
          asChild
        >
          <Pressable style={styles.catItem}>
            <Image
              source={{ uri: item.image || 'https://newapi.gocami.com//storage/5189/Artboard-16.webp' }}
              style={styles.catImage}
            />
            <Text style={styles.catName}>{item.name}</Text>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
  hero: { height: 160, justifyContent: 'flex-end' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  desc: { fontSize: 14, marginTop: 4 },
  sectionHeader: { fontSize: 16, fontWeight: '600', margin: 12 },
  list: { paddingBottom: 16 },
  colWrap: { justifyContent: 'space-between', paddingHorizontal: 12 },
  catItem: { alignItems: 'center', marginVertical: 8, width: '35%' },
  catImage: { width: 50, height: 50, borderRadius: 6 },
  catName: { marginTop: 6, fontSize: 12, textAlign: 'center' },
});
