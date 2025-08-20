import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { postsApi, authApi } from '../services/api'
import { 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Eye, 
  Settings,
  Edit,
  Save,
  X,
  Camera,
  LogOut,
  Shield,
  Bell
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import toast from 'react-hot-toast'

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth()
  const queryClient = useQueryClient()

  // 状態管理
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'posts' | 'settings'>('profile')
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  })

  // ユーザーの投稿データの取得
  const { data: userPosts, isLoading: postsLoading } = useQuery(
    ['userPosts', user?.id],
    () => postsApi.getPosts({ 
      page: 1, 
      limit: 10, 
      authorId: user?.id,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }),
    {
      enabled: !!user?.id
    }
  )

  // ユーザー情報更新のミューテーション
  const updateUserMutation = useMutation(
    (userData: any) => authApi.updateProfile(userData),
    {
      onSuccess: (data) => {
        updateUser(data)
        setIsEditing(false)
        toast.success('プロフィールを更新しました')
        queryClient.invalidateQueries(['user', user?.id])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'プロフィールの更新に失敗しました')
      }
    }
  )

  // フォーム入力処理
  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  // 編集開始
  const handleStartEdit = () => {
    setEditForm({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || ''
    })
    setIsEditing(true)
  }

  // 編集キャンセル
  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  // プロフィール更新
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editForm.username.trim()) {
      toast.error('ユーザー名を入力してください')
      return
    }

    if (!editForm.email.trim()) {
      toast.error('メールアドレスを入力してください')
      return
    }

    await updateUserMutation.mutateAsync(editForm)
  }

  // ログアウト処理
  const handleLogout = async () => {
    await logout()
    toast.success('ログアウトしました')
  }

  // タブコンテンツ
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">プロフィール情報</h3>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEdit}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    編集
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <Input
                    label="ユーザー名"
                    value={editForm.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required
                  />
                  <Input
                    label="メールアドレス"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                  <Input
                    label="自己紹介"
                    value={editForm.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="自己紹介を入力してください"
                  />
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="submit"
                      loading={updateUserMutation.isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {user?.username}
                      </h4>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  
                  {user?.bio && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">自己紹介</h5>
                      <p className="text-gray-600">{user.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {userPosts?.pagination?.totalItems || 0}
                      </div>
                      <div className="text-sm text-gray-600">投稿数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {user?.createdAt ? 
                          formatDistanceToNow(new Date(user.createdAt), { 
                            addSuffix: true, 
                            locale: ja 
                          }) : '不明'
                        }
                      </div>
                      <div className="text-sm text-gray-600">登録日</div>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )

      case 'posts':
        return (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">投稿履歴</h3>
            </CardHeader>
            <CardBody>
              {postsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : userPosts?.posts?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">まだ投稿がありません</p>
                  <Button
                    className="mt-4"
                    onClick={() => window.location.href = '/posts/create'}
                  >
                    投稿を作成
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts?.posts?.map((post: any) => (
                    <div key={post.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {post.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
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
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/posts/${post.id}`}
                          >
                            表示
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/posts/edit/${post.id}`}
                          >
                            編集
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            {/* アカウント設定 */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  アカウント設定
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">パスワード変更</h4>
                      <p className="text-sm text-gray-600">定期的にパスワードを変更することをお勧めします</p>
                    </div>
                    <Button variant="outline" size="sm">
                      変更
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">2段階認証</h4>
                      <p className="text-sm text-gray-600">セキュリティを強化するために2段階認証を有効にします</p>
                    </div>
                    <Button variant="outline" size="sm">
                      設定
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 通知設定 */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  通知設定
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">コメント通知</h4>
                      <p className="text-sm text-gray-600">投稿にコメントがついた時の通知</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">メール通知</h4>
                      <p className="text-sm text-gray-600">重要な更新のメール通知</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 危険な操作 */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-red-900">危険な操作</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">アカウント削除</h4>
                      <p className="text-sm text-gray-600">この操作は取り消せません。すべてのデータが削除されます。</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                      削除
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">ログアウト</h4>
                      <p className="text-sm text-gray-600">現在のセッションを終了します</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="text-gray-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ログアウト
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
          <p className="text-gray-600 mt-2">アカウント情報の管理と設定</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <Card>
              <CardBody>
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    プロフィール
                  </button>
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'posts'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    投稿履歴
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    設定
                  </button>
                </nav>
              </CardBody>
            </Card>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
