// components/ui/IconSymbol.tsx

import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';

interface IconSymbolProps {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: IconSymbolProps) {
  return (
    <View
      style={[
        { width: size, height: size },
        style,
      ]}
    >
      <SymbolView
        name={name}
        weight={weight}
        tintColor={color}
        resizeMode="scaleAspectFit"
        // fill the container you just sized
        style={{ flex: 1 }}
      />
    </View>
  );
}
