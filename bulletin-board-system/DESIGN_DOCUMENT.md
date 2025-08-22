## 📋 掲示板システム 設計書・操作説明書

### 📁 目次
1. [システム概要](#システム概要)
2. [技術仕様](#技術仕様)
3. [データベース設計](#データベース設計)
4. [API仕様](#api仕様)
5. [フロントエンド設計](#フロントエンド設計)
6. [認証・セキュリティ](#認証セキュリティ)
7. [操作説明書](#操作説明書)
8. [開発・デプロイ](#開発デプロイ)

---

## �� システム概要

### 概要
掲示板システムは、ユーザーが投稿を作成・編集・削除し、コメントを投稿できるWebアプリケーションです。パスワードリセット機能も含む完全な認証システムを備えています。

### 主要機能
- **ユーザー管理**: 新規登録、ログイン、ログアウト、プロフィール管理
- **投稿管理**: 投稿の作成・編集・削除、画像アップロード
- **コメント機能**: 投稿へのコメント投稿・管理
- **パスワードリセット**: メールベースのパスワードリセット機能
- **通知システム**: コメント通知のメール送信

---

## ��️ 技術仕様

### バックエンド
- **フレームワーク**: Express.js (Node.js)
- **データベース**: SQLite + Prisma ORM
- **認証**: JWT (JSON Web Token)
- **メール**: Nodemailer (開発環境ではモック)
- **バリデーション**: express-validator
- **セキュリティ**: Helmet, CORS, bcrypt

### フロントエンド
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **ルーティング**: React Router v6
- **状態管理**: React Context API
- **UIコンポーネント**: Lucide React Icons
- **通知**: React Hot Toast

### 開発環境
- **Node.js**: v18以上
- **パッケージマネージャー**: npm
- **データベース**: SQLite (開発用)
- **ポート**: バックエンド(3001), フロントエンド(5173)

---

## ��️ データベース設計

### テーブル構造

#### users テーブル
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### posts テーブル
```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  categoryId TEXT,
  authorId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
);
```

#### comments テーブル
```sql
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  postId TEXT NOT NULL,
  authorId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
);
```

#### categories テーブル
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### password_reset_tokens テーブル
```sql
CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  used BOOLEAN DEFAULT FALSE,
  userId TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔌 API仕様

### 認証関連

#### POST /api/auth/register
**新規ユーザー登録**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

#### POST /api/auth/login
**ユーザーログイン**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/forgot-password
**パスワードリセット要求**
```json
{
  "email": "user@example.com"
}
```

#### GET /api/auth/reset-password/validate/:token
**リセットトークン検証**

#### POST /api/auth/reset-password
**パスワードリセット実行**
```json
{
  "token": "jwt_token_here",
  "password": "newpassword123"
}
```

#### GET /api/auth/me
**現在のユーザー情報取得**

### 投稿関連

#### GET /api/posts
**投稿一覧取得**
- クエリパラメータ: `page`, `limit`, `category`, `search`

#### POST /api/posts
**新規投稿作成**
```json
{
  "title": "投稿タイトル",
  "content": "投稿内容",
  "categoryId": "category_id",
  "image": "image_url"
}
```

#### PUT /api/posts/:id
**投稿編集**

#### DELETE /api/posts/:id
**投稿削除**

### コメント関連

#### GET /api/posts/:id/comments
**投稿のコメント一覧取得**

#### POST /api/posts/:id/comments
**コメント投稿**
```json
{
  "content": "コメント内容"
}
```

---

## �� フロントエンド設計

### ページ構成
```
/
├── /login (ログイン)
├── /register (新規登録)
├── /forgot-password (パスワードリセット要求)
├── /reset-password/:token (パスワードリセット)
├── /posts (投稿一覧)
├── /posts/:id (投稿詳細)
├── /posts/create (投稿作成)
├── /posts/:id/edit (投稿編集)
├── /profile (プロフィール)
├── /terms (利用規約)
└── /privacy (プライバシーポリシー)
```

### コンポーネント構成
```
src/
├── components/
│   ├── ui/ (再利用可能UIコンポーネント)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Layout.tsx
├── contexts/
│   └── AuthContext.tsx
├── pages/ (各ページコンポーネント)
└── services/
    └── api.ts
```

---

## �� 認証・セキュリティ

### JWT認証フロー
1. **ログイン**: ユーザー認証後、JWTトークン発行
2. **アクセス制御**: 保護されたルートでトークン検証
3. **トークン更新**: リフレッシュトークンによる自動更新

### パスワードリセットフロー
1. **リセット要求**: メールアドレス入力
2. **トークン生成**: JWTトークン生成 + データベース保存
3. **メール送信**: リセットリンク付きメール送信
4. **パスワード更新**: トークン検証後、新パスワード設定

### セキュリティ対策
- **パスワードハッシュ化**: bcrypt (salt rounds: 12)
- **CORS設定**: 許可されたオリジンのみアクセス
- **入力バリデーション**: express-validatorによる厳密な検証
- **SQLインジェクション対策**: Prisma ORM使用
- **XSS対策**: Helmetによるセキュリティヘッダー

---

## �� 操作説明書

### ユーザー登録・ログイン

#### 1. 新規ユーザー登録
1. トップページから「新規登録」をクリック
2. 以下の情報を入力：
   - メールアドレス
   - ユーザー名（3-20文字、英数字・アンダースコアのみ）
   - パスワード（6文字以上、文字・数字を含む）
   - パスワード確認
3. 利用規約・プライバシーポリシーに同意
4. 「アカウント作成」ボタンをクリック

#### 2. ログイン
1. トップページから「ログイン」をクリック
2. メールアドレスとパスワードを入力
3. 「ログイン」ボタンをクリック

#### 3. パスワードリセット
1. ログイン画面で「パスワードを忘れた場合」をクリック
2. 登録済みのメールアドレスを入力
3. 「パスワードリセットメールを送信」ボタンをクリック
4. 受信したメールのリセットリンクをクリック
5. 新しいパスワードを設定（6文字以上、文字・数字を含む）

### 投稿・コメント機能

#### 1. 投稿作成
1. ログイン後、「投稿を作成」をクリック
2. 以下の情報を入力：
   - タイトル
   - 内容
   - カテゴリ（選択）
   - 画像（オプション）
3. 「投稿する」ボタンをクリック

#### 2. 投稿編集・削除
1. 自分の投稿の「編集」または「削除」ボタンをクリック
2. 編集の場合は内容を修正して「更新」をクリック
3. 削除の場合は確認ダイアログで「削除」をクリック

#### 3. コメント投稿
1. 投稿詳細ページでコメント欄に内容を入力
2. 「コメントを投稿」ボタンをクリック

### プロフィール管理

#### 1. プロフィール編集
1. ヘッダーのユーザー名をクリック
2. 「プロフィール」を選択
3. 以下の項目を編集：
   - ユーザー名
   - メールアドレス
   - 自己紹介
   - アバター画像
4. 「更新」ボタンをクリック

---

## �� 開発・デプロイ

### 開発環境セットアップ

#### 1. リポジトリクローン
```bash
git clone [repository-url]
cd bulletin-board-system
```

#### 2. バックエンドセットアップ
```bash
cd backend
npm install
cp .env.example .env
# .envファイルを編集
npm run dev
```

#### 3. フロントエンドセットアップ
```bash
cd frontend
npm install
npm run dev
```

### 環境変数設定

#### バックエンド (.env)
```env
# サーバー設定
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# SMTP設定（開発環境では無効）
SMTP_HOST=

# JWT設定
JWT_SECRET=your-secret-key-here

# データベース設定
DATABASE_URL="file:./dev.db"
```

### データベース操作

#### マイグレーション実行
```bash
cd backend
npx prisma migrate dev
```

#### シードデータ投入
```bash
cd backend
npx prisma db seed
```

### ビルド・デプロイ

#### フロントエンドビルド
```bash
cd frontend
npm run build
```

#### 本番環境デプロイ
1. 環境変数を本番用に設定
2. データベースを本番用（PostgreSQL等）に変更
3. SMTP設定を有効化
4. 静的ファイルをWebサーバーに配置

---

## �� 注意事項・制限事項

### パスワード要件
- **最小文字数**: 6文字
- **必須要素**: 文字（大文字・小文字問わず）、数字
- **推奨**: 8文字以上、特殊文字を含む

### ファイルアップロード
- **対応形式**: PNG, JPG, JPEG, GIF
- **最大サイズ**: 10MB
- **保存場所**: `backend/uploads/` ディレクトリ

### セキュリティ
- パスワードリセットトークンの有効期限: 1時間
- トークンは1回のみ使用可能
- パスワードリセット後は既存セッションを無効化

---

## 🔧 トラブルシューティング

### よくある問題

#### 1. パスワードリセットメールが届かない
- 開発環境ではバックエンドコンソールにログが表示される
- 環境変数`NODE_ENV`が`development`に設定されているか確認
- SMTP設定が正しく設定されているか確認

#### 2. データベース接続エラー
- Prismaクライアントが正しく初期化されているか確認
- データベースファイルのパーミッションを確認
- マイグレーションが実行されているか確認

#### 3. CORSエラー
- フロントエンドのポートが`CORS_ORIGIN`に含まれているか確認
- バックエンドサーバーが起動しているか確認

---
