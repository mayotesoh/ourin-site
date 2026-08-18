# -*- coding: utf-8 -*-
"""内部リンク・画像パスを withBase() 経由にする一括修正スクリプト（1回だけ実行）"""
import io
import sys


def edit(path, pairs):
    s = io.open(path, encoding='utf-8').read()
    for old, new in pairs:
        if old not in s:
            print('  ! NOT FOUND in %s: %s' % (path, old[:70]))
            sys.exit(1)
        s = s.replace(old, new)
    io.open(path, 'w', encoding='utf-8', newline='\n').write(s)
    print('  ok', path)


# ── astro.config.mjs ─────────────────────────────
edit('astro.config.mjs', [(
    """// 公開URLが決まったら site を書き換えてください（サイトマップ・RSSに使われます）
export default defineConfig({
  site: 'https://ourin.example.com',
  integrations: [sitemap()],
});""",
    """// GitHub Pages のプロジェクトページ（https://mayotesoh.github.io/ourin-site/）向け設定。
// 独自ドメインに移行するときは site を新ドメインに、base を '/' に変更し、
// public/CNAME にドメイン名を書いたファイルを置いてください。
export default defineConfig({
  site: 'https://mayotesoh.github.io',
  base: '/ourin-site',
  output: 'static',
  integrations: [sitemap()],
});""")])

# ── consts.ts ────────────────────────────────────
edit('src/consts.ts', [
    ("export const SITE_URL = 'https://ourin.example.com';",
     "export const SITE_URL = 'https://mayotesoh.github.io/ourin-site';"),
])

# ── Layout.astro ─────────────────────────────────
edit('src/layouts/Layout.astro', [
    ("import SnsIcons from '../components/SnsIcons.astro';",
     "import SnsIcons from '../components/SnsIcons.astro';\nimport { withBase } from '../lib/url';"),
    ("const ogImageUrl = new URL(ogImage, Astro.site ?? SITE_URL).toString();",
     "const ogImageUrl = new URL(withBase(ogImage), Astro.site ?? SITE_URL).toString();"),
    ("""const navItems = [
  { href: '/', label: 'ホーム' },
  { href: '/about', label: '凰凛について' },
  { href: '/menu', label: '占術メニュー' },
  { href: '/blog', label: '活動報告' },
];
const path = Astro.url.pathname;
const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));""",
     """const home = withBase('/');
const reserveHref = withBase('/reserve');
const navItems = [
  { href: home, label: 'ホーム' },
  { href: withBase('/about'), label: '凰凛について' },
  { href: withBase('/menu'), label: '占術メニュー' },
  { href: withBase('/blog'), label: '活動報告' },
];
const path = Astro.url.pathname;
const isActive = (href: string) => (href === home ? path === home : path.startsWith(href));"""),
    ('<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
     '<link rel="icon" href={withBase("/favicon.svg")} type="image/svg+xml" />'),
    ('<link rel="apple-touch-icon" href={PROFILE_IMAGE} />',
     '<link rel="apple-touch-icon" href={withBase(PROFILE_IMAGE)} />'),
    ('<link rel="sitemap" href="/sitemap-index.xml" />',
     '<link rel="sitemap" href={withBase("/sitemap-index.xml")} />'),
    ('href="/rss.xml"', 'href={withBase("/rss.xml")}'),
    ('<a class="brand" href="/">', '<a class="brand" href={home}>'),
    ('<img class="brand-img" src={PROFILE_IMAGE} alt="" width="44" height="44" />',
     '<img class="brand-img" src={withBase(PROFILE_IMAGE)} alt="" width="44" height="44" />'),
    ('<li><a href="/reserve" class="nav-link nav-cta">ご予約</a></li>',
     '<li><a href={reserveHref} class="nav-link nav-cta">ご予約</a></li>'),
    ('<img src="/images/ourin-logo-gold.png" alt="凰凛" width="120" height="169" loading="lazy" />',
     '<img src={withBase("/images/ourin-logo-gold.png")} alt="凰凛" width="120" height="169" loading="lazy" />'),
    ('<li><a href="/reserve">ご予約</a></li>', '<li><a href={reserveHref}>ご予約</a></li>'),
])

# ── index.astro ──────────────────────────────────
edit('src/pages/index.astro', [
    ("import { PROFILE_IMAGE, SNS_LINKS } from '../consts';",
     "import { PROFILE_IMAGE, SNS_LINKS } from '../consts';\nimport { withBase } from '../lib/url';"),
    ('<img class="hero-mark" src="/images/ourin-logo-gold.png" alt="" aria-hidden="true" />',
     '<img class="hero-mark" src={withBase("/images/ourin-logo-gold.png")} alt="" aria-hidden="true" />'),
    ('<a href="/reserve" class="btn btn-primary">鑑定を予約する</a>',
     '<a href={withBase("/reserve")} class="btn btn-primary">鑑定を予約する</a>'),
    ('<a href="/menu" class="btn btn-ghost">占術メニューを見る</a>',
     '<a href={withBase("/menu")} class="btn btn-ghost">占術メニューを見る</a>'),
    ('<img src={PROFILE_IMAGE} alt="占い師 凰凛" width="440" height="560" fetchpriority="high" />',
     '<img src={withBase(PROFILE_IMAGE)} alt="占い師 凰凛" width="440" height="560" fetchpriority="high" />'),
    ('<a href="/menu" class="btn btn-ghost">メニューと料金を見る</a>',
     '<a href={withBase("/menu")} class="btn btn-ghost">メニューと料金を見る</a>'),
    ('<a class="post-card reveal" href={`/blog/${post.slug}`}>',
     '<a class="post-card reveal" href={withBase(`/blog/${post.slug}`)}>'),
    ('<a href="/blog" class="btn btn-ghost">活動報告をもっと見る</a>',
     '<a href={withBase("/blog")} class="btn btn-ghost">活動報告をもっと見る</a>'),
    ('<a href="/reserve" class="btn btn-primary">予約フォームへ進む</a>',
     '<a href={withBase("/reserve")} class="btn btn-primary">予約フォームへ進む</a>'),
])

