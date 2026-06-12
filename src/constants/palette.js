/**
 * Single source of truth for the color system.
 * Plain CJS so both tailwind.config.js (Node) and app code (TS via palette.d.ts)
 * read the exact same values — never hardcode these hexes elsewhere.
 */
const palette = {
  brand: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  status: {
    fedRecently: '#22C55E', // green: fed < 24h
    feedingDue: '#EAB308', // yellow: fed 24–72h ago
    notFed: '#EF4444', // red: > 72h or never fed
    injured: '#F97316', // orange: injured / sick overrides feeding color
    emergency: '#DC2626', // deep red: active emergency, highest priority
    missing: '#6B7280', // gray: dog missing
  },
  badge: {
    vaccinated: '#0EA5E9',
    sterilized: '#8B5CF6',
    pregnant: '#EC4899',
    puppies: '#F59E0B',
  },
};

module.exports = { palette };
