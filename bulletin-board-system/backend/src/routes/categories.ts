import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { authenticateToken, requireModerator, AuthRequest } from '../middleware/auth';

const router = Router();

// カテゴリ一覧の取得
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    
    // 開発環境ではより詳細なエラー情報を提供
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error' 
      });
    }
  }
});

// カテゴリ詳細の取得
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        posts: {
          where: { isPublished: true },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            },
            _count: {
              select: {
                comments: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            posts: {
              where: { isPublished: true }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found' 
      });
    }

    res.json({ category });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// カテゴリの作成（モデレーター以上）
router.post('/', [
  requireModerator,
  body('name').isLength({ min: 1, max: 50 }).trim(),
  body('description').optional().isLength({ max: 200 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i)
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { name, description, color } = req.body;

    // 既存カテゴリのチェック
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return res.status(400).json({ 
        error: 'Category name already exists' 
      });
    }

    // カテゴリの作成
    const category = await prisma.category.create({
      data: {
        name,
        description,
        color: color || '#3B82F6'
      }
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// カテゴリの更新（モデレーター以上）
router.put('/:id', [
  requireModerator,
  body('name').optional().isLength({ min: 1, max: 50 }).trim(),
  body('description').optional().isLength({ max: 200 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i)
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { name, description, color } = req.body;

    // カテゴリの存在確認
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({ 
        error: 'Category not found' 
      });
    }

    // 名前の重複チェック（自分以外）
    if (name && name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: { name }
      });

      if (duplicateCategory) {
        return res.status(400).json({ 
          error: 'Category name already exists' 
        });
      }
    }

    // カテゴリの更新
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        color
      }
    });

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// カテゴリの削除（モデレーター以上）
router.delete('/:id', requireModerator, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // カテゴリの存在確認
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ 
        error: 'Category not found' 
      });
    }

    // 投稿が存在する場合は削除不可
    if (existingCategory._count.posts > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing posts' 
      });
    }

    // カテゴリの削除
    await prisma.category.delete({
      where: { id }
    });

    res.json({ 
      message: 'Category deleted successfully' 
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// カテゴリ別投稿一覧の取得
router.get('/:id/posts', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // カテゴリの存在確認
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found' 
      });
    }

    // 投稿の取得
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          categoryId: id,
          isPublished: true
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true
                }
              }
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.post.count({
        where: {
          categoryId: id,
          isPublished: true
        }
      })
    ]);

    // ページネーション情報の計算
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      category,
      posts,
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
    console.error('Get category posts error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

export default router;
