import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// テストデータベースの接続
beforeAll(async () => {
  await prisma.$connect();
});

// 各テスト後のクリーンアップ
afterEach(async () => {
  // テストデータのクリーンアップ
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
});

// 全テスト終了後のクリーンアップ
afterAll(async () => {
  await prisma.$disconnect();
});

// テスト用のヘルパー関数
export const createTestUser = async (userData: any = {}) => {
  return await prisma.user.create({
    data: {
      email: userData.email || 'test@example.com',
      username: userData.username || 'testuser',
      password: userData.password || 'hashedpassword',
      role: userData.role || 'USER',
      ...userData
    }
  });
};

export const createTestCategory = async (categoryData: any = {}) => {
  return await prisma.category.create({
    data: {
      name: categoryData.name || 'Test Category',
      description: categoryData.description || 'Test Description',
      color: categoryData.color || '#3B82F6',
      ...categoryData
    }
  });
};

export const createTestPost = async (postData: any = {}) => {
  return await prisma.post.create({
    data: {
      title: postData.title || 'Test Post',
      content: postData.content || 'Test Content',
      authorId: postData.authorId || (await createTestUser()).id,
      categoryId: postData.categoryId || (await createTestCategory()).id,
      isPublished: postData.isPublished !== undefined ? postData.isPublished : true,
      ...postData
    }
  });
};

export const createTestComment = async (commentData: any = {}) => {
  return await prisma.comment.create({
    data: {
      content: commentData.content || 'Test Comment',
      authorId: commentData.authorId || (await createTestUser()).id,
      postId: commentData.postId || (await createTestPost()).id,
      ...commentData
    }
  });
};
