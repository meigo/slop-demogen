import { rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { resolveDevServer, startDevServer } from './dev-server.js';
import { runRecording } from './record.js';
import { assertFfmpegAvailable, encodeGif, encodeMp4 } from './ffmpeg.js';
import {
  DEFAULT_ENCODE,
  DEFAULT_OUTPUT,
  DEFAULT_TRIM,
  type DemoConfig
} from './types.js';

export type {
  DemoConfig,
  DevServerConfig,
  ViewportPreset,
  ViewportSpec,
  MockResponse,
  EncodeOptions,
  StepContext
} from './types.js';

export function defineConfig(config: DemoConfig): DemoConfig {
  return config;
}

export async function recordDemo(config: DemoConfig): Promise<{ gif?: string; mp4?: string }> {
  assertFfmpegAvailable();

  const tmpDir = resolve(process.cwd(), '.tmp-demogen');
  const resolved = resolveDevServer(config.dev);
  const server = await startDevServer(resolved);

  const output = { ...DEFAULT_OUTPUT, ...(config.output ?? {}) };
  const encode = { ...DEFAULT_ENCODE, ...(config.encode ?? {}) };
  const trim = { ...DEFAULT_TRIM, ...(config.trim ?? {}) };

  let result: { gif?: string; mp4?: string } = {};
  try {
    const rec = await runRecording(config, server.url, tmpDir);

    if (output.gif) {
      const out = resolve(process.cwd(), output.gif);
      encodeGif(rec.webmPath, out, encode, trim);
      result.gif = out;
    }
    if (output.mp4) {
      const out = resolve(process.cwd(), output.mp4);
      encodeMp4(rec.webmPath, out, encode, trim);
      result.mp4 = out;
    }
  } finally {
    server.kill();
    rmSync(tmpDir, { recursive: true, force: true });
  }

  return result;
}
