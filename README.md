<!--
---
id: day002
slug: hash-detector

title: "Hash Identifier"

subtitle_ja: "ハッシュ種別判定ツール"
subtitle_en: "Hash Algorithm Identification Tool"

description_ja: "入力されたハッシュ値の形式から、考えられるアルゴリズムの候補と hashcat のモード番号を表示するクライアントサイドツール"
description_en: "A client-side tool that displays possible hash algorithms and hashcat mode numbers based on the format of an input hash"

category_ja:
  - 現代暗号
  - ハッシュ関数
category_en:
  - Modern Cryptography
  - Hash Function

difficulty: 1

tags:
  - hash
  - md5
  - sha1
  - sha256
  - bcrypt
  - ntlm
  - hashcat
  - sha512
  - sha3
  - crypt

repo_url: "https://github.com/ipusiron/hash-detector"
demo_url: "https://ipusiron.github.io/hash-detector/"

hub: true
---
-->

# Hash Identifier - ハッシュ識別ツール

[English](README.en.md) · 日本語

![GitHub Repo stars](https://img.shields.io/github/stars/ipusiron/hash-detector?style=social)
![GitHub forks](https://img.shields.io/github/forks/ipusiron/hash-detector?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/ipusiron/hash-detector)
![GitHub license](https://img.shields.io/github/license/ipusiron/hash-detector)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://ipusiron.github.io/hash-detector/)

**Day002 - 生成AIで作るセキュリティツール100**

このツールは、入力されたハッシュ値の形式と長さから、考えられるアルゴリズムの候補を列挙します。
候補ごとのhashcatのモード番号とコマンド例を表示する、ブラウザー内で動作する軽量なWebアプリです。

---

## 🌐 デモページ

👉 [https://ipusiron.github.io/hash-detector/](https://ipusiron.github.io/hash-detector/)

---

## 📸 スクリーンショット

> ![32文字の16進ハッシュに対してMD5・NTLM・MD4・LMの4候補を表示した画面](screen_sample.png)
>
> *32文字の16進ハッシュ：MD5・NTLM・MD4・LMを候補として表示。形式だけではアルゴリズムを断定できない例*

> ![接頭辞からbcrypt形式を識別し、hashcatモード3200を表示した画面](screen_bcrypt.png)
>
> *bcrypt形式のハッシュ：接頭辞から識別し、hashcatモード3200を表示*

---

## ✨ 対応ハッシュ形式

16進のみの文字列は長さで候補を列挙するため、1つに断定はしません。
モード番号は[hashcat公式の例ハッシュ一覧](https://hashcat.net/wiki/doku.php?id=example_hashes)で確認しています（2026年9月18日確認）。

| アルゴリズム | 見分け方（長さ・接頭辞） | hashcat モード | 備考 |
|--------------|------------------------|----------------|------|
| CRC32 | 16進8文字 | 11500 | hashcatには`<crc32>:00000000`のようにsalt欄を付ける |
| Adler-32 | 16進8文字 | — | 専用モードは公式一覧で未確認 |
| MySQL 3.x | 16進16文字 | 200 | MySQL323 |
| LM の半分 | 16進16文字 | 3000 | LMの8バイト分。hashcatは16文字ずつ処理 |
| MD5 | 16進32文字 | 0 | NTLM・MD4・LMと同じ長さ |
| NTLM | 16進32文字 | 1000 | 大文字・小文字ではMD5などと区別不可 |
| MD4 | 16進32文字 | 900 | MD5・NTLMなどと同じ長さ |
| LM | 16進32文字 | 3000 | 16文字ずつに分割してhashcatへ渡す。大文字表記は慣習 |
| SHA-1 | 16進40文字 | 100 | 160ビット出力 |
| RIPEMD-160 | 16進40文字 | 6000 | SHA-1と同じ長さ |
| SHA-224 | 16進56文字 | 1300 | SHA-2系列 |
| SHA3-224 | 16進56文字 | 17300 | SHA-224と同じ長さ |
| SHA-256 | 16進64文字 | 1400 | SHA-2系列 |
| SHA3-256 | 16進64文字 | 17400 | SHA-256と同じ長さ |
| Keccak-256 | 16進64文字 | 17800 | SHA3-256とは別のアルゴリズム |
| BLAKE2s-256 | 16進64文字 | 31000 | hashcatには`$BLAKE2$`を付加。公式一覧ではベータ／未リリースの注記あり |
| SHA-384 | 16進96文字 | 10800 | SHA-2系列 |
| SHA3-384 | 16進96文字 | 17500 | SHA-384と同じ長さ |
| SHA-512 | 16進128文字 | 1700 | SHA-2系列 |
| SHA3-512 | 16進128文字 | 17600 | SHA-512と同じ長さ |
| Keccak-512 | 16進128文字 | 18000 | 17900はKeccak-384のモードであり別物 |
| Whirlpool | 16進128文字 | 6100 | 512ビット出力 |
| BLAKE2b-512 | 16進128文字、または`$BLAKE2$`＋16進128文字 | 600 | 接頭辞なしの場合は`$BLAKE2$`を付けてhashcatへ渡す |
| MySQL 4.1+ | `*`＋16進40文字 | 300 | hashcatには先頭の`*`を除いて渡す |
| md5crypt | `$1$`＋salt＋22文字のハッシュ部分 | 500 | saltは1〜8文字 |
| Apache apr1 | `$apr1$`＋salt＋22文字のハッシュ部分 | 1600 | saltは1〜8文字 |
| sha256crypt | `$5$`＋salt＋43文字のハッシュ部分 | 7400 | saltは1〜16文字。`rounds=数値$`は省略可 |
| sha512crypt | `$6$`＋salt＋86文字のハッシュ部分 | 1800 | saltは1〜16文字。`rounds=数値$`は省略可 |
| bcrypt | `$2$`・`$2a$`・`$2b$`・`$2x$`・`$2y$` | 3200 | 2桁のコスト＋`$`＋53文字 |
| phpass | `$P$`または`$H$`＋31文字 | 400 | WordPress・phpBBなど |
| Django PBKDF2-SHA256 | `pbkdf2_sha256$` | 10000 | 反復数・salt・Base64文字列を含む形式 |
| scrypt | `SCRYPT:` | 8900 | 3個の数値パラメーター・salt・ハッシュ部分 |
| LDAP {SHA} | `{SHA}`＋Base64の27文字＋`=` | 101 | LDAPのSHA-1形式 |
| LDAP {SSHA} | `{SSHA}`＋Base64文字列 | 111 | salt付きSHA-1形式 |
| Argon2 | `$argon2id$`・`$argon2i$`・`$argon2d$` | 34000 | 接頭辞のみの判定。使用バージョンの対応を要確認 |
| yescrypt | `$y$` | — | 接頭辞のみの判定。専用モードは公式一覧で未確認 |

「—」は画面では「—（要確認）」と表示します。Adler-32とyescryptの専用モードを確認できなかったためで、非対応と断定する意味ではありません。
公式一覧の「scrypt [Bridged: Scrypt-Yescrypt]」は`SCRYPT:`形式なので、`$y$`形式のyescryptには割り当てていません。

---

## 📖 使い方

1. 上記のデモページにアクセス
2. ハッシュ値を入力すると同時に、候補・hashcatモード・注意点を表示
3. テスト用ハッシュのボタンを押して、候補の表示を確認
4. 「コマンドをコピー」または「ハッシュをコピー」で必要な文字列をコピー
5. 右上のボタンで日本語と英語を切り替え

前後の空白は除去しますが、大文字・小文字は変更しません。
モードが未確認の候補にはコマンドを表示しません。
コマンド例の`hash.txt`と`wordlist.txt`は、自分で用意するファイルです。ハッシュのコピーは入力値をそのままコピーするため、MySQL・LM・CRC32・BLAKE2の入力形式は候補の注意点に従って調整してください。
コピー結果は数秒間トーストで表示します。Clipboard APIを利用できない環境では「コピーに失敗しました」と表示し、判定は続けて利用できます。

画面の言語は右上のボタンで日本語と英語を切り替えられます。初回は`?lang=ja`・`?lang=en`のクエリ、次にブラウザーの言語設定を見て決めます。選んだ言語はlocalStorageに保存し、次回以降も引き継ぎます。入力中や判定の表示中に切り替えても、入力値と候補はそのまま残ります。

## 🔬 判定の仕組みと限界

最初に接頭辞付きのパターンを確認し、一致した場合はその形式だけを返します。
それ以外は16進のみの文字列かを確認し、長さに対応する候補を列挙します。未対応の長さの場合は文字数を表示します。
入力欄が空のときは何も表示しません（結果欄は読み上げ対象のため、入力前に「一致しませんでした」と読み上げないようにしています）。
確度は接頭辞付きでは「高」、16進のみでは「形式のみ」と表示しますが、生成元やハッシュ値の正当性を保証するものではありません。
「候補（可能性の高い順）」の掲載順は対応表の順序で、確率を計算した順位ではありません。

大文字・小文字はアルゴリズムを判定する材料にはなりません。LMに大文字表記の慣習があっても、32文字の16進入力だけではMD5・NTLM・MD4・LMを区別できません。
MySQL 4.1+の表示には先頭に`*`が付きますが、hashcatにはこれを除いて渡します。
LMの32文字は8バイトずつ、16文字のハッシュ2つに分かれます。hashcatのモード3000では16文字ずつ扱います。

Argon2とyescryptは接頭辞だけの検出で、残りの構文やパラメーターを検証しません。
ほかの接頭辞付き形式も指定の正規表現による形式確認であり、反復数の範囲やBase64のデコード結果までは検証しません。
`$BLAKE2$`＋64文字の形式は、このツールの接頭辞判定には含めていません。BLAKE2s-256は16進64文字の候補として表示します。
同じ形式を使う別のアルゴリズムや、一覧にない形式もあります。確実に知るには生成元の仕様を確認する必要があります。

## 🧪 テスト用ハッシュについて

画面の10件のサンプルとテストの既知ベクターは、[hashcat公式の例ハッシュ一覧](https://hashcat.net/wiki/doku.php?id=example_hashes)に基づきます。平文はすべて`hashcat`です。
MySQL 4.1+のサンプルは公式例に`*`を付けて大文字表記にし、CRC32のベクターは公式例のsalt欄を除いた先頭8文字を使います。
MD5・SHA-1・SHA-2系列・SHA-3系列・RIPEMD-160の11種類は、テストでNode.js標準の`node:crypto`でも計算して照合します。ブラウザー側にはハッシュ計算機能を追加していません。

## 🧪 テスト

Node.js 22以上で、次のコマンドを実行します。依存パッケージはなく、`npm install`は不要です。

```bash
npm test
```

Node.js標準の`node --test`で、既知ベクター、候補の順序、接頭辞、空入力、未対応形式などを検証します。
日本語・英語の辞書についても、キーの集合の一致、差し込みの整合、HTMLとスクリプトが指すキーの実在、英語辞書への和文の混入、状態の判定を文言の一致で行っていないことを検証します。
READMEの対応表とコードの名前・モード番号、画面の10件のサンプルと候補もテストで照合します。
GitHub Actionsでもpushとpull_requestのたびにNode.js 22で自動実行します。

---

## 🎯 ユースケース

### このツールならではの使い方

- 長さだけでは種類が1つに決まらないことを確かめる（符号・ハッシュの授業）：32桁の16進の文字列を入れると、MD5・NTLM・MD4・LMの4つが候補に挙がる。64桁ならSHA-256・SHA3-256・Keccak-256・BLAKE2s-256の4つになる。長さが同じハッシュは複数あるので、長さだけでは種類を1つに絞れないことを、候補の数で確かめられる
- 接頭辞があると1つに絞れることを確かめる（書式の授業）：`$2b$`で始まる60文字の文字列は、接頭辞からbcryptだと一意に決まる。長さではなく、決まった書式の目印（接頭辞）があると候補が1つになることを確かめられる
- 見分けと解読は別だと確かめる（解析の授業）：候補ごとに、解読ツールhashcatのモード番号が出る（MD5は0、NTLMは1000、MD4は900）。これは「解読するならこの番号を使う」という手がかりであって、種類を見分けること自体は解読ではない。見分け（分類）と解読（元に戻す）は別の作業だと示せる

### 一般的な使い方

- CTFや調べもので、正体の分からないハッシュらしい文字列の種類に当たりを付ける
- ログやデータベースに紛れたハッシュ値の形式を見分ける教材にする
- 自分のサービスが保存しているハッシュの形式を確かめ、弱い方式を使っていないか点検する入口にする

## 🔒 セキュリティ・プライバシー

このツールは完全にクライアントサイドで動作し、入力データの送信・保存は行いません。
判定のための通信や外部APIへの照会はありません。HTTPで開いたときのHTML・JavaScript・CSSの読み込みと、利用者が選んだ外部リンクへの移動は別です。
入力値は入力欄と判定処理で扱いますが、CookieやWeb Storageへは保存しません。localStorageに保存するのは、選んだ表示言語（`hash-detector-language`）だけです。

CSPで読み込み元を制限し、インラインのイベントハンドラーやスタイルは使用しません。referrerは`no-referrer`に設定しています。
結果の組み立てには`createElement`と`textContent`を使用します。
ツール画面の外部リンクはCrackStationとhashcatの例ハッシュ一覧だけで、ハッシュをURLなどに付けて渡すことはありません。別タブのリンクには`noopener noreferrer`を付けています。
コピーにはClipboard APIを使うため、セキュアコンテキストとブラウザーの許可が必要です。HTTPS・localhost・file://でも、ブラウザーの対応や権限によって失敗する場合があります。
ブラウザー拡張や、外部サイトへ移動した後の操作までは本ツールで保護できません。

---

## 📁 ディレクトリー構造

```text
hash-detector/
├── .github/
│   └── workflows/
│       └── test.yml    # push・pull_request時の自動テスト
├── test/
│   ├── identify.test.js # 既知ベクター・候補・モード番号の検証
│   ├── i18n.test.js     # 辞書の対応・キーの実在・切り替えの配線の検証
│   ├── readme.test.js   # README対応表とコードの一致検証
│   └── html.test.js     # サンプル・CSP・アクセシビリティの検証
├── .gitignore          # Gitの追跡対象外設定
├── index.html          # 入力欄・結果・サンプルボタン
├── i18n.js             # 日本語・英語の辞書と切り替え
├── identify.js         # DOMに依存しない判定モジュール
├── script.js           # DOM操作・コピー・トースト通知
├── style.css           # モバイル表示・折り返し・フォーカス
├── package.json        # 依存なしのテストコマンド
├── screen_sample.png   # 32文字の16進ハッシュから4候補を表示した画面
├── screen_bcrypt.png   # 接頭辞からbcrypt形式を識別した画面
├── CLAUDE.md           # 構成・判定仕様・開発手順
├── README.md           # 本ドキュメント（日本語）
├── README.en.md        # 英語版ドキュメント
└── LICENSE             # MITライセンス
```

## 💻 動作環境

- モダンブラウザー（外部ライブラリー・ビルド不要）
- ローカル利用：`index.html`をfile://で直接開いて判定可能
- HTTPでの確認：リポジトリーのフォルダーで`python -m http.server 8000`を実行し、`http://localhost:8000/`へアクセス
- テスト：Node.js 22以上

---

## 📄 ライセンス

[MIT License](LICENSE)

---

## 👤 作者

- [@ipusiron](https://github.com/ipusiron)

---

## 🛠️ このツールについて

本ツールは、「生成AIで作るセキュリティツール100」プロジェクトの一環として開発されました。
このプロジェクトでは、AIの支援を活用しながら、セキュリティに関連するさまざまなツールを100日間にわたり制作・公開していく取り組みを行っています。

プロジェクトの詳細や他のツールについては、以下のページをご覧ください。

🔗 [https://akademeia.info/?page_id=42163](https://akademeia.info/?page_id=42163)
