import { execSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { EncodeOptions } from './types.js';

export function assertFfmpegAvailable(): void {
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (probe.status !== 0) {
    throw new Error(
      'demogen: ffmpeg not found on PATH.\n' +
      '  Install: https://ffmpeg.org/download.html (macOS: `brew install ffmpeg`)'
    );
  }
}

export function buildGifFilter(opts: EncodeOptions): string {
  const head = `fps=${opts.fps},scale=${opts.gifWidth}:-1:flags=lanczos,split[s0][s1]`;
  const palette = `[s0]palettegen=max_colors=${opts.gifMaxColors}[p]`;
  const use = `[s1][p]paletteuse=dither=${opts.gifDither}`;
  return `${head};${palette};${use}`;
}

export function buildGifCommand(
  input: string,
  output: string,
  encode: EncodeOptions,
  trim: { start: number; end: number }
): string {
  return `ffmpeg -y -ss ${trim.start} -i "${input}" -vf "${buildGifFilter(encode)}" -loop 0 "${output}"`;
}

export function buildMp4Command(
  input: string,
  output: string,
  encode: EncodeOptions,
  trim: { start: number; end: number }
): string {
  return [
    'ffmpeg -y',
    `-ss ${trim.start}`,
    `-i "${input}"`,
    '-c:v libx264',
    '-preset slow',
    `-crf ${encode.mp4Crf}`,
    '-movflags +faststart',
    '-pix_fmt yuv420p',
    `"${output}"`
  ].join(' ');
}

export function encodeGif(input: string, output: string, encode: EncodeOptions, trim: { start: number; end: number }): void {
  mkdirSync(dirname(output), { recursive: true });
  execSync(buildGifCommand(input, output, encode, trim), { stdio: 'inherit' });
}

export function encodeMp4(input: string, output: string, encode: EncodeOptions, trim: { start: number; end: number }): void {
  mkdirSync(dirname(output), { recursive: true });
  execSync(buildMp4Command(input, output, encode, trim), { stdio: 'inherit' });
}

export function pickWebm(dir: string): string {
  if (!existsSync(dir)) throw new Error(`demogen: no recording dir at ${dir}`);
  const files = readdirSync(dir).filter(f => f.endsWith('.webm'));
  if (files.length === 0) throw new Error('demogen: Playwright produced no .webm output');
  return join(dir, files[0]!);
}
