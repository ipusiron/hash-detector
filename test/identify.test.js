'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const { identify, PATTERNS_HEX, PATTERNS_PREFIX } = require('../identify.js');

// A-5: public "hashcat" vectors, not credentials.
// https://hashcat.net/wiki/doku.php?id=example_hashes
// Keccak-512 mode corrected to 18000 with the user's approval (17900 = Keccak-384).
const vectors = [
  ['MD5', 0, '8743b52063cd84097a65d1633f5c74f5', 'md5'],
  ['SHA-1', 100, 'b89eaac7e61417341b710b727768294d0e6a277b', 'sha1'],
  ['NTLM', 1000, 'b4b9b02e6f09a9bd760f388b67351e2b'],
  ['MD4', 900, 'afe04867ec7a3845145579a95f72eca7'],
  ['LM の半分', 3000, '299bd128c1101fd6'],
  ['MySQL 3.x', 200, '7196759210defdc0'],
  ['MySQL 4.1+', 300, '*FCF7C1B8749CF99D88E5F34271D636178FB5D130'],
  ['SHA-224', 1300, 'e4fa1555ad877bf0ec455483371867200eee89550a93eff2f95a6198', 'sha224'],
  ['SHA-256', 1400, '127e6fbfe24a750e72930c220a8e138275656b8e5d8f48a98c3c92df2caba935', 'sha256'],
  ['SHA-384', 10800, '07371af1ca1fca7c6941d2399f3610f1e392c56c6d73fddffe38f18c430a2817028dae1ef09ac683b62148a2c8757f42', 'sha384'],
  ['SHA-512', 1700, '82a9dda829eb7f8ffe9fbe49e45d47d2dad9664fbb7adf72492e3c81ebd3e29134d9bc12212bf83c6840f10e8246b9db54a4859b7ccd0123d86e5872c1e5082f', 'sha512'],
  ['SHA3-256', 17400, 'd60fcf6585da4e17224f58858970f0ed5ab042c3916b76b0b828e62eaf636cbd', 'sha3-256'],
  ['SHA3-512', 17600, '7c2dc1d743735d4e069f3bda85b1b7e9172033dfdd8cd599ca094ef8570f3930c3f2c0b7afc8d6152ce4eaad6057a2ff22e71934b3a3dd0fb55a7fc84a53144e', 'sha3-512'],
  ['Keccak-256', 17800, '203f88777f18bb4ee1226627b547808f38d90d3e106262b5de9ca943b57137b6'],
  ['Keccak-512', 18000, '2fbf5c9080f0a704de2e915ba8fdae6ab00bbc026b2c1c8fa07da1239381c6b7f4dfd399bf9652500da723694a4c719587dd0219cb30eabe61210a8ae4dc0b03'],
  ['Whirlpool', 6100, '7ca8eaaaa15eaa4c038b4c47b9313e92da827c06940e69947f85bc0fbef3eb8fd254da220ad9e208b6b28f6bb9be31dd760f1fdb26112d83f87d96b416a4d258'],
  ['RIPEMD-160', 6000, '012cb9b334ec1aeb71a9c8ce85586082467f7eb6', 'ripemd160'],
  ['md5crypt', 500, '$1$ehAsHC4t$4IbK3fHS/H1YGtNYBrIEB1'],
  ['Apache apr1', 1600, '$apr1$71850310$gh9m4xcAn3MGxogwX/ztb.'],
  ['sha256crypt', 7400, '$5$rounds=5000$GX7BopJZJxPc/KEK$le16UF8I2Anb.rOrn22AUPWvzUETDGefUmAV8AZkGcD'],
  ['sha512crypt', 1800, '$6$qdMgClgO2dQWB37F$jhexCX1SdsCAi0OZmoRVAPnWSwuP/mHVhXIMJfKlaacxFkwWLDZ0ViF8Ur3WcHashcatVp2WShcEILi8QZCbt/'],
  ['bcrypt', 3200, '$2a$05$LhayLxezLhK1LhWvKxCyLOj0j1u.Kj0jZ0pEmm134uzrQlFvQJLF6'],
  ['phpass', 400, '$P$9d2OMJEOHyPg11MeSv46hashcatG.F1'],
  ['Django PBKDF2-SHA256', 10000, 'pbkdf2_sha256$20000$H0dPx8NeajVu$GiC4k5kqbbR9qWBlsRgDywNqC2vd9kqfk7zdorEnNas='],
  ['BLAKE2b-512', 600, '$BLAKE2$296c269e70ac5f0095e6fb47693480f0f7b97ccd0307f5c3bfa4df8f5ca5c9308a0e7108e80a0a9c0ebb715e8b7109b072046c6cd5e155b4cfd2f27216283b1e'],
  ['scrypt', 8900, 'SCRYPT:1024:1:1:MDIwMzMwNTQwNDQyNQ==:5FW+zWivLxgCWj7qLiQbeC8zaNQ+qdO0NUinvqyFcfo='],
  ['CRC32', 11500, 'c762de4a'],
  // B-4 also requests these two digests, absent from A-5's list.
  // Added from the same official list and independently checked with node:crypto.
  ['SHA3-224', 17300, '412ef78534ba6ab0e9b1607d3e9767a25c1ea9d5e83176b4c2817a6c', 'sha3-224'],
  ['SHA3-384', 17500, '983ba28532cc6320d04f20fa485bcedb38bddb666eca5f1e5aa279ff1c6244fe5f83cf4bbf05b95ff378dd2353617221', 'sha3-384']
];

