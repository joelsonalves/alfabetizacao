import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './src/e2e',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
})
