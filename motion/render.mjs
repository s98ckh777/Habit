// Renders index.html → MP4 frame by frame.
// Usage: node render.mjs [--fps 30] [--out habit-365.mp4] [--stills 1,5.5,12]
// Needs Playwright (Chromium) and ffmpeg.
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const FPS = +arg('fps', 30), DUR = 40, OUT = path.resolve(dir, arg('out', 'habit-365.mp4'));
const stills = arg('stills');
const url = pathToFileURL(path.join(dir, 'index.html')).href + '?render';
const tmp = arg('tmp', path.join(os.tmpdir(), 'habit-frames'));

const browser = await chromium.launch();
async function page() {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await p.goto(url); await p.evaluate(() => window.__ready);
  return p;
}

if (stills) {
  const p = await page(); mkdirSync(path.join(dir, 'stills'), { recursive: true });
  for (const s of stills.split(',')) {
    await p.evaluate(t => window.__seek(t), +s);
    await p.screenshot({ path: path.join(dir, 'stills', `t${(+s).toFixed(2).padStart(5, '0')}.jpg`), quality: 85, type: 'jpeg' });
  }
  await browser.close(); process.exit(0);
}

rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const N = Math.round(DUR * FPS), W = Math.max(1, Math.min(6, os.cpus().length));
let next = 0, done = 0; const t0 = Date.now();
await Promise.all(Array.from({ length: W }, async () => {
  const p = await page();
  while (next < N) {
    const f = next++;
    await p.evaluate(t => window.__seek(t), f / FPS);
    await p.screenshot({ path: path.join(tmp, `f${String(f).padStart(5, '0')}.png`), type: 'png' });
    if (++done % 60 === 0) console.log(`${done}/${N} frames (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
}));
await browser.close();
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%05d.png'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
rmSync(tmp, { recursive: true, force: true });
console.log('done →', OUT, existsSync(OUT) ? '' : '(missing!)');
