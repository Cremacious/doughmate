// Metro config that lets .svg files import as React components via
// react-native-svg-transformer. Nothing imports a .svg today (Sam is drawn
// inline with react-native-svg), but the transform stays ready for future SVG
// assets.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
