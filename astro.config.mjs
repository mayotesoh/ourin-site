// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages のプロジェクトページ（https://mayotesoh.github.io/ourin-site/）向け設定。
// 独自ドメインに移行するときは site を新ドメインに、base を '/' に変更し、
// public/CNAME にドメイン名を書いたファイルを置いてください。
export default defineConfig({
  site: 'https://mayotesoh.github.io',
  base: '/ourin-site',
  output: 'static',
  integrations: [sitemap()],
});
