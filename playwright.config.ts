import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'https://globe-iq.vercel.app',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'iPhone 16 Pro Max',
      use: {
        ...devices['iPhone 15 Pro Max'],
        viewport: { width: 430, height: 932 },
      },
    },
  ],
});
