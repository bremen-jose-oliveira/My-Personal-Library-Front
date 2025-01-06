const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'), // SVG support
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [
    ...resolver.sourceExts,
    'svg',
    'web.js',
    'web.jsx',
    'web.ts',
    'web.tsx',
  ],
  extraNodeModules: {
    'react-native': require.resolve('react-native-web'),
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });