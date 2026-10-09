'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { PATTERNS_HEX, PATTERNS_PREFIX } = require('../identify.js');
const readme = readFileSync(join(__dirname, '../README.md'), 'utf8');
const claude = readFileSync(join(__dirname, '../CLAUDE.md'), 'utf8');

test('README supported-format table matches every exported name and hashcat mode', () => {
  const sections = readme.split(/^## ✨ 対応ハッシュ形式\r?$/m);
  assert.equal(sections.length, 2, 'exactly one supported-format section must exist');
  const text = sections[1].split(/\r?\n## /)[0];
  assert.match(text, /\| アルゴリズム \| 見分け方（長さ・接頭辞） \| hashcat モード \| 備考 \|/);
  const rows = [...text.matchAll(/^\| ([^|]+?) \| ([^|]+?) \| (\d+|—) \| ([^|]+?) \|$/gm)];
  assert.ok(rows.length >= 20, 'table parser must not silently match zero rows');
  const documented = new Map(rows.map(([, name, , mode]) => [name, mode === '—' ? null : Number(mode)]));
  assert.equal(documented.size, rows.length, 'one row per unique algorithm name');
  const patterns = [...Object.values(PATTERNS_HEX).flat(), ...PATTERNS_PREFIX];
  const expected = new Map(patterns.map(({ name, hashcat }) => [name, hashcat]));
  assert.deepEqual([...documented.keys()].sort(), [...expected.keys()].sort());
  for (const { name, hashcat } of patterns) assert.equal(documented.get(name), hashcat, name);
});

test('README series and YAML identifiers are preserved; confirmed corrections are documented', () => {
  assert.match(readme, /^<!--\r?\n---\r?\nid: day002\r?\nslug: hash-detector/m);
  for (const line of [
    '# Hash Identifier - ハッシュ識別ツール',
    '**Day002 - 生成AIで作るセキュリティツール100**',
    'repo_url: "https://github.com/ipusiron/hash-detector"',
    'demo_url: "https://ipusiron.github.io/hash-detector/"',
    'hub: true', 'Modern Cryptography', 'page_id=42163'
  ]) assert.ok(readme.includes(line), line);
  assert.doesNotMatch(readme, /Mordern|セキュリティツール200|page_id=44607/);
  assert.match(readme, /Keccak-512[\s\S]*18000/);
  assert.match(readme, /ベータ／未リリース/);
});

test('CLAUDE points to the maintained table and documents the same API and constraints', () => {
  for (const term of ['identify.js', 'script.js', 'test/', 'package.json', '.github/workflows',
    'PATTERNS_HEX', 'PATTERNS_PREFIX', 'hexLength', 'candidates', 'caveat',
    'README.md', '対応ハッシュ形式', 'npm test', 'file://', '18000', '31000', '34000']) {
    assert.ok(claude.includes(term), term);
  }
});

test('ユースケースの「このツールならではの使い方」を identify() で再計算（日英）', () => {
  const en = readFileSync(join(__dirname, '../README.en.md'), 'utf8');
  const md5 = require('../identify.js').identify('5f4dcc3b5aa765d61d8327deb882cf99');
  assert.equal(md5.hexLength, 32);
  assert.deepEqual(md5.candidates.map((c) => c.name), ['MD5', 'NTLM', 'MD4', 'LM']);
  const sha = require('../identify.js').identify('a'.repeat(64));
  assert.deepEqual(sha.candidates.map((c) => c.name), ['SHA-256', 'SHA3-256', 'Keccak-256', 'BLAKE2s-256']);
  const bcrypt = require('../identify.js').identify('$2b$12$' + 'a'.repeat(53));
  assert.deepEqual(bcrypt.candidates.map((c) => c.name), ['bcrypt']);
  const modes = Object.fromEntries(md5.candidates.map((c) => [c.name, c.hashcat]));
  assert.deepEqual([modes.MD5, modes.NTLM, modes.MD4], [0, 1000, 900]);
  for (const md of [readme, en]) {
    assert.ok(md.includes('MD5') && md.includes('NTLM') && md.includes('bcrypt'));
    assert.ok(md.includes('$2b$'));
  }
});
