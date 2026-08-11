// Flat config (ESLint 9). Expo's shared config plus Prettier integration.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // i18next's default export also exposes `use`/`t` as named members.
      // Chaining i18n.use(...) is intentional, so silence the false positive.
      'import/no-named-as-default-member': 'off',
      // Reanimated mutates shared values via `sharedValue.value = ...`, which this
      // React Compiler rule flags. That is reanimated's intended API, so allow it.
      'react-hooks/immutability': 'off',
    },
  },
]);
