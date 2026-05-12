import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { recordDemo } from './index.js';
import type { DemoConfig } from './types.js';

async function loadConfig(path: string): Promise<DemoConfig> {
  const abs = resolve(process.cwd(), path);
  if (!existsSync(abs)) throw new Error(`demogen: config not found at ${abs}`);
  const mod = await import(pathToFileURL(abs).href);
  const config: DemoConfig | undefined = mod.default ?? mod.config;
  if (!config) throw new Error(`demogen: ${path} must export a default DemoConfig (use defineConfig)`);
  return config;
}

function parseArgs(argv: string[]): { config: string; debug: boolean } {
  let config = 'demo.config.ts';
  let debug = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--config' || arg === '-c') {
      config = argv[++i] ?? config;
    } else if (arg === '--debug') {
      debug = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: demogen [--config <path>] [--debug]\n\nDefault config path: ./demo.config.ts`);
      process.exit(0);
    }
  }
  return { config, debug };
}

async function main() {
  const { config: configPath, debug } = parseArgs(process.argv.slice(2));
  if (debug) process.env.DEMOGEN_DEBUG = '1';

  const config = await loadConfig(configPath);
  const result = await recordDemo(config);
  if (result.gif) console.log(`✓ Wrote ${result.gif}`);
  if (result.mp4) console.log(`✓ Wrote ${result.mp4}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
