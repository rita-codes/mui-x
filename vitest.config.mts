import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(CURRENT_DIR, './');

declare global {
  interface MUIEnv {
    JSDOM?: string;
    BROWSER?: string;
    PLAYWRIGHT_SERVER_WS?: string;
    CI?: string;
    // Enable performance tracing in charts performance tests
    TRACE?: string;
  }
}

// Checking the environment variables simplifies the scripts in the package.json
// We use `cross-env BROWSER=true vitest` instead of `vitest --project "browser/*"`
// Which allows us to run `pnpm test:browser --project "x-charts"` for example.
const getProjects = () => {
  const getFill = () => {
    const isBrowser = process.env.BROWSER === 'true';
    // We delete the env to prevent it from being used in the tests
    delete process.env.BROWSER;
    if (isBrowser) {
      return 'browser';
    }
    return 'jsdom';
  };

  const fill = getFill();

  return [
    `packages/*/vitest.config.${fill}.mts`,
    ...(fill === 'jsdom'
      ? [
          `docs/vitest.config.${fill}.mts`,
          // We also run node tests when running in jsdom mode
          `packages/*/vitest.config.node.mts`,
        ]
      : []),
  ];
};

export default defineConfig({
  test: {
    projects: getProjects(),
    coverage: {
      provider: 'v8',
      reporter: process.env.CI ? ['lcovonly'] : ['text'],
      reportsDirectory: resolve(WORKSPACE_ROOT, 'coverage'),
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: ['**/*.{test,spec}.{js,ts,tsx}'],
    },
  },
});
