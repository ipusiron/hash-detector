'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { identify } = require('../identify.js');
const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const script = readFileSync(join(__dirname, '../script.js'), 'utf8');

test('viewport, CSP, referrer and description metadata', () => {
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  assert.ok(csp);
  for (const rule of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "img-src 'self'", "object-src 'none'", "base-uri 'none'", "form-action 'none'"]) {
    assert.ok(csp[1].includes(rule), rule);
  }
  assert.doesNotMatch(csp[1], /frame-ancestors|unsafe-inline|unsafe-eval|\*/);
  assert.doesNotMatch(html, /X-Frame-Options/i);
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
  assert.match(html, /<meta name="description" content="[^"]+">/);
});

test('classic deferred scripts are ordered and no inline code or styles remain', () => {
  const first = html.indexOf('<script src="identify.js" defer>');
  const second = html.indexOf('<script src="script.js" defer>');
  assert.ok(first >= 0 && second > first);
  assert.doesNotMatch(html, /\stype=["']module["']/i);
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
  assert.doesNotMatch(html, /\sstyle\s*=/i);
  assert.equal([...html.matchAll(/<script\b/g)].length, 2);
  assert.doesNotMatch(html, /<style\b/i);
  assert.doesNotMatch(script, /innerHTML|alert\s*\(|window\.(?:copyHash|setHash)\s*=/);
});

test('all ten accessible sample buttons contain their expected candidate and displayed value', () => {
  const samples = [...html.matchAll(/<button type="button" class="sample" data-hash="([^"]+)" data-expect="([^"]+)">([\s\S]*?)<\/button>/g)];
  assert.equal(samples.length, 10);
  assert.deepEqual(samples.map(([, , name]) => name), ['MD5', 'SHA-1', 'NTLM', 'SHA-256', 'SHA-512', 'bcrypt', 'sha512crypt', 'md5crypt', 'MySQL 4.1+', 'phpass']);
  for (const [, hash, expected, body] of samples) {
    assert.ok(identify(hash).candidates.some(({ name }) => name === expected), expected);
    assert.equal(body.match(/<code>([^<]+)<\/code>/)[1], hash, 'displayed and clickable hashes agree');
    assert.ok(body.includes(expected));
  }
});

test('input attributes, result live region, visible status toast and noscript', () => {
  const input = html.match(/<input\b[^>]*\bid="hashInput"[^>]*>/)[0];
  for (const attribute of ['spellcheck="false"', 'autocomplete="off"', 'autocapitalize="off"', 'autocorrect="off"']) assert.ok(input.includes(attribute));
  assert.match(html, /<label for="hashInput">/);
  assert.match(html, /<div id="result" aria-live="polite" aria-atomic="true">/);
  assert.match(html, /<div id="message" role="status" aria-live="polite" aria-atomic="true" class="message">/);
  assert.match(html, /<noscript>このツールは JavaScript が必要です<\/noscript>/);
  assert.match(script, /setAttribute\('aria-label'/);
  assert.match(script, /navigator\.clipboard\.writeText/);
  assert.match(script, /noopener noreferrer/);
  assert.doesNotMatch(script, /\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|document\.cookie/);
});
