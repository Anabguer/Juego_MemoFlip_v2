import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.CAP_DEV === 'true';

const config: CapacitorConfig = {
  appId: 'com.memoflip.app',
  appName: 'MemoFlip',
  webDir: 'out',
  server: isDev
    ? { url: 'http://localhost:3000', cleartext: true }  // SOLO dev
    : { androidScheme: 'https' },                        // prod SIN url
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      showSpinner: false
    }
  }
};

export default config;
