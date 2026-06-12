import type { ConfigContext, ExpoConfig } from 'expo/config';

// Build-time native keys (NOT EXPO_PUBLIC_ — they are baked into the native
// binaries by prebuild, never shipped in JS). Empty until Phase 4 maps setup.
const GOOGLE_MAPS_ANDROID_KEY = process.env.GOOGLE_MAPS_ANDROID_KEY ?? '';
const GOOGLE_MAPS_IOS_KEY = process.env.GOOGLE_MAPS_IOS_KEY ?? '';
// Reversed iOS client id, e.g. com.googleusercontent.apps.123-abc (Phase 7).
const GOOGLE_IOS_URL_SCHEME = process.env.GOOGLE_IOS_URL_SCHEME;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Paw Guardians',
  slug: 'pawguardians',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'pawguardians',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.hm99.pawguardians',
    supportsTablet: false,
    icon: './assets/expo.icon',
    config: { googleMapsApiKey: GOOGLE_MAPS_IOS_KEY },
  },
  android: {
    package: 'com.hm99.pawguardians',
    adaptiveIcon: {
      backgroundColor: '#7C2D12',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    config: { googleMaps: { apiKey: GOOGLE_MAPS_ANDROID_KEY } },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#7C2D12',
        android: { image: './assets/images/splash-icon.png', imageWidth: 76 },
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Paw Guardians uses your location to show street dogs near you and to record where dogs were seen.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Paw Guardians lets you attach photos of dogs, feedings and medical updates.',
        cameraPermission: 'Paw Guardians lets you photograph dogs to add or update their profiles.',
      },
    ],
    'expo-notifications',
    'expo-secure-store',
    ...(GOOGLE_IOS_URL_SCHEME
      ? ([['@react-native-google-signin/google-signin', { iosUrlScheme: GOOGLE_IOS_URL_SCHEME }]] as [string, unknown][])
      : []),
  ],
  extra: {
    // Lets DogMap.tsx choose Apple Maps on iOS until a Google key is configured.
    hasGoogleMapsIosKey: GOOGLE_MAPS_IOS_KEY.length > 0,
  },
  experiments: {
    typedRoutes: true,
  },
});
