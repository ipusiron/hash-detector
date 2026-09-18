'use strict';

// Pure format matching shared by classic browser scripts and Node.js tests.
// Mode reference: https://hashcat.net/wiki/doku.php?id=example_hashes (2026-09-18)
(function () {
  const PATTERNS_HEX = {
    8: [
      { name: 'CRC32', hashcat: 11500, note: 'hashcatには<crc32>:00000000のようにsalt欄を付けて渡します。' },
      { name: 'Adler-32', hashcat: null, note: '公式例ハッシュ一覧で専用モードを確認できていません。' }
    ],
    16: [
      { name: 'MySQL 3.x', hashcat: 200, note: 'MySQL323の形式です。' },
      { name: 'LM の半分', hashcat: 3000, note: 'LMの8バイト分です。hashcatは16文字ずつ扱います。' }
    ],
    32: [
      { name: 'MD5', hashcat: 0, note: 'NTLM・MD4・LMなどと形式だけでは区別できません。' },
      { name: 'NTLM', hashcat: 1000, note: '大文字・小文字の違いではMD5などと区別できません。' },
      { name: 'MD4', hashcat: 900, note: 'MD5・NTLMなどと同じ長さです。' },
      { name: 'LM', hashcat: 3000, note: '16文字ずつの2つの連結です。hashcatには分割して渡します。大文字表記は慣習です。' }
    ],
    40: [
      { name: 'SHA-1', hashcat: 100, note: '160ビットの16進表記です。' },
      { name: 'RIPEMD-160', hashcat: 6000, note: 'SHA-1と同じ長さです。' }
    ],
    56: [
      { name: 'SHA-224', hashcat: 1300, note: 'SHA-2系列の224ビット出力です。' },
      { name: 'SHA3-224', hashcat: 17300, note: 'SHA-224と同じ長さです。' }
    ],
    64: [
      { name: 'SHA-256', hashcat: 1400, note: 'SHA-2系列の256ビット出力です。' },
      { name: 'SHA3-256', hashcat: 17400, note: 'SHA-256と同じ長さです。' },
      { name: 'Keccak-256', hashcat: 17800, note: 'SHA3-256とは別のアルゴリズムです。' },
      { name: 'BLAKE2s-256', hashcat: 31000, note: 'hashcatには$BLAKE2$を付けて渡します。公式一覧ではベータ／未リリースの注記あり。使用するバージョンの対応を確認してください。' }
    ],
    96: [
      { name: 'SHA-384', hashcat: 10800, note: 'SHA-2系列の384ビット出力です。' },
      { name: 'SHA3-384', hashcat: 17500, note: 'SHA-384と同じ長さです。' }
    ],
    128: [
      { name: 'SHA-512', hashcat: 1700, note: 'SHA-2系列の512ビット出力です。' },
      { name: 'SHA3-512', hashcat: 17600, note: 'SHA-512と同じ長さです。' },
      { name: 'Keccak-512', hashcat: 18000, note: 'SHA3-512とは別のアルゴリズムです。公式のモード番号は18000です（17900はKeccak-384）。' },
      { name: 'Whirlpool', hashcat: 6100, note: '512ビットの16進表記です。' },
      { name: 'BLAKE2b-512', hashcat: 600, note: 'hashcatには先頭に$BLAKE2$を付けて渡します。' }
    ]
  };

  const PATTERNS_PREFIX = [
    { name: 'MySQL 4.1+', regex: /^\*[0-9a-f]{40}$/i, hashcat: 300, note: 'hashcatには先頭の*を除いて渡します。' },
    { name: 'md5crypt', regex: /^\$1\$[./0-9A-Za-z]{1,8}\$[./0-9A-Za-z]{22}$/, hashcat: 500, note: '$1$で始まるsalt付きの形式です。' },
    { name: 'Apache apr1', regex: /^\$apr1\$[./0-9A-Za-z]{1,8}\$[./0-9A-Za-z]{22}$/, hashcat: 1600, note: 'Apacheの$apr1$形式です。' },
    { name: 'sha256crypt', regex: /^\$5\$(rounds=\d+\$)?[./0-9A-Za-z]{1,16}\$[./0-9A-Za-z]{43}$/, hashcat: 7400, note: '$5$形式です。rounds指定は省略できます。' },
    { name: 'sha512crypt', regex: /^\$6\$(rounds=\d+\$)?[./0-9A-Za-z]{1,16}\$[./0-9A-Za-z]{86}$/, hashcat: 1800, note: '$6$形式です。rounds指定は省略できます。' },
    { name: 'bcrypt', regex: /^\$2[abxy]?\$\d{2}\$[./A-Za-z0-9]{53}$/, hashcat: 3200, note: '$2$・$2a$・$2b$・$2x$・$2y$の形式です。コスト値の妥当性までは検証しません。' },
    { name: 'phpass', regex: /^\$[PH]\$[./0-9A-Za-z]{31}$/, hashcat: 400, note: 'WordPress・phpBBなどで使われる$P$／$H$形式です。' },
    { name: 'Django PBKDF2-SHA256', regex: /^pbkdf2_sha256\$\d+\$[^$]+\$[A-Za-z0-9+/]+=*$/, hashcat: 10000, note: 'DjangoのPBKDF2-SHA256形式です。' },
    { name: 'BLAKE2b-512', regex: /^\$BLAKE2\$[0-9a-f]{128}$/i, hashcat: 600, note: 'hashcatの$BLAKE2$付き512ビット形式です。' },
    { name: 'scrypt', regex: /^SCRYPT:\d+:\d+:\d+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/, hashcat: 8900, note: 'hashcatのSCRYPT形式です。パラメーターやBase64の内容までは検証しません。' },
    { name: 'LDAP {SHA}', regex: /^\{SHA\}[A-Za-z0-9+/]{27}=$/, hashcat: 101, note: 'LDAPのBase64表記のSHA-1形式です。' },
    { name: 'LDAP {SSHA}', regex: /^\{SSHA\}[A-Za-z0-9+/]+=*$/, hashcat: 111, note: 'LDAPのsalt付きSHA-1形式です。Base64の内容までは検証しません。' },
    { name: 'Argon2', regex: /^\$argon2(id|i|d)\$/, hashcat: 34000, note: '接頭辞のみの判定です。残りの構文・パラメーターは未検証です。使用するhashcatのバージョンの対応を確認してください。' },
    { name: 'yescrypt', regex: /^\$y\$/, hashcat: null, note: '接頭辞のみの判定です。$y$形式の専用モードは公式一覧で確認できていません。scryptのブリッジモードとは区別してください。' }
  ];

  function candidate({ name, hashcat, note }) {
    return { name, hashcat, note };
  }

  function identify(input) {
    const normalized = input.trim();
    const prefix = PATTERNS_PREFIX.find(pattern => pattern.regex.test(normalized));
    if (prefix) {
      return {
        input: normalized, kind: 'prefix', hexLength: null,
        candidates: [candidate(prefix)], caveat: '接頭辞の形式から判別しました'
      };
    }
    if (/^[0-9a-f]+$/i.test(normalized)) {
      const hexLength = normalized.length;
      return {
        input: normalized, kind: 'hex', hexLength,
        candidates: (PATTERNS_HEX[hexLength] || []).map(candidate),
        caveat: `形式（16進 ${hexLength} 文字）だけからの推定です。同じ長さのハッシュは他にもあり、アルゴリズムは断定できません。大文字・小文字の違いは表記の慣習で、判定材料にはなりません`
      };
    }
    return {
      input: normalized, kind: 'none', hexLength: null,
      candidates: [], caveat: '対応している形式に一致しませんでした'
    };
  }

  const HashIdentifier = { identify, PATTERNS_HEX, PATTERNS_PREFIX };
  globalThis.HashIdentifier = HashIdentifier;
  if (typeof module === 'object' && module.exports) module.exports = HashIdentifier;
}());
