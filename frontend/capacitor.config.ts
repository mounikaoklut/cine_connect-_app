import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cineconnect.app',
  appName: 'CineConnect',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
