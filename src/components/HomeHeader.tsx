// src/components/HomeHeader.tsx
import React from 'react';
import { View, Image, TextInput, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/common/IconSymbol';
import logoImg from '@/assets/images/logo.png'; // make sure you have the module declaration for .png

export function HomeHeader() {
  const rawScheme = useColorScheme(); // "light" | "dark" | "no-preference" | null
  const scheme = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={logoImg} style={styles.logo} resizeMode="contain" />
      <View style={[styles.searchBox, { backgroundColor: colors.tint + '20' }]}>
        <IconSymbol
          name="magnifyingglass"
          size={16}
          color={colors.text}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Search..."
          placeholderTextColor={colors.text + '88'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 32,
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
});
