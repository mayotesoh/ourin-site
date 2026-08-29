# 松山倫子さん サイト

**公開URL: https://nori-norico.com**
（リポジトリ: https://github.com/mayotesoh/ourin-site ／ `main` に push すると自動デプロイ）

松山倫子（まつやま のりこ）さんの自己紹介サイトです。
**「凰凛（おうりん）」は占い師としての活動名**で、サイトの主体は松山倫子さん本人です
（凰凛はトップと `/about` の専用ブロック・フッターにだけ登場します）。**3つの事業**（占いコミュニティ fortunelabo ／
テレアポ事業 ／ 営業代行事業）を紹介し、活動報告とお問い合わせをまとめています。
Astro で作った静的サイトで、**活動報告（ブログ）は Notion に書くだけ**でサイトに反映されます。
お問い合わせフォームは Google Apps Script（GAS）経由で **Notion のお問い合わせデータベース**に登録されます。

ページ構成： `/`（トップ） `/service`（事業内容一覧） `/service/community`・`/service/telemarketing`・
`/service/sales`（各事業の詳細） `/ourin`（占い師 凰凛） `/about`（プロフィール）
`/blog`（活動報告） `/contact`（お問い合わせ）

```
ourin-site/
├ src/
│  ├ consts.ts            ← ★SNSリンク・GASのURL・3事業の内容はここ
│  ├ pages/               ← 各ページ（/ , /service , /service/○○ , /ourin , /about , /blog , /contact）
│  ├ components/          ← SNSアイコン・Notion本文の表示
│  ├ layouts/Layout.astro ← ヘッダー・フッター・共通の設定
│  └ lib/notion.ts        ← Notion API との通信
├ public/images/            ← 写真と「凰凛」の書（背景・フッターに使用）
├ tools/mklogo.cjs        ← 書の画像を透過PNGに変換するスクリプト
└ .github/workflows/      ← GitHub Pages への自動デプロイ
```

---

## 1. まずやること（SNSリンクの登録）

`src/consts.ts` を開いて、`SNS_LINKS` の `url` を埋めるだけでヘッダー・フッター・
トップページのアイコンが自動的に表示されます（**空のままのSNSは表示されません**）。

```ts
export const SNS_LINKS: SnsLink[] = [
  { key: 'threads',   name: 'Threads',   url: 'https://www.threads.com/@n.calling0506' },
  { key: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/n.calling0506' },
  { key: 'facebook',  name: 'Facebook',  url: 'https://www.facebook.com/share/19MkXh9rrM/' },
];
```

X・YouTube は現在使っていないため掲載していません。使うようになったら
`{ key: 'x', name: 'X（旧Twitter）', url: '…' }` の行を足すだけで表示されます
（`key` に使えるのは `x` / `threads` / `instagram` / `youtube` / `facebook`）。

同じファイルで、サイトURL・メニュー内容・予約枠の時間なども変更できます。

---

## 2. Notion 連携（活動報告ブログ）

### 2-1. インテグレーションを作る
1. https://www.notion.so/my-integrations → 「新しいインテグレーション」を作成
2. 発行された **シークレット（`ntn_` で始まる文字列）** をメモ

### 2-2. 「活動報告」データベースを作る
Notion で以下のプロパティを持つデータベースを作成します（名前はこの通りに）。

| プロパティ名 | 種類 | 用途 |
| --- | --- | --- |
| タイトル | タイトル | 記事タイトル |
| 日付 | 日付 | 公開日（並び順に使用） |
| ステータス | ステータス or セレクト | `公開` のものだけサイトに出ます |
| カテゴリー | マルチセレクト | タグ・絞り込み |
| URLスラッグ | テキスト | URL（例：`event-2026-09`）。空ならページIDが使われます |
| アイキャッチ | ファイル または テキスト(URL) | 一覧・記事上部の画像。空でもOK |
| 概要 | テキスト | 一覧の説明文・SNSシェア時の説明（空なら本文冒頭を自動使用） |

