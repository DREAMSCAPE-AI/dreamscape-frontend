import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      apiUrl: 'http://localhost:3001/api',
      coverage: true,
      // Mobile viewport presets
      viewports: {
        'iphone-se': { width: 375, height: 667 },
        'iphone-12': { width: 390, height: 844 },
        'iphone-14-pro-max': { width: 430, height: 932 },
        'galaxy-s21': { width: 360, height: 800 },
        'galaxy-s21-ultra': { width: 412, height: 915 },
        'ipad-mini': { width: 768, height: 1024 },
        'ipad-pro': { width: 1024, height: 1366 },
        'foldable': { width: 884, height: 1104 }
      }
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720
  },
});