// metro.config.js

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

// Get Expo's default Metro config
let config = getDefaultConfig(__dirname);

// Wrap it with NativeWind (first)
config = withNativeWind(config, { input: "./global.css" });

// Then wrap it with Reanimated
config = wrapWithReanimatedMetroConfig(config);

module.exports = config;
