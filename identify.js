'use strict';

// Pure format matching shared by classic browser scripts and Node.js tests.
// Mode reference: https://hashcat.net/wiki/doku.php?id=example_hashes (2026-09-18)
// The module holds no display text. `note`, `nameKey` and `caveat.key` are
// message keys that i18n.js resolves just before they are shown.
(function () {
  const PATTERNS_HEX = {
    8: [
      { name: 'CRC32', hashcat: 11500, note: 'note.crc32' },
      { name: 'Adler-32', hashcat: null, note: 'note.adler32' }
    ],
    16: [
      { name: 'MySQL 3.x', hashcat: 200, note: 'note.mysql323' },
      { name: 'LM の半分', nameKey: 'algo.lmHalf', hashcat: 3000, note: 'note.lmHalf' }
    ],
    32: [
      { name: 'MD5', hashcat: 0, note: 'note.md5' },
      { name: 'NTLM', hashcat: 1000, note: 'note.ntlm' },
      { name: 'MD4', hashcat: 900, note: 'note.md4' },
      { name: 'LM', hashcat: 3000, note: 'note.lm' }
    ],
    40: [
      { name: 'SHA-1', hashcat: 100, note: 'note.sha1' },
      { name: 'RIPEMD-160', hashcat: 6000, note: 'note.ripemd160' }
    ],
    56: [
      { name: 'SHA-224', hashcat: 1300, note: 'note.sha224' },
      { name: 'SHA3-224', hashcat: 17300, note: 'note.sha3_224' }
    ],
    64: [
      { name: 'SHA-256', hashcat: 1400, note: 'note.sha256' },
      { name: 'SHA3-256', hashcat: 17400, note: 'note.sha3_256' },
      { name: 'Keccak-256', hashcat: 17800, note: 'note.keccak256' },
      { name: 'BLAKE2s-256', hashcat: 31000, note: 'note.blake2s256' }
    ],
    96: [
      { name: 'SHA-384', hashcat: 10800, note: 'note.sha384' },
      { name: 'SHA3-384', hashcat: 17500, note: 'note.sha3_384' }
    ],
    128: [
      { name: 'SHA-512', hashcat: 1700, note: 'note.sha512' },
      { name: 'SHA3-512', hashcat: 17600, note: 'note.sha3_512' },
      { name: 'Keccak-512', hashcat: 18000, note: 'note.keccak512' },
      { name: 'Whirlpool', hashcat: 6100, note: 'note.whirlpool' },
      { name: 'BLAKE2b-512', hashcat: 600, note: 'note.blake2b512hex' }
    ]
  };

  const PATTERNS_PREFIX = [
    { name: 'MySQL 4.1+', regex: /^\*[0-9a-f]{40}$/i, hashcat: 300, note: 'note.mysql41' },
    { name: 'md5crypt', regex: /^\$1\$[./0-9A-Za-z]{1,8}\$[./0-9A-Za-z]{22}$/, hashcat: 500, note: 'note.md5crypt' },
    { name: 'Apache apr1', regex: /^\$apr1\$[./0-9A-Za-z]{1,8}\$[./0-9A-Za-z]{22}$/, hashcat: 1600, note: 'note.apr1' },
    { name: 'sha256crypt', regex: /^\$5\$(rounds=\d+\$)?[./0-9A-Za-z]{1,16}\$[./0-9A-Za-z]{43}$/, hashcat: 7400, note: 'note.sha256crypt' },
    { name: 'sha512crypt', regex: /^\$6\$(rounds=\d+\$)?[./0-9A-Za-z]{1,16}\$[./0-9A-Za-z]{86}$/, hashcat: 1800, note: 'note.sha512crypt' },
    { name: 'bcrypt', regex: /^\$2[abxy]?\$\d{2}\$[./A-Za-z0-9]{53}$/, hashcat: 3200, note: 'note.bcrypt' },
    { name: 'phpass', regex: /^\$[PH]\$[./0-9A-Za-z]{31}$/, hashcat: 400, note: 'note.phpass' },
    { name: 'Django PBKDF2-SHA256', regex: /^pbkdf2_sha256\$\d+\$[^$]+\$[A-Za-z0-9+/]+=*$/, hashcat: 10000, note: 'note.djangoPbkdf2' },
    { name: 'BLAKE2b-512', regex: /^\$BLAKE2\$[0-9a-f]{128}$/i, hashcat: 600, note: 'note.blake2b512prefix' },
    { name: 'scrypt', regex: /^SCRYPT:\d+:\d+:\d+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/, hashcat: 8900, note: 'note.scrypt' },
    { name: 'LDAP {SHA}', regex: /^\{SHA\}[A-Za-z0-9+/]{27}=$/, hashcat: 101, note: 'note.ldapSha' },
    { name: 'LDAP {SSHA}', regex: /^\{SSHA\}[A-Za-z0-9+/]+=*$/, hashcat: 111, note: 'note.ldapSsha' },
    { name: 'Argon2', regex: /^\$argon2(id|i|d)\$/, hashcat: 34000, note: 'note.argon2' },
    { name: 'yescrypt', regex: /^\$y\$/, hashcat: null, note: 'note.yescrypt' }
  ];

  function candidate({ name, nameKey = null, hashcat, note }) {
    return { name, nameKey, hashcat, note };
  }

  function identify(input) {
    const normalized = input.trim();
    const prefix = PATTERNS_PREFIX.find(pattern => pattern.regex.test(normalized));
    if (prefix) {
      return {
        input: normalized, kind: 'prefix', hexLength: null,
        candidates: [candidate(prefix)], caveat: { key: 'caveat.prefix', params: {} }
      };
    }
    if (/^[0-9a-f]+$/i.test(normalized)) {
      const hexLength = normalized.length;
      return {
        input: normalized, kind: 'hex', hexLength,
        candidates: (PATTERNS_HEX[hexLength] || []).map(candidate),
        caveat: { key: 'caveat.hex', params: { length: hexLength } }
      };
    }
    return {
      input: normalized, kind: 'none', hexLength: null,
      candidates: [], caveat: { key: 'caveat.none', params: {} }
    };
  }

  const HashIdentifier = { identify, PATTERNS_HEX, PATTERNS_PREFIX };
  globalThis.HashIdentifier = HashIdentifier;
  if (typeof module === 'object' && module.exports) module.exports = HashIdentifier;
}());
