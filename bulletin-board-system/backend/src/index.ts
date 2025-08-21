import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 環境変数の読み込み
dotenv.config();

// Prismaクライアントの初期化
export const prisma = new PrismaClient();

// Expressアプリの作成
const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェアの設定
app.use(helmet()); // セキュリティヘッダーの設定
app.use(compression()); // レスポンスの圧縮
app.use(morgan('combined')); // ログ出力

// CORS設定
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // 開発環境ではすべてのオリジンを許可（セキュリティ上の注意が必要）
    if (process.env.NODE_ENV === 'development' && !process.env.CORS_ORIGIN) {
      return callback(null, true);
    }
    
    // プリフライトリクエストの場合は常に許可
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true
}));

// ボディパーサーの設定
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静的ファイルの提供
app.use('/uploads', express.static('uploads'));

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// APIルートの設定
app.use('/api/auth', require('./routes/auth').default);
app.use('/api/posts', require('./routes/posts').default);
app.use('/api/comments', require('./routes/comments').default);
app.use('/api/categories', require('./routes/categories').default);
app.use('/api/upload', require('./routes/upload').default);
app.use('/api/weather', require('./routes/weather').default);
app.use('/api/images', require('./routes/images').default);

// 404エラーハンドリング
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// グローバルエラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// サーバーの起動
async function startServer() {
  try {
    // データベース接続の確認
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // サーバーの起動
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// グレースフルシャットダウンの処理
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// サーバーの起動
startServer();
