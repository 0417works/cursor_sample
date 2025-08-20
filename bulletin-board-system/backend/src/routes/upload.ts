import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = Router();

// アップロードディレクトリの作成
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multerの設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ファイル名の重複を避けるため、タイムスタンプを追加
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// ファイルフィルター
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Multerの設定
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    files: 5 // 最大5ファイル
  }
});

// 単一ファイルアップロード
router.post('/single', authenticateToken, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded' 
      });
    }

    // ファイル情報の整形
    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('Single file upload error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// 複数ファイルアップロード
router.post('/multiple', authenticateToken, upload.array('images', 5), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No files uploaded' 
      });
    }

    // ファイル情報の整形
    const files = (req.files as Express.Multer.File[]).map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${file.filename}`,
      uploadedBy: req.user!.id,
      uploadedAt: new Date()
    }));

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: files,
      count: files.length
    });

  } catch (error) {
    console.error('Multiple files upload error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// ファイルの削除
router.delete('/:filename', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'File not found' 
      });
    }

    // ファイルの削除
    fs.unlinkSync(filePath);

    res.json({ 
      message: 'File deleted successfully' 
    });

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// ファイルのダウンロード
router.get('/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'File not found' 
      });
    }

    // ファイルの情報取得
    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();

    // 適切なContent-Typeの設定
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';

    // ヘッダーの設定
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // ファイルの送信
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// アップロードされたファイル一覧の取得
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // ディレクトリ内のファイル一覧を取得
    const files = fs.readdirSync(uploadDir);
    
    // ファイル情報の取得
    const fileInfos = files
      .map(filename => {
        const filePath = path.join(uploadDir, filename);
        const stats = fs.statSync(filePath);
        
        return {
          filename,
          size: stats.size,
          uploadedAt: stats.birthtime,
          url: `/uploads/${filename}`,
          mimetype: getMimeType(filename)
        };
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // ページネーション
    const total = fileInfos.length;
    const paginatedFiles = fileInfos.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      files: paginatedFiles,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });

  } catch (error) {
    console.error('Get files list error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// ファイルサイズの取得
router.get('/size/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'File not found' 
      });
    }

    const stats = fs.statSync(filePath);
    
    res.json({
      filename,
      size: stats.size,
      sizeInKB: Math.round(stats.size / 1024 * 100) / 100,
      sizeInMB: Math.round(stats.size / (1024 * 1024) * 100) / 100
    });

  } catch (error) {
    console.error('Get file size error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// ファイルのMIMEタイプを取得するヘルパー関数
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// エラーハンドリングミドルウェア
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        maxSize: process.env.MAX_FILE_SIZE || '5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Too many files',
        maxFiles: 5
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Unexpected field name' 
      });
    }
  }
  
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      error: error.message 
    });
  }

  console.error('Upload error:', error);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

export default router;
