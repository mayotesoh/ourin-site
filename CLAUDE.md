# CLAUDE.md — 凰凛（おうりん）サイト 引き継ぎメモ

> 新しい Claude Code セッションが最初に読む資料です。手順の詳細は `README.md` に、
> 予約バックエンドの手順は `gas/Reserve.gs` の冒頭コメントにあります。

## サイト概要
- 占い師 **凰凛（おうりん）** の名刺代わりサイト。占術は **チャネリング**と**ルノルマン**
- メインコンテンツは **活動報告（ブログ）**。Notion DB をビルド時に取得して静的化
- 場所: `C:\Users\mayonery\占いサイト\松山さん\ourin-site`（2026-08-18 新規作成）
- 構成は姉妹サイト `mayonery-site` を踏襲（Astro 静的サイト + Notion REST 直叩き + GitHub Pages）
- プロフィール写真の原本: `..\松山さん.jpg` → `public/images/ourin.jpg`
- ロゴ（毛筆の「凰凛」）の原本: `..\凰凛.png`（白背景・黒墨）
  → `tools/mklogo.cjs` で **トリム＋白背景を透過＋任意色に着色**した
    `public/images/ourin-logo-gold.png` / `ourin-logo-white.png` を生成して使用
  → 使い所: トップのヒーロー背面（`.hero-mark` opacity .11）／トップ以外の全ページ背景
    （`global.css` の `body::after` fixed, opacity .045。トップは index.astro の
    `<style is:global>` で `display:none` にして二重表示を回避）／フッターの署名

## 技術メモ
- Astro 6 / 静的出力。統合は `@astrojs/sitemap` と `@astrojs/rss` のみ
- Notion は SDK を使わず `src/lib/notion.ts` で REST を直叩き（`Notion-Version: 2022-06-28`）
  - `queryDatabase()` は **ページネーション対応済み**（page_size 既定100の罠を回避）
  - 鍵やDB IDが未設定・通信失敗でも `safeFetchJson` で空配列を返し、**ビルドは止まらない**
  - プロパティ名は候補を配列で渡す設計（`getTitle(page, ['タイトル','名前'])`）。表記ゆれに強い
- 本文表示は `src/components/NotionBlocks.astro`。連続するリスト項目は ul/ol にまとめてから描画
- YouTube は `youtube-nocookie.com/embed` に変換（Firefox対策・mayonery-site と同じ方針）
- SNSアイコンは simple-icons のパスを `src/components/SnsIcons.astro` に直書き。
  `src/consts.ts` の `SNS_LINKS` で **url が空のものは自動で非表示**

## 未完・未設定（ユーザー待ち）
1. **各SNSのURL**（X / Threads / Instagram / YouTube / Facebook）→ `src/consts.ts`
   ※現在は各SNSのトップページを仮に設定してある（アイコンの表示確認用）
2. **Notion のシークレットとDB ID** → `.env`（`.env.example` 参照）
3. **予約用GASのデプロイURL** → `src/consts.ts` の `GAS_RESERVE_URL`
4. **公開URL/独自ドメイン** → `astro.config.mjs` の `site` と `consts.ts` の `SITE_URL`、`public/robots.txt`
5. プロフィール文・経歴（`src/pages/about.astro` の `intro` / `timeline`）と料金（`menu.astro` の `defaultMenus`）は仮の文章

## 予約システムの設計（重要）
静的サイトから Notion へ直接書き込むと APIキーが公開されるため、**GAS を中継**する。
`予約フォーム → GAS ウェブアプリ(doPost) → Notion 予約DB + メール通知`
- CORS プリフライトを避けるため、フォームからは `Content-Type: text/plain` で JSON を送る
  （GAS 側で `JSON.parse`）。この方式は Branch-site でも実績あり
- GAS 側は必須項目チェック＋60秒の連投防止（CacheService）。Notion 登録に失敗しても
  オーナー宛メールだけは飛ばして取りこぼしを防ぐ
- Notion の `select` は存在しない選択肢を自動作成するが、`status` はしないため
  ステータスは **セレクト型**で作ること

## 確認済みのこと
- `npm run build` は鍵なしでも成功（記事0件でエラーにならない）
- mayonery-site の Notion ブログDBを一時的に指定してビルドし、一覧・個別記事・RSS・
  ブロック描画（見出し/リスト/コールアウト/リンク）が正しく出ることを確認済み
- Chrome ヘッドレスでの表示確認済み（デスクトップ / 500px幅）。
  ※このPCのChromeヘッドレスは **ビューポート最小幅が500px**。390px指定でも500pxで描画され切り取られるだけなので注意
