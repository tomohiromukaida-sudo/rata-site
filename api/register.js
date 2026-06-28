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

// 高意向リードスコア計算（仕様の重み付けに準拠）
function computeHighIntentScore({ visitIntent, priceExpectation, interests, experienceInterest }) {
  let score = 0;
  if (visitIntent === 'asap') score += 3;
  else if (visitIntent === 'within_1y') score += 2;

  if (priceExpectation === '3000') score += 1;
  else if (priceExpectation === '5000') score += 2;
  else if (priceExpectation === '10000+') score += 3;

  if (experienceInterest.includes('snorkel') || experienceInterest.includes('diving')) score += 2;
  if (interests.includes('ocean_gaia')) score += 2;
  if (interests.includes('corporate')) score += 2;

  return score;
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
  const interestsArr = Array.isArray(body.interests) ? body.interests : (body.interests ? [body.interests] : []);
  const interests = interestsArr.join(',');
  const experienceInterestArr = Array.isArray(body.experience_interest)
    ? body.experience_interest
    : (body.experience_interest ? [body.experience_interest] : []);
  const experienceInterest = experienceInterestArr.join(',');
  const priceExpectation = (body.price_expectation || '').trim();
  const companions = body.companions !== '' && body.companions != null ? parseInt(body.companions, 10) : null;
  const reason = (body.reason || '').trim();
  const consent = !!body.consent;

  // 広告計測メタ情報（UTM等）。無くてもエラーにしない。
  const utmSource = (body.utm_source || '').trim();
  const utmMedium = (body.utm_medium || '').trim();
  const utmCampaign = (body.utm_campaign || '').trim();
  const utmContent = (body.utm_content || '').trim();
  const utmTerm = (body.utm_term || '').trim();
  const firstLandingPage = (body.first_landing_page || '').trim();
  const referrer = (body.referrer || '').trim();
  const adRegion = (body.ad_region || '').trim();
  const adConcept = (body.ad_concept || '').trim();
  const adLanguage = (body.ad_language || '').trim();
  const browserLanguage = (body.browser_language || '').trim();
  const deviceType = (body.device_type || '').trim();
  const screenWidth = body.screen_width != null && body.screen_width !== '' ? parseInt(body.screen_width, 10) : null;
  const screenHeight = body.screen_height != null && body.screen_height !== '' ? parseInt(body.screen_height, 10) : null;
  const userAgent = (body.user_agent || req.headers['user-agent'] || '').trim();

  const errors = [];
  if (!isValidEmail(email)) errors.push('メールアドレスの形式が正しくありません。');
  if (!language) errors.push('希望言語を選択してください。');
  if (!visitIntent) errors.push('訪問意向を選択してください。');
  if (!consent) errors.push('プライバシーポリシーへの同意が必要です。');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  const highIntentScore = computeHighIntentScore({
    visitIntent,
    priceExpectation,
    interests: interestsArr,
    experienceInterest: experienceInterestArr,
  });
  const highIntent = highIntentScore >= 5;

  try {
    await tursoExecute(
      `INSERT INTO rata_pre_registrations
       (email, name, country, language, visit_intent, interests, experience_interest, price_expectation,
        companions, reason, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        first_landing_page, referrer, ad_region, ad_concept, ad_language, browser_language,
        device_type, screen_width, screen_height, user_agent, high_intent_score, high_intent,
        consent, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        name || null,
        country || null,
        language,
        visitIntent,
        interests || null,
        experienceInterest || null,
        priceExpectation || null,
        companions,
        reason || null,
        utmSource || null,
        utmMedium || null,
        utmCampaign || null,
        utmContent || null,
        utmTerm || null,
        firstLandingPage || null,
        referrer || null,
        adRegion || null,
        adConcept || null,
        adLanguage || null,
        browserLanguage || null,
        deviceType || null,
        screenWidth,
        screenHeight,
        userAgent || null,
        highIntentScore,
        highIntent ? 1 : 0,
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
