// src/app/(tabs)/account/index.tsx

import React, { useCallback, useMemo } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import Header from '@/components/account/AccountHeader';
import IconGrid, { IconGridItem } from '@/components/account/IconGrid';
import Footer from '@/components/account/Footer';

// Helper: generate Unicode flag emoji from ISO country code
function getFlagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .split('')
    .map((c) => 0x1F1E6 + c.charCodeAt(0) - 0x41)
    .map((cp) => String.fromCodePoint(cp))
    .join('');
}

export default function AccountScreen() {
  // Memoize language options so we don't recreate on every render
  const languages = useMemo(
    () => [
      { code: 'en', flag: getFlagEmoji('US') },
      // { code: 'fr', flag: getFlagEmoji('FR') },
    ],
    []
  );

  // Handlers for grid actions
  const handleSignIn = useCallback(() => {
    // TODO: navigate to Sign In screen
  }, []);

  const handleSignUp = useCallback(() => {
    // TODO: navigate to Sign Up screen
  }, []);

  const contactItems: IconGridItem[] = useMemo(
    () => [
      { icon: 'user', label: 'Sign in', onPress: handleSignIn },
      { icon: 'user-plus', label: 'Sign up', onPress: handleSignUp },
      { icon: 'phone', label: 'Contact', onPress: () => { /* TODO */ } },
    ],
    [handleSignIn, handleSignUp]
  );

  const helpItems: IconGridItem[] = useMemo(
    () => [
      { icon: 'headset', label: 'Get Support', onPress: () => { /* TODO */ } },
      { icon: 'question-circle', label: 'FAQ', onPress: () => { /* TODO */ } },
      { icon: 'file-contract', label: 'Legal', onPress: () => { /* TODO */ } },
    ],
    []
  );

  return (
    <View style={styles.outer}>
      <SafeAreaView style={styles.inner}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header
          logo={require('@/assets/images/logo.png')}
          greeting="Hello, welcome to Go Cami!"
          languages={languages}
        />
      </SafeAreaView>

      <View style={styles.gridSection}>
        <IconGrid items={contactItems} />
      </View>

      <Text style={styles.sectionTitle}>Help Center</Text>

      <View style={styles.gridSection}>
        <IconGrid items={helpItems} />
      </View>

      <View style={styles.spacer} />

      <Footer
        socials={[
          { icon: 'facebook', url: 'https://facebook.com', brand: true },
          { icon: 'tiktok', url: 'https://tiktok.com', brand: true },
          { icon: 'linkedin', url: 'https://linkedin.com', brand: true },
          { icon: 'instagram', url: 'https://instagram.com', brand: true },
          { icon: 'twitter', url: 'https://x.com', brand: true },
        ]}
        version="0.1"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  inner: {
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
  },
  gridSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 12,
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  spacer: {
    flex: 1,
  },
});