# ── about.astro ──────────────────────────────────
edit('src/pages/about.astro', [
    ("import { PROFILE_IMAGE, SNS_LINKS } from '../consts';",
     "import { PROFILE_IMAGE, SNS_LINKS } from '../consts';\nimport { withBase } from '../lib/url';"),
    ('<img src={PROFILE_IMAGE} alt="占い師 凰凛" width="420" height="520" />',
     '<img src={withBase(PROFILE_IMAGE)} alt="占い師 凰凛" width="420" height="520" />'),
    ('<a href="/blog">活動報告</a>', '<a href={withBase("/blog")}>活動報告</a>'),
    ('<a href="/menu" class="btn btn-ghost">占術メニュー</a>',
     '<a href={withBase("/menu")} class="btn btn-ghost">占術メニュー</a>'),
    ('<a href="/reserve" class="btn btn-primary">ご予約へ進む</a>',
     '<a href={withBase("/reserve")} class="btn btn-primary">ご予約へ進む</a>'),
])

# ── menu.astro ───────────────────────────────────
edit('src/pages/menu.astro', [
    ("import { queryDatabase, getTitle, getText, getNumber, getStatus } from '../lib/notion';",
     "import { queryDatabase, getTitle, getText, getNumber, getStatus } from '../lib/notion';\nimport { withBase } from '../lib/url';"),
    ('<a class="menu-link" href="/reserve">このメニューで予約する →</a>',
     '<a class="menu-link" href={withBase("/reserve")}>このメニューで予約する →</a>'),
    ('<a href="/reserve" class="btn btn-primary">予約フォームへ進む</a>',
     '<a href={withBase("/reserve")} class="btn btn-primary">予約フォームへ進む</a>'),
])

# ── blog/index.astro ─────────────────────────────
edit('src/pages/blog/index.astro', [
    ("} from '../../lib/notion';",
     "} from '../../lib/notion';\nimport { withBase } from '../../lib/url';"),
    ('href={`/blog/${post.slug}`}', 'href={withBase(`/blog/${post.slug}`)}'),
])

# ── blog/[slug].astro ────────────────────────────
edit('src/pages/blog/[slug].astro', [
    ("import { SNS_LINKS } from '../../consts';",
     "import { SNS_LINKS } from '../../consts';\nimport { withBase } from '../../lib/url';"),
    ('<a class="post-nav-item prev" href={`/blog/${prev.slug}`}>',
     '<a class="post-nav-item prev" href={withBase(`/blog/${prev.slug}`)}>'),
    ('<a class="post-nav-item next" href={`/blog/${next.slug}`}>',
     '<a class="post-nav-item next" href={withBase(`/blog/${next.slug}`)}>'),
    ('<a href="/blog" class="btn btn-ghost">活動報告の一覧へ</a>',
     '<a href={withBase("/blog")} class="btn btn-ghost">活動報告の一覧へ</a>'),
    ('<a href="/reserve" class="btn btn-primary">鑑定を予約する</a>',
     '<a href={withBase("/reserve")} class="btn btn-primary">鑑定を予約する</a>'),
])

# ── 404.astro ────────────────────────────────────
edit('src/pages/404.astro', [
    ("import Layout from '../layouts/Layout.astro';",
     "import Layout from '../layouts/Layout.astro';\nimport { withBase } from '../lib/url';"),
    ('<a href="/" class="btn btn-ghost">ホームへ</a>',
     '<a href={withBase("/")} class="btn btn-ghost">ホームへ</a>'),
    ('<a href="/blog" class="btn btn-ghost">活動報告</a>',
     '<a href={withBase("/blog")} class="btn btn-ghost">活動報告</a>'),
    ('<a href="/reserve" class="btn btn-primary">ご予約</a>',
     '<a href={withBase("/reserve")} class="btn btn-primary">ご予約</a>'),
])

# ── rss.xml.js ───────────────────────────────────
edit('src/pages/rss.xml.js', [
    ("import { queryDatabase, getTitle, getDateStr, getSlug, getStatus, getText } from '../lib/notion';",
     "import { queryDatabase, getTitle, getDateStr, getSlug, getStatus, getText } from '../lib/notion';\nimport { withBase } from '../lib/url';"),
    ("        link: `/blog/${getSlug(p)}/`,", "        link: withBase(`/blog/${getSlug(p)}/`),"),
])

# ── global.css（背景画像のパス）─────────────────
edit('src/styles/global.css', [
    ("url('/images/ourin-logo-gold.png')", "url('/ourin-site/images/ourin-logo-gold.png')"),
])

# ── robots.txt ───────────────────────────────────
edit('public/robots.txt', [
    ("Sitemap: https://ourin.example.com/sitemap-index.xml",
     "Sitemap: https://mayotesoh.github.io/ourin-site/sitemap-index.xml"),
])

print('done')
