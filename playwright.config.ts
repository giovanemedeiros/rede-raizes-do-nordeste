import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:3333',
    trace: 'retain-on-failure',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'api-integration',
      testMatch: /tests\/api\/.*\.spec\.ts/,
    },
    {
      name: 'totem-touch',
      testMatch: /tests\/e2e\/totem.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1080, height: 1920 }, // Resolução padrão de totem vertical touch
      },
    },
    {
      name: 'mobile-app',
      testMatch: /tests\/e2e\/app.*\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
  webServer: {
    command: 'npm run start:mock',
    url: 'http://127.0.0.1:3333/health',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});

