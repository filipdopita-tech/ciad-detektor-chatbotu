// DOM část nad lokálními fixtures. Playwright z ciad-analyza-qa (není v repu),
// cesta jde přebít proměnnou PLAYWRIGHT_PATH. Headless, žádné okno na obrazovce.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PW = process.env.PLAYWRIGHT_PATH || '/Users/filipdopita/Code/ciad-analyza-qa/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(PW).href);
const SRC = fs.readFileSync(path.join(HERE, '..', 'ext', 'detekce.js'), 'utf8');

const browser = await chromium.launch({ headless: true });
async function spust(fixture) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.route('https://engage.wixapps.net/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' }));
  await page.goto(pathToFileURL(path.join(HERE, 'fixtures', fixture + '.html')).href);
  const r = await page.evaluate(SRC);
  await ctx.close();
  return r;
}
test.after(() => browser.close());

test('bez chatu (text o AI na stránce a cookie lišta nevadí)', async () => {
  const r = await spust('bez-chatu');
  assert.equal(r.jeOkno, false); assert.equal(r.stroj.stav, 'nenalezen'); assert.equal(r.dodavatel, null);
});
test('Smartsupp bez oznámení = okno, stroj nelze určit', async () => {
  const r = await spust('smartsupp-bez-oznameni');
  assert.equal(r.jeOkno, true); assert.equal(r.dodavatel.nazev, 'Smartsupp'); assert.equal(r.dodavatel.hybrid, true);
  assert.equal(r.stroj.stav, 'nelze'); assert.equal(r.okno_otevreno, false);
});
test('virtuální asistent v textu = stroj nalezen s citací', async () => {
  const r = await spust('sefbot-virtualni-asistent');
  assert.equal(r.jeOkno, true); assert.equal(r.stroj.stav, 'nalezen'); assert.match(r.stroj.citace, /virtuální asistent|chatbot/i);
});
test('jen skript bez vykreslení = okno nenalezeno (Prusa případ)', async () => {
  const r = await spust('jen-skript');
  assert.equal(r.jeOkno, false); assert.equal(r.jenSkript, true); assert.equal(r.dodavatel.nazev, 'LiveChat');
});
test('vlastní okno bez textu = okno, stroj nelze určit', async () => {
  const r = await spust('vlastni-bez-textu');
  assert.equal(r.jeOkno, true); assert.equal(r.dodavatel, null); assert.equal(r.stroj.stav, 'nelze');
});
test('shadow DOM', async () => {
  const r = await spust('shadow-dom');
  assert.equal(r.jeOkno, true); assert.equal(r.stroj.stav, 'nalezen');
});
test('rám Wix Chat v rohu', async () => {
  const r = await spust('wix-ramec');
  assert.equal(r.jeOkno, true); assert.equal(r.dodavatel.nazev, 'Wix Chat'); assert.equal(r.stroj.stav, 'nelze');
});
test('globály drift* a crisp* bez chatu nedají nález', async () => {
  const r = await spust('drift-falesny');
  assert.equal(r.jeOkno, false);
});
