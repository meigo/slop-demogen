import { devices } from 'playwright';
import type { ViewportPreset, ViewportSpec } from './types.js';

const PRESETS: Record<ViewportPreset, ViewportSpec> = {
  'iphone-13': {
    width: 390,
    height: 720,
    deviceScaleFactor: 3,
    isMobile: true,
    userAgent: devices['iPhone 13'].userAgent
  },
  'iphone-15-pro': {
    width: 393,
    height: 720,
    deviceScaleFactor: 3,
    isMobile: true,
    userAgent: devices['iPhone 15 Pro']?.userAgent ?? devices['iPhone 13'].userAgent
  },
  'pixel-7': {
    width: 412,
    height: 720,
    deviceScaleFactor: 2.625,
    isMobile: true,
    userAgent: devices['Pixel 7']?.userAgent ?? devices['Pixel 5'].userAgent
  },
  'desktop': {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    isMobile: false
  },
  'square-1080': {
    width: 1080,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false
  }
};

export function resolveViewport(input: ViewportPreset | ViewportSpec): ViewportSpec {
  if (typeof input === 'string') {
    const preset = PRESETS[input];
    if (!preset) throw new Error(`Unknown viewport preset: "${input}"`);
    return preset;
  }
  return input;
}

export const VIEWPORT_PRESETS = PRESETS;
