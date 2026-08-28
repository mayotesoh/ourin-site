// ── サイト内に直接書く記事 ─────────────────────────────
// Notion連携がまだの間や、すぐ出したい記事はここに書けば公開されます。
// Notionの記事と自動で合流し、日付の新しい順に並びます。
//
// 【書き方】下の例をコピーして、配列の先頭に足してください。
//   date は 'YYYY-MM-DD'、slug は半角英数字とハイフン（記事のURLになります）。
//   本文（body）は上から順に表示されます。
//     { type: 'p',     text: '段落' }
//     { type: 'h2',    text: '見出し' }
//     { type: 'list',  items: ['項目1', '項目2'] }
//     { type: 'image', src: '/images/blog/○○.jpg', alt: '説明', caption: 'キャプション' }
//     { type: 'note',  text: '囲みで目立たせたいお知らせ' }
//     { type: 'link',  url: 'https://…', label: 'リンクの文言' }

export type PostBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt?: string; caption?: string }
  | { type: 'note'; text: string }
  | { type: 'link'; url: string; label: string };

export type LocalPost = {
  title: string;
  /** 'YYYY-MM-DD' */
  date: string;
  /** 記事のURL（/blog/○○） */
  slug: string;
  categories: string[];
  /** 一覧・記事上部に出る画像（任意） */
  image?: string;
  /** 一覧とSNSシェアに使う説明文 */
  summary: string;
  body: PostBlock[];
};

export const LOCAL_POSTS: LocalPost[] = [
  {
    title: 'FM MOOV KOBE『上原ようこのやさしさラジオ』に出演しました',
    date: '2026-08-28',
    slug: 'radio-yasashisa-2026-09',
    categories: ['メディア出演', 'お知らせ'],
    image: '/images/blog/radio-yasashisa.jpg',
    summary:
      'FM MOOV KOBEのラジオ番組『上原ようこのやさしさラジオ』の収録に参加しました。シングルマザーとしての在り方や、3つの事業についてお話ししています。放送は9月10日（木）18時半〜。',
    body: [
      { type: 'p', text: 'FM MOOV KOBEさんのラジオ『上原ようこのやさしさラジオ』の収録でした。' },
      {
        type: 'p',
        text: '上原ようこさんはNPO法人虐待問題研究所の代表で、子ども虐待の専門家です。児童虐待防止や女性支援の活動をされています。',
      },
      {
        type: 'p',
        text: '今回はそんな上原さんがパーソナリティを務める、社会問題に取り組む活動の紹介番組『上原ようこのやさしさラジオ』に出演。シングルマザーとしての在り方や事業紹介をさせていただきました♪',
      },
      { type: 'note', text: '放送日：9月10日（木）18時半〜' },
    ],
  },
];
