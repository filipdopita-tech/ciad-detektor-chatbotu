// Skládá screenshoty 1280x800 a dlaždici 440x280 pro Chrome Web Store.
// Vstup: PNG z test/e2e-rozsireni.mjs (VYSTUP=<adresář> DPR=2). Použití: node scripts/store-grafika.mjs <vstup> <výstup>
import { chromium } from '/Users/filipdopita/Code/ciad-analyza-qa/node_modules/playwright/index.mjs';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [VSTUP, VYSTUP = resolve(ROOT, 'store')] = process.argv.slice(2);
mkdirSync(VYSTUP, { recursive: true });
const uri = (p, mime = 'image/png') => `data:${mime};base64,${readFileSync(p).toString('base64')}`;
const font = (w) => uri(resolve(ROOT, `ext/fonts/Aspekta-${w}.woff2`), 'font/woff2');

const SNIMKY = [
  ['sefbot-virtualni-asistent', '01-chat-a-signal-stroj'],
  ['smartsupp-bez-oznameni', '02-chat-nelze-urcit'],
  ['bez-chatu', '03-bez-chatu'],
];

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();

async function ohranic(src) {
  await p.setContent(`<img id=i src="${src}">`);
  return p.evaluate(async () => {
    const i = document.getElementById('i'); await i.decode();
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(i, 0, 0);
    const bg = g.getImageData(c.width - 5, c.height - 5, 1, 1).data;
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let maxY = 0, maxX = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      const k = (y * c.width + x) * 4;
      if (Math.abs(d[k] - bg[0]) + Math.abs(d[k + 1] - bg[1]) + Math.abs(d[k + 2] - bg[2]) > 6) { if (y > maxY) maxY = y; if (x > maxX) maxX = x; }
    }
    return { w: c.width, h: c.height, maxY, maxX };
  });
}

for (const [fx, out] of SNIMKY) {
  const stranka = uri(resolve(VSTUP, `${fx}-stranka.png`));
  const popupP = resolve(VSTUP, `${fx}-popup.png`);
  const popup = uri(popupP);
  const bb = await ohranic(popup);
  const k = bb.w / 1280;                       // poměr pixelů ke CSS px (DPR)
  const Z = 1.25, sirka = 380 * Z, vyska = Math.ceil((bb.maxY + 24 * k) / k * Z);
  await p.setContent(`<!doctype html><meta charset=utf-8><style>
    body{margin:0;width:1280px;height:800px;position:relative;overflow:hidden;background:#FAF9F7}
    .st{position:absolute;inset:0;width:1280px;height:800px}
    .pp{position:absolute;top:28px;right:48px;width:${sirka}px;height:${vyska}px;overflow:hidden;border-radius:12px;
        border:1px solid rgba(11,25,66,.14);box-shadow:0 12px 40px rgba(10,10,12,.18);background:#F2F0EE}
    .pp img{display:block;width:${1280 * Z}px;height:${800 * Z}px}
  </style><img class=st src="${stranka}"><div class=pp><img src="${popup}"></div>`);
  await p.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
  await p.screenshot({ path: resolve(VYSTUP, `screenshot-${out}.png`) });
  console.log(out, 'popup výška', vyska);
}

// Dlaždice 440x280: znak + název, bez gradientů, červená se nepoužívá.
const znak = readFileSync(resolve(ROOT, 'ext/icons/znak.svg'), 'utf8');
const t = await ctx.newPage();
await t.setViewportSize({ width: 440, height: 280 });
await t.setContent(`<!doctype html><meta charset=utf-8><style>
  @font-face{font-family:Aspekta;font-weight:400;src:url(${font(400)})}
  @font-face{font-family:Aspekta;font-weight:500;src:url(${font(500)})}
  body{margin:0;width:440px;height:280px;background:#F2F0EE;font-family:Aspekta,system-ui,sans-serif;color:#0A0A0C;
       display:flex;flex-direction:column;justify-content:center;padding:0 36px;box-sizing:border-box;border-left:6px solid #1E3A8A}
  .z{width:56px;height:56px;margin-bottom:22px}.z svg{width:100%;height:100%;display:block}
  h1{font-weight:500;font-size:34px;line-height:1.1;margin:0 0 12px;letter-spacing:-.01em}
  p{font-weight:400;font-size:16px;line-height:1.4;margin:0;color:#454B5E}
  .c{position:absolute;left:42px;bottom:22px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6E6961}
</style><div class=z>${znak}</div><h1>Detektor chatbotů</h1><p>Chat na stránce a signál, že odpovídá stroj.</p><div class=c>CIAD</div>`);
await t.evaluate(() => document.fonts.ready);
await t.screenshot({ path: resolve(VYSTUP, 'promo-dlazdice-440x280.png') });
await b.close();
