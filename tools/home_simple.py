# -*- coding: utf-8 -*-
"""トップページの3事業を、丸アイコンの横並びカードにシンプル化する"""
import io
import sys

p = 'src/pages/index.astro'
s = io.open(p, encoding='utf-8').read()

start = s.index('      <div class="service-list">')
end = s.index('    </div>\n  </section>\n', start)

new_markup = """      <div class="service-list">
        {SERVICES.map((s) => (
          <a class="service-card reveal" href={withBase(`/service/${s.id}`)}>
            <span class="icon" aria-hidden="true" set:html={SERVICE_ICONS[s.id]} />
            <span class="card-no">{s.no}｜{s.en}</span>
            <span class="card-name">{s.name}</span>
            <span class="card-lead">{s.lead}</span>
            <span class="card-more">くわしく見る →</span>
          </a>
        ))}
      </div>
"""
s = s[:start] + new_markup + s[end:]

# アイコン定義をフロントマターに追加
s = s.replace(
    "const hasSns = SNS_LINKS.some((s) => s.url);",
    """const hasSns = SNS_LINKS.some((s) => s.url);

// 事業ごとの丸アイコン（線画・共通の太さで統一）
const SERVICE_ICONS: Record<string, string> = {
  // 占いコミュニティ：仲間（3人）
  community:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.2" r="3.1"/><path d="M6.4 19.2a5.6 5.6 0 0 1 11.2 0"/><circle cx="4.6" cy="10.4" r="2.1"/><path d="M1.6 17.6a3.1 3.1 0 0 1 3.6-2.9"/><circle cx="19.4" cy="10.4" r="2.1"/><path d="M22.4 17.6a3.1 3.1 0 0 0-3.6-2.9"/></svg>',
  // テレアポ：ヘッドセット
  telemarketing:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13.5v-1.8a8 8 0 0 1 16 0v1.8"/><rect x="2.4" y="13" width="4" height="6" rx="1.6"/><rect x="17.6" y="13" width="4" height="6" rx="1.6"/><path d="M20 19v.6a2.6 2.6 0 0 1-2.6 2.6H13"/></svg>',
  // 営業代行：右肩上がりのグラフ
  sales:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M4.5 15.5l4.5-4.6 3.4 3.2 6.6-7"/><path d="M15.4 7.1h3.6v3.6"/></svg>',
};""",
)

# スタイル：featured系 → シンプルなカードへ
style_start = s.index('  /* 事業カード（3つとも同じレイアウト） */')
style_end = s.index('  /* 占い師としての名前ブロック */')
new_style = """  /* 事業カード（丸アイコンの横並び・シンプル） */
  .service-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 48px;
  }
  .service-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
    padding: 40px 26px 34px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: var(--shadow-sm);
    text-decoration: none;
    color: var(--text);
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .service-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    border-color: var(--line);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 92px;
    height: 92px;
    margin-bottom: 8px;
    border-radius: 50%;
    background: linear-gradient(150deg, var(--accent-pale), #ffffff);
    border: 1px solid var(--border);
    color: var(--accent-deep);
    transition: background 0.3s ease;
  }
  .service-card:hover .icon { background: linear-gradient(150deg, #c9f4e2, var(--accent-pale)); }
  .icon :global(svg) { width: 40px; height: 40px; }

  .card-no {
    font-family: var(--font-serif);
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    color: var(--accent);
  }
  .card-name { font-family: var(--font-serif); font-size: 1.14rem; line-height: 1.6; }
  .card-lead { color: var(--muted); font-size: 0.88rem; line-height: 1.8; }
  .card-more { margin-top: 8px; font-size: 0.82rem; color: var(--accent-deep); }
  .service-card:hover .card-more { text-decoration: underline; text-underline-offset: 4px; }

"""
s = s[:style_start] + new_style + s[style_end:]

# レスポンシブ：スマホは1列、タブレットは詰めて表示
s = s.replace(
    """  @media (max-width: 900px) {
    .alias { grid-template-columns: 1fr; gap: 28px; padding: 32px 26px; text-align: center; }""",
    """  @media (max-width: 900px) {
    .service-list { gap: 18px; }
    .service-card { padding: 30px 18px 26px; }
    .icon { width: 76px; height: 76px; }
    .icon :global(svg) { width: 34px; height: 34px; }
    .card-name { font-size: 1.02rem; }
    .card-lead { font-size: 0.82rem; }
    .alias { grid-template-columns: 1fr; gap: 28px; padding: 32px 26px; text-align: center; }""",
)
s = s.replace(
    """  @media (max-width: 860px) {
    .hero { padding: 48px 0 60px; }""",
    """  @media (max-width: 620px) {
    .service-list { grid-template-columns: 1fr; }
    .service-card { padding: 28px 22px; }
  }

  @media (max-width: 860px) {
    .hero { padding: 48px 0 60px; }""",
)

io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok', p)
