import { describe, it, expect } from 'vitest';
import { resolveViewport } from '../../src/viewports.js';

describe('resolveViewport', () => {
  it('resolves iphone-13 preset to 390x720', () => {
    const v = resolveViewport('iphone-13');
    expect(v.width).toBe(390);
    expect(v.height).toBe(720);
    expect(v.isMobile).toBe(true);
  });

  it('resolves desktop preset to 1280x800', () => {
    const v = resolveViewport('desktop');
    expect(v).toMatchObject({ width: 1280, height: 800, isMobile: false });
  });

  it('passes through a custom ViewportSpec', () => {
    const v = resolveViewport({ width: 500, height: 500, isMobile: false });
    expect(v).toMatchObject({ width: 500, height: 500, isMobile: false });
  });

  it('throws on unknown preset', () => {
    // @ts-expect-error testing runtime guard
    expect(() => resolveViewport('not-a-preset')).toThrow(/unknown viewport/i);
  });
});
