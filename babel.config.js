module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        "nativewind/babel",
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      ],
      plugins: [
        [
          'module-resolver',
          {
            root: ['.'],
            alias: {
              '@': './src',
            },
          },
        ],
        'react-native-reanimated/plugin'
      ],
    };
  };