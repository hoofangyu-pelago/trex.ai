module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // NOTE: Keep reanimated plugin last. Do not include 'expo-router/babel' in SDK 50+.
    plugins: ['react-native-reanimated/plugin'],
  };
};

