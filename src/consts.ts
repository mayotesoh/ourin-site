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

// 表示するSNS。並び順がそのまま表示順になります。
// ★X・YouTube は現在使用していないため掲載していません。
//   使うようになったら { key: 'x', name: 'X（旧Twitter）', url: '…' } のように追加してください
//   （key は 'x' | 'threads' | 'instagram' | 'youtube' | 'facebook'）。
export const SNS_LINKS: SnsLink[] = [
  { key: 'threads', name: 'Threads', url: 'https://www.threads.com/@n.calling0506' },
  { key: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/n.calling0506' },
  { key: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/share/19MkXh9rrM/' },
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
// ★詳細ページの部品。あとから中身を足していくための「箱」です。
//   空（[]）のままにしておけば、そのセクションはページに表示されません。

/** 自由に増やせる本文ブロック（見出し＋段落＋箇条書き） */
export type Block = {
  title: string;
  body?: string[];   // 段落。1要素＝1段落
  list?: string[];   // 箇条書き（不要なら省略）
};

/** ステップ表示（例：参加までの流れ） */
export type FlowStep = { step: string; title: string; text: string };

/** よくある質問 */
export type Faq = { q: string; a: string };

/** 参加者の声・お客さまの声 */
export type Voice = { name: string; text: string };

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

  // ── ここから下が詳細ページ（/service/○○）専用。空のままでもページは成立します ──
  /** 詳細ページ冒頭の導入文（未設定なら summary を使用） */
  detailLead?: string;
  /** 自由記述のセクション。いくつでも追加できます */
  blocks?: Block[];
  /** 参加・開始までの流れ */
  flow?: FlowStep[];
  /** よくある質問 */
  faq?: Faq[];
  /** 参加者の声 */
  voices?: Voice[];
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

    // ★詳細ページの中身はここに追記してください（例は下のコメント参照）
    blocks: [],
    flow: [],
    faq: [],
    voices: [],
    // 例）
    // blocks: [
    //   { title: '定例会について', body: ['毎月第4火曜20時から…'], list: ['占いロープレ', 'スキルアップ勉強会'] },
    // ],
    // flow: [{ step: 'STEP 01', title: 'お問い合わせ', text: 'フォームからご連絡ください。' }],
    // faq: [{ q: '未経験でも参加できますか？', a: 'はい、これから占い師を目指す方も歓迎です。' }],
    // voices: [{ name: '30代・女性', text: '横のつながりができて…' }],
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

    // ★詳細ページの中身はここに追記してください
    blocks: [],
    flow: [],
    faq: [],
    voices: [],
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

    // ★詳細ページの中身はここに追記してください
    blocks: [],
    flow: [],
    faq: [],
    voices: [],
  },
];


// ── 占い師「凰凛」の詳細ページ（/ourin）─────────────────────
// ★内容はここに追記してください。空の項目はページに表示されません。
export const OURIN = {
  name: FORTUNE_NAME,
  kana: FORTUNE_NAME_KANA,
  lead: 'その人の「いま」に必要なメッセージを、言葉にしてお渡しします。',
  intro: [
    '松山倫子が、占い師として活動するときの名前が「凰凛（おうりん）」です。',
    'チャネリングとルノルマンカードを使い分けながら、ご相談者さまの状況に合わせて読み解いています。',
    '占い師として現場に立ち続けてきた経験が、占い師のためのコミュニティづくりの土台になっています。',
  ],

  /** 扱う占術 */
  methods: [
    {
      en: 'Channeling',
      name: 'チャネリング',
      text: '目には見えない領域とつながり、いま必要なメッセージを受け取ってお伝えします。「頭ではわかっているのに動けない」——そんなときに、心の奥にある本当の声を言葉にしていきます。',
      target: ['進むべき方向を確かめたいとき', '人間関係のもつれをほどきたいとき', '自分の本音がわからなくなったとき'],
    },
    {
      en: 'Lenormand',
      name: 'ルノルマンカード',
      text: '36枚のカードが描くのは、日常のなかの具体的な出来事。抽象的な励ましではなく、「いつ・どこで・何が起こりやすいか」を現実的な言葉で読み解きます。',
      target: ['近い未来の流れを知りたいとき', '選択肢のどちらを選ぶか迷うとき', '具体的なアドバイスが欲しいとき'],
    },
  ],

  // ★鑑定メニュー（料金が決まったら追加してください）
  // 例）{ name: 'チャネリングセッション', duration: '60分', price: 10000, priceText: '', desc: '…' }
  menus: [] as { name: string; duration?: string; price?: number; priceText?: string; desc?: string }[],

  // ★鑑定の流れ
  flow: [] as FlowStep[],

  // ★自由記述のセクション（実績・鑑定への想い など）
  blocks: [] as Block[],

  // ★よくある質問
  faq: [] as Faq[],

  // ★お客さまの声
  voices: [] as Voice[],
};
