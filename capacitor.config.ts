import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chief360.copilot',
  appName: 'Chief360 Copilot',
  webDir: 'out',
  server: {
    url: 'https://chief360-web-production.up.railway.app',
    cleartext: true
  }
};

export default config;
