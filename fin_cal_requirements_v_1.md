# FinCal 要件定義書 v1.0

---

## 1. 背景・目的

会計・ファイナンス領域のイベント情報を一元化し、誰でも自由に追加できるオープンカレンダー **FinCal** を提供する。イベント発見コストの削減とコミュニティ活性化、主催者と参加者のマッチング機会拡大を狙う。

---

## 2. スコープ

| 区分     | 含む (In)                                                              | 含まない (Out)                                  |
| ------ | -------------------------------------------------------------------- | ------------------------------------------- |
| **機能** | イベント投稿フォーム / 承認フロー / カレンダービュー / 検索・フィルタ / ICS配信                      | チケット決済 / 複雑なアクセス権制御 / モバイルアプリ / **Slack通知** |
| **技術** | Supabase (PostgreSQL, Auth, Storage) / Next.js (Vercel) / Prisma ORM | Notion / Slack Webhook / オンプレミス環境           |

---

## 3. 利用者・権限

| 役割     | 権限                          |
| ------ | --------------------------- |
| 一般ユーザー | カレンダー閲覧・検索・ICS購読            |
| 投稿ユーザー | フォーム経由でイベント追加（初期 *pending*） |
| モデレーター | pending→published 承認・編集・削除  |
| 管理者    | モデレーター全権限＋システム設定・データモデル変更   |

---

## 4. 機能要件（FR）

| ID  | 要件                                                         |
| --- | ---------------------------------------------------------- |
| FR1 | **公開カレンダー表示**：月 / 週 / リストビュー、タグ・日付・地域フィルタ、フリーワード検索         |
| FR2 | **イベント投稿フォーム**：誰でも入力可能。入力項目はデータモデルに準拠                      |
| FR3 | **承認ワークフロー**：投稿後 status=pending → モデレーターが確認し published へ変更 |
| FR4 | **画像アップロード**：カバー画像／ロゴを Supabase Storage に保存                |
| FR5 | **ICSエクスポート**：公開イベントを iCal URL で購読可能                       |
| FR6 | （削除済み）Slack 通知は不要                                          |
| FR7 | **多言語対応**：UI 日本語優先、将来英語切替を想定                               |
| FR8 | **Analytics**：閲覧数・クリック数を簡易計測（Vercel Web Analytics 等）       |

---

## 5. データモデル（PostgreSQL）

```sql
CREATE TYPE event_status AS ENUM ('pending','published','rejected');
CREATE TYPE event_type   AS ENUM ('seminar','webinar','meetup','workshop','other');

CREATE TABLE events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT       NOT NULL,
  start_at     TIMESTAMP  NOT NULL,
  end_at       TIMESTAMP  NOT NULL,
  type         event_type NOT NULL,
  organizer    TEXT       NOT NULL,
  place        TEXT       NOT NULL,
  register_url TEXT       NOT NULL,
  fee          INTEGER,
  target       TEXT[],
  description  TEXT,
  image_url    TEXT,
  prefecture   CHAR(2),
  status       event_status NOT NULL DEFAULT 'pending',
  created_by   UUID        NOT NULL,
  created_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);
```

---

## 6. 非機能要件（NFR）

| カテゴリ    | 要件                                                     |
| ------- | ------------------------------------------------------ |
| パフォーマンス | 初期ロード < 2 秒（Edge Cache）                                |
| セキュリティ  | Supabase RLS で本人以外の直接更新禁止、Auth は GitHub / Google Oauth |
| 可用性     | 99.9% (Vercel & Supabase SLA)                          |
| 拡張性     | Prisma でスキーマ一元管理・マイグレーション自動化                           |
| 保守性     | README・ER 図を自動生成し、変更毎に更新                               |

---

## 7. システム構成

```mermaid
graph TD
  A[Next.js (Vercel)] --REST/GraphQL--> B[Supabase API]
  B --> C[(PostgreSQL)]
  B --> D[Supabase Storage]
  A -->|Public ICS Feed| E[Calendar Apps]
```

---

## 8. ワークフロー詳細

1. **投稿**：`/submit` 画面 → Supabase `events(status=pending)` に insert
2. **承認**：モデレーターが `/admin` で内容確認 → `status=published` に更新
3. **公開**：ISR Revalidate でサイトへ即反映
4. **購読**：ユーザーは `https://fincal.io/calendar.ics` を自身のカレンダーへ登録

---

## 9. マイルストーン

| フェーズ          | 完了目標 | 内容                              |
| ------------- | ---- | ------------------------------- |
| 0. Setup      | D+1  | GitHub repo & Supabase プロジェクト作成 |
| 1. MVP        | D+7  | カレンダー表示＋投稿フォーム (pending 固定)     |
| 2. Moderation | D+14 | 承認ダッシュボード追加                     |
| 3. UX強化       | D+21 | フィルタ UI・ICS 配信実装                |
| 4. GA         | D+30 | SEO / 解析 / ドキュメント整備             |

---

## 10. ガバナンス・運用ポリシー

- **掲載基準**：会計・ファイナンス関連に限定し、重複・スパムを排除
- **画像反映遅延**：アップロード後、CDN 反映に最大 10 分要す旨を明記
- **免責**：イベント内容の最新性・正確性は主催者の責任
- **著作権**：投稿画像・ロゴは掲載目的で二次利用を許諾されたものとみなす

---

*最終更新: 2025-08-01*

