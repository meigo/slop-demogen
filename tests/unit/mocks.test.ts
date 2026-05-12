import { describe, it, expect } from 'vitest';
import { matchMock, normaliseMocks } from '../../src/mocks.js';
import type { MockResponse } from '../../src/types.js';

describe('normaliseMocks', () => {
  it('returns empty array when mocks is undefined', () => {
    expect(normaliseMocks(undefined)).toEqual([]);
  });

  it('produces one entry per key', () => {
    const m: Record<string, MockResponse> = {
      '/api/foo': { body: { ok: true } },
      '/api/bar': { status: 201, body: 'created' }
    };
    expect(normaliseMocks(m)).toHaveLength(2);
  });
});

describe('matchMock', () => {
  const mocks = normaliseMocks({
    '/api/diagnose': { body: { id: 'demo' } },
    '/api/users/*': { body: [] },
    '**/heavy.json': { body: '{}', contentType: 'application/json' }
  });

  it('matches a leading-slash path against any host', () => {
    expect(matchMock(mocks, 'http://localhost:5173/api/diagnose')?.body).toEqual({ id: 'demo' });
    expect(matchMock(mocks, 'http://example.com/api/diagnose')?.body).toEqual({ id: 'demo' });
  });

  it('matches a single-segment wildcard', () => {
    expect(matchMock(mocks, 'http://localhost/api/users/42')?.body).toEqual([]);
    expect(matchMock(mocks, 'http://localhost/api/users/42/posts')).toBeUndefined();
  });

  it('matches a multi-segment wildcard', () => {
    expect(matchMock(mocks, 'http://x.com/static/heavy.json')?.body).toBe('{}');
    expect(matchMock(mocks, 'http://x.com/a/b/c/heavy.json')?.body).toBe('{}');
  });

  it('returns undefined for unmatched URLs', () => {
    expect(matchMock(mocks, 'http://localhost/other')).toBeUndefined();
  });
});
