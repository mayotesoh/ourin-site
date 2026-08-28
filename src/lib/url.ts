// base（サイトを置くパス）を前につけるヘルパー。
// 現在は独自ドメイン直下（base: '/'）だが、サブディレクトリ配信に戻す場合も
// astro.config.mjs の base を変えるだけでリンクが追従します。
const BASE = (import.meta.env.BASE_URL as string) || '/';

export const withBase = (path: string = '/'): string =>
  `${BASE.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
