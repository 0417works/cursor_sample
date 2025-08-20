# 掲示板システム（Bulletin Board System）

## プロジェクト概要

ユーザーが投稿・閲覧・コメントできる掲示板システムです。IT技術の成長目標評価におけるレベル2達成を目指して開発されています。

## 技術スタック

### フロントエンド
- React.js 18.x
- TypeScript
- Tailwind CSS
- Axios

### バックエンド
- Node.js 18.x
- Express.js 4.x
- TypeScript
- JWT認証

### データベース
- PostgreSQL 14.x
- Prisma ORM

### その他
- Multer（ファイルアップロード）
- Nodemailer（メール送信）
- Jest（テスト）

## プロジェクト構造

```
bulletin-board-system/
├── frontend/          # Reactフロントエンド
├── backend/           # Node.jsバックエンド
├── database/          # データベース関連ファイル
├── docs/             # ドキュメント
└── README.md         # このファイル
```

## セットアップ手順

### 1. 環境構築
```bash
# 必要なソフトウェア
- Node.js 18.x以上
- PostgreSQL 14.x以上
- Git
```

### 2. リポジトリのクローン
```bash
git clone <repository-url>
cd bulletin-board-system
```

### 3. バックエンドのセットアップ
```bash
cd backend
npm install
npm run dev
```

### 4. フロントエンドのセットアップ
```bash
cd frontend
npm install
npm start
```

### 5. データベースのセットアップ
```bash
cd database
# PostgreSQLの設定とテーブル作成
```

## 機能一覧

### レベル1達成要件
- [x] ループ処理（投稿一覧表示、ページネーション）
- [x] 条件分岐（権限制御、表示制御）
- [x] 配列・オブジェクト利用
- [x] ユーザー認証（JWT）
- [x] CRUD操作（投稿、コメント、ユーザー）
- [x] ファイル操作（画像アップロード）

### レベル2達成要件
- [x] 非同期処理（API通信、非同期UI更新）
- [x] 外部API利用（天気API、画像検索API）
- [x] メール送信機能
- [x] 複数テーブル操作（結合検索）
- [x] ファイルアップロード/ダウンロード
- [x] テストコード

## 開発スケジュール

- **フェーズ1**: 環境構築・基本CRUD機能（2週間）
- **フェーズ2**: 認証・ファイルアップロード（2週間）
- **フェーズ3**: 非同期処理・外部API（2週間）
- **フェーズ4**: テスト・最終調整（1週間）

## ライセンス

MIT License

## 作成者

AI Assistant
