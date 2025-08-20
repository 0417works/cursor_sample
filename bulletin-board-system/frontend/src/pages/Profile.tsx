import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { authApi, postsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Edit, 
  Save, 
  X, 
  FileText, 
  Settings,
  Eye,
  Clock,
  MessageSquare
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import toast from 'react-hot-toast'

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  })
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({})

  // ユーザーの投稿履歴を取得
  const { data: userPosts, isLoading: postsLoading } = useQuery(
    ['userPosts', user?.id],
    () => postsApi.getPosts({ authorId: user?.id, page: 1, limit: 20 }),
    {
      enabled: !!user?.id
    }
  )

  // プロフィール更新のミューテーション
  const updateProfileMutation = useMutation(
    (userData: any) => authApi.updateProfile(userData),
    {
      onSuccess: (data) => {
        updateUser(data.user)
        setIsEditing(false)
        toast.success('プロフィールを更新しました')
        queryClient.invalidateQueries(['userPosts', user?.id])
      },
      onError: (error: any) => {
        const message = error.response?.data?.error || 'プロフィールの更新に失敗しました'
        toast.error(message)
      }
    }
  )

  // フォームバリデーション
  const validateEditForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!editForm.username.trim()) {
      newErrors.username = 'ユーザー名を入力してください'
    } else if (editForm.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上で入力してください'
    } else if (editForm.username.length > 20) {
      newErrors.username = 'ユーザー名は20文字以下で入力してください'
    }

    if (!editForm.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }

    if (editForm.bio && editForm.bio.length > 500) {
      newErrors.bio = '自己紹介は500文字以下で入力してください'
    }

    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // プロフィール更新
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEditForm()) {
      return
    }

    updateProfileMutation.mutate(editForm)
  }

  // 編集開始
  const startEditing = () => {
    setEditForm({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || ''
    })
    setEditErrors({})
    setIsEditing(true)
  }

  // 編集キャンセル
  const cancelEditing = () => {
    setIsEditing(false)
    setEditErrors({})
  }

  // 入力値変更
  const handleEditInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
    
    // エラーをクリア
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">アクセス制限</h2>
          <p className="text-gray-600 mb-6">プロフィールを表示するにはログインが必要です。</p>
          <Button onClick={() => window.location.href = '/login'}>
            ログインする
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
          <p className="text-gray-600 mt-2">
            あなたのアカウント情報と投稿履歴を管理できます
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* プロフィール情報 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    プロフィール情報
                  </h2>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startEditing}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      編集
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ユーザー名 *
                      </label>
                      <Input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => handleEditInputChange('username', e.target.value)}
                        error={editErrors.username}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス *
                      </label>
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleEditInputChange('email', e.target.value)}
                        error={editErrors.email}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        自己紹介
                      </label>
                      <textarea
                        rows={4}
                        value={editForm.bio}
                        onChange={(e) => handleEditInputChange('bio', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm transition-colors ${
                          editErrors.bio
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="自己紹介を入力してください"
                        maxLength={500}
                      />
                      {editErrors.bio && (
                        <p className="mt-1 text-sm text-red-600">
                          {editErrors.bio}
                        </p>
                      )}
                      <div className="mt-1 text-sm text-gray-500">
                        {editForm.bio.length}/500文字
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="submit"
                        loading={updateProfileMutation.isLoading}
                        disabled={updateProfileMutation.isLoading}
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        保存
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                        disabled={updateProfileMutation.isLoading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        キャンセル
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ユーザー名
                      </label>
                      <p className="text-gray-900">{user.username}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        メールアドレス
                      </label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        自己紹介
                      </label>
                      <p className="text-gray-900">
                        {user.bio || '自己紹介が設定されていません'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        アカウント作成日
                      </label>
                      <p className="text-gray-900">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : '不明'}
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 統計情報 */}
            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  統計情報
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">総投稿数</span>
                    <span className="font-semibold text-gray-900">
                      {userPosts?.pagination?.totalItems || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">総閲覧数</span>
                    <span className="font-semibold text-gray-900">
                      {userPosts?.posts?.reduce((sum: number, post: any) => sum + (post.viewCount || 0), 0) || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">総コメント数</span>
                    <span className="font-semibold text-gray-900">
                      {userPosts?.posts?.reduce((sum: number, post: any) => sum + (post._count?.comments || 0), 0) || 0}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 投稿履歴 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  投稿履歴
                </h2>
              </CardHeader>
              <CardBody>
                {postsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : userPosts?.posts?.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      まだ投稿がありません
                    </h3>
                    <p className="text-gray-600 mb-4">
                      最初の投稿を作成してみましょう
                    </p>
                    <Button onClick={() => window.location.href = '/posts/create'}>
                      投稿を作成
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userPosts?.posts?.map((post: any) => (
                      <div key={post.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                                onClick={() => window.location.href = `/posts/${post.id}`}>
                              {post.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                                <span>{post.viewCount || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{post._count?.comments || 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              post.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {post.isPublished ? '公開' : '下書き'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
