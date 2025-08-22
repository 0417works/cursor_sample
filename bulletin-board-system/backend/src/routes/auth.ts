import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService';

const router = Router();

// ユーザー登録
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 6 }),
], async (req: Request, res: Response) => {
  try {
    // バリデーションエラーのチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { email, username, password } = req.body;

    // 既存ユーザーのチェック
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email or username already exists' 
      });
    }

    // パスワードのハッシュ化
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    });

    // ウェルカムメールの送信
    try {
      await sendWelcomeEmail(user.email, user.username);
    } catch (emailError) {
      console.warn('Failed to send welcome email:', emailError);
    }

    // JWTトークンの生成
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // リフレッシュトークンの保存
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// ユーザーログイン
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req: Request, res: Response) => {
  try {
    // バリデーションエラーのチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // ユーザーの検索
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // パスワードの検証
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // JWTトークンの生成
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // 古いセッションの削除
    await prisma.userSession.deleteMany({
      where: { userId: user.id }
    });

    // 新しいセッションの作成
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日後
      }
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// ログアウト
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    // セッションの削除
    await prisma.userSession.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({ 
      message: 'Logout successful' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// トークン更新
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required' 
      });
    }

    // リフレッシュトークンの検証
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // セッションの確認
    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            isActive: true
          }
        }
      }
    });

    if (!session || !session.user || !session.user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid refresh token' 
      });
    }

    // 新しいアクセストークンの生成
    const newAccessToken = jwt.sign(
      { userId: session.user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      accessToken: newAccessToken
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: 'Invalid refresh token' 
      });
    }
    
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// パスワードリセット要求
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // パスワードリセットトークンの生成
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '1h' }
      );

      // パスワードリセットメールの送信
      try {
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.warn('Failed to send password reset email:', emailError);
      }
    }

    // セキュリティのため、ユーザーの存在に関係なく成功レスポンス
    res.json({ 
      message: 'If the email exists, a password reset link has been sent' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// 現在のユーザー情報取得
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true
      }
    });

    res.json({ user });

  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// プロフィール更新
router.put('/profile', [
  authenticateToken,
  body('username').optional().custom((value) => {
    if (value !== undefined && value !== '') {
      if (value.length < 3 || value.length > 20) {
        throw new Error('Username must be between 3 and 20 characters');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
      }
    }
    return true;
  }),
  body('email').optional().custom((value) => {
    if (value !== undefined && value !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw new Error('Invalid email format');
      }
    }
    return true;
  }),
  body('bio').optional().custom((value) => {
    if (value !== undefined && value !== '') {
      if (value.length > 500) {
        throw new Error('Bio must be 500 characters or less');
      }
    }
    return true;
  }),
  body('avatar').optional().custom((value) => {
    if (value !== undefined && value !== '') {
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('Avatar must be a valid URL');
      }
    }
    return true;
  })
], async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== プロフィール更新リクエスト開始 ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.user?.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    if (!req.user) {
      console.log('No user found in request');
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const { username, email, bio, avatar } = req.body;
    console.log('Extracted data:', { username, email, bio, avatar });

    // ユーザー名の重複チェック（変更される場合）
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: {
            id: req.user.id
          }
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'Username already exists' 
        });
      }
    }

    // メールアドレスの重複チェック（変更される場合）
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: req.user.id
          }
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'Email already exists' 
        });
      }
    }

    // プロフィールの更新
    const updateData: any = {};
    
    // 空文字列でない場合のみ更新データに含める
    if (username !== undefined && username !== '') {
      updateData.username = username;
    }
    if (email !== undefined && email !== '') {
      updateData.email = email;
    }
    if (bio !== undefined && bio !== '') {
      updateData.bio = bio;
    }
    if (avatar !== undefined && avatar !== '') {
      updateData.avatar = avatar;
    }
    
    console.log('Update data to be sent:', updateData);
    
    // 更新するデータがない場合はエラー
    if (Object.keys(updateData).length === 0) {
      console.log('No valid data provided for update');
      return res.status(400).json({ 
        error: 'No valid data provided for update' 
      });
    }
    
    console.log('Updating user with ID:', req.user.id);
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('User updated successfully:', updatedUser);

    const response = {
      message: 'Profile updated successfully',
      user: updatedUser
    };
    
    console.log('Sending response:', response);
    res.json(response);

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// パスワード変更
router.put('/password', [
  authenticateToken,
  body('currentPassword').isLength({ min: 1 }),
  body('newPassword').isLength({ min: 6 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // 現在のユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // 現在のパスワードの確認
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // 新しいパスワードのハッシュ化
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // パスワードの更新
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

export default router;
