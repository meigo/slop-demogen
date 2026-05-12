import { describe, it, expect, afterEach } from 'vitest';
import { recordDemo } from '../../src/index.js';
import { statSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const counterDir = join(here, '..', '..', 'examples', 'counter');
const gifOut = join(here, '..', '..', '.tmp-integration', 'demo.gif');
const mp4Out = join(here, '..', '..', '.tmp-integration', 'demo.mp4');

afterEach(() => {
  rmSync(join(here, '..', '..', '.tmp-integration'), { recursive: true, force: true });
});

describe('recordDemo (integration: counter example)', () => {
  it('records a demo and writes a non-empty GIF + MP4', async () => {
    const result = await recordDemo({
      dev: {
        command: `node ${join(counterDir, 'server.mjs')} 5180`,
        port: 5180,
        readyLog: 'Local:'
      },
      viewport: 'desktop',
      output: { gif: gifOut, mp4: mp4Out },
      trim: { start: 1, end: 0 },
      steps: async page => {
        await new Promise(r => setTimeout(r, 1500));
        await page.click('[data-testid="inc"]');
        await page.waitForFunction(() => document.querySelector('[data-testid="value"]')?.textContent === '1');
        await new Promise(r => setTimeout(r, 500));
        await page.click('[data-testid="inc"]');
        await new Promise(r => setTimeout(r, 500));
        await page.click('[data-testid="inc"]');
        await page.waitForFunction(() => document.querySelector('[data-testid="value"]')?.textContent === '3');
        await new Promise(r => setTimeout(r, 500));
        await page.click('[data-testid="reset"]');
        await new Promise(r => setTimeout(r, 1000));
      }
    });

    expect(existsSync(gifOut)).toBe(true);
    expect(existsSync(mp4Out)).toBe(true);
    expect(statSync(gifOut).size).toBeGreaterThan(1000);
    expect(statSync(mp4Out).size).toBeGreaterThan(1000);
    expect(result.gif).toBe(gifOut);
    expect(result.mp4).toBe(mp4Out);
  }, 120_000);
});
