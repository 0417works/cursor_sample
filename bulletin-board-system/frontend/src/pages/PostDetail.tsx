import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'

import { postsApi, commentsApi, weatherApi, imageApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  Eye, 
  MessageSquare, 
  Clock, 
  User, 
  Tag, 
  Edit, 
  Trash2,
  Cloud,
  Image as ImageIcon
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import toast from 'react-hot-toast'

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  const [commentContent, setCommentContent] = useState('')
  const [showWeather, setShowWeather] = useState(false)
  const [showImages, setShowImages] = useState(false)

  // 投稿データの取得
  const { data: post, isLoading, error } = useQuery(
    ['post', id],
    () => postsApi.getPost(id!),
    {
      enabled: !!id,
      onSuccess: () => {
        // 閲覧数の増加
        if (id) {
          postsApi.incrementViewCount(id)
        }
      }
    }
  )

  // コメントデータの取得
  const { data: commentsData, isLoading: commentsLoading } = useQuery(
    ['comments', id],
    () => commentsApi.getComments(id!, { page: 1, limit: 50 }),
    {
      enabled: !!id
    }
  )

  // 天気データの取得
  const { data: weatherData, isLoading: weatherLoading } = useQuery(
    ['weather', post?.title],
    () => weatherApi.getCurrentWeather('Tokyo'),
    {
      enabled: showWeather && !!post?.title,
      staleTime: 10 * 60 * 1000 // 10分間キャッシュ
    }
  )

  // 関連画像の取得
  const { data: imagesData, isLoading: imagesLoading } = useQuery(
    ['images', post?.title],
    () => imageApi.searchImage(post?.title || '', 6),
    {
      enabled: showImages && !!post?.title,
      staleTime: 10 * 60 * 1000 // 10分間キャッシュ
    }
  )

  // コメント投稿のミューテーション
  const commentMutation = useMutation(
    (content: string) => commentsApi.createComment({ content, postId: id! }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', id])
        setCommentContent('')
        toast.success('コメントを投稿しました')
      },
      onError: () => {
        toast.error('コメントの投稿に失敗しました')
      }
    }
  )

  // 投稿削除のミューテーション
  const deleteMutation = useMutation(
    () => postsApi.deletePost(id!),
    {
      onSuccess: () => {
        toast.success('投稿を削除しました')
        navigate('/posts')
      },
      onError: () => {
        toast.error('投稿の削除に失敗しました')
      }
    }
  )

  // コメント投稿の処理
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return
    
    commentMutation.mutate(commentContent)
  }

  // 投稿削除の処理
  const handleDelete = () => {
    if (window.confirm('この投稿を削除しますか？')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-red-600 mb-4">投稿の取得に失敗しました</p>
              <Button onClick={() => navigate('/posts')}>
                投稿一覧に戻る
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  const canEdit = isAuthenticated && (user?.id === post.author?.id || user?.role === 'ADMIN')
  const canDelete = isAuthenticated && (user?.id === post.author?.id || user?.role === 'ADMIN')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 投稿詳細 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {post.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{post.author?.username}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {post.createdAt ? (
                        (() => {
                          try {
                            return formatDistanceToNow(new Date(post.createdAt), { 
                              addSuffix: true, 
                              locale: ja 
                            });
                          } catch (error) {
                            console.warn('Invalid date:', post.createdAt);
                            return '日時不明';
                          }
                        })()
                      ) : (
                        '日時不明'
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{commentsData?.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* アクションボタン */}
              <div className="flex items-center space-x-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/posts/edit/${post.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    編集
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    loading={deleteMutation.isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    削除
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardBody>
            {/* 投稿画像 */}
            {post.imageUrl && (
              <div className="mb-6">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* 投稿内容 */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* カテゴリー */}
            {post.category && (
              <div className="flex items-center space-x-2 mb-6">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {post.category.name}
                </span>
              </div>
            )}

            {/* 外部API統合 */}
            <div className="border-t pt-6 space-y-4">
              {/* 天気情報 */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWeather(!showWeather)}
                  className="mb-3"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  {showWeather ? '天気情報を隠す' : '天気情報を表示'}
                </Button>
                
                {showWeather && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    {weatherLoading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-blue-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                      </div>
                    ) : weatherData ? (
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">🌤️</div>
                        <div>
                          <div className="font-medium text-blue-900">
                            {weatherData.city}: {weatherData.temperature}°C
                          </div>
                          <div className="text-sm text-blue-700">
                            {weatherData.description} | 湿度: {weatherData.humidity}% | 風速: {weatherData.windSpeed}m/s
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-blue-700">天気情報の取得に失敗しました</div>
                    )}
                  </div>
                )}
              </div>

              {/* 関連画像 */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImages(!showImages)}
                  className="mb-3"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {showImages ? '関連画像を隠す' : '関連画像を表示'}
                </Button>
                
                {showImages && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    {imagesLoading ? (
                      <div className="grid grid-cols-3 gap-3">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-24 bg-green-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : imagesData?.images ? (
                      <div className="grid grid-cols-3 gap-3">
                        {imagesData.images.map((image: any) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(image.url, '_blank')}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                              {image.photographer}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-green-700">関連画像の取得に失敗しました</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* コメント投稿フォーム */}
        {isAuthenticated && (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">コメントを投稿</h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleCommentSubmit}>
                <div className="space-y-4">
                  <textarea
                    rows={4}
                    placeholder="コメントを入力してください..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <Button
                    type="submit"
                    loading={commentMutation.isLoading}
                    disabled={!commentContent.trim()}
                  >
                    コメントを投稿
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* コメント一覧 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              コメント ({commentsData?.comments?.length || 0})
            </h3>
          </CardHeader>
          <CardBody>
            {commentsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : commentsData?.comments?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                まだコメントがありません。最初のコメントを投稿してみましょう！
              </p>
            ) : (
              <div className="space-y-4">
                {commentsData?.comments?.map((comment: any) => (
                  <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {comment.author?.username}
                        </span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt ? (
                            (() => {
                              try {
                                return formatDistanceToNow(new Date(comment.createdAt), { 
                                  addSuffix: true, 
                                  locale: ja 
                                });
                              } catch (error) {
                                console.warn('Invalid comment date:', comment.createdAt);
                                return '日時不明';
                              }
                            })()
                          ) : (
                            '日時不明'
                          )}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default PostDetail
