// RATAパス 先行登録 簡易管理ビュー (Vercel Serverless Function)
// URL: https://rata.jp/api/admin
// Basic認証で保護。ADMIN_USER / ADMIN_PASS を環境変数で設定してください。
// CSVエクスポート: https://rata.jp/api/admin?export=csv

import { tursoExecute, rowsToObjects } from './_turso.js';

function checkAuth(req) {
  const header = req.headers.authorization || '';
  const [, encoded] = header.split(' ');
  if (!encoded) return false;
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  const [user, pass] = decoded.split(':');
  return user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS;
}

function toCSV(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="RATA Admin"');
    return res.status(401).send('認証が必要です。');
  }

  let rows;
  try {
    const result = await tursoExecute('SELECT * FROM rata_pre_registrations ORDER BY created_at DESC');
    rows = rowsToObjects(result);
  } catch (e) {
    console.error('Turso select error:', e);
    return res.status(500).send('データベースの取得に失敗しました。');
  }

  if (req.query.export === 'csv') {
    const csv = toCSV(rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="rata_registrations.csv"');
    return res.status(200).send('﻿' + csv);
  }

  const total = rows.length;
  const byLang = {};
  for (const r of rows) byLang[r.language] = (byLang[r.language] || 0) + 1;

  const tableRows = rows
    .slice(0, 200)
    .map(
      (r) => `
    <tr>
      <td>${r.created_at}</td><td>${r.email}</td><td>${r.name || ''}</td>
      <td>${r.country || ''}</td><td>${r.language}</td><td>${r.visit_intent}</td>
      <td>${r.interests || ''}</td><td>${r.price_expectation || ''}</td><td>${r.companions ?? ''}</td>
    </tr>`
    )
    .join('');

  const statCards = Object.entries(byLang)
    .map(([lang, c]) => `<div class="stat-card"><div class="n">${c}</div><div class="l">言語: ${lang}</div></div>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><title>RATAパス 先行登録 管理画面</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #061820; color: #fff; padding: 24px; }
  h1 { font-size: 20px; margin-bottom: 16px; }
  .stats { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat-card { background: rgba(46,155,181,0.15); border: 0.5px solid rgba(126,205,224,0.3); border-radius: 8px; padding: 12px 18px; }
  .stat-card .n { font-size: 22px; font-weight: 600; color: #7ECDE0; }
  .stat-card .l { font-size: 11px; color: rgba(255,255,255,0.6); }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
  th, td { border-bottom: 0.5px solid rgba(126,205,224,0.15); padding: 8px; text-align: left; white-space: nowrap; }
  th { color: #7ECDE0; font-weight: 500; }
  a.export { display: inline-block; margin-bottom: 16px; background: #2E9BB5; color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 12px; }
</style></head>
<body>
  <h1>RATAパス 先行登録 管理画面</h1>
  <a class="export" href="?export=csv">CSVダウンロード</a>
  <div class="stats">
    <div class="stat-card"><div class="n">${total}</div><div class="l">総登録数</div></div>
    ${statCards}
  </div>
  <table>
    <tr><th>登録日時</th><th>メール</th><th>氏名</th><th>国</th><th>言語</th><th>訪問意向</th><th>興味</th><th>価格期待</th><th>同伴</th></tr>
    ${tableRows}
  </table>
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
