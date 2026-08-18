/**
 * 凰凛サイト 予約フォーム受け口（Google Apps Script）
 * ------------------------------------------------------------
 * 役割：サイトの予約フォームから送られた内容を Notion の「予約」DBに登録し、
 *       お客さまへの受付メールと、凰凛さんへの通知メールを送ります。
 *
 * 【セットアップ手順】
 * 1. https://script.google.com/ で新しいプロジェクトを作成し、このファイルの中身を貼り付ける
 * 2. 左メニュー「プロジェクトの設定」→「スクリプト プロパティ」に以下を追加
 *      NOTION_API_KEY   : Notionインテグレーションのシークレット（ntn_... ）
 *      NOTION_RESERVE_DB: 予約データベースのID（32桁）
 *      OWNER_EMAIL      : 通知を受け取るメールアドレス（凰凛さん）
 *      OWNER_NAME       : 署名に使う名前（未設定なら「凰凛」）
 * 3. Notion側で、予約DBを「コネクト」からインテグレーションに接続（共有）する
 * 4. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *      次のユーザーとして実行 : 自分
 *      アクセスできるユーザー : 全員
 *    → 発行された /exec のURLを、サイトの src/consts.ts の GAS_RESERVE_URL に貼り付ける
 * 5. コードを変更したら「デプロイを管理」→ 鉛筆マーク →「バージョン: 新バージョン」で更新する
 *
 * 【Notion 予約DBのプロパティ（この名前で作ってください）】
 *   お名前        : タイトル
 *   メール        : メール
 *   連絡先        : テキスト
 *   メニュー      : セレクト
 *   形式          : セレクト
 *   第1希望       : 日付
 *   第2希望       : 日付
 *   ご相談内容    : テキスト
 *   ステータス    : セレクト（申込 / 確定 / 完了 / キャンセル）
 *   受付日時      : 日付
 */

var NOTION_VERSION = '2022-06-28';

function prop_(key, fallback) {
  var v = PropertiesService.getScriptProperties().getProperty(key);
  return v ? v : fallback || '';
}

/** 動作確認用（ブラウザでURLを開いたときに表示されます） */
function doGet() {
  return json_({ ok: true, message: '凰凛サイト 予約受付APIは稼働中です。' });
}

function doPost(e) {
  try {
    var body = {};
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return json_({ ok: false, message: '送信データを読み取れませんでした。' });
    }

    // ── 入力チェック ────────────────────────────
    var name = String(body.name || '').trim();
    var email = String(body.email || '').trim();
    var menu = String(body.menu || '').trim();
    var date1 = String(body.date1 || '').trim();
    var time1 = String(body.time1 || '').trim();

    if (!name || !email || !menu || !date1 || !time1) {
      return json_({ ok: false, message: '必須項目が入力されていません。' });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json_({ ok: false, message: 'メールアドレスの形式をご確認ください。' });
    }
    // かんたんな連投防止（同じメールから60秒以内の再送信を弾く）
    var cache = CacheService.getScriptCache();
    var cacheKey = 'reserve_' + Utilities.base64Encode(email);
    if (cache.get(cacheKey)) {
      return json_({ ok: false, message: '送信済みです。しばらくしてからお試しください。' });
    }
    cache.put(cacheKey, '1', 60);

    var record = {
      name: name,
      email: email,
      contact: String(body.contact || '').trim(),
      menu: menu,
      style: String(body.style || '').trim(),
      start1: date1 + 'T' + time1 + ':00+09:00',
      start2: body.date2 && body.time2 ? body.date2 + 'T' + body.time2 + ':00+09:00' : '',
      message: String(body.message || '').trim(),
      display1: date1 + ' ' + time1,
      display2: body.date2 && body.time2 ? body.date2 + ' ' + body.time2 : '（なし）',
    };

    // ── Notionへ登録 ───────────────────────────
    var saved = createNotionPage_(record);
    if (!saved.ok) {
      // Notionが失敗してもメール通知だけは飛ばして取りこぼしを防ぐ
      notifyOwner_(record, 'Notion登録に失敗しました：' + saved.message);
      return json_({ ok: false, message: '登録に失敗しました。お手数ですが再度お試しください。' });
    }

    // ── メール送信 ─────────────────────────────
    try {
      sendCustomerMail_(record);
    } catch (err) {
      // メール失敗は致命的ではないので握りつぶす
    }
    notifyOwner_(record, '');

    return json_({ ok: true, message: 'ご予約を受け付けました。' });
  } catch (err) {
    return json_({ ok: false, message: '予期しないエラーが発生しました。' });
  }
}

