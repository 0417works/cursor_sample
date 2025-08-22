import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // カテゴリーの作成
  const categories = [
    {
      name: '技術',
      description: 'プログラミング、開発、IT技術に関する投稿',
      color: '#3B82F6'
    },
    {
      name: '生活',
      description: '日常生活、趣味、ライフスタイルに関する投稿',
      color: '#10B981'
    },
    {
      name: 'ニュース',
      description: '最新のニュース、時事問題に関する投稿',
      color: '#F59E0B'
    },
    {
      name: '学習',
      description: '勉強、教育、スキルアップに関する投稿',
      color: '#8B5CF6'
    },
    {
      name: 'その他',
      description: 'その他のトピックに関する投稿',
      color: '#6B7280'
    }
  ];

  console.log('📝 Creating categories...');
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData
    });
    console.log(`✅ Created category: ${category.name}`);
  }

  // タグの作成
  const tags = [
    { name: 'JavaScript', color: '#F7DF1E' },
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'React', color: '#61DAFB' },
    { name: 'Node.js', color: '#339933' },
    { name: 'Python', color: '#3776AB' },
    { name: 'プログラミング', color: '#FF6B6B' },
    { name: 'Web開発', color: '#4ECDC4' },
    { name: 'AI', color: '#FF6B9D' },
    { name: '機械学習', color: '#A8E6CF' }
  ];

  console.log('🏷️ Creating tags...');
  for (const tagData of tags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagData.name },
      update: {},
      create: tagData
    });
    console.log(`✅ Created tag: ${tag.name}`);
  }

  // サンプルユーザーの作成
  console.log('👤 Creating sample user...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  const sampleUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      bio: 'システム管理者'
    }
  });
  console.log(`✅ Created user: ${sampleUser.username}`);

  // サンプル投稿の作成
  console.log('📝 Creating sample posts...');
  const samplePosts = [
    {
      title: '掲示板システムの開発について',
      content: 'この掲示板システムは、React + TypeScript + Node.js + Prismaを使用して開発されています。\n\n主な機能：\n- ユーザー認証\n- 投稿の作成・編集・削除\n- カテゴリー別の投稿管理\n- コメント機能\n- タグ機能',
      categoryId: (await prisma.category.findUnique({ where: { name: '技術' } }))?.id,
      authorId: sampleUser.id,
      isPublished: true
    },
    {
      title: 'Prismaの使い方',
      content: 'Prismaは、Node.jsとTypeScriptのための次世代ORMです。\n\n特徴：\n- 型安全なデータベースアクセス\n- 自動生成されるPrismaクライアント\n- 直感的なスキーマ定義\n- 強力なマイグレーション機能',
      categoryId: (await prisma.category.findUnique({ where: { name: '技術' } }))?.id,
      authorId: sampleUser.id,
      isPublished: true
    }
  ];

  for (const postData of samplePosts) {
    const post = await prisma.post.create({
      data: postData
    });
    console.log(`✅ Created post: ${post.title}`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
