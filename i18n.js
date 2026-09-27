'use strict';

// 日本語と英語のメッセージ。画面と判定モジュールは言語ごとの文字列を持たない。
const I18n = (() => {
  const ja = {
    'app.title': 'ハッシュ識別ツール',
    'app.description': 'ハッシュ値の形式からアルゴリズムの候補を推定するクライアントサイドのツール',
    'app.heading': '🔍 ハッシュ識別ツール',
    'app.intro': '入力されたハッシュ値の形式から、アルゴリズムの候補とhashcatのモード番号を表示します。同じ長さの16進文字列から1つに断定はできません。',
    'app.langButton': 'English',
    'app.langAria': '言語を切り替える',

    'input.label': 'ハッシュ値を入力:',
    'input.placeholder': 'ハッシュ値を入力してください',

    'samples.heading': '🧪 テスト用ハッシュ一覧',
    'samples.intro': 'ボタンを押すと入力できます。サンプルの平文はすべて「hashcat」です。',
    'samples.ntlm': 'NTLM（形式は MD5 と同じ）',

    'result.heading': '候補（可能性の高い順）',
    'result.confidencePrefix': '確度：高（接頭辞の形式）',
    'result.confidenceHex': '確度：形式のみ',
    'result.orderNote': '候補順は対応表の掲載順であり、確率を計算したものではありません。',
    'result.mode': 'hashcatモード：{mode}',
    'result.modeUnknown': '—（要確認）',
    'result.unsupportedLength': '16進 {length} 文字ですが、対応表にない長さです。',
    'text.sentenceJoin': '',

    'copy.command': 'コマンドをコピー',
    'copy.commandAria': 'hashcat コマンドをコピー: {name}',
    'copy.hash': '📋 ハッシュをコピー',
    'copy.hashAria': 'ハッシュをコピー',
    'copy.done': 'コピーしました',
    'copy.failed': 'コピーに失敗しました',

    'link.crackstation': '🔗 CrackStation を開く',
    'link.hashcatExamples': '🔗 hashcat の例ハッシュ一覧',

    'algo.lmHalf': 'LM の半分',

    'caveat.prefix': '接頭辞の形式から判別しました',
    'caveat.hex': '形式（16進 {length} 文字）だけからの推定です。同じ長さのハッシュは他にもあり、アルゴリズムは断定できません。大文字・小文字の違いは表記の慣習で、判定材料にはなりません',
    'caveat.none': '対応している形式に一致しませんでした',

    'note.crc32': 'hashcatには<crc32>:00000000のようにsalt欄を付けて渡します。',
    'note.adler32': '公式例ハッシュ一覧で専用モードを確認できていません。',
    'note.mysql323': 'MySQL323の形式です。',
    'note.lmHalf': 'LMの8バイト分です。hashcatは16文字ずつ扱います。',
    'note.md5': 'NTLM・MD4・LMなどと形式だけでは区別できません。',
    'note.ntlm': '大文字・小文字の違いではMD5などと区別できません。',
    'note.md4': 'MD5・NTLMなどと同じ長さです。',
    'note.lm': '16文字ずつの2つの連結です。hashcatには分割して渡します。大文字表記は慣習です。',
    'note.sha1': '160ビットの16進表記です。',
    'note.ripemd160': 'SHA-1と同じ長さです。',
    'note.sha224': 'SHA-2系列の224ビット出力です。',
    'note.sha3_224': 'SHA-224と同じ長さです。',
    'note.sha256': 'SHA-2系列の256ビット出力です。',
    'note.sha3_256': 'SHA-256と同じ長さです。',
    'note.keccak256': 'SHA3-256とは別のアルゴリズムです。',
    'note.blake2s256': 'hashcatには$BLAKE2$を付けて渡します。公式一覧ではベータ／未リリースの注記あり。使用するバージョンの対応を確認してください。',
    'note.sha384': 'SHA-2系列の384ビット出力です。',
    'note.sha3_384': 'SHA-384と同じ長さです。',
    'note.sha512': 'SHA-2系列の512ビット出力です。',
    'note.sha3_512': 'SHA-512と同じ長さです。',
    'note.keccak512': 'SHA3-512とは別のアルゴリズムです。公式のモード番号は18000です（17900はKeccak-384）。',
    'note.whirlpool': '512ビットの16進表記です。',
    'note.blake2b512hex': 'hashcatには先頭に$BLAKE2$を付けて渡します。',
    'note.mysql41': 'hashcatには先頭の*を除いて渡します。',
    'note.md5crypt': '$1$で始まるsalt付きの形式です。',
    'note.apr1': 'Apacheの$apr1$形式です。',
    'note.sha256crypt': '$5$形式です。rounds指定は省略できます。',
    'note.sha512crypt': '$6$形式です。rounds指定は省略できます。',
    'note.bcrypt': '$2$・$2a$・$2b$・$2x$・$2y$の形式です。コスト値の妥当性までは検証しません。',
    'note.phpass': 'WordPress・phpBBなどで使われる$P$／$H$形式です。',
    'note.djangoPbkdf2': 'DjangoのPBKDF2-SHA256形式です。',
    'note.blake2b512prefix': 'hashcatの$BLAKE2$付き512ビット形式です。',
    'note.scrypt': 'hashcatのSCRYPT形式です。パラメーターやBase64の内容までは検証しません。',
    'note.ldapSha': 'LDAPのBase64表記のSHA-1形式です。',
    'note.ldapSsha': 'LDAPのsalt付きSHA-1形式です。Base64の内容までは検証しません。',
    'note.argon2': '接頭辞のみの判定です。残りの構文・パラメーターは未検証です。使用するhashcatのバージョンの対応を確認してください。',
    'note.yescrypt': '接頭辞のみの判定です。$y$形式の専用モードは公式一覧で確認できていません。scryptのブリッジモードとは区別してください。'
  };

  const en = {
    'app.title': 'Hash Identifier',
    'app.description': 'A client-side tool that infers likely hash algorithms from the format of a hash value',
    'app.heading': '🔍 Hash Identifier',
    'app.intro': 'Enter a hash value and this tool lists the algorithms that match its format, together with the matching hashcat mode numbers. Hex strings of the same length cannot be narrowed down to a single algorithm.',
    'app.langButton': '日本語',
    'app.langAria': 'Switch language',

    'input.label': 'Hash value:',
    'input.placeholder': 'Enter a hash value',

    'samples.heading': '🧪 Sample hashes',
    'samples.intro': 'Press a button to load the value into the input field. Every sample is a hash of the word "hashcat".',
    'samples.ntlm': 'NTLM (same format as MD5)',

    'result.heading': 'Candidates (most likely first)',
    'result.confidencePrefix': 'Confidence: high (recognised by prefix)',
    'result.confidenceHex': 'Confidence: format only',
    'result.orderNote': 'Candidates follow the order of the reference table. The order is not a calculated probability.',
    'result.mode': 'hashcat mode: {mode}',
    'result.modeUnknown': '— (unconfirmed)',
    'result.unsupportedLength': 'This is {length} hex characters, a length that is not in the reference table.',
    'text.sentenceJoin': ' ',

    'copy.command': 'Copy command',
    'copy.commandAria': 'Copy hashcat command: {name}',
    'copy.hash': '📋 Copy hash',
    'copy.hashAria': 'Copy hash',
    'copy.done': 'Copied',
    'copy.failed': 'Copy failed',

    'link.crackstation': '🔗 Open CrackStation',
    'link.hashcatExamples': '🔗 hashcat example hashes',

    'algo.lmHalf': 'Half of an LM hash',

    'caveat.prefix': 'Identified from the prefix of the value',
    'caveat.hex': 'This is a guess from the format alone ({length} hex characters). Other hashes share the same length, so the algorithm cannot be settled. Upper and lower case are a matter of convention and carry no information.',
    'caveat.none': 'No supported format matched this value',

    'note.crc32': 'hashcat expects a salt field, as in <crc32>:00000000.',
    'note.adler32': 'No dedicated mode was found in the official example-hash list.',
    'note.mysql323': 'The MySQL323 format.',
    'note.lmHalf': 'Half of an LM hash (8 bytes). hashcat processes LM in 16-character halves.',
    'note.md5': 'The format alone cannot separate this from NTLM, MD4 or LM.',
    'note.ntlm': 'Letter case does not separate this from MD5 and friends.',
    'note.md4': 'Same length as MD5 and NTLM.',
    'note.lm': 'Two 16-character halves joined together. Split them before passing them to hashcat. Upper case is only a convention.',
    'note.sha1': '160 bits written in hex.',
    'note.ripemd160': 'Same length as SHA-1.',
    'note.sha224': 'The 224-bit output of the SHA-2 family.',
    'note.sha3_224': 'Same length as SHA-224.',
    'note.sha256': 'The 256-bit output of the SHA-2 family.',
    'note.sha3_256': 'Same length as SHA-256.',
    'note.keccak256': 'A different algorithm from SHA3-256.',
    'note.blake2s256': 'hashcat expects a $BLAKE2$ prefix. The official list marks this mode as beta or unreleased, so check the version you use.',
    'note.sha384': 'The 384-bit output of the SHA-2 family.',
    'note.sha3_384': 'Same length as SHA-384.',
    'note.sha512': 'The 512-bit output of the SHA-2 family.',
    'note.sha3_512': 'Same length as SHA-512.',
    'note.keccak512': 'A different algorithm from SHA3-512. The official mode number is 18000 (17900 is Keccak-384).',
    'note.whirlpool': '512 bits written in hex.',
    'note.blake2b512hex': 'hashcat expects a $BLAKE2$ prefix in front of the value.',
    'note.mysql41': 'Strip the leading * before passing the value to hashcat.',
    'note.md5crypt': 'A salted format that starts with $1$.',
    'note.apr1': "Apache's $apr1$ format.",
    'note.sha256crypt': 'The $5$ format. The rounds field is optional.',
    'note.sha512crypt': 'The $6$ format. The rounds field is optional.',
    'note.bcrypt': 'One of $2$, $2a$, $2b$, $2x$ or $2y$. The cost value itself is not validated.',
    'note.phpass': 'The $P$ / $H$ format used by WordPress, phpBB and others.',
    'note.djangoPbkdf2': "Django's PBKDF2-SHA256 format.",
    'note.blake2b512prefix': "hashcat's 512-bit format with the $BLAKE2$ prefix.",
    'note.scrypt': "hashcat's SCRYPT format. Neither the parameters nor the Base64 payload is validated.",
    'note.ldapSha': 'The Base64 SHA-1 format used by LDAP.',
    'note.ldapSsha': 'The salted SHA-1 format used by LDAP. The Base64 payload is not validated.',
    'note.argon2': 'Recognised by prefix only. The rest of the syntax and the parameters are not validated. Check what the hashcat version you use supports.',
    'note.yescrypt': 'Recognised by prefix only. No dedicated mode for the $y$ format was found in the official list. Do not confuse it with the bridged scrypt mode.'
  };

  let language = 'ja';
  const STORAGE_KEY = 'hash-detector-language';

  function t(key, values = {}) {
    const dict = language === 'en' ? en : ja;
    const message = dict[key];
    if (typeof message !== 'string') throw new Error('Unknown message: ' + key);
    return message.replace(/\{(\w+)\}/g, (m, name) => (Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : m));
  }

  function apply(root = document) {
    document.documentElement.lang = language;
    document.title = t('app.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('app.description'));
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    for (const attr of ['aria-label', 'title', 'placeholder']) {
      root.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) => el.setAttribute(attr, t(el.getAttribute(`data-i18n-${attr}`))));
    }
  }

  function setLanguage(value) {
    if (!['ja', 'en'].includes(value)) return;
    language = value;
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ストレージが使えない環境では記憶しない */ }
    apply();
    document.dispatchEvent(new Event('languagechange'));
  }

  function init() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ストレージが使えない環境では既定に従う */ }
    const query = new URLSearchParams(location.search).get('lang');
    language = [query, saved].find((v) => v === 'ja' || v === 'en') || (/^ja\b/i.test(navigator.language || '') ? 'ja' : 'en');
    apply();
  }

  return { ja, en, t, apply, init, setLanguage, get language() { return language; } };
})();

if (typeof window !== 'undefined') window.I18n = I18n;
if (typeof module !== 'undefined' && module.exports) module.exports = I18n;
