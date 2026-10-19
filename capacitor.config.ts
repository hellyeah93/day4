import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dayzero.planner',
  appName: 'DayZero',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
