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

## 広告計測（需要検証 Phase1）

### 広告計測の概要

UTMパラメータ付きで流入したユーザーの情報をlocalStorageに保存し、フォーム送信時に登録データと一緒にTursoへ保存します。GA4 / dataLayer（GTM想定） / Meta Pixelの3系統に同じイベントを送信します。実装は [js/tracking.js](./js/tracking.js)。

### UTMパラメータ一覧

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

命名規則は [docs/ad_plan/rata_pass_ad_plan_300k.md](./docs/ad_plan/rata_pass_ad_plan_300k.md) を参照。

### フォーム送信時に保存される項目

UTM 5項目に加えて以下を保存します（[js/tracking.js](./js/tracking.js) の `getFormPayloadFields()`、[api/register.js](./api/register.js) で受信・保存）。

- `first_landing_page`（初回ランディングページ）
- `referrer`
- `ad_region`（utm_campaignの命名規則から推測）
- `ad_concept`（utm_content相当）
- `ad_language`
- `browser_language`
- `device_type`（mobile/tablet/desktop）
- `screen_width` / `screen_height`
- `user_agent`
- `submitted_at`
- `experience_interest`（体験したい内容、複数選択）
- `high_intent_score` / `high_intent`（サーバー側で計算。スコア定義は [docs/ad_plan/rata_pass_ad_plan_300k.md](./docs/ad_plan/rata_pass_ad_plan_300k.md) を参照）

### GA4/GTMイベント一覧

`window.dataLayer.push()` および `gtag('event', ...)` で送信されるイベント（[js/tracking.js](./js/tracking.js)）:

- `page_view`
- `cta_click`
- `form_start`
- `form_submit`
- `form_error`
- `thank_you_view`
- `outbound_click`
- `language_switch`

※GTMコンテナを使う場合は、`dataLayer`に積まれたイベントをGTM側でトリガー設定する。GTMコンテナIDの実際の設定は人間が行う。

### Meta Pixelイベント一覧

各HTMLの`<head>`にMeta Pixelスニペットを挿入済み（`META_PIXEL_ID`は `REPLACE_WITH_PIXEL_ID` のプレースホルダーのまま無効化されている）。配信開始前に実際のPixel IDに差し替えること。

- `PageView`（標準イベント、Pixel読み込み時）
- 上記GA4/GTMイベントと同名のカスタムイベント（`fbq('trackCustom', eventName, ...)`）

### 広告入稿CSVの場所

[docs/ad_plan/ad_import_phase1.csv](./docs/ad_plan/ad_import_phase1.csv)

広告コピー一覧: [docs/ad_plan/ad_copy_phase1.md](./docs/ad_plan/ad_copy_phase1.md)

予算配分・KPI・運用方針: [docs/ad_plan/rata_pass_ad_plan_300k.md](./docs/ad_plan/rata_pass_ad_plan_300k.md)

### 週次レポートテンプレートの場所

[docs/ad_plan/weekly_report_template.md](./docs/ad_plan/weekly_report_template.md)

### 配信開始前チェックリスト

- [ ] GA4が発火している
- [ ] GTMが発火している
- [ ] Meta Pixelが発火している（`META_PIXEL_ID`を実際のIDに差し替え済み）
- [ ] `cta_click`が計測される
- [ ] `form_start`が計測される
- [ ] `form_submit`が計測される
- [ ] UTM付きURLで流入した場合、フォーム送信時にUTMが保存される
- [ ] `thank_you_view`が計測される
- [ ] プライバシーポリシーに計測ツール利用が記載されている
- [ ] 広告コピーを人間が確認済み
- [ ] 配信予算を人間が確認済み
- [ ] 広告アカウントの支払い設定が完了している

### 注意

**広告アカウントへの直接入稿、配信ON、予算変更はClaude/Codexでは実施しない。** 上記CSV・コピー・プランをもとに、人間が広告アカウント上で入稿・配信操作を行う。
