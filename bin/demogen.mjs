#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const cli = join(here, '..', 'dist', 'cli.js');
const tsx = join(here, '..', 'node_modules', '.bin', 'tsx');

const cmd = tsx;
const args = [cli, ...process.argv.slice(2)];
const result = spawnSync(cmd, args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
