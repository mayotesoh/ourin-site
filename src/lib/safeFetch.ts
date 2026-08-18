// 通信に失敗しても「サイトのビルドを止めない」ための安全なfetch。
// Notionが落ちていても、鍵が未設定でも、fallback を返して静かに続行します。
export async function safeFetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  fallback: T
): Promise<T> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      console.warn(`[notion] ${res.status} ${res.statusText}: ${String(input)}`);
      return fallback;
    }
    const raw = await res.text();
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  } catch (e) {
    console.warn('[notion] fetch failed:', (e as Error)?.message);
    return fallback;
  }
}
