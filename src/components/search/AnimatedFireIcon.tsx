import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface AnimatedFireIconProps {
  delay?: number;
  size?: number;
  color?: string;
}

const AnimatedFireIcon = ({
  delay = 0,
  size = 16,
  color = "#F9B615",
}: AnimatedFireIconProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.3,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    animate();
  }, [delay]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "15deg"],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { rotate }],
        opacity: opacityAnim,
      }}
    >
      <FontAwesome5 name="fire" size={size} color={color} />
    </Animated.View>
  );
};

export default AnimatedFireIcon;
