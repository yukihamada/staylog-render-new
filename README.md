# StayLog - Next.js Subscription App with PostgreSQL and Stripe

StayLogは旅館業法に基づく宿泊者情報の収集と管理を簡単にするサブスクリプションアプリです。

## 特徴

- Next.js App Router
- PostgreSQL データベース
- JWT 認証
- Stripe 決済
- 多言語対応（日本語・英語）
- モバイルレスポンシブデザイン
- TypeScript

## 機能

- ユーザー認証（登録、ログイン、パスワードリセット）
- 施設管理（追加、編集、削除）
- 宿泊者登録（個別登録、QRコード共有）
- サブスクリプション管理（プラン選択、支払い）

## Renderへのデプロイ方法

### ワンクリックデプロイ

以下のボタンをクリックして、Renderにデプロイできます：

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yukihamada/staylog-render-new)

### 手動デプロイ

1. [Render](https://render.com/)にログイン
2. ダッシュボードから「New +」→「Blueprint」を選択
3. GitHubアカウントを連携し、「yukihamada/staylog-render-new」リポジトリを選択
4. 「Apply Blueprint」ボタンをクリックしてデプロイを開始

Renderは`render.yaml`ファイルを読み込み、自動的にWebサービスとPostgreSQLデータベースを設定します。

## 環境変数

デプロイ後、以下の環境変数を設定してください：

- `DATABASE_URL`: PostgreSQLデータベースのURL（Renderが自動的に設定）
- `JWT_SECRET`: JWT認証用のシークレットキー
- `NEXT_PUBLIC_SITE_URL`: デプロイされたサイトのURL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: StripeのPublishable Key
- `STRIPE_SECRET_KEY`: StripeのSecret Key
- `STRIPE_WEBHOOK_SECRET`: StripeのWebhook Secret

## テストユーザー

デプロイ後、以下のテストユーザーでログインできます：
- メールアドレス: test@staylog.jp
- パスワード: StayLog2025!

## ローカル開発

### 1. リポジトリをクローン

```bash
git clone https://github.com/yukihamada/staylog-render-new.git
cd staylog-render-new
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env.local`ファイルをプロジェクトのルートに作成し、以下の変数を追加：

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

### 4. データベースを初期化

```bash
npm run db:init
```

### 5. 開発サーバーを起動

```bash
npm run dev
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。
