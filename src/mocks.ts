import { minimatch } from 'minimatch';
import type { Page, Route } from 'playwright';
import type { MockResponse } from './types.js';

export interface NormalisedMock {
  pattern: string;
  response: MockResponse;
}

export function normaliseMocks(mocks: Record<string, MockResponse> | undefined): NormalisedMock[] {
  if (!mocks) return [];
  return Object.entries(mocks).map(([pattern, response]) => ({ pattern, response }));
}

export function matchMock(mocks: NormalisedMock[], url: string): MockResponse | undefined {
  const path = new URL(url).pathname;
  for (const { pattern, response } of mocks) {
    if (matches(pattern, path)) return response;
  }
  return undefined;
}

function matches(pattern: string, path: string): boolean {
  if (pattern.startsWith('/')) {
    return minimatch(path, pattern);
  }
  return minimatch(path, '**/' + pattern.replace(/^\*\*\//, ''));
}

export async function installMocks(page: Page, mocks: NormalisedMock[]): Promise<void> {
  if (mocks.length === 0) return;
  await page.route('**/*', async (route: Route) => {
    const match = matchMock(mocks, route.request().url());
    if (!match) return route.fallback();
    if (match.delay) await new Promise(r => setTimeout(r, match.delay));
    const body = typeof match.body === 'string' ? match.body : JSON.stringify(match.body);
    const contentType =
      match.contentType ??
      (typeof match.body === 'string' ? 'text/plain' : 'application/json');
    await route.fulfill({
      status: match.status ?? 200,
      contentType,
      body
    });
  });
}
