// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'supabase/functions/**'],
  },
  {
    // react-native-maps must never leak outside the <DogMap> abstraction —
    // it has no web implementation and would break the web bundle.
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/components/map/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native-maps',
              message: 'Use the platform-split <DogMap> from @/components/map/DogMap instead.',
            },
            {
              name: '@vis.gl/react-google-maps',
              message: 'Use the platform-split <DogMap> from @/components/map/DogMap instead.',
            },
          ],
        },
      ],
    },
  },
]);
