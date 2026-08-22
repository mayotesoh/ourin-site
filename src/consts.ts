// サイト全体で使う設定値をここにまとめています。
// ★リンクが決まったら URL を書き換えるだけで、ヘッダー・フッター・各ページに反映されます。

export const SITE_TITLE = '松山倫子';
export const SITE_NAME_KANA = 'まつやま のりこ';
export const SITE_NAME_EN = 'Noriko Matsuyama';

// 占い師としての名前（活動名のひとつ）
export const FORTUNE_NAME = '凰凛';
export const FORTUNE_NAME_KANA = 'おうりん';
export const SITE_TAGLINE = '働く選択肢を、もっと自由に。';
export const SITE_DESCRIPTION =
  '働く選択肢を、もっと自由に。松山倫子（占い師名：凰凛）が、占いコミュニティ（Branch Cafe）・テレアポ事業・営業代行事業の3つを通じて、女性が自分らしく働ける環境をつくっています。';

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
//   決まったら url を実際のアカウントURLに差し替えてください。
export const SNS_LINKS: SnsLink[] = [
  { key: 'x', name: 'X（旧Twitter）', url: 'https://x.com/' },
  { key: 'threads', name: 'Threads', url: 'https://www.threads.net/' },
  { key: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/' },
  { key: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/' },
  { key: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/' },
];

// お問い合わせ用（任意。設定するとフッター・お問い合わせページに表示されます）
export const CONTACT_EMAIL = '';

// ── お問い合わせフォーム ───────────────────────────────────
// GAS（Google Apps Script）ウェブアプリのURL。
// gas/Contact.gs をデプロイして得られる https://script.google.com/macros/s/xxxx/exec を入れます。
// 空のままだと、フォームは「準備中」と表示されます。
export const GAS_CONTACT_URL = '';

// お問い合わせフォームの「ご用件」の選択肢
export const CONTACT_TOPICS = [
  '占いコミュニティについて（Branch Cafe）',
  'テレアポ事業について',
  '営業代行事業について',
  '個人鑑定のご依頼（チャネリング／ルノルマン）',
  'その他・ご相談',
];

// 面談・鑑定などの希望時間の選択肢（任意入力）
export const TIME_SLOTS = [
  '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

// ── 3つの事業 ─────────────────────────────────────────────
// トップページのカードと事業内容ページで共通に使います。
// 並び順がそのまま表示順になります（占いコミュニティを先頭に）。
export type Service = {
  id: string;
  no: string;
  en: string;
  name: string;
  lead: string;
  summary: string;
  points: string[];
  target: string[];
  note?: string;
};

export const SERVICES: Service[] = [
  {
    id: 'community',
    no: '01',
    en: 'Fortune-telling Community',
    name: '占いコミュニティ｜Branch Cafe',
    lead: '占い師として、稼ぐ・育つ・つながる。すべてここで。',
    summary:
      '大阪・天満のイベントスペース「Branch Cafe」が運営する、占い師専門のコミュニティです。年間500回以上のイベント開催実績をベースに、占い師が活躍できる“場・機会・仲間”を提供します。',
    points: [
      'オンライン＆リアル定例会への参加',
      '占いBAR在籍・イベント出店・占い師派遣などの活動機会',
      'SNS講座・税務相談・メンタルサポートなどのスキルアップ支援',
      '仲間とつながれるコミュニティ環境',
    ],
    target: [
      '占い師になりたい・興味がある方',
      'デビューしたけれど活動できていない方',
      'もっと稼ぎたい・次のステージへ進みたい方',
      '自分の講座を広める場がほしい方',
    ],
    note: '3月より定例会がスタートし、紹介の輪が広がり続けています。',
  },
  {
    id: 'telemarketing',
    no: '02',
    en: 'Telemarketing',
    name: 'テレアポ事業',
    lead: '在宅で、自分のペースで。稼ぐ力を手に入れる。',
    summary:
      '育児や介護でなかなか外に出られない方でも、スマートフォン1台で始められる在宅ワークです。アポイント獲得よりもヒアリング・マーケティングを重視したスタイルなので、「話すのが得意じゃない」という方でも取り組みやすい環境を整えています。',
    points: [
      '週5〜10時間の稼働で固定報酬3万〜5万円',
      'トークスクリプト・架電リストは会社が用意',
      '架電にかかる通信費は経費請求OK',
      'マインドセットのサポートあり・未経験歓迎',
    ],
    target: [
      '育児・介護中でも収入を得たい方',
      '時間の融通が利く働き方をしたい方',
      'まず副業から始めてみたい方',
    ],
  },
  {
    id: 'sales',
    no: '03',
    en: 'Sales Agency',
    name: '営業代行事業',
    lead: 'スキルが収入に直結する。本気で稼ぎたい方へ。',
    summary:
      '主にオンラインスクールのクロージング（成約）を代行する業務です。完全在宅・フルコミッション制で、スキルと努力が収入にダイレクトに反映されます。未経験でも1から丁寧に育てる体制が整っており、営業スキルを身につけながら高収入を目指したい方に最適です。',
    points: [
      '完全在宅・業務委託契約',
      '完全フルコミッション（MAX7桁の実績あり）',
      '未経験OK・1から育成',
      '成約後のアフターサポート不要',
      '取り扱い案件は代表が厳選・グレーな案件はお断り',
      '意欲的なメンバーが集まるコミュニティ（朝活・女子会あり）',
    ],
    target: [
      '本気で収入を上げたい方',
      '営業スキルを磨きたい方',
      '在宅でがっつり稼ぎたい方',
    ],
    note: 'フリーランス・個人事業主向けの講座も始動予定。営業スキルを体系的に学びたい方にも対応していきます。',
  },
];
