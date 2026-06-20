// RATAパス 先行案内登録 受信エンドポイント (Vercel Serverless Function)
// DB: Turso (libSQL HTTP API — SDKは既知の不具合を避けるため使用しない)  /  Mail: Resend
//
// 必要な環境変数 (Vercelの Project Settings > Environment Variables で設定):
//   TURSO_DATABASE_URL   - Tursoデータベース接続URL (libsql://...)
//   TURSO_AUTH_TOKEN      - Tursoの認証トークン
//   RESEND_API_KEY        - Resend APIキー
//   MAIL_FROM              - 送信元アドレス (例: RATA Japan <info@rata.jp>)
//   MAIL_BCC                - 管理者への通知先 (任意)

import { Resend } from 'resend';
import { tursoExecute } from './_turso.js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const body = req.body || {};
  const email = (body.email || '').trim();
  const name = (body.name || '').trim();
  const country = (body.country || '').trim();
  const language = (body.language || '').trim();
  const visitIntent = (body.visit_intent || '').trim();
  const interests = Array.isArray(body.interests) ? body.interests.join(',') : (body.interests || '');
  const priceExpectation = (body.price_expectation || '').trim();
  const companions = body.companions !== '' && body.companions != null ? parseInt(body.companions, 10) : null;
  const reason = (body.reason || '').trim();
  const consent = !!body.consent;
  const utmSource = (body.utm_source || '').trim();
  const utmCampaign = (body.utm_campaign || '').trim();

  const errors = [];
  if (!isValidEmail(email)) errors.push('メールアドレスの形式が正しくありません。');
  if (!language) errors.push('希望言語を選択してください。');
  if (!visitIntent) errors.push('訪問意向を選択してください。');
  if (!consent) errors.push('プライバシーポリシーへの同意が必要です。');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  try {
    await tursoExecute(
      `INSERT INTO rata_pre_registrations
       (email, name, country, language, visit_intent, interests, price_expectation,
        companions, reason, utm_source, utm_campaign, consent, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        name || null,
        country || null,
        language,
        visitIntent,
        interests || null,
        priceExpectation || null,
        companions,
        reason || null,
        utmSource || null,
        utmCampaign || null,
        consent ? 1 : 0,
        req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
      ]
    );
  } catch (e) {
    console.error('Turso insert error:', e);
    return res.status(500).json({ success: false, message: '登録処理中にエラーが発生しました。時間をおいて再度お試しください。' });
  }

  // 自動返信メール（Resend未設定の場合はスキップ）
  if (resend && process.env.MAIL_FROM) {
    try {
      await resend.emails.send({
        from: process.env.MAIL_FROM,
        to: email,
        bcc: process.env.MAIL_BCC || undefined,
        subject: '【RATA】先行案内登録ありがとうございます',
        text: `${name ? name + '様' : 'お申込みありがとうございます'}

RATAパス先行案内登録へのお申し込みありがとうございます。

現在、正式な提供開始に向けて構想・需要検証を行っております。
正式リリースが近づきましたら、優先的にご案内いたします。

------------------------------
一般社団法人 リジェネラティブアートツーリズム協会（RATA）
Email: info@rata.jp
https://rata.jp/
------------------------------

※本メールに心当たりのない場合は、破棄していただけますと幸いです。`,
      });
    } catch (e) {
      console.error('Resend error (non-fatal):', e);
    }
  }

  return res.status(200).json({ success: true });
}
