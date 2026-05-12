# demogen

Record repo-committed demo GIFs / MP4s of web apps. Playwright + ffmpeg, no SaaS, no LLM, no API keys.

![demo](./demo.gif)

## Install

```bash
npm install -D demogen playwright
npx playwright install chromium
```

`ffmpeg` must be on PATH (`brew install ffmpeg` on macOS).

## Use

Create `demo.config.ts` at your repo root:

```ts
import { defineConfig } from 'demogen';

export default defineConfig({
  dev: { framework: 'vite', port: 5173 },
  viewport: 'iphone-13',
  mocks: {
    '/api/diagnose': { delay: 1500, body: { id: 'demo' } }
  },
  steps: async (page, ctx) => {
    await page.locator('input[type="file"]').setInputFiles(ctx.fixture('tests/fixtures/photos'));
    await page.waitForSelector('img[alt="Selected"]');
  }
});
```

Then:

```bash
npx demogen
```

Writes `demo.gif` and `demo.mp4` at your repo root.

## Supported frameworks

`vite`, `next`, `sveltekit`, `astro` — or pass `{ command, port, readyLog }` for anything else.

## API

See `src/types.ts` for the full `DemoConfig` shape. Highlights:

- `viewport`: preset (`iphone-13`, `iphone-15-pro`, `pixel-7`, `desktop`, `square-1080`) or `{ width, height, ... }`.
- `mocks`: `{ '/api/foo': { body, status?, delay?, contentType? } }` — globs supported.
- `trim`: `{ start, end }` — seconds to chop from each end (default `start: 3` to skip cold-start).
- `encode`: override `fps`, `gifWidth`, `gifMaxColors`, `gifDither`, `mp4Crf`.

## License

MIT
