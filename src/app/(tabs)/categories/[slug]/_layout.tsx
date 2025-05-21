import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';

export default function CategoryChildLayout() {
  return (
    <SafeAreaView style={styles.safe}>
      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
});
