/**
 * 凰凛サイト お問い合わせフォーム受け口（Google Apps Script）
 * ------------------------------------------------------------
 * 役割：サイトのお問い合わせフォームから送られた内容を Notion の「お問い合わせ」DBに登録し、
 *       送信者への自動返信メールと、運営への通知メールを送ります。
 *
 * 【セットアップ手順】
 * 1. https://script.google.com/ で新しいプロジェクトを作成し、このファイルの中身を貼り付ける
 * 2. 左メニュー「プロジェクトの設定」→「スクリプト プロパティ」に以下を追加
 *      NOTION_API_KEY   : Notionインテグレーションのシークレット（ntn_... ）
 *      NOTION_CONTACT_DB: お問い合わせデータベースのID（32桁）
 *      OWNER_EMAIL      : 通知を受け取るメールアドレス
 *      OWNER_NAME       : 署名に使う名前（未設定なら「凰凛」）
 * 3. Notion側で、お問い合わせDBを「コネクト」からインテグレーションに接続（共有）する
 * 4. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *      次のユーザーとして実行 : 自分
 *      アクセスできるユーザー : 全員
 *    → 発行された /exec のURLを、サイトの src/consts.ts の GAS_CONTACT_URL に貼り付ける
 * 5. コードを変更したら「デプロイを管理」→ 鉛筆マーク →「バージョン: 新バージョン」で更新する
 *
 * 【Notion お問い合わせDBのプロパティ（この名前で作ってください）】
 *   お名前          : タイトル
 *   メール          : メール
 *   連絡先          : テキスト
 *   ご用件          : セレクト（占いコミュニティ／テレアポ／営業代行／個人鑑定／その他）
 *   形式            : セレクト（オンライン／対面／どちらでも）
 *   第1希望         : 日付
 *   第2希望         : 日付
 *   お問い合わせ内容 : テキスト
 *   ステータス      : セレクト（新規 / 対応中 / 完了）
 *   受付日時        : 日付
 */

var NOTION_VERSION = '2022-06-28';

function prop_(key, fallback) {
  var v = PropertiesService.getScriptProperties().getProperty(key);
  return v ? v : fallback || '';
}

/** 動作確認用（ブラウザでURLを開いたときに表示されます） */
function doGet() {
  return json_({ ok: true, message: '凰凛サイト お問い合わせ受付APIは稼働中です。' });
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
    var topic = String(body.topic || '').trim();
    var message = String(body.message || '').trim();
    var date1 = String(body.date1 || '').trim();
    var time1 = String(body.time1 || '').trim();
    var date2 = String(body.date2 || '').trim();
    var time2 = String(body.time2 || '').trim();

    if (!name || !email || !topic || !message) {
      return json_({ ok: false, message: '必須項目が入力されていません。' });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json_({ ok: false, message: 'メールアドレスの形式をご確認ください。' });
    }
    // かんたんな連投防止（同じメールから60秒以内の再送信を弾く）
    var cache = CacheService.getScriptCache();
    var cacheKey = 'contact_' + Utilities.base64Encode(email);
    if (cache.get(cacheKey)) {
      return json_({ ok: false, message: '送信済みです。しばらくしてからお試しください。' });
    }
    cache.put(cacheKey, '1', 60);

    // 日時は任意項目。日付だけ入力された場合は 00:00 として扱う
    var record = {
      name: name,
      email: email,
      contact: String(body.contact || '').trim(),
      topic: topic,
      style: String(body.style || '').trim(),
      message: message,
      start1: date1 ? date1 + 'T' + (time1 || '00:00') + ':00+09:00' : '',
      start2: date2 ? date2 + 'T' + (time2 || '00:00') + ':00+09:00' : '',
      display1: date1 ? date1 + ' ' + time1 : '（指定なし）',
      display2: date2 ? date2 + ' ' + time2 : '（なし）',
    };

    // ── Notionへ登録 ───────────────────────────
    var saved = createNotionPage_(record);
    if (!saved.ok) {
      // Notionが失敗してもメール通知だけは飛ばして取りこぼしを防ぐ
      notifyOwner_(record, 'Notion登録に失敗しました：' + saved.message);
      return json_({ ok: false, message: '送信に失敗しました。お手数ですが再度お試しください。' });
    }

    // ── メール送信 ─────────────────────────────
    try {
      sendCustomerMail_(record);
    } catch (err) {
      // メール失敗は致命的ではないので握りつぶす
    }
    notifyOwner_(record, '');

    return json_({ ok: true, message: 'お問い合わせを受け付けました。' });
  } catch (err) {
    return json_({ ok: false, message: '予期しないエラーが発生しました。' });
  }
}

/** Notion のお問い合わせDBに1件追加 */
function createNotionPage_(r) {
  var key = prop_('NOTION_API_KEY');
  var db = prop_('NOTION_CONTACT_DB');
  if (!key || !db) return { ok: false, message: 'スクリプトプロパティが未設定です。' };

  var properties = {
    'お名前': { title: [{ text: { content: r.name } }] },
    'メール': { email: r.email },
    'ご用件': { select: { name: r.topic } },
    'ステータス': { select: { name: '新規' } },
    '受付日時': { date: { start: new Date().toISOString() } },
    'お問い合わせ内容': { rich_text: [{ text: { content: r.message.slice(0, 1900) } }] },
  };
  if (r.contact) properties['連絡先'] = { rich_text: [{ text: { content: r.contact } }] };
  if (r.style) properties['形式'] = { select: { name: r.style } };
  if (r.start1) properties['第1希望'] = { date: { start: r.start1 } };
  if (r.start2) properties['第2希望'] = { date: { start: r.start2 } };

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

/** 送信者への自動返信メール */
function sendCustomerMail_(r) {
  var owner = prop_('OWNER_NAME', '凰凛');
  var subject = '【' + owner + '】お問い合わせを受け付けました';
  var lines = [
    r.name + ' 様',
    '',
    'このたびはお問い合わせいただきありがとうございます。',
    '以下の内容で受け付けいたしました。',
    '',
    '─────────────',
    'ご用件：' + r.topic,
    '形式：' + (r.style || '未選択'),
    '第1希望：' + r.display1,
    '第2希望：' + r.display2,
    '',
    'お問い合わせ内容：',
    r.message,
    '─────────────',
    '',
    '※こちらは自動返信です。',
    '　内容を確認のうえ、' + owner + 'より改めてご連絡をお送りします。',
    '',
    'どうぞよろしくお願いいたします。',
    '',
    owner,
  ];
  MailApp.sendEmail({ to: r.email, subject: subject, body: lines.join('\n'), name: owner });
}

/** 運営への通知メール */
function notifyOwner_(r, warning) {
  var to = prop_('OWNER_EMAIL');
  if (!to) return;
  var lines = [
    warning ? '⚠ ' + warning : '新しいお問い合わせが届きました。',
    '',
    'お名前：' + r.name,
    'メール：' + r.email,
    '連絡先：' + (r.contact || '（なし）'),
    'ご用件：' + r.topic,
    '形式：' + (r.style || '未選択'),
    '第1希望：' + r.display1,
    '第2希望：' + r.display2,
    '',
    'お問い合わせ内容：',
    r.message || '（なし）',
  ];
  MailApp.sendEmail({ to: to, subject: '【お問い合わせ】' + r.name + ' 様（' + r.topic + '）', body: lines.join('\n') });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
