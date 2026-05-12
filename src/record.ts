import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { installMocks, normaliseMocks } from './mocks.js';
import { resolveViewport } from './viewports.js';
import type { DemoConfig, StepContext, ViewportSpec } from './types.js';

export interface RecordResult {
  webmPath: string;
  tmpDir: string;
}

export async function runRecording(config: DemoConfig, baseUrl: string, tmpDir: string): Promise<RecordResult> {
  if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });

  const viewport: ViewportSpec = resolveViewport(config.viewport);
  const browser: Browser = await chromium.launch();
  const context: BrowserContext = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    isMobile: viewport.isMobile,
    userAgent: viewport.userAgent,
    recordVideo: { dir: tmpDir, size: { width: viewport.width, height: viewport.height } }
  });
  const page: Page = await context.newPage();

  await installMocks(page, normaliseMocks(config.mocks));
  await page.goto(config.url ?? baseUrl);

  const stepCtx: StepContext = {
    fixture: (dirRel: string) => {
      const dir = join(process.cwd(), dirRel);
      const files = readdirSync(dir).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f));
      if (!files.length) throw new Error(`demogen: no fixture image in ${dir}`);
      return join(dir, files[0]!);
    },
    base: baseUrl,
    context
  };

  try {
    await config.steps(page, stepCtx);
  } finally {
    await context.close();
    await browser.close();
  }

  const all = await readdir(tmpDir);
  const webm = all.find(f => f.endsWith('.webm'));
  if (!webm) throw new Error('demogen: Playwright produced no .webm');
  return { webmPath: join(tmpDir, webm), tmpDir };
}
