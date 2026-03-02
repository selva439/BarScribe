// IronLog Color System — Dark + Iron Red theme (user confirmed)
export const Colors = {
  // Backgrounds
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  border: '#2C2C2C',

  // Accent
  accent: '#E8341C',        // Iron Red — CTAs, active states, PRs
  accentDim: '#C02A17',     // Pressed/dimmed accent
  accentMuted: '#E8341C26', // 15% opacity for backgrounds

  // Text
  text: '#F5F5F5',
  textSecondary: '#AAAAAA',
  textMuted: '#888888',
  textDisabled: '#555555',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Pro badge
  pro: '#F5A623',
  proDim: '#B87A19',

  // Tab bar
  tabActive: '#E8341C',
  tabInactive: '#666666',
  tabBar: '#141414',

  // Status bar
  statusBar: 'dark-content' as const,
} as const;

export type ColorKey = keyof typeof Colors;
