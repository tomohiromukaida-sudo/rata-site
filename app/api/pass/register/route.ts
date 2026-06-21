import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generatePassCode } from '@/lib/passId';

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, country, language, interest, visit_intent, price_range } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'メールアドレスは必須です。' }, { status: 400 });
  }

  // pass_code has a unique constraint; retry with a fresh code on collision
  // rather than failing the registration outright.
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const passCode = generatePassCode();
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .insert({
        pass_code: passCode,
        email,
        name: name || null,
        country: country || null,
        language: language || null,
        interest: interest || null,
        visit_intent: visit_intent || null,
        price_range: price_range || null,
      })
      .select('pass_code')
      .single();

    if (!error) {
      return NextResponse.json({ pass_code: data.pass_code }, { status: 200 });
    }

    // 23505 = unique_violation in Postgres; retry on pass_code collision only.
    if (error.code !== '23505') {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: '登録処理に失敗しました。' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: '登録処理に失敗しました。' }, { status: 500 });
}
