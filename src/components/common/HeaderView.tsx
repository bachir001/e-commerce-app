// src/components/HeaderView.tsx
import React from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/common/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/common/IconSymbol';
import logoImg from '../../assets/images/logo.png';

interface HeaderViewProps {
  onSearchPress?: () => void;
}

export const HeaderView: React.FC<HeaderViewProps> = ({ onSearchPress }) => {
    const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
    const colors = Colors[scheme];
  
    return (
      <View style={styles.container}>
        <Image source={logoImg} style={styles.logo} resizeMode="contain" />
        
        <Link href="/(tabs)/home/SearchScreen" asChild>
          <Pressable
            onPress={onSearchPress}
            style={({ pressed }) => [
              styles.searchBox,
              { 
                backgroundColor: colors.tint + '20',
                opacity: pressed ? 0.8 : 1,
                borderColor: '#fff' 
              }
            ]}
          >
            <ThemedText style={styles.searchInput}>Search...</ThemedText>
          </Pressable>
        </Link>
  
        <IconSymbol
          size={310}
          color="#808080"
          name="sparkles"
          style={styles.decorativeIcon}
        />
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    backgroundColor: '#5e3ebd',
    position: 'relative',
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
  searchInput: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    paddingLeft: 15,
    width: 250,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#fff',
    paddingVertical: 0,
  },
  decorativeIcon: {
    position: 'absolute',
    bottom: -90,
    left: -35,
    color: '#808080',
  },
});
