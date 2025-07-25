import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run start',
    port: 3000
  },
  use: {
    baseURL: 'http://localhost:3000'
  }
});
