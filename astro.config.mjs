// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 独自ドメイン（https://nori-norico.com）で配信します。
// ドメイン直下に置くため base は '/'。public/CNAME にドメイン名を記載しています。
export default defineConfig({
  site: 'https://nori-norico.com',
  base: '/',
  output: 'static',
  integrations: [sitemap()],
});
