import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  reporter: 'list',
  use: {
    // Allow BASE_URL override so CI / local runs can point at a local server;
    // defaults to the production Vercel deployment.
    baseURL: process.env.BASE_URL ?? 'https://globe-iq.vercel.app',
  },
  projects: [
    {
      name: 'iPhone 16 Pro Max',
      use: {
        viewport: { width: 430, height: 932 },
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
          'Version/18.0 Mobile/15E148 Safari/604.1',
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
  ],
});
