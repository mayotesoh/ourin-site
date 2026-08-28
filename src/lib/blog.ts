// Notionの記事と、サイト内に直接書いた記事（src/data/posts.ts）をひとつにまとめるところ。
// どちらのソースでも同じ形にして返すので、各ページは中身を気にせず表示できます。
import { LOCAL_POSTS, type LocalPost, type PostBlock } from '../data/posts';
import {
  queryDatabase,
  getTitle,
  getDateStr,
  getSlug,
  getStatus,
  getMultiSelect,
  getImageUrl,
  getText,
} from './notion';

export type UnifiedPost = {
  source: 'notion' | 'local';
  title: string;
  date: string;
  slug: string;
  categories: string[];
  image: string;
  summary: string;
  /** Notion記事のときだけ入る（本文ブロックの取得に使う） */
  pageId?: string;
  /** サイト内記事のときだけ入る */
  body?: PostBlock[];
};

const isPublished = (status: string) =>
  status === '' || status === '公開' || status === 'Published' || status === '完了';

function fromLocal(p: LocalPost): UnifiedPost {
  return {
    source: 'local',
    title: p.title,
    date: p.date,
    slug: p.slug,
    categories: p.categories,
    image: p.image ?? '',
    summary: p.summary,
    body: p.body,
  };
}

/** Notion＋サイト内記事を、日付の新しい順に並べて返す */
export async function getAllPosts(): Promise<UnifiedPost[]> {
  const pages = await queryDatabase(import.meta.env.NOTION_BLOG_ID, {});

  const notionPosts: UnifiedPost[] = pages
    .filter((p: any) => isPublished(getStatus(p)))
    .map((p: any) => ({
      source: 'notion' as const,
      title: getTitle(p) || '無題',
      date: getDateStr(p),
      slug: getSlug(p),
      categories: getMultiSelect(p),
      image: getImageUrl(p),
      summary: getText(p, ['概要', '抜粋', 'サマリー']),
      pageId: p.id,
    }));

  // ビルドログに取得状況を出す（連携が効いているかの確認用）
  const statuses = pages.map((p: any) => getStatus(p) || '（未設定）');
  console.log(
    `[blog] Notion取得: ${pages.length}件 / 公開: ${notionPosts.length}件` +
      (pages.length > 0 ? ` / ステータス内訳: ${[...new Set(statuses)].join(', ')}` : '')
  );

  const localPosts = LOCAL_POSTS.map(fromLocal);

  // slugが重なった場合はNotion側を優先（Notionへ移し替えたときに二重表示しない）
  const notionSlugs = new Set(notionPosts.map((p) => p.slug));
  const merged = [...notionPosts, ...localPosts.filter((p) => !notionSlugs.has(p.slug))];

  // 日付の新しい順（降順）。日付が未入力のものは最後に回す
  const time = (d: string) => {
    const t = new Date(d).getTime();
    return Number.isNaN(t) ? -Infinity : t;
  };
  return merged.sort((a, b) => time(b.date) - time(a.date));
}

/** 本文の冒頭から抜粋をつくる（Notion記事で概要が空のとき用） */
export function localExcerpt(body: PostBlock[] = [], length = 110): string {
  const text = body
    .map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : ''))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > length ? `${text.slice(0, length)}…` : text;
}
