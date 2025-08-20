import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { postsApi, commentsApi, weatherApi, imageApi } from '../services/api'
import { 
  Eye, 
  MessageSquare, 
  Clock, 
  User, 
  Tag, 
  Edit, 
  Trash2,
  Heart,
  Share2,
  ArrowLeft,
  Cloud,
  Image as ImageIcon
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import toast from 'react-hot-toast'

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // 状態管理
  const [commentContent, setCommentContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWeather, setShowWeather] = useState(false)
  const [showRelatedImage, setShowRelatedImage] = useState(false)

  // 投稿データの取得
  const { data: post, isLoading: postLoading, error: postError } = useQuery(
    ['post', id],
    () => postsApi.getPost(id!),
    {
      enabled: !!id
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

  // 関連投稿の取得
  const { data: relatedPosts } = useQuery(
    ['relatedPosts', id],
    () => postsApi.getPosts({ 
      page: 1, 
      limit: 3, 
      categoryId: post?.categoryId,
      excludeId: id 
    }),
    {
      enabled: !!id && !!post?.categoryId
    }
  )

  // 天気データの取得
  const { data: weatherData, isLoading: weatherLoading } = useQuery(
    ['weather', post?.title],
    () => weatherApi.getCurrentWeather('Tokyo'), // デフォルトで東京
    {
      enabled: showWeather && !!post?.title
    }
  )

  // 関連画像の取得
  const { data: relatedImage, isLoading: imageLoading } = useQuery(
    ['relatedImage', post?.title],
    () => imageApi.searchImage(post?.title || ''),
    {
      enabled: showRelatedImage && !!post?.title
    }
  )

  // コメント投稿のミューテーション
  const commentMutation = useMutation(
    (content: string) => commentsApi.createComment({ content, postId: id! }),
    {
      onSuccess: () => {
        setCommentContent('')
        queryClient.invalidateQueries(['comments', id])
        toast.success('コメントを投稿しました')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'コメントの投稿に失敗しました')
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
      onError: (error: any) => {
        toast.error(error.response?.data?.error || '投稿の削除に失敗しました')
      }
    }
  )

  // コメント投稿処理
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    setIsSubmitting(true)
    try {
      await commentMutation.mutateAsync(commentContent)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 投稿削除処理
  const handleDelete = async () => {
    if (window.confirm('この投稿を削除しますか？この操作は取り消せません。')) {
      await deleteMutation.mutateAsync()
    }
  }

  // 投稿編集ページへ遷移
  const handleEdit = () => {
    navigate(`/posts/edit/${id}`)
  }

  if (postLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardBody className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">投稿が見つかりません</h2>
              <p className="text-gray-600 mb-6">指定された投稿が存在しないか、削除された可能性があります。</p>
              <Link to="/posts">
                <Button>投稿一覧に戻る</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link to="/posts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              投稿一覧に戻る
            </Button>
          </Link>
        </div>

        {/* 投稿内容 */}
        <Card className="mb-8">
          <CardBody>
            {/* 投稿ヘッダー */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                      <span>{post.viewCount} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{commentsData?.comments?.length || 0} comments</span>
                    </div>
                  </div>
                </div>

                {/* アクションボタン */}
                {isAuthenticated && user?.id === post.authorId && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      編集
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDelete}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      削除
                    </Button>
                  </div>
                )}
              </div>

              {/* カテゴリー */}
              {post.category && (
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{post.category.name}</span>
                </div>
              )}
            </div>

            {/* 投稿画像 */}
            {post.imageUrl && (
              <div className="mb-6">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* 投稿本文 */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* 外部API連携セクション */}
            <div className="border-t pt-6 space-y-4">
              {/* 天気情報 */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWeather(!showWeather)}
                  className="mb-2"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  天気情報を表示
                </Button>
                {showWeather && weatherData && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">現在の天気</h4>
                    <div className="flex items-center space-x-4 text-sm text-blue-800">
                      <span>東京: {weatherData.weather[0]?.description}</span>
                      <span>気温: {Math.round(weatherData.main.temp)}°C</span>
                      <span>湿度: {weatherData.main.humidity}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 関連画像 */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRelatedImage(!showRelatedImage)}
                  className="mb-2"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  関連画像を表示
                </Button>
                {showRelatedImage && relatedImage && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">関連画像</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {relatedImage.slice(0, 4).map((image: any, index: number) => (
                        <img
                          key={index}
                          src={image.urls.small}
                          alt={`Related ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* コメントセクション */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">
              コメント ({commentsData?.comments?.length || 0})
            </h3>
          </CardHeader>
          <CardBody>
            {/* コメント投稿フォーム */}
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="space-y-4">
                  <Input
                    label="コメントを投稿"
                    placeholder="コメントを入力してください..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    multiline
                    rows={3}
                    required
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !commentContent.trim()}
                      loading={isSubmitting}
                    >
                      コメントを投稿
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-2">コメントを投稿するにはログインが必要です</p>
                <Link to="/login">
                  <Button size="sm">ログイン</Button>
                </Link>
              </div>
            )}

            {/* コメント一覧 */}
            {commentsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : commentsData?.comments?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">まだコメントがありません</p>
            ) : (
              <div className="space-y-4">
                {commentsData?.comments?.map((comment: any) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.author?.username}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { 
                              addSuffix: true, 
                              locale: ja 
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* 関連投稿 */}
        {relatedPosts?.posts && relatedPosts.posts.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-900">関連投稿</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {relatedPosts.posts.map((relatedPost: any) => (
                  <Link
                    key={relatedPost.id}
                    to={`/posts/${relatedPost.id}`}
                    className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                      {relatedPost.title}
                    </h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{relatedPost.author?.username}</span>
                      <span>
                        {formatDistanceToNow(new Date(relatedPost.createdAt), { 
                          addSuffix: true, 
                          locale: ja 
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PostDetail
