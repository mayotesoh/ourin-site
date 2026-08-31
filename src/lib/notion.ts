// Notion REST API をビルド時に直叩きする薄いラッパー。
// SDKは使わず fetch のみ。鍵が無い／通信できない場合は空配列を返してビルドを止めません。
import { safeFetchJson } from './safeFetch';
import imageMap from '../data/notion-images.json';

/**
 * Notionにアップされた画像のURLは1時間ほどで期限切れになるため、
 * ビルド前に取り込んだローカルの画像に差し替えます（tools/fetch-notion-images.mjs）。
 */
export function localizeImage(url: string): string {
  if (!url) return url;
  const key = url.split('?')[0];
  return (imageMap as Record<string, string>)[key] ?? url;
}

const NOTION_VERSION = '2022-06-28';
const API = 'https://api.notion.com/v1';

export const NOTION_API_KEY = import.meta.env.NOTION_API_KEY as string | undefined;

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

/** データベースを全件取得（page_size=100 の壁を越えるためページネーション必須） */
export async function queryDatabase(
  databaseId: string | undefined,
  body: Record<string, unknown> = {}
): Promise<any[]> {
  if (!NOTION_API_KEY || !databaseId) return [];

  const all: any[] = [];
  let cursor: string | undefined = undefined;

  for (let i = 0; i < 50; i++) {
    const data: { results?: any[]; has_more?: boolean; next_cursor?: string } =
      await safeFetchJson(
        `${API}/databases/${databaseId}/query`,
        {
          method: 'POST',
          headers: headers(NOTION_API_KEY),
          body: JSON.stringify(cursor ? { ...body, start_cursor: cursor } : body),
        },
        { results: [] }
      );

    all.push(...(data.results || []));
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return all;
}

/** ページ本文のブロックを全件取得（入れ子も1階層ぶん子を取得して has_children に格納） */
export async function fetchBlocks(blockId: string, depth = 0): Promise<any[]> {
  if (!NOTION_API_KEY) return [];

  const all: any[] = [];
  let cursor: string | undefined = undefined;

  for (let i = 0; i < 20; i++) {
    const url = new URL(`${API}/blocks/${blockId}/children`);
    url.searchParams.set('page_size', '100');
    if (cursor) url.searchParams.set('start_cursor', cursor);

    const data: { results?: any[]; has_more?: boolean; next_cursor?: string } =
      await safeFetchJson(
        url.toString(),
        { headers: headers(NOTION_API_KEY) },
        { results: [] }
      );

    all.push(...(data.results || []));
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  // 入れ子（トグル・リストの子）を2階層まで取得
  if (depth < 2) {
    for (const block of all) {
      if (block.has_children) {
        block.__children = await fetchBlocks(block.id, depth + 1);
      }
    }
  }
  return all;
}

// ── プロパティ取得ヘルパー ────────────────────────────────
// Notion側のプロパティ名は表記ゆれしやすいので、候補を複数渡せるようにしています。

function pick(page: any, names: string[]) {
  const props = page?.properties || {};
  for (const n of names) {
    if (props[n]) return props[n];
  }
  return undefined;
}

export function getTitle(page: any, names = ['タイトル', '名前', 'Name', 'Title']): string {
  const p = pick(page, names) ?? Object.values(page?.properties || {}).find((v: any) => v?.type === 'title');
  return (p as any)?.title?.map((t: any) => t.plain_text).join('') || '';
}

export function getText(page: any, names: string[]): string {
  const p = pick(page, names);
  if (!p) return '';
  if (p.type === 'rich_text') return p.rich_text.map((t: any) => t.plain_text).join('');
  if (p.type === 'title') return p.title.map((t: any) => t.plain_text).join('');
  if (p.type === 'url') return p.url || '';
  if (p.type === 'number') return p.number == null ? '' : String(p.number);
  if (p.type === 'select') return p.select?.name || '';
  return '';
}

export function getDateStr(page: any, names = ['日付', '公開日', 'Date']): string {
  const p = pick(page, names);
  if (p?.type === 'date') return p.date?.start || '';
  if (p?.type === 'created_time') return p.created_time || '';
  return page?.created_time || '';
}

export function getStatus(page: any, names = ['ステータス', '公開ステータス', 'Status']): string {
  const p = pick(page, names);
  return p?.status?.name || p?.select?.name || '';
}

export function getMultiSelect(page: any, names = ['カテゴリー', 'カテゴリ', 'タグ', 'Tags']): string[] {
  const p = pick(page, names);
  return p?.multi_select?.map((t: any) => t.name) || [];
}

export function getNumber(page: any, names: string[]): number | null {
  const p = pick(page, names);
  return p?.type === 'number' ? p.number : null;
}

/** アイキャッチ：files型でも「URLを書いたrich_text/url型」でもOK */
export function getImageUrl(page: any, names = ['アイキャッチ', '画像', 'カバー', 'Image'], fallback = ''): string {
  const p = pick(page, names);
  if (p) {
    if (p.type === 'files' && p.files?.length) {
      const f = p.files[0];
      return localizeImage(f.type === 'file' ? f.file.url : f.external?.url || fallback);
    }
    if (p.type === 'rich_text' && p.rich_text?.length) {
      const u = p.rich_text[0].plain_text.trim();
      if (u) return u;
    }
    if (p.type === 'url' && p.url) return p.url;
  }
  // ページのカバー画像も候補にする
  const cover = page?.cover;
  if (cover) return localizeImage(cover.type === 'external' ? cover.external.url : cover.file?.url || fallback);
  return fallback;
}

/** URLスラッグ（無ければページIDから生成） */
export function getSlug(page: any, names = ['URLスラッグ', 'スラッグ', 'slug', 'Slug']): string {
  const s = getText(page, names).trim();
  if (s) return encodeURIComponent(s);
  return String(page.id).replace(/-/g, '');
}

// ── リッチテキスト → HTML ────────────────────────────────
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function richTextToHtml(richText: any[] = []): string {
  return richText
    .map((t: any) => {
      let html = escapeHtml(t.plain_text ?? '');
      const a = t.annotations || {};
      if (a.code) html = `<code>${html}</code>`;
      if (a.bold) html = `<strong>${html}</strong>`;
      if (a.italic) html = `<em>${html}</em>`;
      if (a.underline) html = `<u>${html}</u>`;
      if (a.strikethrough) html = `<s>${html}</s>`;
      if (t.href) {
        const external = /^https?:\/\//.test(t.href) && !t.href.includes('ourin');
        html = `<a href="${escapeHtml(t.href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${html}</a>`;
      }
      return html;
    })
    .join('')
    .replace(/\n/g, '<br />');
}

/** 本文の冒頭を抜き出して抜粋にする */
export function blocksToExcerpt(blocks: any[], length = 90): string {
  const text = blocks
    .map((b: any) => {
      const body = b[b.type];
      if (body?.rich_text) return body.rich_text.map((t: any) => t.plain_text).join('');
      return '';
    })
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
