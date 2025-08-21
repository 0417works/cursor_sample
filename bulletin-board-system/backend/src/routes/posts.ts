import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../index';
import { authenticateToken, optionalAuth, requireModerator, AuthRequest } from '../middleware/auth';
import { getWeatherInfo } from '../services/weatherService';
import { searchRelatedImages } from '../services/imageService';

const router = Router();

// 投稿一覧の取得（ページネーション対応）
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('category').optional().isString(),
  query('categoryId').optional().isString(),
  query('tag').optional().isString(),
  query('search').optional().isString(),
  query('sort').optional().isIn(['newest', 'oldest', 'popular', 'title']),
  query('sortBy').optional().isString(),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;
    const tag = req.query.tag as string;
    const search = req.query.search as string;
    const sort = req.query.sort as string || 'newest';
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as string || 'desc';

    // 検索条件の構築
    const where: any = {
      isPublished: true
    };

    if (category) {
      where.category = { name: category };
    }

    // categoryIdパラメータでの絞り込み（フロントエンド対応）
    const categoryId = req.query.categoryId as string;
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { name: tag }
        }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // ソート条件の設定
    let orderBy: any = {};
    
    // sortByとsortOrderパラメータが指定されている場合はそれを使用
    if (sortBy && sortOrder) {
      // 有効なフィールド名かチェック
      const validSortFields = ['createdAt', 'updatedAt', 'title', 'viewCount', 'likeCount'];
      if (validSortFields.includes(sortBy)) {
        orderBy[sortBy] = sortOrder;
      } else {
        // 無効なフィールドの場合はデフォルトのソート
        orderBy.createdAt = 'desc';
      }
    } else {
      // 従来のsortパラメータを使用
      switch (sort) {
        case 'oldest':
          orderBy.createdAt = 'asc';
          break;
        case 'popular':
          orderBy.viewCount = 'desc';
          break;
        case 'title':
          orderBy.title = 'asc';
          break;
        default: // newest
          orderBy.createdAt = 'desc';
      }
    }

    // 投稿の取得
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true
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
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.post.count({ where })
    ]);

    // ページネーション情報の計算
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
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
    console.error('Get posts error:', error);
    
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

// 投稿詳細の取得
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
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
        comments: {
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
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ 
        error: 'Post not found' 
      });
    }

    if (!post.isPublished && (!req.user || req.user.role === 'USER')) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // 閲覧数の更新
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({ post });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// 投稿の作成
router.post('/', [
  authenticateToken,
  body('title').isLength({ min: 1, max: 200 }),
  body('content').isLength({ min: 1, max: 10000 }),
  body('categoryId').optional().isString(),
  body('tags').optional().isArray(),
  body('imageUrl').optional().isURL()
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

    const { title, content, categoryId, tags, imageUrl } = req.body;

    // 天気情報の取得（外部API利用 - レベル2達成要件）
    let weatherInfo = null;
    try {
      weatherInfo = await getWeatherInfo();
    } catch (weatherError) {
      console.warn('Failed to get weather info:', weatherError);
    }

    // 関連画像の検索（外部API利用 - レベル2達成要件）
    let relatedImages = null;
    try {
      relatedImages = await searchRelatedImages(title);
    } catch (imageError) {
      console.warn('Failed to search related images:', imageError);
    }

    // 投稿の作成
    const post = await prisma.post.create({
      data: {
        title,
        content: weatherInfo ? `${content}\n\n🌤️ 現在の天気: ${weatherInfo}` : content,
        imageUrl,
        authorId: req.user.id,
        categoryId: categoryId || null,
        tags: tags && tags.length > 0 ? {
          create: tags.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
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
        }
      }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post,
      weatherInfo,
      relatedImages
    });

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// 投稿の更新
router.put('/:id', [
  authenticateToken,
  body('title').optional().isLength({ min: 1, max: 200 }),
  body('content').optional().isLength({ min: 1, max: 10000 }),
  body('categoryId').optional().isString(),
  body('tags').optional().isArray(),
  body('imageUrl').optional().isURL(),
  body('isPublished').optional().isBoolean()
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
    const { title, content, categoryId, tags, imageUrl, isPublished } = req.body;

    // 投稿の存在確認と権限チェック
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingPost) {
      return res.status(404).json({ 
        error: 'Post not found' 
      });
    }

    if (existingPost.authorId !== req.user.id && req.user.role === 'USER') {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // 投稿の更新
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        imageUrl,
        categoryId: categoryId || null,
        isPublished: isPublished !== undefined ? isPublished : existingPost.isPublished,
        tags: tags ? {
          deleteMany: {},
          create: tags.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
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
        }
      }
    });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// 投稿の削除
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const { id } = req.params;

    // 投稿の存在確認と権限チェック
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingPost) {
      return res.status(404).json({ 
        error: 'Post not found' 
      });
    }

    if (existingPost.authorId !== req.user.id && req.user.role === 'USER') {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // 投稿の削除
    await prisma.post.delete({
      where: { id }
    });

    res.json({ 
      message: 'Post deleted successfully' 
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// 投稿の公開/非公開切り替え
router.patch('/:id/toggle-publish', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const { id } = req.params;

    // 投稿の存在確認と権限チェック
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!existingPost) {
      return res.status(404).json({ 
        error: 'Post not found' 
      });
    }

    if (existingPost.authorId !== req.user.id && req.user.role === 'USER') {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // 公開状態の切り替え
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        isPublished: !existingPost.isPublished
      }
    });

    res.json({
      message: `Post ${updatedPost.isPublished ? 'published' : 'unpublished'} successfully`,
      post: updatedPost
    });

  } catch (error) {
    console.error('Toggle post publish error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

export default router;
