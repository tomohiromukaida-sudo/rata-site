# RATA — Regenerative Art Tourism Association

RATA PASSの先行登録・仮パスID発行・パス証明ページに対応するためのWebアプリ基盤（Phase 2 MVP）。

## 技術スタック

- Next.js (App Router) + TypeScript
- CSS Modules
- Turso（libSQL/SQLite互換のエッジDB）+ `@libsql/client`
- Vercel（ホスティング）

Stripe・Resend・認証は本フェーズでは未実装です。

## ページ構成

| パス | 内容 |
|---|---|
| `/` | トップページ |
| `/about` | About RATA |
| `/public-notice` | 公告情報（Tursoの`public_notices`テーブルから取得） |
| `/pass` | RATA PASS紹介 |
| `/pass/register` | RATA PASS先行登録フォーム |
| `/pass/thanks` | 登録完了（仮RATA PASS ID表示） |
| `/pass/[passCode]` | パス証明ページ（存在しないコードは404） |
| `/admin/waitlist` | 登録者一覧（**認証なし。`ADMIN_ENABLED=true`の時のみ表示**） |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Tursoデータベースの準備

[Turso CLI](https://docs.turso.tech/cli/installation) を使う場合の例:

```bash
turso db create rata-pass
turso db shell rata-pass < turso/schema.sql
turso db show rata-pass --url
turso db tokens create rata-pass
```

- `turso/schema.sql` には `waitlist` / `passes` / `public_notices` / `monitoring_reports` の4テーブルのDDLが入っています（`monitoring_reports`は本フェーズではUIから未参照、将来の先行登録者向けレポート機能用）。
- `public_notices` には、Phase 1の静的サイトで掲載していた決算公告を引き継ぐための初期データ（INSERT文）も含まれています。不要であれば削除して構いません。

### 3. 環境変数の設定

`.env.example` を `.env.local` にコピーし、値を入力する。

```bash
cp .env.example .env.local
```

| 変数名 | 用途 |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://...` 形式のデータベースURL |
| `TURSO_AUTH_TOKEN` | Turso認証トークン |
| `ADMIN_ENABLED` | `true` の場合のみ `/admin/waitlist` を表示する。デフォルトは`false`（非表示） |

Vercelにデプロイする場合は、Project Settings → Environment Variables に同じ3つを設定する。`ADMIN_ENABLED`は必要なときだけ`true`にし、使い終わったら`false`に戻すこと。

### 4. ローカル起動

```bash
npm run dev
```

`http://localhost:3000` でトップページが表示されます。

## 既知の制約・今後の対応事項

- `/admin/waitlist` は認証なし。`ADMIN_ENABLED`での出し分けはアクセス制限ではなく見えないようにするだけの簡易対応であり、本番公開前にBasic認証またはセッションベースの認証を`middleware.ts`等で追加すること。
- RATA PASS IDは `RATA-TKN-XXXXXX`（ランダム6文字）形式。ユニーク制約（`waitlist.pass_code` / `passes.pass_code`）に違反した場合はAPI Route側で自動的に再生成・リトライする。
- 決済（Stripe）・メール送信（Resend）・ユーザー認証は未実装。Phase 2の次段階で `/pass/checkout` 等を追加する想定。
