import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../consts';
import { withBase } from '../lib/url';
import { getAllPosts } from '../lib/blog';

export async function GET(context) {
  const posts = await getAllPosts();

  const items = posts.map((p) => {
    const d = new Date(p.date);
    return {
      title: p.title,
      pubDate: Number.isNaN(d.getTime()) ? new Date() : d,
      description: p.summary,
      link: withBase(`/blog/${p.slug}/`),
    };
  });

  return rss({
    title: `${SITE_TITLE} 活動報告`,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items,
  });
}
