import { describe, it, expect } from 'vitest';
import { resolveDevServer } from '../../src/dev-server.js';

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