const expectedHex = {
  8: [['CRC32', 11500], ['Adler-32', null]],
  16: [['MySQL 3.x', 200], ['LM の半分', 3000]],
  32: [['MD5', 0], ['NTLM', 1000], ['MD4', 900], ['LM', 3000]],
  40: [['SHA-1', 100], ['RIPEMD-160', 6000]],
  56: [['SHA-224', 1300], ['SHA3-224', 17300]],
  64: [['SHA-256', 1400], ['SHA3-256', 17400], ['Keccak-256', 17800], ['BLAKE2s-256', 31000]],
  96: [['SHA-384', 10800], ['SHA3-384', 17500]],
  128: [['SHA-512', 1700], ['SHA3-512', 17600], ['Keccak-512', 18000], ['Whirlpool', 6100], ['BLAKE2b-512', 600]]
};
const pairs = result => result.candidates.map(({ name, hashcat }) => [name, hashcat]);

for (const [name, mode, input, cryptoName] of vectors) {
  test('known vector: ' + name, () => {
    const result = identify(input);
    const match = result.candidates.find(candidate => candidate.name === name);
    assert.ok(match, name + ' must be a candidate');
    assert.equal(match.hashcat, mode);
    assert.equal(result.input, input);
    if (/^[0-9a-f]+$/i.test(input)) {
      assert.equal(result.kind, 'hex');
      assert.equal(result.hexLength, input.length);
      assert.deepEqual(pairs(result), expectedHex[input.length]);
      assert.deepEqual(pairs(identify(input.toUpperCase())), pairs(result));
    } else {
      assert.equal(result.kind, 'prefix');
      assert.equal(result.hexLength, null);
      assert.deepEqual(pairs(result), [[name, mode]]);
    }
  });
  if (cryptoName) {
    test('node:crypto independently confirms ' + name, () => {
      assert.equal(createHash(cryptoName).update('hashcat').digest('hex'), input);
    });
  }
}

for (const [length, expected] of Object.entries(expectedHex)) {
  test('all candidates and order for hex length ' + length, () => {
    assert.deepEqual(pairs(identify('a'.repeat(Number(length)))), expected);
    assert.deepEqual(PATTERNS_HEX[length].map(({ name, hashcat }) => [name, hashcat]), expected);
  });
}

