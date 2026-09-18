# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side hash identifier tool that lists possible algorithms and hashcat modes from input format and length. It does not compute hashes, identify the generating system, send inputs, or persist them. No dependencies, build process, or runtime network requests beyond loading static assets.

## Architecture

- **Frontend-only**: Pure HTML/CSS/JavaScript with no backend dependencies
- **Single-page application**: UI in `index.html`, pure matching in `identify.js`, DOM handling in `script.js`
- **Pattern matching**: Recognizes prefix formats first, otherwise lists all candidates for the hex length
- **No external dependencies**: Self-contained application

## Key Components

- `index.html`: Main UI with input field, result display, and test hash examples
- `identify.js`: DOM-free classic script exposing `globalThis.HashIdentifier = { identify, PATTERNS_HEX, PATTERNS_PREFIX }`; also exported through CommonJS for Node.js tests
- `script.js`: DOM handling only; uses HashIdentifier.identify, createElement and textContent, sample button listeners, Clipboard API and visible status toasts
- `style.css`: Styling for the interface
- Test hashes are embedded in HTML for quick testing
- `package.json`: CommonJS (no type field), npm test runs node --test without dependencies
- `test/`: identify.test.js (vectors and mode/order assertions), readme.test.js (table parity), html.test.js (samples and HTML requirements)
- `.github/workflows/test.yml`: push and pull_request tests on Node.js 22

## Hash Detection Logic

`identify(input)` trims surrounding whitespace, preserves the remaining characters, and returns:

```text
{ input, kind: 'prefix' | 'hex' | 'none', hexLength, candidates: [{ name, hashcat, note }], caveat }
```

- `PATTERNS_PREFIX` is an ordered array of named regex patterns. A matching prefix format returns only its candidate, with confidence shown as 高. Argon2 and yescrypt are intentionally prefix-only matches; other patterns use the specified full-string regexes. Numeric ranges and decoded Base64 content are not validated.
- If no prefix matches, ASCII hex characters (case-insensitive) select the ordered array in `PATTERNS_HEX`, keyed by length: 8, 16, 32, 40, 56, 64, 96, 128. Confidence is 形式のみ. For example, 32 characters always lists MD5, NTLM, MD4, LM, in that order, regardless of letter case.
- `hexLength` is the number of hex characters for kind hex, otherwise null. Empty or invalid input returns kind none and an empty candidates array. Unsupported hex lengths remain kind hex with no candidates; the UI also reports the length.
- Candidate objects contain name, hashcat (integer or null), and note. Null is displayed as —（要確認）, with no command button. Mode 0 must not be treated as missing.
- Prefix caveat: 接頭辞の形式から判別しました
- Hex caveat: 形式（16進 n 文字）だけからの推定です。同じ長さのハッシュは他にもあり、アルゴリズムは断定できません。大文字・小文字の違いは表記の慣習で、判定材料にはなりません
- None caveat: 対応している形式に一致しませんでした

For the complete names, formats, modes and input conversion notes, see the **対応ハッシュ形式** table in [README.md](README.md). Tests enforce parity with both exported pattern tables and all ten HTML samples.
The official reference is https://hashcat.net/wiki/doku.php?id=example_hashes (checked 2026-09-18). LDAP modes 101/111, Argon2 34000 and BLAKE2s-256 31000 were confirmed there; BLAKE2s has a beta/not-yet-released marker. Keccak-512 is 18000, corrected with the user's approval; 17900 is Keccak-384. Adler-32 and $y$ yescrypt remain null because no dedicated matching mode was confirmed.

The display heading is 候補（可能性の高い順）, but a separate sentence explains that this is table order, not a calculated probability ranking. Copy commands use fixed numeric modes and placeholder filenames, never interpolate input into shell commands. Hash copying preserves the normalized input, so callers must apply each candidate's format notes themselves (MySQL *, LM halves, CRC32 salt, BLAKE2 prefix).

## Development Notes

- No build process or third-party packages; run `npm test` on Node.js 22+ (do not run npm install)
- Preserve direct file:// operation: identify.js and script.js must stay classic deferred scripts, in that order; do not convert to ES modules
- Also verify over HTTP: `python -m http.server 8000`, then open http://localhost:8000/
- Verify both HTTP and file:// for console errors and CSP violations; keep all scripts/styles external, and never add header-only frame-ancestors or X-Frame-Options to meta
- Result changes are polite and atomic; all samples and copy controls are native buttons, and copy success/failure uses one visible live status toast (no alert)
- Clipboard availability and permission failures must not stop identification; reduced-motion disables toast transitions
- Keep inputs at least 16px, buttons at least 44px high, hashes and commands wrapped at narrow widths
- GitHub Pages deployment ready (served from root)
- All text is in Japanese
- Real-time input validation via event listeners
