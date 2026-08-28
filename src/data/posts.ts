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
  // ここに記事を足すとすぐ公開されます（Notionに同じURLスラッグの記事があれば、そちらが優先されます）
];
