'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const I18n = require(path.join(repositoryRoot, 'i18n.js'));
const { PATTERNS_HEX, PATTERNS_PREFIX, identify } = require(path.join(repositoryRoot, 'identify.js'));
const html = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(repositoryRoot, 'script.js'), 'utf8');
const identifySource = fs.readFileSync(path.join(repositoryRoot, 'identify.js'), 'utf8');

test('日本語と英語で、キーの集合が同じ', () => {
  const ja = Object.keys(I18n.ja).sort();
  const en = Object.keys(I18n.en).sort();
  assert.ok(ja.length >= 55, `キーが少なすぎる: ${ja.length}`);
  assert.deepEqual(ja.filter((k) => !(k in I18n.en)), [], '英語に無いキーがある');
  assert.deepEqual(en.filter((k) => !(k in I18n.ja)), [], '日本語に無いキーがある');
});

test('差し込みの名前が、日本語と英語で一致する', () => {
  const holes = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  const mismatched = Object.keys(I18n.ja).filter((k) => holes(I18n.ja[k]) !== holes(I18n.en[k]));
  assert.deepEqual(mismatched, []);
});

test('index.html が指すキーは、すべて辞書にある', () => {
  const keys = new Set();
  for (const m of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) keys.add(m[1]);
  assert.ok(keys.size >= 8, `data-i18n が少なすぎる: ${keys.size}`);
  assert.deepEqual([...keys].filter((k) => !(k in I18n.ja)), []);
});

test('script.js が呼ぶキーは、すべて辞書にある', () => {
  const keys = new Set();
  for (const m of script.matchAll(/I18n\.t\(\s*['"]([\w.]+)['"]/g)) keys.add(m[1]);
  for (const m of script.matchAll(/['"]((?:copy|link|result)\.[a-zA-Z]+)['"]/g)) keys.add(m[1]);
  assert.ok(keys.size >= 10, `I18n.t の呼び出しが少なすぎる: ${keys.size}`);
  assert.deepEqual([...keys].filter((k) => !(k in I18n.ja)), []);
});

test('identify.js が返すキー（note・nameKey・caveat）は、すべて辞書にある', () => {
  const candidates = [...Object.values(PATTERNS_HEX).flat(), ...PATTERNS_PREFIX];
  assert.ok(candidates.length >= 30);
  for (const { name, note, nameKey } of candidates) {
    assert.match(note, /^note\./, `${name} の note がキーになっていない`);
    assert.ok(note in I18n.ja, note);
    assert.ok(note in I18n.en, note);
    if (nameKey) {
      assert.ok(nameKey in I18n.ja, nameKey);
      assert.ok(nameKey in I18n.en, nameKey);
    }
  }
  for (const input of ['', 'deadbeef', '$2a$05$LhayLxezLhK1LhWvKxCyLOj0j1u.Kj0jZ0pEmm134uzrQlFvQJLF6']) {
    const { caveat } = identify(input);
    assert.ok(caveat.key in I18n.ja, caveat.key);
    assert.doesNotThrow(() => I18n.t(caveat.key, caveat.params));
  }
});

test('判定モジュールに表示用の文章が残っていない', () => {
  // 純ロジックが文言を持つと、言語を変えたときに訳せない
  const japanese = /[぀-ヿ一-鿿]/;
  const leftovers = identifySource.split('\n')
    .filter((line) => japanese.test(line))
    .map((line) => line.trim());
  // 日本語を含んでよいのは、英語表記を持たない候補名 'LM の半分' の行だけ
  assert.deepEqual(leftovers.filter((line) => !line.includes("nameKey: 'algo.lmHalf'")), []);
});

test('英語の辞書に、訳し忘れの日本語が残っていない', () => {
  const jp = /[぀-ヿ一-鿿]/;
  // 言語の切り替えボタンだけは、相手の言語を出すのが正しい
  const expected = new Set(['app.langButton']);
  assert.deepEqual(Object.keys(I18n.en).filter((k) => !expected.has(k) && jp.test(I18n.en[k])), []);
});

test('t() は差し込みを埋める。知らないキーは黙って通さない', () => {
  assert.match(I18n.t('result.mode', { mode: 3200 }), /3200/);
  assert.match(I18n.t('result.unsupportedLength', { length: 33 }), /33/);
  assert.match(I18n.t('copy.commandAria', { name: 'bcrypt' }), /bcrypt/);
  assert.throws(() => I18n.t('no.such.key'), /Unknown message/);
});

test('状態の判定を、表示中の文言との一致で行っていない', () => {
  // 言語を変えると文字列が変わるため、dataset の印で見分ける
  assert.doesNotMatch(script, /(?:textContent|value|innerText)\s*===?\s*['"][^'"]/);
  assert.match(script, /result\.dataset\.kind/);
  assert.match(script, /message\.dataset\.key/);
  // 空欄は「一致しませんでした」ではなく、何も出さない状態として扱う
  assert.match(script, /identified\.input === '' \? 'empty' : identified\.kind/);
});

test('i18n.js を最初に読み込み、切り替えボタンが配線されている', () => {
  assert.ok(html.indexOf('<script src="i18n.js"') < html.indexOf('<script src="identify.js"'));
  assert.match(html, /id="langToggle"[^>]*data-i18n="app\.langButton"/);
  assert.match(html, /data-i18n-aria-label="app\.langAria"/);
  assert.match(script, /langToggle\.addEventListener\('click'/);
  assert.match(script, /I18n\.setLanguage\(I18n\.language === 'ja' \? 'en' : 'ja'\)/);
  assert.match(script, /document\.addEventListener\('languagechange'/);
  assert.match(script, /I18n\.init\(\)/);
});

test('README は日英の相互リンクを持つ', () => {
  const ja = fs.readFileSync(path.join(repositoryRoot, 'README.md'), 'utf8');
  const en = fs.readFileSync(path.join(repositoryRoot, 'README.en.md'), 'utf8');
  assert.match(ja, /\[English\]\(README\.en\.md\) · 日本語/);
  assert.match(en, /English · \[日本語\]\(README\.md\)/);
  assert.match(en, /hash-detector/);
});
