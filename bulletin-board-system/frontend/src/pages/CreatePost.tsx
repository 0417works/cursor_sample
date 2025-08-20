import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { postsApi, categoriesApi, uploadApi } from '../services/api'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Eye, 
  EyeOff, 
  Save, 
  Image as ImageIcon,
  FileText,
  Tag
} from 'lucide-react'
import toast from 'react-hot-toast'

const CreatePost: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    isPublished: true
  })

  // 画像関連の状態
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  // UI状態
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // カテゴリーデータの取得
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    'categories',
    categoriesApi.getCategories
  )

  // 投稿作成のミューテーション
  const createPostMutation = useMutation(
    (postData: any) => postsApi.createPost(postData),
    {
      onSuccess: (data) => {
        toast.success('投稿を作成しました')
        navigate(`/posts/${data.id}`)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || '投稿の作成に失敗しました')
      }
    }
  )

  // 画像アップロードのミューテーション
  const uploadImageMutation = useMutation(
    (file: File) => uploadApi.uploadFile(file),
    {
      onSuccess: (data) => {
        setUploadedImageUrl(data.url)
        toast.success('画像をアップロードしました')
      },
      onError: (error: any) => {
        toast.error('画像のアップロードに失敗しました')
      }
    }
  )

  // フォーム入力処理
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 画像選択処理
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        toast.error('画像サイズは5MB以下にしてください')
        return
      }

      // ファイル形式チェック
      if (!file.type.startsWith('image/')) {
        toast.error('画像ファイルを選択してください')
        return
      }

      setSelectedImage(file)
      
      // プレビュー表示
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 画像削除処理
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setUploadedImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 画像アップロード処理
  const handleUploadImage = async () => {
    if (!selectedImage) return

    setIsSubmitting(true)
    try {
      await uploadImageMutation.mutateAsync(selectedImage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('タイトルを入力してください')
      return
    }

    if (!formData.content.trim()) {
      toast.error('内容を入力してください')
      return
    }

    if (!formData.categoryId) {
      toast.error('カテゴリーを選択してください')
      return
    }

    setIsSubmitting(true)
    try {
      const postData = {
        ...formData,
        imageUrl: uploadedImageUrl
      }
      await createPostMutation.mutateAsync(postData)
    } finally {
      setIsSubmitting(false)
    }
  }

  // プレビューデータ
  const previewData = {
    ...formData,
    imageUrl: imagePreview || uploadedImageUrl,
    author: user,
    createdAt: new Date(),
    viewCount: 0,
    _count: { comments: 0 }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/posts')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">投稿を作成</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    編集
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    プレビュー
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 投稿フォーム */}
          <div className={showPreview ? 'hidden lg:block' : ''}>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">投稿情報</h2>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* タイトル */}
                  <Input
                    label="タイトル"
                    placeholder="投稿のタイトルを入力してください"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    maxLength={100}
                  />

                  {/* カテゴリー */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      カテゴリー <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">カテゴリーを選択</option>
                      {categoriesData?.categories?.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 内容 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      内容 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                      placeholder="投稿の内容を入力してください"
                      required
                    />
                  </div>

                  {/* 画像アップロード */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      画像（オプション）
                    </label>
                    
                    {!selectedImage && !uploadedImageUrl ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          画像を選択
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                          PNG, JPG, GIF (最大5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* 画像プレビュー */}
                        <div className="relative">
                          <img
                            src={imagePreview || uploadedImageUrl || ''}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* アップロードボタン */}
                        {selectedImage && !uploadedImageUrl && (
                          <Button
                            type="button"
                            onClick={handleUploadImage}
                            loading={isSubmitting}
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            画像をアップロード
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 公開設定 */}
                  <div className="flex items-center">
                    <input
                      id="isPublished"
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                      投稿を公開する
                    </label>
                  </div>

                  {/* 送信ボタン */}
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/posts')}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      投稿を作成
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* プレビュー */}
          <div className={showPreview ? '' : 'hidden lg:block'}>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">プレビュー</h2>
              </CardHeader>
              <CardBody>
                {formData.title || formData.content ? (
                  <div className="space-y-4">
                    {/* タイトル */}
                    {formData.title && (
                      <h1 className="text-2xl font-bold text-gray-900">
                        {formData.title}
                      </h1>
                    )}

                    {/* メタ情報 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{user?.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span>
                          {categoriesData?.categories?.find(c => c.id === formData.categoryId)?.name || '未選択'}
                        </span>
                      </div>
                    </div>

                    {/* 画像 */}
                    {(imagePreview || uploadedImageUrl) && (
                      <div className="mb-4">
                        <img
                          src={imagePreview || uploadedImageUrl || ''}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* 内容 */}
                    {formData.content && (
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {formData.content}
                        </p>
                      </div>
                    )}

                    {/* 公開状態 */}
                    <div className="pt-4 border-t border-gray-200">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        formData.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formData.isPublished ? '公開' : '下書き'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>タイトルと内容を入力するとプレビューが表示されます</p>
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

export default CreatePost
