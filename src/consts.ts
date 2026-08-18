// サイト全体で使う設定値をここにまとめています。
// ★リンクが決まったら URL を書き換えるだけで、ヘッダー・フッター・各ページに反映されます。

export const SITE_TITLE = '凰凛（おうりん）';
export const SITE_TAGLINE = 'チャネリング・ルノルマン占い';
export const SITE_DESCRIPTION =
  'チャネリングとルノルマンカードで、あなたの「今」に必要なメッセージをお届けします。占い師・凰凛（おうりん）の活動報告とご予約はこちらから。';

// 公開URL（独自ドメイン or GitHub Pages のURLが決まったら書き換え）
export const SITE_URL = 'https://mayotesoh.github.io/ourin-site';

// プロフィール写真
export const PROFILE_IMAGE = '/images/ourin.jpg';

// ── SNSリンク ─────────────────────────────────────────────
// ★ url を実際のアカウントURLに差し替えてください。
//    空文字（''）のままのSNSはサイト上に表示されません。
export type SnsKey = 'x' | 'threads' | 'instagram' | 'youtube' | 'facebook';

export type SnsLink = {
  key: SnsKey;
  name: string;
  url: string;
};

// ※アカウントが決まるまでは各SNSのトップページを仮に入れています。
//   決まったら url を「凰凛さんのアカウントURL」に差し替えてください。
export const SNS_LINKS: SnsLink[] = [
  { key: 'x', name: 'X（旧Twitter）', url: 'https://x.com/' },
  { key: 'threads', name: 'Threads', url: 'https://www.threads.net/' },
  { key: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/' },
  { key: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/' },
  { key: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/' },
];

// お問い合わせ用（任意。設定するとフッターに表示されます）
export const CONTACT_EMAIL = '';

// ── 予約フォーム ───────────────────────────────────────────
// GAS（Google Apps Script）ウェブアプリのURL。
// gas/Reserve.gs をデプロイして得られる https://script.google.com/macros/s/xxxx/exec を入れます。
// 空のままだと、フォームは「準備中」と表示されます。
export const GAS_RESERVE_URL = '';

// 予約フォームの「ご希望メニュー」の選択肢
export const RESERVE_MENUS = [
  'チャネリングセッション（60分）',
  'ルノルマンカードリーディング（40分）',
  'チャネリング＋ルノルマン（90分）',
  'その他・ご相談',
];

// 予約枠（開始時刻）
export const RESERVE_TIME_SLOTS = [
  '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];
