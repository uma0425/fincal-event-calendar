# FinCal - 会計・ファイナンスイベントカレンダー

会計・ファイナンス領域のイベント情報を一元化し、誰でも自由に追加できるオープンカレンダーです。

## 🚀 機能

- **公開カレンダー**: 月/週/リストビューでイベントを表示
- **イベント投稿**: 誰でも簡単にイベントを投稿可能
- **承認ワークフロー**: モデレーターによる承認システム
- **ICS配信**: カレンダーアプリで購読可能
- **検索・フィルタ**: タイプ、地域、日付での絞り込み

## 🛠 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **バックエンド**: Supabase (PostgreSQL, Auth, Storage)
- **ORM**: Prisma
- **デプロイ**: Vercel
- **その他**: React Hook Form, Zod, date-fns, ics

## 📋 前提条件

- Node.js 18.0.0以上
- npm または yarn
- Supabaseアカウント
- Vercelアカウント（デプロイ時）

## 🚀 セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd fincal
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fincal"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)で新しいプロジェクトを作成
2. プロジェクトのURLとAPIキーを取得
3. SQL Editorでマイグレーションを実行：

```sql
-- supabase/migrations/001_initial_schema.sql の内容を実行
```

### 5. データベースのセットアップ

```bash
# Prismaクライアントの生成
npm run db:generate

# データベースへのプッシュ（開発環境）
npm run db:push
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認してください。

## 📁 プロジェクト構成

```
FinCal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   │   └── admin/         # 管理者ダッシュボード
│   │   ├── api/               # API Routes
│   │   │   ├── events/        # イベントCRUD
│   │   │   └── calendar.ics   # ICS配信
│   │   ├── submit/            # 投稿フォーム
│   │   ├── globals.css        # TailwindCSS
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx           # 公開カレンダー
│   ├── components/            # 再利用可能コンポーネント
│   │   ├── ui/               # 基本UIコンポーネント
│   │   ├── calendar/         # カレンダー関連
│   │   ├── forms/            # フォーム関連
│   │   └── admin/            # 管理者用コンポーネント
│   ├── lib/                  # ユーティリティ
│   │   ├── prisma.ts         # Prismaクライアント
│   │   ├── supabase.ts       # Supabaseクライアント
│   │   ├── ics.ts            # ICS生成
│   │   └── utils.ts          # 汎用ユーティリティ
│   └── types/                # TypeScript型定義
├── prisma/
│   └── schema.prisma         # データベーススキーマ
├── supabase/
│   └── migrations/           # データベースマイグレーション
└── public/                   # 静的ファイル
```

## 🔧 開発

### 利用可能なスクリプト

```bash
# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm run start

# リンターの実行
npm run lint

# Prisma Studioの起動
npm run db:studio

# データベースマイグレーション
npm run db:migrate
```

### データベースの管理

```bash
# スキーマの変更をデータベースに反映
npm run db:push

# マイグレーションファイルの生成
npx prisma migrate dev --name migration_name

# Prisma Studioでデータベースを確認
npm run db:studio
```

## 🚀 デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)でアカウントを作成
2. GitHubリポジトリを接続
3. 環境変数を設定：
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`

4. デプロイを実行

### 本番環境での注意事項

- SupabaseのRLS（Row Level Security）が有効になっていることを確認
- 環境変数が正しく設定されていることを確認
- データベースのバックアップを定期的に取得

## 📊 データモデル

### Events テーブル

| カラム | 型 | 説明 |
|--------|----|----|
| id | TEXT (PK) | イベントID |
| title | TEXT | イベントタイトル |
| start_at | TIMESTAMP | 開始日時 |
| end_at | TIMESTAMP | 終了日時 |
| type | event_type | イベントタイプ |
| organizer | TEXT | 主催者 |
| place | TEXT | 場所 |
| register_url | TEXT | 申込URL |
| fee | INTEGER | 参加費 |
| target | TEXT[] | 対象者 |
| description | TEXT | 説明 |
| image_url | TEXT | 画像URL |
| prefecture | CHAR(2) | 都道府県 |
| status | event_status | ステータス |
| created_by | TEXT | 作成者 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### Enum型

```sql
CREATE TYPE event_status AS ENUM ('pending', 'published', 'rejected');
CREATE TYPE event_type AS ENUM ('seminar', 'webinar', 'meetup', 'workshop', 'other');
```

## 🔐 セキュリティ

- Supabase RLS（Row Level Security）によるデータアクセス制御
- 入力値のバリデーション（Zod）
- CORS設定
- 環境変数による機密情報の管理

## 📈 パフォーマンス

- Next.js 14のApp Routerによる最適化
- ISR（Incremental Static Regeneration）
- Edge Cache
- 画像の最適化

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

ご質問やご要望がございましたら、お気軽にお問い合わせください。

---

**FinCal Team** - 会計・ファイナンスイベントカレンダー 