作成したら、DBの右上「•••」→「接続」→ 2-1 で作ったインテグレーションを追加してください。
（これをしないと 404 になります）

**本文はNotionに普通に書くだけ**です。見出し・箇条書き・画像・引用・コールアウト・
YouTubeの埋め込み・トグル・コードに対応しています。

### 2-3. データベースIDの調べ方
NotionでDBを開いたときのURL：
`https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
の `xxxxxxxx...`（32桁）の部分がIDです。

### 2-4. .env を作る
`.env.example` をコピーして `.env` を作り、値を入れます（**.env は絶対にコミットしない**）。

```
NOTION_API_KEY=ntn_xxxxxxxxxxxx
NOTION_BLOG_ID=（活動報告DBのID）
NOTION_MENU_ID=（メニューDBのID・任意）
```

> 鍵を入れなくてもサイトはビルドできます（記事が0件になるだけ）。

---

## 3. お問い合わせ（公式LINE）

お問い合わせは**公式LINEのみ**で受け付けています（入力フォームは設置していません）。
窓口はご用件で2つに分かれており、URLは `src/consts.ts` で設定します。

```ts
export const LINE_BUSINESS_URL = 'https://lin.ee/xxxx'; // テレアポ・営業代行
export const LINE_FORTUNE_URL  = 'https://lin.ee/xxxx'; // 占い（コミュニティ・鑑定）
```

この2つを変えるだけで、`/contact`・各事業の詳細ページ・占い師ページ・トップのボタンすべてに反映されます。

> 以前はGAS経由でNotionに登録するフォームを用意していましたが、2026-08-29に廃止しました。
> 復活させたい場合は、Gitの履歴から `gas/Contact.gs` と旧 `src/pages/contact.astro` を戻せます。

## 4. ローカルで動かす

```bash
npm install      # 最初の1回だけ
npm run dev      # http://localhost:4321 で確認
npm run build    # dist/ に本番用ファイルを生成
npm run preview  # ビルド結果を確認
```

---

## 5. 公開（GitHub Pages）

1. GitHub に新しいリポジトリを作成し push（**.env は含めない**）
2. リポジトリの Settings → Pages → Source を **GitHub Actions** に
3. Settings → Secrets and variables → Actions に登録
   - `NOTION_API_KEY`
   - `NOTION_BLOG_ID`
   - `NOTION_MENU_ID`（使う場合のみ）
4. `main` に push すると自動でビルド＆公開されます
5. 公開URLは https://nori-norico.com （独自ドメイン設定済み）

### 独自ドメインの設定（設定済みの内容）
- `astro.config.mjs`：`site: 'https://nori-norico.com'` / `base: '/'`
- `public/CNAME`：`nori-norico.com`
- Xserver（ドメイン管理側）のDNSレコード：

| 種別 | ホスト名 | 値 |
| --- | --- | --- |
| A | （空欄／@） | 185.199.108.153 |
| A | （空欄／@） | 185.199.109.153 |
| A | （空欄／@） | 185.199.110.153 |
| A | （空欄／@） | 185.199.111.153 |
| CNAME | www | mayotesoh.github.io |

DNSが反映されると、GitHub側で自動的に証明書（HTTPS）が発行されます（数分〜最大24時間）。

Notionを更新したときは、GitHub Actions が **毎日 07:00（日本時間）に再ビルド**します。
すぐ反映したいときは Actions タブから「Deploy to GitHub Pages」を手動実行してください。

独自ドメインを使う場合は `public/CNAME` にドメイン名だけを書いたファイルを置きます。

---

## 6. よく編集する場所

| やりたいこと | 編集する場所 |
| --- | --- |
| SNSのリンクを追加・変更 | `src/consts.ts` の `SNS_LINKS` |
| 表示名・占い師名 | `src/consts.ts` の `SITE_TITLE` / `FORTUNE_NAME` |
| プロフィール文・経歴 | `src/pages/about.astro` の冒頭 |
| 3事業の説明・特徴・対象者 | `src/consts.ts` の `SERVICES`（トップ・一覧・詳細ページすべてに反映） |
| 各事業の詳細ページの中身 | `src/consts.ts` の `SERVICES` の `blocks` / `flow` / `faq` / `voices`（→ 8章） |
| 占い師ページの中身 | `src/consts.ts` の `OURIN`（→ 8章） |
| キャッチコピー・ヒーロー文 | `src/pages/index.astro` の冒頭 |
| 公式LINEのURL | `src/consts.ts` の `LINE_BUSINESS_URL` / `LINE_FORTUNE_URL` |
| 色・フォント | `src/styles/global.css` の `:root`（エメラルドグリーンテーマの色をここで一括管理） |
| プロフィール写真 | `public/images/ourin.jpg` を差し替え |
| 背景の書の濃さ | トップは `src/pages/index.astro` の `.hero-mark` の `opacity`、他ページは `src/styles/global.css` の `body::after` |

---

## 7. 「凰凛」の書について

原本 `..\凰凛.png`（白背景・黒墨）を、透過PNGに変換して使っています。

- `public/images/ourin-logo-ink.png` … 墨（黒）の書 ← **現在使用中**
  （トップと `/about` の「占い師としての名前」ブロック、フッターの占い師名の横）
  ※サイトの主体は松山倫子さんなので、書は「凰凛」に触れている箇所だけに使っています
- `public/images/ourin-logo-gold.png` … 金色の書（予備・ダーク配色にする場合用）
- `public/images/ourin-logo-white.png` … 白の書（予備）

書の画像を差し替えたいときは、新しい画像を用意して次のコマンドを実行してください。

```bash
node tools/mklogo.cjs "../凰凛.png" "public/images"
```

（余白を自動でトリミングし、墨の部分だけを残した透過PNGを生成します）

---

## 8. 詳細ページに内容を足す

3事業と占い師（凰凛）には、それぞれ詳細ページがあります。

| ページ | URL | 原稿の置き場所 |
| --- | --- | --- |
| 事業一覧 | `/service` | `src/consts.ts` の `SERVICES` |
| 占いコミュニティ | `/service/community` | `SERVICES` の `id: 'community'` |
| テレアポ事業 | `/service/telemarketing` | `SERVICES` の `id: 'telemarketing'` |
| 営業代行事業 | `/service/sales` | `SERVICES` の `id: 'sales'` |
| 占い師 凰凛 | `/ourin` | `src/consts.ts` の `OURIN` |

**内容の足し方**：`src/consts.ts` の該当箇所に書き足すだけです。
空（`[]`）の項目はページに表示されないので、書いた分だけ増えていきます。

```ts
// 例：占いコミュニティの詳細ページに中身を足す
blocks: [
  {
    title: '定例会について',
    body: ['昼・夜の2部制でオンライン開催しています。'],
    list: ['占いロープレ', 'スキルアップ勉強会', '情報交換交流タイム'],
  },
],
flow: [
  { step: 'STEP 01', title: 'お問い合わせ', text: 'フォームからご連絡ください。' },
  { step: 'STEP 02', title: 'ご案内', text: '活動内容と参加方法をご説明します。' },
],
faq: [
  { q: '未経験でも参加できますか？', a: 'はい、これから占い師を目指す方も歓迎しています。' },
],
voices: [
  { name: '30代・女性', text: '横のつながりができて、活動の幅が広がりました。' },
],
```

占い師ページ（`OURIN`）には、上に加えて **鑑定メニュー**の枠もあります。

```ts
menus: [
  { name: 'チャネリングセッション', duration: '60分', price: 10000, desc: '…' },
],
```

すべての項目が空のあいだは、ページに「このページの詳しい内容は、順次追加していきます。」と表示されます。
