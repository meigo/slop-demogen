import { describe, it, expect } from 'vitest';
import { startDevServer, resolveDevServer } from '../../src/dev-server.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

describe('resolveDevServer', () => {
  it('resolves vite framework preset', () => {
    const r = resolveDevServer({ framework: 'vite', port: 5183 });
    expect(r.kind).toBe('spawn');
    if (r.kind !== 'spawn') return;
    expect(r.command).toBe('npx vite dev --port 5183');
    expect(r.readyLog).toBe('Local:');
    expect(r.url).toBe('http://localhost:5183');
  });

  it('resolves next framework preset', () => {
    const r = resolveDevServer({ framework: 'next', port: 3000 });
    expect(r.kind).toBe('spawn');
    if (r.kind !== 'spawn') return;
    expect(r.command).toBe('npx next dev --port 3000');
    expect(r.readyLog).toEqual(/ready in/i);
  });

  it('passes through custom command + readyLog', () => {
    const r = resolveDevServer({
      command: 'pnpm dev --port 4000',
      port: 4000,
      readyLog: 'listening'
    });
    expect(r.kind).toBe('spawn');
    if (r.kind !== 'spawn') return;
    expect(r.command).toBe('pnpm dev --port 4000');
    expect(r.readyLog).toBe('listening');
  });

  it('passes through url-only mode', () => {
    const r = resolveDevServer({ url: 'http://localhost:8080' });
    expect(r.kind).toBe('url-only');
    if (r.kind !== 'url-only') return;
    expect(r.url).toBe('http://localhost:8080');
  });
});

describe('startDevServer (integration)', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const fixture = join(here, '..', 'fixtures', 'ready-server.mjs');

  it('starts a process and resolves when readyLog appears', async () => {
    const resolved = resolveDevServer({
      command: `node ${fixture} 4321`,
      port: 4321,
      readyLog: 'Local:'
    });
    const handle = await startDevServer(resolved, 5_000);
    expect(handle.url).toBe('http://localhost:4321');
    const res = await fetch(handle.url);
    expect(await res.text()).toBe('ok');
    handle.kill();
  });

  it('rejects if readyLog never appears within timeout', async () => {
    const resolved = resolveDevServer({
      command: `node ${fixture} 9999`,
      port: 9999,
      readyLog: 'nope-never-prints'
    });
    await expect(startDevServer(resolved, 1_000)).rejects.toThrow(/not become ready/i);
  });
});
