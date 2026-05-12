import type { Page, BrowserContext } from 'playwright';

export type ViewportPreset = 'iphone-13' | 'iphone-15-pro' | 'pixel-7' | 'desktop' | 'square-1080';

export interface ViewportSpec {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  userAgent?: string;
}

export type DevServerConfig =
  | { framework: 'vite' | 'next' | 'sveltekit' | 'astro'; port: number; env?: Record<string, string>; cwd?: string }
  | { command: string; port: number; readyLog: string | RegExp; env?: Record<string, string>; cwd?: string }
  | { url: string };

export interface MockResponse {
  status?: number;
  body: unknown;
  contentType?: string;
  delay?: number;
}

export interface EncodeOptions {
  fps: number;
  gifWidth: number;
  gifMaxColors: number;
  gifDither: 'bayer' | 'floyd_steinberg' | 'none';
  mp4Crf: number;
}

export interface StepContext {
  fixture(dirRelativeToCwd: string): string;
  base: string;
  context: BrowserContext;
}

export interface DemoConfig {
  dev: DevServerConfig;
  url?: string;
  viewport: ViewportPreset | ViewportSpec;
  output?: {
    gif?: string | false;
    mp4?: string | false;
  };
  trim?: { start?: number; end?: number };
  mocks?: Record<string, MockResponse>;
  steps: (page: Page, ctx: StepContext) => Promise<void>;
  encode?: Partial<EncodeOptions>;
}

export const DEFAULT_ENCODE: EncodeOptions = {
  fps: 10,
  gifWidth: 320,
  gifMaxColors: 96,
  gifDither: 'bayer',
  mp4Crf: 28
};

export const DEFAULT_OUTPUT = { gif: 'demo.gif', mp4: 'demo.mp4' } as const;

export const DEFAULT_TRIM = { start: 3, end: 0 } as const;
