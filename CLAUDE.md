# CLAUDE.md — 松山倫子さん サイト 引き継ぎメモ

> 新しい Claude Code セッションが最初に読む資料です。手順の詳細は `README.md` に、
> 予約バックエンドの手順は `gas/Reserve.gs` の冒頭コメントにあります。

## サイト概要
- **松山倫子（まつやま のりこ）さんの自己紹介サイト**。
- **名前の扱い（重要）**: サイトの主体は「松山倫子」。「凰凛（おうりん）」は
  *占い師としての活動名＝手札の一枚* という位置づけ。
  ヘッダー／フッター／ヒーローは松山倫子名義で、凰凛はトップと `/about` の
  「もうひとつの名前」ブロックとフッターの1行にだけ登場させる。
  毛筆ロゴ（書）も凰凛のマークなので、そのブロック以外では使わない（全ページ背景の書は廃止済み）。
- 構成は2026-08-19にクライアント資料
  （Googleドキュメント「自己紹介HP テキストコンテンツ案」）に沿って全面的に作り直した
- 掲載する3事業（**この並び順が指定。占いを一番上に**）
  1. 占いコミュニティ｜fortunelabo（占い師専門コミュニティ。旧称 Branch Cafe → 2026-08-28 に fortunelabo へ変更）
  2. テレアポ事業（在宅・週5〜10時間で固定報酬3〜5万円）
  3. 営業代行事業（完全在宅・フルコミッション）
- 本人は占い師でもあり（チャネリング／ルノルマン）、個人鑑定はお問い合わせの選択肢に残している
- デザインは **エメラルドグリーン（ミント地＋エメラルドのアクセント）＋墨黒の毛筆ロゴ**。
  2026-08-19にクライアント指定で空色から変更（背景の指定色は #c6fce3 系のミント）。
  色は `src/styles/global.css` の `:root` トークンで一括管理し、各ページのCSSも同じ系統に揃えてある
- メインコンテンツは **活動報告（ブログ）**。Notion DB をビルド時に取得して静的化
- 場所: `C:\Users\mayonery\占いサイト\松山さん\ourin-site`（2026-08-18 新規作成）
- リポジトリ: `mayotesoh/ourin-site`（**PUBLIC**。秘密情報は絶対にコミットしない）
- 公開URL: **https://nori-norico.com**（独自ドメイン。GitHub Actions で自動デプロイ／毎日 07:00 JST 再ビルド）
  - 2026-08-28 に `mayotesoh.github.io/ourin-site` から移行。`base: '/'`、`public/CNAME` あり
  - 内部リンクは引き続き `src/lib/url.ts` の `withBase()` 経由（base が変わっても壊れない）
- 構成は姉妹サイト `mayonery-site` を踏襲（Astro 静的サイト + Notion REST 直叩き + GitHub Pages）
- プロフィール写真の原本: `..\松山さん.jpg` → `public/images/ourin.jpg`
- ロゴ（毛筆の「凰凛」）の原本: `..\凰凛.png`（白背景・黒墨）
  → `tools/mklogo.cjs` で **トリム＋白背景を透過＋任意色に着色**した
    `public/images/ourin-logo-gold.png` / `ourin-logo-white.png` を生成して使用
  → 現在使っているのは **ink（墨黒）**。gold / white は予備
  → 使い所: トップと `/about` の「占い師としての名前」ブロック（`.alias-mark`）、
    フッターの占い師名の横。ヒーロー背面と全ページ背景の書は 2026-08-19 に廃止

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

## ページ構成
- `/`（トップ） `/service`（一覧） `/service/[id]`（community / telemarketing / sales の詳細）
  `/ourin`（占い師 凰凛の詳細） `/about` `/blog` `/blog/[slug]` `/contact` `/404`
- 詳細ページは **`src/consts.ts` のデータだけで組み立てる**設計。
  `SERVICES[].blocks / flow / faq / voices` と `OURIN` が空なら、そのセクションは描画されず
  「順次追加していきます」の案内だけが出る（`src/components/DetailSections.astro`）。
  → クライアントから原稿が届いたら **consts.ts に足すだけ**で反映される
- ヘッダーのSNSアイコンはPCでは非表示（ナビ項目が5つになり収まらないため）。
  スマホのメニュー内とフッターには出る

## コンテンツの出どころ
- 3事業の文章は `src/consts.ts` の `SERVICES` にまとめてある（クライアント資料をほぼそのまま採用）。
  トップページのカードと `/service` の詳細セクションが同じデータを参照するので、修正はここ1か所
- ブログのサンプル原稿もクライアントから提供済み（定例会レポート）。Notion に入れれば `/blog` に出る

## 未完・未設定（ユーザー待ち）
1. **各SNSのURL**（X / Threads / Instagram / YouTube / Facebook）→ `src/consts.ts`
   ※現在は各SNSのトップページを仮に設定してある（アイコンの表示確認用）
2. **Notion のシークレットとDB ID** → `.env`（`.env.example` 参照）
3. **お問い合わせ用GASのデプロイURL** → `src/consts.ts` の `GAS_CONTACT_URL`
4. **独自ドメイン**（決まったら base を '/' に戻す。手順は README 5章）
5. `/about` の「これまでの歩み」の年号は未確定（`src/pages/about.astro` の `timeline`）
6. 料金・講座メニューは資料に記載がないため未掲載
   （参考として共有された他社スクールの価格帯：体験2,980〜3,300円／本コース298,000〜798,000円）

## お問い合わせフォームの設計（重要）
静的サイトから Notion へ直接書き込むと APIキーが公開されるため、**GAS を中継**する。
`お問い合わせフォーム → GAS ウェブアプリ(doPost) → Notion お問い合わせDB + メール通知`
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

## 2026-08-28 の大きな追加
- **公式LINE導線**: `consts.ts` の `LINE_BUSINESS_URL`（テレアポ・営業代行）と `LINE_FORTUNE_URL`（占い）。
  各詳細ページ・お問い合わせ・トップのCTAに緑のLINEボタンを設置
- **事業詳細の中身**: クライアント提供のPDF2本（営業代行＝株式会社マッサフルの募集資料／
  テレアポ＝インサイドセールスチーム紹介）と massaful.com の要約を `SERVICES` に反映
  - テレアポの取り扱い案件は **クライアント企業名を伏せる**指定。業種＋頭文字（例：空調・冷熱設備会社 T社）で掲載し、
    担当者名と組織図は載せない（元資料のスライド2枚目は不使用）。会社名（Asrise…）も出さない
- **写真**: `public/images/` に sales.jpg（登壇）／telemarketing.jpg（ヘッドセット）／
  ourin-session.jpg・ourin-cards.jpg（鑑定風景）。`tools/mkphotos.cjs` で幅1400pxに最適化
- **お客さまの声**: 鑑定サイトのレビューとLINEのやり取りのスクショが元。**ハンドルネーム・アイコンは載せず**、
  本文だけを匿名の肩書き（「鑑定をご利用のお客さま」等）で `OURIN.voices` に転記。注記も表示
- **Notion連携の手順書**: `docs/notion-blog-setup.md`（Notion AI用プロンプト＋API手順）