/** Notion の予約DBに1件追加 */
function createNotionPage_(r) {
  var key = prop_('NOTION_API_KEY');
  var db = prop_('NOTION_RESERVE_DB');
  if (!key || !db) return { ok: false, message: 'スクリプトプロパティが未設定です。' };

  var properties = {
    'お名前': { title: [{ text: { content: r.name } }] },
    'メール': { email: r.email },
    'メニュー': { select: { name: r.menu } },
    'ステータス': { select: { name: '申込' } },
    '第1希望': { date: { start: r.start1 } },
    '受付日時': { date: { start: new Date().toISOString() } },
  };
  if (r.contact) properties['連絡先'] = { rich_text: [{ text: { content: r.contact } }] };
  if (r.style) properties['形式'] = { select: { name: r.style } };
  if (r.start2) properties['第2希望'] = { date: { start: r.start2 } };
  if (r.message) properties['ご相談内容'] = { rich_text: [{ text: { content: r.message.slice(0, 1900) } }] };

  var res = UrlFetchApp.fetch('https://api.notion.com/v1/pages', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + key,
      'Notion-Version': NOTION_VERSION,
    },
    payload: JSON.stringify({ parent: { database_id: db }, properties: properties }),
  });

  var code = res.getResponseCode();
  if (code >= 200 && code < 300) return { ok: true, message: '' };
  return { ok: false, message: code + ' ' + res.getContentText().slice(0, 300) };
}

/** お客さまへの受付メール */
function sendCustomerMail_(r) {
  var owner = prop_('OWNER_NAME', '凰凛');
  var subject = '【' + owner + '】ご予約を受け付けました';
  var lines = [
    r.name + ' 様',
    '',
    'このたびはご予約いただきありがとうございます。',
    '以下の内容で受け付けいたしました。',
    '',
    '─────────────',
    'ご希望メニュー：' + r.menu,
    '形式：' + (r.style || '未選択'),
    '第1希望：' + r.display1,
    '第2希望：' + r.display2,
    '─────────────',
    '',
    '※こちらはまだ「仮受付」の状態です。',
    '　内容を確認のうえ、' + owner + 'より日程確定のご連絡をお送りします。',
    '',
    'どうぞよろしくお願いいたします。',
    '',
    owner,
  ];
  MailApp.sendEmail({ to: r.email, subject: subject, body: lines.join('\n'), name: owner });
}

/** 凰凛さんへの通知メール */
function notifyOwner_(r, warning) {
  var to = prop_('OWNER_EMAIL');
  if (!to) return;
  var lines = [
    warning ? '⚠ ' + warning : '新しい予約が届きました。',
    '',
    'お名前：' + r.name,
    'メール：' + r.email,
    '連絡先：' + (r.contact || '（なし）'),
    'メニュー：' + r.menu,
    '形式：' + (r.style || '未選択'),
    '第1希望：' + r.display1,
    '第2希望：' + r.display2,
    '',
    'ご相談内容：',
    r.message || '（なし）',
  ];
  MailApp.sendEmail({ to: to, subject: '【予約】' + r.name + ' 様（' + r.display1 + '）', body: lines.join('\n') });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
