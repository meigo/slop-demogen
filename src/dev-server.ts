import { spawn, type ChildProcess } from 'node:child_process';
import type { DevServerConfig } from './types.js';

export type ResolvedDevServer =
  | {
      kind: 'spawn';
      command: string;
      readyLog: string | RegExp;
      env: Record<string, string>;
      cwd: string;
      url: string;
    }
  | { kind: 'url-only'; url: string };

const FRAMEWORK_PRESETS = {
  vite: { command: 'npx vite dev --port {port}', readyLog: 'Local:' as string | RegExp },
  sveltekit: { command: 'npx vite dev --port {port}', readyLog: 'Local:' as string | RegExp },
  next: { command: 'npx next dev --port {port}', readyLog: /ready in/i as string | RegExp },
  astro: { command: 'npx astro dev --port {port}', readyLog: 'Local' as string | RegExp }
} as const;

export function resolveDevServer(config: DevServerConfig): ResolvedDevServer {
  if ('url' in config) {
    return { kind: 'url-only', url: config.url };
  }
  let command: string;
  let readyLog: string | RegExp;
  let port: number;
  if ('framework' in config) {
    const preset = FRAMEWORK_PRESETS[config.framework];
    command = preset.command.replace('{port}', String(config.port));
    readyLog = preset.readyLog;
    port = config.port;
  } else {
    command = config.command;
    readyLog = config.readyLog;
    port = config.port;
  }
  return {
    kind: 'spawn',
    command,
    readyLog,
    env: { ...process.env, ...(config.env ?? {}) } as Record<string, string>,
    cwd: config.cwd ?? process.cwd(),
    url: `http://localhost:${port}`
  };
}

export interface DevServerHandle {
  url: string;
  kill: () => void;
}

export async function startDevServer(resolved: ResolvedDevServer, timeoutMs = 30_000): Promise<DevServerHandle> {
  if (resolved.kind === 'url-only') {
    return { url: resolved.url, kill: () => {} };
  }
  const [cmd, ...args] = resolved.command.split(' ');
  const proc: ChildProcess = spawn(cmd!, args, {
    cwd: resolved.cwd,
    env: resolved.env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  await new Promise<void>((resolveReady, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Dev server did not become ready within ${timeoutMs}ms`)),
      timeoutMs
    );
    const matcher = resolved.readyLog;
    const isMatch = (line: string) =>
      typeof matcher === 'string' ? line.includes(matcher) : matcher.test(line);
    proc.stdout!.on('data', chunk => {
      if (isMatch(chunk.toString())) {
        clearTimeout(timer);
        resolveReady();
      }
    });
    proc.on('exit', code => {
      clearTimeout(timer);
      reject(new Error(`Dev server exited early with code ${code}`));
    });
  });

  try {
    await fetch(resolved.url);
  } catch {
    /* ignore — recording will surface real failures */
  }

  return {
    url: resolved.url,
    kill: () => proc.kill('SIGTERM')
  };
}
