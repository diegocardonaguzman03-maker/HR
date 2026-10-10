import { defineConfig } from "@playwright/test";

const PORT = 3199;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: `npm run db:reset && npm run build && npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/login`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      PRAXIA_DB_URL: "file:./data/e2e.db",
      PRAXIA_ADMIN_PASSWORD: "e2e-password",
      PRAXIA_SESSION_SECRET: "e2e-session-secret-at-least-32-characters",
    },
  },
});
