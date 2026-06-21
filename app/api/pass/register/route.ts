import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';
import { generatePassCode } from '@/lib/passId';

const MAX_ATTEMPTS = 5;

function isUniqueConstraintError(e: unknown): boolean {
  const message = e instanceof Error ? e.message : String(e);
  return message.includes('UNIQUE constraint failed');
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, country, language, interest, visit_intent, price_range } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'メールアドレスは必須です。' }, { status: 400 });
  }

  let db;
  try {
    db = getTursoClient();
  } catch (e) {
    console.error('Turso client error:', e);
    return NextResponse.json({ error: 'サーバー設定エラーが発生しました。' }, { status: 500 });
  }

  // pass_code is unique in both waitlist and passes; retry with a fresh code
  // on collision rather than failing the registration outright.
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const passCode = generatePassCode();

    try {
      // Both inserts happen in one transaction via batch — if either fails
      // (e.g. pass_code collision), neither row is committed.
      await db.batch(
        [
          {
            sql: `INSERT INTO waitlist
              (pass_code, email, name, country, language, interest, visit_intent, price_range)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              passCode,
              email,
              name || null,
              country || null,
              language || null,
              interest || null,
              visit_intent || null,
              price_range || null,
            ],
          },
          {
            sql: `INSERT INTO passes (pass_code, email, name, pass_type, status)
              VALUES (?, ?, ?, 'waitlist', 'pending')`,
            args: [passCode, email, name || null],
          },
        ],
        'write'
      );

      return NextResponse.json({ pass_code: passCode }, { status: 200 });
    } catch (e) {
      if (isUniqueConstraintError(e)) {
        continue; // retry with a new pass code
      }
      console.error('Turso insert error:', e);
      return NextResponse.json({ error: '登録処理に失敗しました。' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: '登録処理に失敗しました。' }, { status: 500 });
}