test('prefix table order and confirmed or unconfirmed modes', () => {
  assert.deepEqual(PATTERNS_PREFIX.map(({ name, hashcat }) => [name, hashcat]), [
    ['MySQL 4.1+', 300], ['md5crypt', 500], ['Apache apr1', 1600],
    ['sha256crypt', 7400], ['sha512crypt', 1800], ['bcrypt', 3200],
    ['phpass', 400], ['Django PBKDF2-SHA256', 10000], ['BLAKE2b-512', 600],
    ['scrypt', 8900], ['LDAP {SHA}', 101], ['LDAP {SSHA}', 111],
    ['Argon2', 34000], ['yescrypt', null]
  ]);
});

test('normalization preserves case and trims surrounding whitespace', () => {
  for (const [, , input] of vectors) {
    assert.deepEqual(identify(' \r\n\t' + input + '\u3000 '), identify(input));
  }
});

test('empty and unknown inputs return none with the exact caveat', () => {
  for (const input of ['', ' \n\t ', 'hello', '<img src=x onerror=alert(1)>', 'ab cd', '0x1234']) {
    assert.deepEqual(identify(input), {
      input: input.trim(), kind: 'none', hexLength: null, candidates: [],
      caveat: { key: 'caveat.none', params: {} }
    });
  }
});

test('hex caveat, including unsupported lengths, never claims an algorithm', () => {
  for (const length of [1, 7, 8, 16, 31, 32, 33, 40, 55, 56, 64, 96, 128, 129]) {
    const result = identify('A'.repeat(length));
    assert.equal(result.kind, 'hex');
    assert.equal(result.hexLength, length);
    assert.deepEqual(result.caveat, { key: 'caveat.hex', params: { length } });
    if (!expectedHex[length]) assert.deepEqual(result.candidates, []);
  }
});

test('prefix caveat and candidate shape; no hex candidates mixed in', () => {
  for (const [, , input] of vectors.filter(([, , value]) => !/^[0-9a-f]+$/i.test(value))) {
    const result = identify(input);
    assert.deepEqual(result.caveat, { key: 'caveat.prefix', params: {} });
    assert.equal(result.candidates.length, 1);
    assert.deepEqual(Object.keys(result.candidates[0]), ['name', 'nameKey', 'hashcat', 'note']);
  }
});

test('LDAP official vectors and prefix-only Argon2 / yescrypt recognition', () => {
  for (const [input, name, mode] of [
    ['{SHA}uJ6qx+YUFzQbcQtyd2gpTQ5qJ3s=', 'LDAP {SHA}', 101],
    ['{SSHA}AZKja92fbuuB9SpRlHqaoXxbTc43Mzc2MDM1Ng==', 'LDAP {SSHA}', 111],
    ['$argon2id$v=19$m=65536,t=3,p=1$FBMjI4RJBhIykCgol1KEJA$2ky5GAdhT1kH4kIgPN/oERE3Taiy43vNN70a3HpiKQU', 'Argon2', 34000],
    ['$argon2id$', 'Argon2', 34000], ['$argon2i$', 'Argon2', 34000],
    ['$argon2d$not-validated', 'Argon2', 34000], ['$y$', 'yescrypt', null]
  ]) {
    assert.equal(identify(input).kind, 'prefix');
    assert.deepEqual(pairs(identify(input)), [[name, mode]]);
  }
});

test('all supported bcrypt signatures and exactly two cost digits', () => {
  const bcrypt = vectors.find(([name]) => name === 'bcrypt')[2];
  for (const variant of ['2', '2a', '2b', '2x', '2y']) {
    assert.deepEqual(pairs(identify(bcrypt.replace('$2a$', '$' + variant + '$'))), [['bcrypt', 3200]]);
  }
  for (const signature of ['$2z$', '$2A$', '$2aa$']) {
    assert.equal(identify(bcrypt.replace('$2a$', signature)).kind, 'none');
  }
  for (const cost of ['5', '005', 'ab']) {
    assert.equal(identify(bcrypt.replace('$05$', '$' + cost + '$')).kind, 'none');
  }
});

