# RATAパス 先行案内登録サイト

Vercel + Turso + Resend + GitHub によるサーバーレス構成。

## 構成

```
index.html          メインLP（先行案内登録フォーム）
thanks.html          登録完了ページ
privacy.html         プライバシーポリシー
images/              実画像（Ocean Gaia写真・ロゴ）
api/register.js      フォーム受信 → Turso保存 → Resendで自動返信（Vercel Serverless Function）
api/admin.js          登録一覧の確認・CSV出力（Basic認証）
schema.sql            Turso用テーブル定義
```

## セットアップ手順

### 1. Turso データベース作成

```bash
# Turso CLI インストール（初回のみ）
curl -sSfL https://get.tur.so/install.sh | bash

# ログイン
turso auth login

# データベース作成
turso db create rata-pre-registrations

# 接続情報取得
turso db show rata-pre-registrations --url
turso db tokens create rata-pre-registrations
```

上記の URL と トークンを後で Vercel の環境変数に設定します。

### 2. スキーマ適用

```bash
turso db shell rata-pre-registrations < schema.sql
```

### 3. Resend アカウント作成（自動返信メール用）

1. https://resend.com で無料登録
2. ドメイン `rata.jp` を検証（DNSにTXT/CNAME追加）
3. APIキーを発行

### 4. GitHub リポジトリ作成

```bash
cd rata-site
git init
git add .
git commit -m "Initial commit: RATAパス先行案内登録サイト"
gh repo create rata-site --private --source=. --push
```

### 5. Vercel にデプロイ

1. https://vercel.com にログイン（GitHubアカウントで連携）
2. "Add New Project" → GitHubリポジトリ `rata-site` を選択
3. Environment Variables に `.env.example` の内容を設定:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `RESEND_API_KEY`
   - `MAIL_FROM`
   - `MAIL_BCC`
   - `ADMIN_USER`
   - `ADMIN_PASS`
4. Deploy

### 6. ドメイン接続（rata.jp）

Vercel Project → Settings → Domains → `rata.jp` を追加。

お名前.com 側でネームサーバーをVercelに向けるか、A/CNAMEレコードのみ変更：

```
お名前.com コントロールパネル → DNS設定
タイプ: A     ホスト名: @     値: 76.76.21.21（Vercelが指示する値）
タイプ: CNAME ホスト名: www   値: cname.vercel-dns.com
```

※ メールサーバー（mail1032.onamae.ne.jp）を使い続ける場合は、MXレコードはそのまま残してください。AレコードとCNAMEだけVercel向けに変更すればメールは影響を受けません。

## 運用

- **登録データ確認**: `https://rata.jp/api/admin`（Basic認証）
- **CSVダウンロード**: `https://rata.jp/api/admin?export=csv`
- **コード更新**: `git push` するとVercelが自動デプロイ

## ローカル開発

```bash
npm install
npx vercel dev
```
