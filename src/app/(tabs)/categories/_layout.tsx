import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { Slot, useSegments } from 'expo-router';
import Sidebar from '@/components/Sidebar';
import { HeaderView } from '@/components/common/HeaderView';

export default function CategoriesLayout() {
  const segments = useSegments();
  const isChildRoute = segments.length > 3;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <HeaderView />
      </SafeAreaView>

      <View style={styles.body}>
        {!isChildRoute && (
          <View style={styles.sidebar}>
            <Sidebar />
          </View>
        )}
        <View style={styles.main}>
          <SafeAreaView style={styles.mainSafe}>
            <Slot />
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#FFF' },
  body: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 100 },
  main: { flex: 1 },
  mainSafe: { flex: 1 },
});
