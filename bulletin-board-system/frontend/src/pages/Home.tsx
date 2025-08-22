import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { postsApi, categoriesApi, statsApi } from '../services/api'
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Eye, 
  Clock,
  User,
  Tag,
  TrendingUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

const Home: React.FC = () => {
  // 最新投稿の取得
  const { data: recentPosts, isLoading: postsLoading } = useQuery(
    'recentPosts',
    () => postsApi.getPosts({ page: 1, limit: 6, sortBy: 'createdAt', sortOrder: 'desc' })
  )

  // 人気投稿の取得
  const { data: popularPosts, isLoading: popularLoading } = useQuery(
    'popularPosts',
    () => postsApi.getPosts({ page: 1, limit: 4, sortBy: 'viewCount', sortOrder: 'desc' })
  )

  // カテゴリーの取得
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    categoriesApi.getCategories
  )

  // 全体統計情報の取得
  const { data: overallStats, isLoading: statsLoading } = useQuery(
    ['overallStats'],
    () => statsApi.getOverallStats(),
    {
      refetchInterval: 300000, // 5分ごとに更新
      staleTime: 300000 // 5分間はキャッシュを使用
    }
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              掲示板システムへようこそ
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              ユーザーが自由に投稿・閲覧・コメントできる掲示板システムです。
              IT技術の成長目標評価におけるレベル2達成を目指して開発されています。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/posts">
                <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-50">
                  投稿を探す
                </Button>
              </Link>
              <Link to="/posts/create">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                  投稿を作成
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardBody>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : (overallStats?.totalPosts || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">総投稿数</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody>
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : (overallStats?.totalUsers || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">登録ユーザー</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody>
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : (overallStats?.totalComments || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">総コメント数</div>
            </CardBody>
          </Card>

          <Card className="text-center">
            <CardBody>
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : (overallStats?.totalViews || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">総閲覧数</div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 最新投稿 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">最新投稿</h2>
              <Link to="/posts">
                <Button variant="outline" size="sm">
                  すべて見る
                </Button>
              </Link>
            </div>

            {postsLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardBody>
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts?.posts?.map((post: any) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex items-start space-x-4">
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/posts/${post.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {post.title}
                          </Link>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{post.author?.username}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatDistanceToNow(new Date(post.createdAt), { 
                                  addSuffix: true, 
                                  locale: ja 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.viewCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{post._count?.comments || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 人気投稿 */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                  人気投稿
                </h3>
              </CardHeader>
              <CardBody>
                {popularLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {popularPosts?.posts?.map((post: any) => (
                      <Link
                        key={post.id}
                        to={`/posts/${post.id}`}
                        className="block hover:bg-gray-50 p-2 rounded-md transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 line-clamp-2 hover:text-blue-600">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                          <span>{post.viewCount} views</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(post.createdAt), { 
                              addSuffix: true, 
                              locale: ja 
                            })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* カテゴリー */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-blue-500" />
                  カテゴリー
                </h3>
              </CardHeader>
              <CardBody>
                {categoriesLoading ? (
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories?.categories?.map((category: any) => (
                      <Link
                        key={category.id}
                        to={`/posts?categoryId=${category.id}`}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-700">{category.name}</span>
                        <span className="text-sm text-gray-500">
                          {category._count?.posts || 0}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* クイックアクション */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">クイックアクション</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Link to="/posts/create">
                  <Button className="w-full" size="sm">
                    投稿を作成
                  </Button>
                </Link>
                <Link to="/posts">
                  <Button variant="outline" className="w-full" size="sm">
                    投稿を探す
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" className="w-full" size="sm">
                    アカウント作成
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
