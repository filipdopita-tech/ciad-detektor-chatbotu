/**
 * Detekce chatovacího okna a signálu "odpovídá stroj".
 *
 * Pravidla jsou PŘENESENÁ z repa měření čl. 50 (ciad-cl50-mereni), ne vymyšlená:
 *   - seznamy dodavatelů (GLOBALS, VENDOR_PREFIX, IFRAME_HOSTS) · src/03_detekce.mjs
 *   - sken spouštěčů (findLaunchersIn) · src/03_detekce.mjs, bez zápisu do DOM
 *   - rohový sken a rámy (rohoveProvky, rohoveChatoveRamy) · src/rohovy-sken.mjs
 *   - rozhodovací pravidlo (rozhodni) · src/pravidlo.mjs, doslova
 *   - RE_STROJ (sdělení, že protějšek je stroj) · src/03_detekce.mjs, METODIKA §5
 *
 * Co se NEPŘENÁŠÍ a proč:
 *   - signál `sit:` (síťový požadavek): rozšíření nemá oprávnění sledovat síť
 *     a v repu stejně nikdy nerozhoduje sám. Z performance API se bere jen
 *     k určení dodavatele.
 *   - odklik cookie souhlasu, scroll a otevření okna: rozšíření nic neklikne.
 *   - METODIKA §5 čte text PRVNÍHO OTEVŘENÉHO STAVU po kliknutí na spouštěč.
 *     Tady se okno neotevírá, takže se RE_STROJ aplikuje jen na to, co je vidět
 *     bez kliknutí: popisky a text spouštěče a útvarů přilepených k rohu.
 *     Když okno existuje a žádné sdělení v dohledném textu není, výsledek je
 *     "nelze určit", ne "nenalezen" (METODIKA §5, neotevřené = neurčeno).
 *
 * Klasický skript, ne modul: vkládá se přes chrome.scripting (files, world MAIN)
 * a poslední výraz je výsledek. V Node (testy) vystaví čistá pravidla
 * v globalThis.CIAD_DETEKTOR_PRAVIDLA.
 */
