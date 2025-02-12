import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    experimentalStudio: false,
    chromeWebSecurity: false,
    
    env: {
      API_URL: 'http://localhost:3001',
      COVERAGE: false,
      MOCK_API: true,
      RECORD_VIDEO: false,
      RETRIES: 2
    },
    
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    video: false,
    screenshotOnRunFailure: true,
    testIsolation: true,
    
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      configFile: 'reporter-config.json'
    },
    
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
});