test('salt and digest boundaries for crypt formats', () => {
  for (const [prefix, maxSalt, digestLength, name] of [
    ['$1$', 8, 22, 'md5crypt'], ['$apr1$', 8, 22, 'Apache apr1'],
    ['$5$', 16, 43, 'sha256crypt'], ['$6$', 16, 86, 'sha512crypt']
  ]) {
    for (const saltLength of [1, maxSalt]) {
      assert.equal(identify(prefix + './Az09xyZ'.repeat(2).slice(0, saltLength) + '$' + 'a'.repeat(digestLength)).candidates[0].name, name);
    }
    for (const [saltLength, length] of [[0, digestLength], [maxSalt + 1, digestLength], [1, digestLength - 1], [1, digestLength + 1]]) {
      assert.equal(identify(prefix + 'a'.repeat(saltLength) + '$' + 'a'.repeat(length)).kind, 'none');
    }
    assert.equal(identify(prefix + 'a!$' + 'a'.repeat(digestLength)).kind, 'none');
  }
  for (const prefix of ['$5$', '$6$']) {
    const length = prefix === '$5$' ? 43 : 86;
    assert.equal(identify(prefix + 'rounds=12345$a$' + 'a'.repeat(length)).kind, 'prefix');
    assert.equal(identify(prefix + 'rounds=abc$a$' + 'a'.repeat(length)).kind, 'none');
  }
});

test('fixed-length prefix formats reject truncation, extra suffixes and leading junk', () => {
  for (const [, , input] of vectors.filter(([name]) => ['MySQL 4.1+', 'md5crypt', 'Apache apr1', 'sha256crypt', 'sha512crypt', 'bcrypt', 'phpass', 'BLAKE2b-512'].includes(name))) {
    for (const invalid of [input.slice(0, -1), input + 'A', 'x' + input, input + '\nX']) {
      assert.equal(identify(invalid).kind, 'none', invalid);
    }
  }
});

test('case-sensitive signatures, Base64 characters, and non-empty fields', () => {
  assert.equal(identify('$H$9d2OMJEOHyPg11MeSv46hashcatG.F1').kind, 'prefix');
  assert.equal(identify('$p$9d2OMJEOHyPg11MeSv46hashcatG.F1').kind, 'none');
  assert.equal(identify('*' + 'a'.repeat(40)).kind, 'prefix');
  assert.equal(identify('$blake2$' + 'A'.repeat(128)).kind, 'prefix');
  for (const invalid of [
    'pbkdf2_sha256$a$salt$YWJj', 'pbkdf2_sha256$20$$YWJj',
    'pbkdf2_sha256$20$salt$ab-c', 'PBKDF2_SHA256$20$salt$YWJj',
    'SCRYPT:1:2:3::YWJj', 'scrypt:1:2:3:YWJj:YWJj',
    '{SHA}' + 'A'.repeat(28), '{SSHA}', '{SSHA}a-b',
    '$argon2$', '$argon2id', '$Y$'
  ]) assert.equal(identify(invalid).kind, 'none', invalid);
});

test('pure classic-script API without DOM or CommonJS, and fresh return values', () => {
  const sandbox = {};
  runInNewContext(readFileSync(join(__dirname, '../identify.js'), 'utf8'), sandbox);
  assert.deepEqual(Object.keys(sandbox.HashIdentifier), ['identify', 'PATTERNS_HEX', 'PATTERNS_PREFIX']);
  assert.equal(sandbox.HashIdentifier.identify(vectors[0][2]).candidates[0].hashcat, 0);
  const first = identify(vectors[0][2]);
  first.candidates[0].name = 'changed';
  assert.equal(identify(vectors[0][2]).candidates[0].name, 'MD5');
});
