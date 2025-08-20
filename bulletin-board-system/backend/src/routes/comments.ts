import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { sendCommentNotificationEmail } from '../services/emailService';

const router = Router();

// コメントの作成
router.post('/', [
  authenticateToken,
  body('content').isLength({ min: 1, max: 1000 }),
  body('postId').isString()
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

    const { content, postId } = req.body;

    // 投稿の存在確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ 
        error: 'Post not found' 
      });
    }

    if (!post.isPublished) {
      return res.status(403).json({ 
        error: 'Cannot comment on unpublished post' 
      });
    }

    // コメントの作成
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
        postId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // コメント通知メールの送信（投稿者とコメント投稿者が異なる場合）
    if (post.author.id !== req.user.id) {
      try {
        await sendCommentNotificationEmail(
          post.author.email,
          post.title,
          req.user.username
        );
      } catch (emailError) {
        console.warn('Failed to send comment notification email:', emailError);
      }
    }

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });

  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// コメントの取得（投稿ID指定）
router.get('/post/:postId', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // 投稿の存在確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { isPublished: true }
    });

    if (!post) {
      return res.status(404).json({ 
        error: 'Post not found' 
      });
    }

    if (!post.isPublished) {
      return res.status(403).json({ 
        error: 'Cannot view comments on unpublished post' 
      });
    }

    // コメントの取得
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        skip: offset,
        take: limit
      }),
      prisma.comment.count({
        where: { postId }
      })
    ]);

    // ページネーション情報の計算
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      comments,
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
    console.error('Get comments error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// コメントの更新
router.put('/:id', [
  authenticateToken,
  body('content').isLength({ min: 1, max: 1000 })
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

    const { id } = req.params;
    const { content } = req.body;

    // コメントの存在確認と権限チェック
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: { isPublished: true }
        }
      }
    });

    if (!existingComment) {
      return res.status(404).json({ 
        error: 'Comment not found' 
      });
    }

    if (existingComment.authorId !== req.user.id) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    if (!existingComment.post.isPublished) {
      return res.status(403).json({ 
        error: 'Cannot edit comment on unpublished post' 
      });
    }

    // コメントの更新
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// コメントの削除
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const { id } = req.params;

    // コメントの存在確認と権限チェック
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: { isPublished: true }
        }
      }
    });

    if (!existingComment) {
      return res.status(404).json({ 
        error: 'Comment not found' 
      });
    }

    if (existingComment.authorId !== req.user.id) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    if (!existingComment.post.isPublished) {
      return res.status(403).json({ 
        error: 'Cannot delete comment on unpublished post' 
      });
    }

    // コメントの削除
    await prisma.comment.delete({
      where: { id }
    });

    res.json({ 
      message: 'Comment deleted successfully' 
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// ユーザーのコメント履歴取得
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // コメントの取得
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { 
          authorId: userId,
          post: {
            isPublished: true
          }
        },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              isPublished: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.comment.count({
        where: { 
          authorId: userId,
          post: {
            isPublished: true
          }
        }
      })
    ]);

    // ページネーション情報の計算
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      comments,
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
    console.error('Get user comments error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

export default router;
