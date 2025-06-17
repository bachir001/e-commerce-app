import { View, Text, Animated } from "react-native";
import { useEffect, useRef } from "react";

interface DotsLoaderProps {
  color?: string;
  size?: "small" | "large";
  text?: string;
}

export default function DotsLoader({
  color = "#5e3ebd",
  size = "large",
  text = "Loading...",
}: DotsLoaderProps) {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(200),
        ])
      );
    };

    const animations = [
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 150),
      createDotAnimation(dot3Anim, 300),
    ];

    animations.forEach((anim) => anim.start());

    return () => animations.forEach((anim) => anim.stop());
  }, []);

  const dotSize = size === "large" ? 10 : 8;

  return (
    <View className="py-6 items-center justify-center">
      {/* Three bouncing dots */}
      <View className="flex-row items-center mb-4">
        {[dot1Anim, dot2Anim, dot3Anim].map((anim, index) => (
          <Animated.View
            key={index}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: color,
              marginHorizontal: 4,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
                {
                  scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            }}
          />
        ))}
      </View>

      <Text className="text-gray-600 text-sm font-medium">{text}</Text>
    </View>
  );
}
