import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myspace.app',
  appName: 'MySpace',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
