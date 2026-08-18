import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../consts';
import { queryDatabase, getTitle, getDateStr, getSlug, getStatus, getText } from '../lib/notion';
import { withBase } from '../lib/url';

export async function GET(context) {
  const pages = await queryDatabase(import.meta.env.NOTION_BLOG_ID, {});

  const items = pages
    .filter((p) => {
      const s = getStatus(p);
      return s === '' || s === '公開' || s === 'Published' || s === '完了';
    })
    .map((p) => {
      const dateStr = getDateStr(p);
      const d = new Date(dateStr);
      return {
        title: getTitle(p) || '無題',
        pubDate: Number.isNaN(d.getTime()) ? new Date() : d,
        description: getText(p, ['概要', '抜粋', 'サマリー']),
        link: withBase(`/blog/${getSlug(p)}/`),
      };
    })
    .sort((a, b) => b.pubDate - a.pubDate);

  return rss({
    title: `${SITE_TITLE} 活動報告`,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items,
  });
}
