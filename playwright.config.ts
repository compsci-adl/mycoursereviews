import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3200',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run local Next.js dev server before starting the tests */
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3200',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mycoursereviews',
      KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER || 'https://auth.csclub.org.au/realms/csclub',
      KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || 'mycoursereviews',
      KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET || 'secret',
      AUTH_SECRET: process.env.AUTH_SECRET || 'secret-key-for-auth-32chars-minimum',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3200',
    },
  },
});
