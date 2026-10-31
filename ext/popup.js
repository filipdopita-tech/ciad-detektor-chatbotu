(function () {
  'use strict';
  const t = (k, s) => chrome.i18n.getMessage(k, s) || k;

  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  document.documentElement.lang = chrome.i18n.getUILanguage().startsWith('cs') ? 'cs' : 'en';
  document.title = t('extName');

  const kořen = document.getElementById('vysledek');

  function p(trida, text) {
    const e = document.createElement('p');
    if (trida) e.className = trida;
    e.textContent = text;
    return e;
  }

  function radek(ano, nazev, hodnota, poznamky, citace) {
    const d = document.createElement('section');
    d.className = 'radek ' + (ano ? 'ano' : 'ne');
    d.append(p('nazev', nazev), p('hodnota', hodnota));
    for (const n of poznamky) d.append(p('poznamka', n));
    if (citace) { const q = document.createElement('q'); q.textContent = t('quote', [citace]); d.append(q); }
    return d;
  }

  function vykresli(r) {
    kořen.replaceChildren();
    const poznChat = [];
    if (r.jeOkno) {
      poznChat.push(r.dodavatel ? t('vendor', [r.dodavatel.nazev]) : t('vendorUnknown'));
      if (r.dodavatel && r.dodavatel.hybrid) poznChat.push(t('vendorHybrid'));
    } else if (r.jenSkript) {
      poznChat.push(t('chatScriptOnly'));
    }
    kořen.append(radek(r.jeOkno, t('rowChat'), r.jeOkno ? t('chatFound') : t('chatNotFound'), poznChat));

    const s = r.stroj.stav;
    const hodnota = s === 'nalezen' ? t('machineFound') : s === 'nenalezen' ? t('machineNotFound') : t('machineUnknown');
    const pozn = r.jeOkno ? [t('notOpened')] : [];
    kořen.append(radek(s === 'nalezen', t('rowMachine'), hodnota, pozn, s === 'nalezen' ? r.stroj.citace : ''));
  }

  function nelze() {
    kořen.replaceChildren();
    const d = document.createElement('section');
    d.className = 'radek ne';
    d.append(p('hodnota', t('unsupportedTitle')), p('poznamka', t('unsupportedText')));
    kořen.append(d);
  }

  async function najdiKartu() {
    const id = Number(new URLSearchParams(location.search).get('tabId'));
    if (Number.isInteger(id) && id > 0) return id;
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab && tab.id;
  }

  async function main() {
    try {
      const tabId = await najdiKartu();
      const [vys] = await chrome.scripting.executeScript({ target: { tabId }, files: ['detekce.js'], world: 'MAIN' });
      if (!vys || !vys.result || typeof vys.result.jeOkno !== 'boolean') return nelze();
      vykresli(vys.result);
    } catch (e) { nelze(); }
  }
  main();
})();