(function () {
  'use strict';

  // ---- přeneseno: src/pravidlo.mjs --------------------------------------
  const PRAH_PRVKU = 11;

  function rozhodni(signals) {
    const ma = p => signals.some(s => s.startsWith(p));
    const skore = Math.max(0, ...signals
      .filter(s => s.startsWith('prvek('))
      .map(s => Number(s.slice(6, s.indexOf(')'))) || 0));
    if (ma('iframe:') || ma('ramec:')) return true;
    if (skore >= PRAH_PRVKU) return true;
    const vykresleno = skore > 0 || ma('vykresleno:');
    return (ma('global:') || ma('vlastní:')) && vykresleno;
  }

  // ---- přeneseno: src/03_detekce.mjs (seznamy dodavatelů) ----------------
  const GLOBALS = ['smartsupp', 'Tawk_API', 'Intercom', '$crisp', 'LiveChatWidget', 'LC_API',
    'daktela', 'zE', 'fcWidget', 'Tidio', 'tidioChatApi', 'jivo_api', 'Chatra', 'olark',
    'HubSpotConversations', 'drift', 'chatwoot', 'Leadoo', 'botpressWebChat', 'voiceflow',
    'Typebot', 'landbot'];

  const VENDOR_PREFIX_SRC = '^(' + [
    'daktela', 'smartsupp', 'tawk', 'intercom', 'livechat', 'zopim',
    'zendesk', 'freshchat', 'tidio', 'jivo', 'chatra', 'olark', 'chatwoot',
    'leadoo', 'botpress', 'voiceflow', 'typebot', 'landbot',
    'hubspotconversations',
  ].join('|') + ')';

  const IFRAME_HOSTS = ['smartsupp', 'tawk.to', 'intercom', 'livechatinc', 'crisp.chat',
    'zopim', 'zendesk', 'zdassets', 'freshchat', 'hubspot', 'driftt', 'daktela', 'tidio',
    'jivosite', 'chatra', 'olark', 'chatwoot', 'leadoo', 'botpress', 'landbot', 'voiceflow',
    'typebot', 'chatbot.com'];

  const RE_VLASTNI = /^(bootstrap)?chat([A-Z_]|$)|chatapp|chatwidget|chatbot|livechat|webchat/i;

  // ---- přeneseno: src/03_detekce.mjs (METODIKA §5, sdělení "stroj") -------
  const RE_STROJ_SRC = [
    'um[eě]l[aáeéyý][a-zá-ž]*\\s+inteligenc', 'AI[ -]?asistent', 'AI[ -]?chat',
    'AI[ -]?bot', 'AI[ -]?pr[uů]vodce',
    'virtu[aá]ln[ií][a-zá-ž]*\\s+(asistent|asistentk|poradce|pr[uů]vodce|odborn[ií]k|konzultant|prodejce|kolegy?n|pomocn[ií]k)',
    'sefbot', 'jsem\\s+[a-zá-ž]+,\\s*v[aá][šs]\\s+virtu[aá]ln',
    'automatick[aáéyý][a-zá-ž]*\\s+(odpov|asisten)', 'chatbot', 'nejsem\\s+[čc]lov[eě]k',
    'jsem\\s+(virtu[aá]ln|AI|um[eě]l|chatbot|bot\\b)', 'v[aá][šs]\\s+AI\\b', 'va[šs]e\\s+AI\\b',
    'm[uů][žz]e\\s+d[eě]lat\\s+chyby', 'poh[aá]n[eě]n[oaéy]?\\s+(AI|um[eě]lou)',
    'artificial intelligence', 'AI[ -]?powered', 'powered by AI', 'automated (assistant|response)',
    'virtual assistant', 'I am an AI', 'AI assistant',
  ].join('|');

  // ---- přeneseno: src/rohovy-sken.mjs -------------------------------------
  const NABYTEK_SRC = 'grecaptcha|recaptcha|cookie|consent|cmp|gdpr|back-to-top|scroll-top|newsletter';
  const RE_CHAT_RAM_SRC = [
    'chat-widget', 'chatwidget', 'chat-server', 'renderchatwidget',
    '/chat[/?#]', '[?&]chat=', 'chat\\.(js|html|php)', 'webchat', 'livechat',
    'messenger', 'smartsupp', 'tawk\\.to', 'intercom', 'daktela', 'crisp\\.chat',
    'freshchat', 'zdassets', 'reamaze', 'olark\\.com', 'drift\\.com', 'driftt',
    'hubspot.*conversation', 'tidio', 'jivosite', 'chatra', 'chatwoot',
    'leadoo', 'botpress', 'landbot', 'voiceflow', 'typebot',
  ].join('|');
  const RE_NENI_CHAT_SRC = '^about:|^data:|doubleclick|recaptcha|youtube\\.com|twitch\\.tv|googletagmanager|google\\.com/(ads|pagead)|googlesyndication|hotjar|clarity\\.ms';
  const RAMEC_MAX = 760;
  const ROH_PX = 240;

  // ---- dodavatelé: signatury z kódu měření, hybrid dle METODIKA §1 --------
  // Amio a Wix Chat jsou z naměřených dat repa (signal vlastní:amioWebchat,
  // ramec:engage.wixapps.net), ne ze seznamu dodavatelů. Šéfbot se pozná jen
  // podle adresy skriptu nebo textu; v kódu měření pro něj globál není.
  const DODAVATELE = [
    { id: 'smartsupp', nazev: 'Smartsupp', re: /smartsupp/i, hybrid: true },
    { id: 'tawk', nazev: 'Tawk.to', re: /tawk/i, hybrid: true },
    { id: 'livechat', nazev: 'LiveChat', re: /livechat|LC_API/i, hybrid: true },
    { id: 'daktela', nazev: 'Daktela', re: /daktela/i, hybrid: true },
    { id: 'intercom', nazev: 'Intercom', re: /intercom/i },
    { id: 'crisp', nazev: 'Crisp', re: /\$crisp|crisp\.chat/i },
    { id: 'zendesk', nazev: 'Zendesk', re: /zendesk|zdassets|zopim|global:(?:[^|]*\+)?zE(?:\+|\s|\||$)/ },
    { id: 'freshchat', nazev: 'Freshchat', re: /freshchat|fcWidget/i },
    { id: 'hubspot', nazev: 'HubSpot', re: /hubspot/i },
    { id: 'drift', nazev: 'Drift', re: /driftt|drift\.com|global:(?:[^|]*\+)?drift(?:\+|\s|\||$)/i },
    { id: 'tidio', nazev: 'Tidio', re: /tidio/i },
    { id: 'jivo', nazev: 'Jivo', re: /jivo/i },
    { id: 'chatra', nazev: 'Chatra', re: /chatra/i },
    { id: 'olark', nazev: 'Olark', re: /olark/i },
    { id: 'chatwoot', nazev: 'Chatwoot', re: /chatwoot/i },
    { id: 'leadoo', nazev: 'Leadoo', re: /leadoo/i },
    { id: 'botpress', nazev: 'Botpress', re: /botpress/i },
    { id: 'landbot', nazev: 'Landbot', re: /landbot/i },
    { id: 'voiceflow', nazev: 'Voiceflow', re: /voiceflow/i },
    { id: 'typebot', nazev: 'Typebot', re: /typebot/i },
    { id: 'chatbotcom', nazev: 'Chatbot.com', re: /chatbot\.com/i },
    { id: 'wix', nazev: 'Wix Chat', re: /wixapps|Wix Chat/i },
    { id: 'amio', nazev: 'Amio', re: /amio/i },
    { id: 'sefbot', nazev: 'Šéfbot', re: /sefbot/i },
  ];

  function urciDodavatele(signaly, zdroje) {
    const pole = signaly.join(' | ') + ' | ' + (zdroje || []).join(' | ');
    const d = DODAVATELE.find(x => x.re.test(pole));
    return d ? { id: d.id, nazev: d.nazev, hybrid: !!d.hybrid } : null;
  }

  // ---- sdělení "stroj" ----------------------------------------------------
  function vyrez(text, od, delka) {
    const z = Math.max(0, od - 50);
    const k = Math.min(text.length, od + delka + 70);
    const r = text.slice(z, k).replace(/\s+/g, ' ').trim();
    return (z > 0 ? '…' : '') + r + (k < text.length ? '…' : '');
  }

  function najdiSignalStroj(texty) {
    const re = new RegExp(RE_STROJ_SRC, 'i');
    for (const t of texty) {
      const m = re.exec(t);
      if (m) return { nalezen: true, citace: vyrez(t, m.index, m[0].length) };
    }
    return { nalezen: false, citace: '' };
  }

  function vyhodnotStroj(jeOkno, texty) {
    if (!jeOkno) return { stav: 'nenalezen', citace: '' };
    const n = najdiSignalStroj(texty);
    return n.nalezen ? { stav: 'nalezen', citace: n.citace } : { stav: 'nelze', citace: '' };
  }

  // ---- sběr v živé stránce -----------------------------------------------
  function prochazej(dotaz, zpracuj) {
    const fronta = [document]; const videno = new Set();
    while (fronta.length) {
      const kor = fronta.shift();
      let vsechny = []; try { vsechny = [...kor.querySelectorAll('*')]; } catch (e) { continue; }
      for (const el of vsechny) {
        if (el.shadowRoot && !videno.has(el.shadowRoot)) { videno.add(el.shadowRoot); fronta.push(el.shadowRoot); }
      }
      let prvky = []; try { prvky = [...kor.querySelectorAll(dotaz)]; } catch (e) { continue; }
      for (const el of prvky) zpracuj(el, kor);
    }
  }

  function sberGlobaly() {
    const out = [];
    const re = new RegExp(VENDOR_PREFIX_SRC, 'i');
    const presne = GLOBALS.filter(x => typeof window[x] !== 'undefined' && window[x] !== null);
    let predpony = [];
    try {
      predpony = Object.keys(window)
        .filter(k => re.test(k) && typeof window[k] !== 'undefined' && window[k] !== null).slice(0, 6);
    } catch (e) { /* okno může být zamčené */ }
    const g = [...new Set([...presne, ...predpony])].slice(0, 8);
    if (g.length) out.push('global:' + g.join('+'));
    try {
      const c = Object.keys(window).filter(k => RE_VLASTNI.test(k) && !/^webpackChunk/i.test(k)).slice(0, 5);
      if (c.length) out.push('vlastní:' + c.join('+'));
    } catch (e) { /* nic */ }
    return out;
  }

  /** findLaunchersIn z repa. Rozdíl: nezapisuje atribut do stránky, vrací prvek. */
  function sberSpoustece() {
    const RE_STRONG = /\b(chat|chatbot|asisten|assistant|poradce|pruvodce|průvodce|livechat|zeptejte)/i;
    const RE_WEAK = /(chat|bot|widget|launcher|bubble|message|zpr[aá]v)/i;
    const out = [];
    const nodes = document.querySelectorAll(
      'button,a,iframe,[role="button"],[aria-label],[title],[data-testid],svg,span[class*="chat" i],div[class*="chat" i]');
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      if (r.width < 20 || r.height < 20 || r.width > 460 || r.height > 460) continue;
      const st = getComputedStyle(el);
      if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) < 0.1) continue;
      const id = el.id || '';
      const cls = typeof el.className === 'string' ? el.className : '';
      const al = el.getAttribute('aria-label') || '';
      const ti = el.getAttribute('title') || '';
      const dt = el.getAttribute('data-testid') || '';
      const src = el.getAttribute('src') || '';
      const txt = (el.innerText || '').trim().slice(0, 40);
      const blob = `${id} ${cls} ${al} ${ti} ${dt} ${src} ${txt}`;
      let score = 0; const why = [];
      if (RE_STRONG.test(al)) { score += 6; why.push('aria'); }
      if (RE_STRONG.test(ti)) { score += 5; why.push('title'); }
      if (RE_STRONG.test(id) || RE_STRONG.test(dt)) { score += 4; why.push('id'); }
      if (RE_STRONG.test(cls)) { score += 3; why.push('class'); }
      if (RE_STRONG.test(txt)) { score += 3; why.push('text'); }
      if (!score && RE_WEAK.test(blob)) { score += 1; why.push('slabý'); }
      if (!score) continue;
      const fixed = st.position === 'fixed' || st.position === 'sticky';
      const nearEdge = (window.innerHeight - r.bottom) < 160 && (window.innerWidth - r.right) < 260;
      if (fixed) { score += 2; why.push('fixed'); }
      if (fixed && nearEdge) { score += 3; why.push('roh'); }
      out.push({ score, why: why.join('+'), al: al.slice(0, 40), cls: String(cls).slice(0, 40), el });
      if (out.length > 40) break;
    }
    return out.sort((a, b) => b.score - a.score);
  }

  /** rohoveProvky z repa. */
  function sberRoh() {
    const H = innerHeight, W = innerWidth;
    const NABYTEK = new RegExp(NABYTEK_SRC, 'i');
    const out = [];
    prochazej('div,button,a,iframe,[role=button]', (el) => {
      let cs; try { cs = getComputedStyle(el); } catch (e) { return; }
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
      if (cs.position !== 'fixed' && cs.position !== 'sticky') return;
      const r = el.getBoundingClientRect();
      if (r.width < 28 || r.height < 28 || r.width > 460 || r.height > 460) return;
      if (r.bottom < H - 240 || r.right < W - 240) return;
      const id = [el.id, typeof el.className === 'string' ? el.className : ''].join(' ');
      if (NABYTEK.test(id)) return;
      out.push({ el });
    });
    return out;
  }

  /** rohoveChatoveRamy z repa. */
  function sberRamy() {
    const H = innerHeight, W = innerWidth;
    const NABYTEK = new RegExp(NABYTEK_SRC, 'i');
    const CHAT = new RegExp(RE_CHAT_RAM_SRC, 'i');
    const NENI = new RegExp(RE_NENI_CHAT_SRC, 'i');
    const out = [];
    prochazej('iframe', (el) => {
      const src = el.getAttribute('src') || '';
      if (!src || NENI.test(src) || !CHAT.test(src)) return;
      const id = [el.id, typeof el.className === 'string' ? el.className : '', src].join(' ');
      if (NABYTEK.test(id)) return;
      let cs; try { cs = getComputedStyle(el); } catch (e) { return; }
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
      const r = el.getBoundingClientRect();
      if (r.width < 28 || r.height < 28 || r.width > RAMEC_MAX || r.height > RAMEC_MAX) return;
      if (r.bottom < H - ROH_PX || r.right < W - ROH_PX) return;
      let host = ''; try { host = new URL(src, location.href).host; } catch (e) { host = ''; }
      if (host) out.push(host);
    });
    return out;
  }

  function textyPrvku(el) {
    const t = [];
    const al = el.getAttribute && el.getAttribute('aria-label');
    const ti = el.getAttribute && el.getAttribute('title');
    if (al) t.push(al);
    if (ti) t.push(ti);
    const inner = (el.innerText || '').trim();
    if (inner) t.push(inner.slice(0, 300));
    return t;
  }

  function detekuj() {
    const signaly = [];
    signaly.push(...sberGlobaly());

    const ifr = [...document.querySelectorAll('iframe')].map(f => f.src || f.getAttribute('src') || '').filter(Boolean);
    const hit = IFRAME_HOSTS.filter(h => ifr.some(u => u.includes(h)));
    if (hit.length) signaly.push('iframe:' + hit.join('+'));

    const spoustece = sberSpoustece();
    const silne = spoustece.filter(l => l.score >= 4);
    if (silne.length) {
      const s = silne[0];
      signaly.push(`prvek(${s.score}):${s.why}:${(s.al || s.cls).slice(0, 30)}`);
    }

    const ramy = sberRamy();
    const hosty = [...new Set(ramy)].slice(0, 3);
    if (hosty.length) signaly.push('ramec:' + hosty.join('+'));
    const roh = sberRoh();
    if (roh.length) signaly.push('vykresleno:roh');

    // zdroje k určení dodavatele; v repu je to signál sit:, který nerozhoduje
    let zdroje = [];
    try {
      zdroje = performance.getEntriesByType('resource').map(e => e.name)
        .filter(u => IFRAME_HOSTS.some(h => u.includes(h)) || /sefbot|amio|wixapps/i.test(u)).slice(0, 20);
    } catch (e) { /* nic */ }

    const jeOkno = rozhodni(signaly);
    const jenSkript = !jeOkno && (signaly.some(s => /^(global|vlastní|iframe):/.test(s)) || zdroje.length > 0);

    // dohledný text: popisky a text silných spouštěčů a útvarů v rohu
    const texty = [];
    const videno = new Set();
    for (const l of silne) for (const t of textyPrvku(l.el)) if (!videno.has(t)) { videno.add(t); texty.push(t); }
    for (const r of roh) for (const t of textyPrvku(r.el)) if (!videno.has(t)) { videno.add(t); texty.push(t); }

    const dodavatel = (jeOkno || jenSkript) ? urciDodavatele(signaly, zdroje) : null;
    return {
      verze: 1,
      jeOkno,
      jenSkript,
      dodavatel,
      stroj: vyhodnotStroj(jeOkno, texty.slice(0, 30)),
      okno_otevreno: false,
      signaly,
    };
  }

  const pravidla = { rozhodni, najdiSignalStroj, vyhodnotStroj, urciDodavatele, PRAH_PRVKU, RE_STROJ_SRC };
  if (typeof document === 'undefined') {
    globalThis.CIAD_DETEKTOR_PRAVIDLA = pravidla;
    return pravidla;
  }
  return detekuj();
})();
