# RATA — Regenerative Art Tourism Association

RATA PASSの先行登録・パスID発行・将来的な決済/マイページ実装に対応するためのWebアプリ基盤（Phase 2 MVP）。

## 技術スタック

- Next.js (App Router) + TypeScript
- CSS Modules
- Supabase（先行登録者データの保存）
- Vercel（ホスティング）

Stripe・Resendは本フェーズでは未実装です。

## ページ構成

| パス | 内容 |
|---|---|
| `/` | トップページ |
| `/about` | About RATA |
| `/public-notice` | 公告情報 |
| `/pass` | RATA PASS紹介 |
| `/pass/register` | RATA PASS先行登録フォーム |
| `/pass/thanks` | 登録完了（仮RATA PASS ID表示） |
| `/admin/waitlist` | 登録者一覧（**認証なし。本番公開前に要対応**） |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの準備

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. SQL Editorで `supabase/schema.sql` の内容を実行し、`waitlist` テーブルを作成
3. プロジェクトの Settings → API から以下を取得
   - Project URL
   - `anon` `public` キー
   - `service_role` キー（**サーバー側のみで使用。クライアントに公開しないこと**）

### 3. 環境変数の設定

`.env.example` を `.env.local` にコピーし、値を入力する。

```bash
cp .env.example .env.local
```

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabaseプロジェクトのエンドポイント |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | クライアント側で使用する公開キー |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバー側（API Route・管理ページ）専用。RLSをバイパスするため厳重に管理する |

Vercelにデプロイする場合は、Project Settings → Environment Variables に同じ3つを設定する。

### 4. ローカル起動

```bash
npm run dev
```

`http://localhost:3000` でトップページが表示されます。

## 既知の制約・今後の対応事項

- `/admin/waitlist` は認証なしで全件取得・表示する。本番公開前に、Basic認証またはSupabase Authによるログイン保護を `middleware.ts` 等で追加すること。
- RATA PASS IDは `RATA-TKN-XXXXXX`（ランダム6文字）形式。連番管理が必要になった場合はテーブル設計の見直しが必要。
- 決済（Stripe）・メール送信（Resend）は未実装。Phase 2の次段階で `/pass/checkout` 等を追加する想定。
