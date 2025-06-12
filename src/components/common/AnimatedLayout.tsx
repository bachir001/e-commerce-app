"use client";

import { View, Text, Animated, Easing, Dimensions } from "react-native";
import { useEffect, useRef } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface AnimatedLoaderProps {
  color?: string;
  size?: "small" | "large";
  text?: string;
}

const { width } = Dimensions.get("window");

export default function AnimatedLoader({
  color = "#5e3ebd",
  size = "large",
  text = "Loading amazing products...",
}: AnimatedLoaderProps) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Particle animations
  const particleRotateAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;
  const particleScaleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;
  const particleOpacityAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  const particleAnims = useRef(
    Array.from({ length: 8 }, (_, index) => ({
      rotate: particleRotateAnims[index],
      scale: particleScaleAnims[index],
      opacity: particleOpacityAnims[index],
    }))
  ).current;

  // Dot animations
  const dotTranslateYAnims = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0))
  ).current;
  const dotScaleAnims = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(1))
  ).current;

  const dotAnims = useRef(
    Array.from({ length: 3 }, (_, index) => ({
      translateY: dotTranslateYAnims[index],
      scale: dotScaleAnims[index],
    }))
  ).current;

  useEffect(() => {
    // Initial entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous rotation animation for main icon
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Pulse animation for outer rings
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Wave animation for ripple effect
    const waveAnimation = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    waveAnimation.start();

    // Float animation for vertical movement
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();

    // Shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    // Particle animations
    particleAnims.forEach((particle, index) => {
      const delay = index * 200;

      // Rotation
      Animated.loop(
        Animated.timing(particle.rotate, {
          toValue: 1,
          duration: 3000 + index * 500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Scale and opacity
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: 800,
              easing: Easing.in(Easing.back(1.2)),
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    // Dot animations
    dotAnims.forEach((dot, index) => {
      const delay = index * 150;

      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(dot.translateY, {
              toValue: -8,
              duration: 400,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(dot.scale, {
              toValue: 1.2,
              duration: 400,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot.translateY, {
              toValue: 0,
              duration: 400,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(dot.scale, {
              toValue: 1,
              duration: 400,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
      waveAnimation.stop();
      floatAnimation.stop();
      shimmerAnimation.stop();
    };
  }, []);

  const iconSize = size === "large" ? 32 : 24;
  const containerSize = iconSize * 4;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const float = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View className="py-12 items-center justify-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: float }],
        }}
        className="items-center"
      >
        {/* Main loader container */}
        <View
          style={{
            width: containerSize,
            height: containerSize,
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Outer ripple waves */}
          {[1, 2, 3].map((index) => (
            <Animated.View
              key={`wave-${index}`}
              style={{
                position: "absolute",
                width: containerSize * (0.6 + index * 0.2),
                height: containerSize * (0.6 + index * 0.2),
                borderRadius: (containerSize * (0.6 + index * 0.2)) / 2,
                borderWidth: 2,
                borderColor: color,
                opacity: waveAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8 - index * 0.2, 0],
                }),
                transform: [
                  {
                    scale: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.4 + index * 0.2],
                    }),
                  },
                ],
              }}
            />
          ))}

          {/* Gradient background circle */}
          <Animated.View
            style={{
              position: "absolute",
              width: containerSize * 0.7,
              height: containerSize * 0.7,
              borderRadius: containerSize * 0.35,
              transform: [{ scale: pulseAnim }],
            }}
          >
            <LinearGradient
              colors={[`${color}20`, `${color}40`, `${color}20`]}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: containerSize * 0.35,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* Particle system */}
          {particleAnims.map((particle, index) => {
            const angle = index * 45 * (Math.PI / 180);
            const radius = containerSize * 0.4;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <Animated.View
                key={`particle-${index}`}
                style={{
                  position: "absolute",
                  left: containerSize / 2 + x - 4,
                  top: containerSize / 2 + y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: color,
                  opacity: particle.opacity,
                  transform: [
                    { scale: particle.scale },
                    {
                      rotate: particle.rotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                }}
              />
            );
          })}

          {/* Main icon container with perfect centering */}
          <Animated.View
            style={{
              width: iconSize * 2.2,
              height: iconSize * 2.2,
              borderRadius: iconSize * 1.1,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              transform: [{ rotate: spin }],
              shadowColor: color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={[color, `${color}CC`, color]}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: iconSize * 1.1,
                alignItems: "center",
                justifyContent: "center",
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome5 name="magic" size={iconSize} color="white" />
            </LinearGradient>

            {/* Shimmer effect */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: iconSize * 1.1,
                overflow: "hidden",
              }}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 20,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  transform: [{ translateX: shimmerTranslate }],
                }}
              />
            </Animated.View>
          </Animated.View>
        </View>

        {/* Text and dots section */}
        <View className="mt-6 items-center">
          <Text className="font-bold text-lg mb-1" style={{ color }}>
            {text}
          </Text>
          <Text className="text-gray-500 text-sm mb-4">
            Curating the perfect selection for you
          </Text>

          {/* Animated dots */}
          <View className="flex-row items-center">
            {dotAnims.map((dot, index) => (
              <Animated.View
                key={`dot-${index}`}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: color,
                  marginHorizontal: 4,
                  transform: [
                    { translateY: dot.translateY },
                    { scale: dot.scale },
                  ],
                }}
              />
            ))}
          </View>
        </View>

        {/* Progress indicator */}
        <View className="mt-4 w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <Animated.View
            style={{
              height: "100%",
              backgroundColor: color,
              borderRadius: 2,
              transform: [
                {
                  translateX: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-128, 128],
                  }),
                },
              ],
            }}
            className="w-16"
          />
        </View>
      </Animated.View>
    </View>
  );
}
