import { describe, it, expect } from 'vitest';
import { buildGifFilter, buildGifCommand, buildMp4Command } from '../../src/ffmpeg.js';
import { DEFAULT_ENCODE, DEFAULT_TRIM } from '../../src/types.js';

describe('buildGifFilter', () => {
  it('builds the default palettegen/paletteuse chain', () => {
    const f = buildGifFilter(DEFAULT_ENCODE);
    expect(f).toContain('fps=10');
    expect(f).toContain('scale=320:-1:flags=lanczos');
    expect(f).toContain('palettegen=max_colors=96');
    expect(f).toContain('paletteuse=dither=bayer');
  });

  it('respects custom values', () => {
    const f = buildGifFilter({ ...DEFAULT_ENCODE, fps: 15, gifWidth: 480, gifDither: 'none' });
    expect(f).toContain('fps=15');
    expect(f).toContain('scale=480:-1');
    expect(f).toContain('paletteuse=dither=none');
  });
});

describe('buildGifCommand', () => {
  it('includes -ss for trim.start and -loop 0 for infinite loop', () => {
    const cmd = buildGifCommand('/tmp/in.webm', '/out/demo.gif', DEFAULT_ENCODE, DEFAULT_TRIM);
    expect(cmd).toMatch(/-ss 3\b/);
    expect(cmd).toMatch(/-loop 0/);
    expect(cmd).toContain('/tmp/in.webm');
    expect(cmd).toContain('/out/demo.gif');
  });
});

describe('buildMp4Command', () => {
  it('uses libx264 with the documented flags', () => {
    const cmd = buildMp4Command('/tmp/in.webm', '/out/demo.mp4', DEFAULT_ENCODE, DEFAULT_TRIM);
    expect(cmd).toContain('-c:v libx264');
    expect(cmd).toContain('-crf 28');
    expect(cmd).toContain('-movflags +faststart');
    expect(cmd).toContain('-pix_fmt yuv420p');
    expect(cmd).toMatch(/-ss 3\b/);
  });
});
