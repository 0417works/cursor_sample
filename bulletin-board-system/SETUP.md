# 掲示板システム セットアップガイド

## 前提条件

以下のソフトウェアがインストールされている必要があります：

- **Node.js**: 18.x以上
- **PostgreSQL**: 14.x以上
- **Git**: 最新版
- **npm** または **yarn**: 最新版

## 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd bulletin-board-system
```

## 2. バックエンドのセットアップ

### 2.1 依存関係のインストール

```bash
cd backend
npm install
```

### 2.2 環境変数の設定

```bash
# env.exampleをコピーして.envファイルを作成
cp env.example .env
```

`.env`ファイルを編集して、以下の値を設定してください：

```env
# サーバー設定
PORT=3001
NODE_ENV=development

# データベース設定
DATABASE_URL="postgresql://username:password@localhost:5432/bulletin_board_db"

# JWT設定
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# メール設定
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 外部API設定
WEATHER_API_KEY=your-openweathermap-api-key
UNSPLASH_API_KEY=your-unsplash-api-key

# ファイルアップロード設定
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# セキュリティ設定
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

### 2.3 データベースのセットアップ

#### PostgreSQLデータベースの作成

```sql
-- PostgreSQLにログイン
psql -U postgres

-- データベースの作成
CREATE DATABASE bulletin_board_db;

-- ユーザーの作成（必要に応じて）
CREATE USER bulletin_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bulletin_board_db TO bulletin_user;

-- 終了
\q
```

#### Prismaのセットアップ

```bash
# Prismaクライアントの生成
npm run db:generate

# データベースマイグレーションの実行
npm run db:migrate

# Prisma Studioの起動（データベースの確認用）
npm run db:studio
```

### 2.4 アップロードディレクトリの作成

```bash
mkdir uploads
```

### 2.5 バックエンドの起動

```bash
# 開発モードで起動
npm run dev
```

バックエンドが正常に起動すると、以下のメッセージが表示されます：

```
✅ Database connected successfully
🚀 Server is running on port 3001
📱 Environment: development
🔗 Health check: http://localhost:3001/health
```

## 3. フロントエンドのセットアップ

### 3.1 依存関係のインストール

```bash
cd ../frontend
npm install
```

### 3.2 フロントエンドの起動

```bash
npm run dev
```

フロントエンドが正常に起動すると、以下のメッセージが表示されます：

```
  VITE v5.0.7  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

## 4. 外部APIの設定

### 4.1 OpenWeatherMap API

1. [OpenWeatherMap](https://openweathermap.org/)にアクセス
2. アカウントを作成
3. APIキーを取得
4. `.env`ファイルの`WEATHER_API_KEY`に設定

### 4.2 Unsplash API

1. [Unsplash Developers](https://developers.unsplash.com/)にアクセス
2. アカウントを作成
3. アプリケーションを作成
4. APIキーを取得
5. `.env`ファイルの`UNSPLASH_API_KEY`に設定

### 4.3 メール設定（Gmailの場合）

1. Gmailアカウントで2段階認証を有効化
2. アプリパスワードを生成
3. `.env`ファイルの`SMTP_PASS`にアプリパスワードを設定

## 5. 動作確認

### 5.1 バックエンドの動作確認

```bash
# ヘルスチェック
curl http://localhost:3001/health
```

期待されるレスポンス：

```json
{
  "status": "OK",
  "timestamp": "2024-12-19T05:58:00.000Z",
  "environment": "development"
}
```

### 5.2 フロントエンドの動作確認

ブラウザで `http://localhost:3000` にアクセスして、掲示板システムのトップページが表示されることを確認してください。

## 6. 開発用データの投入

### 6.1 サンプルデータの作成

Prisma Studioを使用してサンプルデータを作成できます：

```bash
cd backend
npm run db:studio
```

ブラウザで `http://localhost:5555` が開き、データベースの内容を確認・編集できます。

### 6.2 基本的なデータの作成

以下の順序でデータを作成することをお勧めします：

1. **カテゴリ**: 技術、生活、趣味など
2. **タグ**: プログラミング、料理、旅行など
3. **ユーザー**: テスト用のユーザーアカウント
4. **投稿**: サンプルの投稿
5. **コメント**: サンプルのコメント

## 7. トラブルシューティング

### 7.1 データベース接続エラー

```
❌ Failed to start server: Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解決方法**:
- PostgreSQLサービスが起動しているか確認
- データベースの接続情報が正しいか確認
- ファイアウォールの設定を確認

### 7.2 ポートが使用中

```
❌ Failed to start server: Error: listen EADDRINUSE :::3001
```

**解決方法**:
```bash
# ポート3001を使用しているプロセスを確認
netstat -ano | findstr :3001

# プロセスを終了
taskkill /PID <process_id> /F
```

### 7.3 依存関係のインストールエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 7.4 Prismaエラー

```bash
# Prismaクライアントを再生成
npm run db:generate

# データベースをリセット（開発環境のみ）
npm run db:migrate:reset
```

## 8. 本番環境へのデプロイ

### 8.1 環境変数の設定

本番環境では、以下の設定を変更してください：

```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
DATABASE_URL=your-production-database-url
```

### 8.2 ビルド

```bash
# バックエンド
cd backend
npm run build

# フロントエンド
cd ../frontend
npm run build
```

### 8.3 プロセス管理

本番環境では、PM2などのプロセスマネージャーの使用を推奨します：

```bash
npm install -g pm2
pm2 start dist/index.js --name "bulletin-board-api"
```

## 9. セキュリティチェックリスト

- [ ] 強力なJWT_SECRETの設定
- [ ] データベースのアクセス制限
- [ ] HTTPSの有効化
- [ ] レート制限の実装
- [ ] ログの監視
- [ ] 定期的なセキュリティアップデート

## 10. サポート

問題が発生した場合は、以下の手順で調査してください：

1. ログの確認
2. 環境変数の設定確認
3. データベース接続の確認
4. 外部APIの設定確認

詳細なログは、バックエンドのコンソールに出力されます。

---

**注意**: このセットアップガイドは開発環境向けです。本番環境では、セキュリティとパフォーマンスを考慮した追加の設定が必要です。
