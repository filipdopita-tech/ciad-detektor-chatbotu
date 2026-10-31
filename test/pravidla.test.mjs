// Čistá pravidla bez DOM: rozhodni (z repa měření) a sdělení "stroj" (RE_STROJ).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
require('../ext/detekce.js');
const P = globalThis.CIAD_DETEKTOR_PRAVIDLA;

// Případy převzaté z test/rozhodni.test.mjs v repu měření.
const PRIPADY = [
  [['iframe:smartsupp'], true],
  [['prvek(11):aria+fixed+roh:Start chatbot'], true],
  [['global:smartsupp', 'prvek(6):slabý+fixed+roh:'], true],
  [['global:LiveChatWidget', 'vlastní:LiveChatWidget'], false],
  [['global:smartsupp'], false],
  [['prvek(8):class+fixed+roh:chat-selector'], false],
  [[], false],
  [['ramec:engage.wixapps.net'], true],
  [['vykresleno:roh'], false],
  [['global:LiveChatWidget', 'vykresleno:roh'], true],
];
for (const [s, ocek] of PRIPADY) {
  test(`rozhodni ${JSON.stringify(s)} -> ${ocek}`, () => assert.equal(P.rozhodni(s), ocek));
}

const STROJ_ANO = ['Jsem virtuální asistent', 'Váš virtuální odborník', 'Jsem Lukáš, váš virtuální asistent',
  'Nejsem člověk', 'Tento chat pohání umělá inteligence', 'Start chatbot', 'AI chatbot Chetty',
  'Automatická odpověď', 'I am an AI assistant'];
const STROJ_NE = ['Napište nám zprávu', 'Odpovíme okamžitě', 'Jsme online pro vás', 'Online podpora', 'Chat s námi'];
for (const t of STROJ_ANO) test(`stroj ano: ${t}`, () => assert.equal(P.najdiSignalStroj([t]).nalezen, true));
for (const t of STROJ_NE) test(`stroj ne: ${t}`, () => assert.equal(P.najdiSignalStroj([t]).nalezen, false));

test('okno bez sdělení = nelze určit, ne nenalezen', () => {
  assert.equal(P.vyhodnotStroj(true, ['Napište nám']).stav, 'nelze');
  assert.equal(P.vyhodnotStroj(false, ['Jsem virtuální asistent']).stav, 'nenalezen');
  const r = P.vyhodnotStroj(true, ['Dobrý den, jsem virtuální asistent Eva.']);
  assert.equal(r.stav, 'nalezen');
  assert.match(r.citace, /virtuální asistent/);
});

test('dodavatel z globálu a hostu', () => {
  assert.equal(P.urciDodavatele(['global:smartsupp+SMARTSUPP_LOADED']).nazev, 'Smartsupp');
  assert.equal(P.urciDodavatele(['ramec:engage.wixapps.net']).nazev, 'Wix Chat');
  assert.equal(P.urciDodavatele(['prvek(11):aria+fixed+roh:Start chatbot']), null);
});
