// E2E: rozbalené rozšíření v headless Chromiu (Playwright, channel chromium = nový headless).
// Test kopie manifestu dostává navíc host_permissions a tabs, protože v headless nejde
// kliknout na ikonu, a tím udělit activeTab. Produkční manifest tohle NEMÁ.
// Použití: node test/e2e-rozsireni.mjs [url ...]   (bez argumentu jen fixtures)
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PW = process.env.PLAYWRIGHT_PATH || '/Users/filipdopita/Code/ciad-analyza-qa/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(PW).href);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ciad-ext-'));
fs.cpSync(path.join(HERE, '..', 'ext'), path.join(tmp, 'ext'), { recursive: true });
const mf = JSON.parse(fs.readFileSync(path.join(tmp, 'ext', 'manifest.json'), 'utf8'));
mf.host_permissions = ['<all_urls>']; mf.permissions.push('tabs');
fs.writeFileSync(path.join(tmp, 'ext', 'manifest.json'), JSON.stringify(mf));

export async function otevri() {
  const ctx = await chromium.launchPersistentContext(path.join(tmp, 'profil'), {
    channel: 'chromium', headless: true, viewport: { width: 1280, height: 800 }, deviceScaleFactor: Number(process.env.DPR || 1), locale: 'cs-CZ',
    args: [`--disable-extensions-except=${path.join(tmp, 'ext')}`, `--load-extension=${path.join(tmp, 'ext')}`],
  });
  let sw = ctx.serviceWorkers()[0];
  // bez service workeru id zjistíme z chrome://extensions není možné, proto z tabs API níže
  return { ctx, tmp };
}

export async function popupPro(ctx, page, extId) {
  const pop = await ctx.newPage();
  await pop.goto(`chrome-extension://${extId}/popup.html`);
  const tabId = await pop.evaluate(async (u) => (await chrome.tabs.query({ url: u }))[0]?.id, page.url());
  await pop.goto(`chrome-extension://${extId}/popup.html?tabId=${tabId}`);
  await pop.waitForFunction(() => !document.getElementById('stav'), null, { timeout: 8000 });
  return pop;
}

export async function zjistiId() {
  for (let i = 0; i < 30; i++) {
    for (const f of ['Secure Preferences', 'Preferences']) {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(tmp, 'profil', 'Default', f), 'utf8'));
        for (const [id, v] of Object.entries(j.extensions?.settings || {}))
          if (v.path && v.path.startsWith(fs.realpathSync(path.join(tmp, 'ext')))) return id;
      } catch { /* ještě nezapsáno */ }
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('id rozšíření nenalezeno');
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; CIAD-AIActResearch/1.0; +https://ciad.cz; dopita@ciad.cz)';

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const http = await import('node:http');
  const srv = http.createServer((q, r) => {
    const f = path.join(HERE, 'fixtures', path.basename(q.url.split('?')[0]));
    if (fs.existsSync(f)) { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(fs.readFileSync(f)); }
    else { r.writeHead(404); r.end(); }
  }).listen(0, '127.0.0.1');
  await new Promise(r => srv.on('listening', r));
  const port = srv.address().port;
  const { ctx } = await otevri();
  const extId = await zjistiId();
  const vystup = process.env.VYSTUP || path.join(tmp, 'out');
  fs.mkdirSync(vystup, { recursive: true });
  const cile = [
    ...fs.readdirSync(path.join(HERE, 'fixtures')).filter(f => f.endsWith('.html')).map(f => ({ jm: f.replace('.html', ''), url: `http://127.0.0.1:${port}/${f}` })),
    ...process.argv.slice(2).map(u => ({ jm: 'zive-' + new URL(u).hostname, url: u, ziva: true })),
  ];
  const { acceptConsent } = await import('/Users/filipdopita/Code/ciad-cl50-mereni/src/consent.mjs');
  let selhani = 0;
  for (const c of cile) {
    const page = await ctx.newPage();
    if (c.ziva) await page.setExtraHTTPHeaders({ 'user-agent': UA });
    await page.goto(c.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (c.ziva) {
      // Jen v testovací sadě: stejně jako měření klikne na souhlas s cookies, aby se widget vykreslil.
      // Samo rozšíření nic neklikne. Do chatu se nepíše a okno se neotevírá.
      await page.waitForTimeout(1500); await acceptConsent(page); await page.waitForTimeout(6000);
    }
    const pop = await popupPro(ctx, page, extId);
    const text = (await pop.innerText('body')).replace(/\n+/g, ' | ');
    await pop.screenshot({ path: path.join(vystup, c.jm + '-popup.png') });
    await page.screenshot({ path: path.join(vystup, c.jm + '-stranka.png') });
    console.log(`${c.jm}: ${text}`);
    if (/Kontroluji|nelze zkontrolovat/.test(text)) selhani++;
    await pop.close(); await page.close();
  }
  await ctx.close(); srv.close();
  console.log(`výstup: ${vystup} · selhání: ${selhani}`);
  process.exit(selhani ? 1 : 0);
}
