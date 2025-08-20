import request from 'supertest';
import express from 'express';
import { prisma } from '../index';
import postsRouter from '../routes/posts';
import { createTestUser, createTestCategory } from './setup';

const app = express();
app.use(express.json());
app.use('/api/posts', postsRouter);

describe('Posts Routes', () => {
  let testUser: any;
  let testCategory: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    testCategory = await createTestCategory();
  });

  describe('GET /api/posts', () => {
    beforeEach(async () => {
      // テスト用の投稿を作成
      await prisma.post.createMany({
        data: [
          {
            title: 'Test Post 1',
            content: 'Test Content 1',
            authorId: testUser.id,
            categoryId: testCategory.id,
            isPublished: true
          },
          {
            title: 'Test Post 2',
            content: 'Test Content 2',
            authorId: testUser.id,
            categoryId: testCategory.id,
            isPublished: true
          },
          {
            title: 'Draft Post',
            content: 'Draft Content',
            authorId: testUser.id,
            categoryId: testCategory.id,
            isPublished: false
          }
        ]
      });
    });

    it('should return published posts with pagination', async () => {
      const response = await request(app)
        .get('/api/posts')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.posts).toHaveLength(2); // 公開済みの投稿のみ
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalItems).toBe(2);
    });

    it('should filter posts by category', async () => {
      const response = await request(app)
        .get('/api/posts')
        .query({ categoryId: testCategory.id })
        .expect(200);

      expect(response.body.posts).toHaveLength(2);
      response.body.posts.forEach((post: any) => {
        expect(post.categoryId).toBe(testCategory.id);
      });
    });

    it('should search posts by title', async () => {
      const response = await request(app)
        .get('/api/posts')
        .query({ search: 'Test Post 1' })
        .expect(200);

      expect(response.body.posts).toHaveLength(1);
      expect(response.body.posts[0].title).toBe('Test Post 1');
    });

    it('should sort posts by creation date', async () => {
      const response = await request(app)
        .get('/api/posts')
        .query({ sortBy: 'createdAt', sortOrder: 'desc' })
        .expect(200);

      const posts = response.body.posts;
      expect(posts[0].createdAt).toBeGreaterThan(posts[1].createdAt);
    });
  });

  describe('GET /api/posts/:id', () => {
    let testPost: any;

    beforeEach(async () => {
      testPost = await prisma.post.create({
        data: {
          title: 'Test Post for Detail',
          content: 'Test Content for Detail',
          authorId: testUser.id,
          categoryId: testCategory.id,
          isPublished: true
        }
      });
    });

    it('should return post details with author and category', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPost.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('post');
      expect(response.body.post.title).toBe(testPost.title);
      expect(response.body.post.content).toBe(testPost.content);
      expect(response.body.post.author).toBeTruthy();
      expect(response.body.post.category).toBeTruthy();
    });

    it('should increment view count', async () => {
      await request(app)
        .get(`/api/posts/${testPost.id}`)
        .expect(200);

      const updatedPost = await prisma.post.findUnique({
        where: { id: testPost.id }
      });

      expect(updatedPost?.viewCount).toBe(1);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .get('/api/posts/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Post not found');
    });

    it('should return 403 for unpublished post', async () => {
      const draftPost = await prisma.post.create({
        data: {
          title: 'Draft Post',
          content: 'Draft Content',
          authorId: testUser.id,
          categoryId: testCategory.id,
          isPublished: false
        }
      });

      const response = await request(app)
        .get(`/api/posts/${draftPost.id}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Post not published');
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post successfully', async () => {
      const postData = {
        title: 'New Post',
        content: 'New Content',
        categoryId: testCategory.id,
        imageUrl: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer valid-jwt-token`)
        .send(postData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Post created successfully');
      expect(response.body).toHaveProperty('post');
      expect(response.body.post.title).toBe(postData.title);
      expect(response.body.post.content).toBe(postData.content);
      expect(response.body.post.authorId).toBe(testUser.id);
      expect(response.body.post.isPublished).toBe(true);

      // データベースに投稿が作成されているか確認
      const createdPost = await prisma.post.findUnique({
        where: { id: response.body.post.id }
      });
      expect(createdPost).toBeTruthy();
    });

    it('should return error without authentication', async () => {
      const postData = {
        title: 'New Post',
        content: 'New Content',
        categoryId: testCategory.id
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token is required');
    });

    it('should return error for invalid title', async () => {
      const postData = {
        title: '', // 空のタイトル
        content: 'New Content',
        categoryId: testCategory.id
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer valid-jwt-token`)
        .send(postData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return error for invalid category', async () => {
      const postData = {
        title: 'New Post',
        content: 'New Content',
        categoryId: 'non-existent-category-id'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer valid-jwt-token`)
        .send(postData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Category not found');
    });
  });

  describe('PUT /api/posts/:id', () => {
    let testPost: any;

    beforeEach(async () => {
      testPost = await prisma.post.create({
        data: {
          title: 'Test Post for Update',
          content: 'Test Content for Update',
          authorId: testUser.id,
          categoryId: testCategory.id,
          isPublished: true
        }
      });
    });

    it('should update post successfully', async () => {
      const updateData = {
        title: 'Updated Post Title',
        content: 'Updated Post Content',
        categoryId: testCategory.id
      };

      const response = await request(app)
        .put(`/api/posts/${testPost.id}`)
        .set('Authorization', `Bearer valid-jwt-token`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Post updated successfully');
      expect(response.body).toHaveProperty('post');
      expect(response.body.post.title).toBe(updateData.title);
      expect(response.body.post.content).toBe(updateData.content);

      // データベースが更新されているか確認
      const updatedPost = await prisma.post.findUnique({
        where: { id: testPost.id }
      });
      expect(updatedPost?.title).toBe(updateData.title);
      expect(updatedPost?.content).toBe(updateData.content);
    });

    it('should return error for non-existent post', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated Content'
      };

      const response = await request(app)
        .put('/api/posts/non-existent-id')
        .set('Authorization', `Bearer valid-jwt-token`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Post not found');
    });

    it('should return error for unauthorized access', async () => {
      // 別のユーザーを作成
      const otherUser = await createTestUser({
        email: 'other@example.com',
        username: 'otheruser'
      });

      const otherPost = await prisma.post.create({
        data: {
          title: 'Other User Post',
          content: 'Other User Content',
          authorId: otherUser.id,
          categoryId: testCategory.id,
          isPublished: true
        }
      });

      const updateData = {
        title: 'Updated Title',
        content: 'Updated Content'
      };

      const response = await request(app)
        .put(`/api/posts/${otherPost.id}`)
        .set('Authorization', `Bearer valid-jwt-token`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    let testPost: any;

    beforeEach(async () => {
      testPost = await prisma.post.create({
        data: {
          title: 'Test Post for Delete',
          content: 'Test Content for Delete',
          authorId: testUser.id,
          categoryId: testCategory.id,
          isPublished: true
        }
      });
    });

    it('should delete post successfully', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost.id}`)
        .set('Authorization', `Bearer valid-jwt-token`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Post deleted successfully');

      // データベースから投稿が削除されているか確認
      const deletedPost = await prisma.post.findUnique({
        where: { id: testPost.id }
      });
      expect(deletedPost).toBeNull();
    });

    it('should return error for non-existent post', async () => {
      const response = await request(app)
        .delete('/api/posts/non-existent-id')
        .set('Authorization', `Bearer valid-jwt-token`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Post not found');
    });

    it('should return error for unauthorized access', async () => {
      // 別のユーザーを作成
      const otherUser = await createTestUser({
        email: 'other@example.com',
        username: 'otheruser'
      });

      const otherPost = await prisma.post.create({
        data: {
          title: 'Other User Post',
          content: 'Other User Content',
          authorId: otherUser.id,
          categoryId: testCategory.id,
          isPublished: true
        }
      });

      const response = await request(app)
        .delete(`/api/posts/${otherPost.id}`)
        .set('Authorization', `Bearer valid-jwt-token`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Access denied');
    });
  });

  describe('PATCH /api/posts/:id/toggle-publish', () => {
    let testPost: any;

    beforeEach(async () => {
      testPost = await prisma.post.create({
        data: {
          title: 'Test Post for Toggle',
          content: 'Test Content for Toggle',
          authorId: testUser.id,
          categoryId: testCategory.id,
          isPublished: true
        }
      });
    });

    it('should toggle post publish status successfully', async () => {
      // 公開状態から非公開に変更
      const response = await request(app)
        .patch(`/api/posts/${testPost.id}/toggle-publish`)
        .set('Authorization', `Bearer valid-jwt-token`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Post publish status updated');
      expect(response.body).toHaveProperty('post');
      expect(response.body.post.isPublished).toBe(false);

      // 非公開状態から公開に変更
      const response2 = await request(app)
        .patch(`/api/posts/${testPost.id}/toggle-publish`)
        .set('Authorization', `Bearer valid-jwt-token`)
        .expect(200);

      expect(response2.body.post.isPublished).toBe(true);
    });

    it('should return error for non-existent post', async () => {
      const response = await request(app)
        .patch('/api/posts/non-existent-id/toggle-publish')
        .set('Authorization', `Bearer valid-jwt-token`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Post not found');
    });
  });
});
