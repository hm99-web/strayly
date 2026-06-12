import { DarkTheme, DefaultTheme } from 'expo-router';

import { palette } from './palette';

export const lightNavTheme: typeof DefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.brand[600],
    background: '#FAFAF9',
    card: '#FFFFFF',
    text: '#1C1917',
    border: '#E7E5E4',
  },
};

export const darkNavTheme: typeof DarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: palette.brand[400],
    background: '#0C0A09',
    card: '#1C1917',
    text: '#F5F5F4',
    border: '#292524',
  },
};
