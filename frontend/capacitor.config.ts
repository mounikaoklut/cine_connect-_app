interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
    url?: string;
    cleartext?: boolean;
  };
}

const config: CapacitorConfig = {
  appId: 'com.cineconnect.app',
  appName: 'CineConnect',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
