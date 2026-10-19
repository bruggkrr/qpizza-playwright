// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['tests/**/*.spec.js', 'solutions/**/*.spec.js'],
  testIgnore: ['**/node_modules/**'],
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4280',
    testIdAttribute: 'data-testid', // page.getByTestId('qty') finds data-testid="qty"
    trace: 'on-first-retry',
    viewport: { width: 1100, height: 800 }
  },
  retries: 0,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Playwright starts the QPizza app for you before the tests run
  webServer: {
    command: 'npx http-server app -p 4280 -c-1 --silent',
    url: 'http://localhost:4280',
    reuseExistingServer: true
  }
});
