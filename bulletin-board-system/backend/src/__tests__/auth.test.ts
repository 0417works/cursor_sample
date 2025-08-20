import request from 'supertest';
import express from 'express';
import { prisma } from '../index';
import authRouter from '../routes/auth';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).not.toHaveProperty('password');

      // データベースにユーザーが作成されているか確認
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.role).toBe('USER');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        username: 'duplicate',
        password: 'password123'
      };

      // 最初のユーザーを作成
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // 同じメールアドレスで再度登録
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email already exists');
    });

    it('should return error for duplicate username', async () => {
      const userData1 = {
        email: 'user1@example.com',
        username: 'sameusername',
        password: 'password123'
      };

      const userData2 = {
        email: 'user2@example.com',
        username: 'sameusername',
        password: 'password123'
      };

      // 最初のユーザーを作成
      await request(app)
        .post('/api/auth/register')
        .send(userData1)
        .expect(201);

      // 同じユーザー名で再度登録
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData2)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Username already exists');
    });

    it('should return error for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should return error for short password', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // テスト用ユーザーを作成
      const hashedPassword = await bcrypt.hash('password123', 12);
      await prisma.user.create({
        data: {
          email: 'login@example.com',
          username: 'loginuser',
          password: hashedPassword
        }
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', loginData.email);
    });

    it('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully and invalidate refresh token', async () => {
      // テスト用ユーザーとセッションを作成
      const user = await prisma.user.create({
        data: {
          email: 'logout@example.com',
          username: 'logoutuser',
          password: 'hashedpassword'
        }
      });

      await prisma.userSession.create({
        data: {
          userId: user.id,
          refreshToken: 'test-refresh-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間後
        }
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send({ refreshToken: 'test-refresh-token' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logout successful');

      // セッションが削除されているか確認
      const session = await prisma.userSession.findUnique({
        where: { refreshToken: 'test-refresh-token' }
      });
      expect(session).toBeNull();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // テスト用ユーザーとセッションを作成
      const user = await prisma.user.create({
        data: {
          email: 'refresh@example.com',
          username: 'refreshuser',
          password: 'hashedpassword'
        }
      });

      await prisma.userSession.create({
        data: {
          userId: user.id,
          refreshToken: 'valid-refresh-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間後
        }
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return error for expired refresh token', async () => {
      // テスト用ユーザーと期限切れセッションを作成
      const user = await prisma.user.create({
        data: {
          email: 'expired@example.com',
          username: 'expireduser',
          password: 'hashedpassword'
        }
      });

      await prisma.userSession.create({
        data: {
          userId: user.id,
          refreshToken: 'expired-refresh-token',
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24時間前
        }
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'expired-refresh-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Refresh token expired');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info with valid token', async () => {
      // テスト用ユーザーを作成
      const user = await prisma.user.create({
        data: {
          email: 'me@example.com',
          username: 'meuser',
          password: 'hashedpassword'
        }
      });

      // モックのJWTトークン検証（実際の実装では適切なJWTトークンが必要）
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', user.email);
      expect(response.body.user).toHaveProperty('username', user.username);
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token is required');
    });
  });
});
