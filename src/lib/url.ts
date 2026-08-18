// GitHub Pages のプロジェクトページ（/ourin-site/ 配下）でもリンクが壊れないようにするヘルパー。
// 独自ドメインに移行したら astro.config.mjs の base を '/' に戻すだけで、コードは変更不要です。
const BASE = (import.meta.env.BASE_URL as string) || '/';

export const withBase = (path: string = '/'): string =>
  `${BASE.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
