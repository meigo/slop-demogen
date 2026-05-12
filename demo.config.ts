import { defineConfig } from './dist/index.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const counterServer = join(here, 'examples', 'counter', 'server.mjs');

export default defineConfig({
  dev: {
    command: `node ${counterServer} 5181`,
    port: 5181,
    readyLog: 'Local:'
  },
  viewport: 'desktop',
  trim: { start: 1, end: 0 },
  steps: async page => {
    await page.waitForSelector('[data-testid="value"]');
    await new Promise(r => setTimeout(r, 500));
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="inc"]');
      await new Promise(r => setTimeout(r, 300));
    }
    await new Promise(r => setTimeout(r, 800));
    await page.click('[data-testid="reset"]');
    await new Promise(r => setTimeout(r, 600));
  }
});
