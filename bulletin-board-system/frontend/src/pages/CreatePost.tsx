import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { postsApi, categoriesApi, uploadApi, buildImageUrl } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  FileText, 
  Image as ImageIcon, 
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

const CreatePost: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const isEditMode = !!id
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    isPublished: false, // 編集モードの場合は下書きとして開始
    imageUrl: null as string | null
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // カテゴリーの取得
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    'categories',
    categoriesApi.getCategories
  )

  // 編集モードの場合、既存の投稿データを取得
  const { data: existingPost, isLoading: postLoading, error: postError } = useQuery(
    ['post', id],
    () => postsApi.getPost(id!),
    {
      enabled: isEditMode && !!id,
      staleTime: 0, // 常に最新データを取得
      refetchOnMount: true, // コンポーネントマウント時に再取得
      onSuccess: (data) => {
        console.log('=== 既存投稿データ取得成功 ===');
        console.log('Existing post data:', data);
        // フォームデータの初期化はuseEffectで処理
      },
      onError: (error: any) => {
        console.error('=== 既存投稿データ取得エラー ===');
        console.error('Error fetching existing post:', error);
        if (error.response?.status === 403) {
          toast.error('この投稿を編集する権限がありません');
        } else {
          toast.error('投稿データの取得に失敗しました');
        }
      }
    }
  )

  // 編集モードの場合のデータ初期化
  useEffect(() => {
    if (isEditMode && existingPost?.post) {
      console.log('=== useEffect: フォームデータ初期化 ===');
      console.log('Existing post data in useEffect:', existingPost.post);
      
      setFormData({
        title: existingPost.post.title,
        content: existingPost.post.content,
        categoryId: existingPost.post.categoryId || '',
        isPublished: existingPost.post.isPublished,
        imageUrl: existingPost.post.imageUrl
      });
      
      if (existingPost.post.imageUrl) {
        setImagePreview(buildImageUrl(existingPost.post.imageUrl));
      }
    }
  }, [isEditMode, existingPost]);

  // 投稿作成のミューテーション
  const createPostMutation = useMutation(
    (postData: any) => {
      console.log('=== createPostMutation 開始 ===');
      console.log('Post data to create:', postData);
      console.log('Image URL in post data:', postData.imageUrl);
      return postsApi.createPost(postData);
    },
    {
      onSuccess: (data) => {
        console.log('=== 投稿作成成功 ===');
        console.log('Post creation success data:', data);
        
        // キャッシュを更新
        queryClient.invalidateQueries(['posts']);
        queryClient.invalidateQueries(['drafts']);
        
                     toast.success('投稿を作成しました', { duration: 1500 })
        
        // 下書きとして保存した場合は下書き一覧に、公開した場合は投稿一覧に遷移
        if (data.post?.isPublished) {
          navigate('/posts');
        } else {
          navigate('/drafts');
        }
      },
      onError: (error: any) => {
        console.error('=== 投稿作成エラー ===');
        console.error('Post creation error:', error);
        console.error('Error response:', error.response?.data);
        let message = '投稿の作成に失敗しました'
        
        if (error.response?.data?.error) {
          message = error.response.data.error
        }
        
        toast.error(message, { duration: 2000 })
        console.error('Create post error:', error.response?.data)
        console.error('Error details:', error.response?.data?.details)
        
        // エラーの詳細をコンソールに表示
        if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
          console.error('Validation errors:')
          error.response.data.details.forEach((detail: any, index: number) => {
            console.error(`  ${index + 1}. ${detail.path}: ${detail.msg}`)
          })
        }
      }
    }
  )

  // 投稿更新のミューテーション
  const updatePostMutation = useMutation(
    (postData: any) => {
      console.log('=== updatePostMutation 開始 ===');
      console.log('Post data to update:', postData);
      return postsApi.updatePost(id!, postData);
    },
    {
      onSuccess: (data) => {
        console.log('=== 投稿更新成功 ===');
        console.log('Post update success data:', data);
        
        // キャッシュを更新
        queryClient.invalidateQueries(['post', id]);
        queryClient.invalidateQueries(['drafts']);
        queryClient.invalidateQueries(['posts']);
        
        toast.success('投稿を更新しました', { duration: 1500 })
        
        // 下書きとして保存した場合は下書き一覧に、公開した場合は投稿一覧に遷移
        if (data.post?.isPublished) {
          navigate('/posts');
        } else {
          navigate('/drafts');
        }
      },
      onError: (error: any) => {
        console.error('=== 投稿更新エラー ===');
        console.error('Post update error:', error);
        toast.error('投稿の更新に失敗しました', { duration: 2000 })
      }
    }
  )

  // 画像アップロードのミューテーション
  const uploadImageMutation = useMutation(
    (file: File) => {
      console.log('=== uploadImageMutation 開始 ===');
      console.log('File to upload:', file);
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      return uploadApi.uploadFile(file);
    },
    {
      onSuccess: (data) => {
        console.log('=== 画像アップロード成功 ===');
        console.log('Upload success data:', data);
        console.log('Full response structure:', JSON.stringify(data, null, 2));
        
        // レスポンス構造を詳しく確認
        if (data.file && data.file.url) {
          console.log('Image URL from file.url:', data.file.url);
          setFormData(prev => ({ ...prev, imageUrl: data.file.url }))
        } else if (data.url) {
          console.log('Image URL from data.url:', data.url);
          setFormData(prev => ({ ...prev, imageUrl: data.url }))
        } else {
          console.error('No image URL found in response:', data);
          toast.error('画像URLの取得に失敗しました');
          return; // エラー時は処理を中断
        }
        
        toast.success('画像をアップロードしました')
      },
      onError: (error: any) => {
        console.error('=== 画像アップロードエラー ===');
        console.error('Upload error:', error);
        console.error('Error response:', error.response?.data);
        toast.error('画像のアップロードに失敗しました')
        // エラー時は処理を中断
        throw error;
      }
    }
  )

  // フォームバリデーション
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルを入力してください'
    } else if (formData.title.length > 100) {
      newErrors.title = 'タイトルは100文字以下で入力してください'
    }

    if (!formData.content.trim()) {
      newErrors.content = '内容を入力してください'
    } else if (formData.content.length > 10000) {
      newErrors.content = '内容は10000文字以下で入力してください'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'カテゴリーを選択してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      let imageUrl: string | null = null
      
      // 画像がある場合は先にアップロード
      if (selectedImage) {
        console.log('=== 画像アップロード開始 ===');
        console.log('Selected image:', selectedImage);
        console.log('Image file details:', {
          name: selectedImage.name,
          size: selectedImage.size,
          type: selectedImage.type
        });
        
        try {
          const uploadResult = await uploadImageMutation.mutateAsync(selectedImage)
          console.log('Upload result:', uploadResult);
          
          // 画像URLの取得を改善
          let extractedImageUrl: string | null = null;
          if (uploadResult.file && uploadResult.file.url) {
            extractedImageUrl = uploadResult.file.url;
            console.log('Extracted imageUrl from file.url:', extractedImageUrl);
          } else if (uploadResult.url) {
            extractedImageUrl = uploadResult.url;
            console.log('Extracted imageUrl from url:', extractedImageUrl);
          } else {
            console.error('No image URL found in upload result:', uploadResult);
            toast.error('画像URLの取得に失敗しました');
            return;
          }
          
          imageUrl = extractedImageUrl;
          console.log('Final extracted imageUrl:', imageUrl);
          
          // フォームデータの状態も更新
          setFormData(prev => ({ ...prev, imageUrl }))
          console.log('Updated form data:', { ...formData, imageUrl });
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast.error('画像のアップロードに失敗しました');
          return;
        }
      } else {
        console.log('No image selected for upload');
      }

      // 送信データの確認
      const postData = {
        ...formData,
        imageUrl: imageUrl || formData.imageUrl || null
      }
      console.log('=== 投稿作成開始 ===');
      console.log('Final post data to send:', postData);
      console.log('Image URL in post data:', postData.imageUrl);

      // 投稿を作成または更新
      if (isEditMode) {
        await updatePostMutation.mutateAsync(postData)
      } else {
        await createPostMutation.mutateAsync(postData)
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false)
    }
  }

  // 画像選択
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('=== 画像選択 ===');
      console.log('Selected file:', file);
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        console.error('File too large:', file.size);
        toast.error('画像サイズは5MB以下にしてください')
        return
      }

      // ファイル形式チェック
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        toast.error('画像ファイルを選択してください')
        return
      }

      console.log('File validation passed, setting selected image');
      setSelectedImage(file)
      
      // プレビュー表示
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log('Image preview loaded');
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      console.log('No file selected');
    }
  }

  // 画像削除
  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, imageUrl: null }))
  }

  // 入力値変更
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">アクセス制限</h2>
          <p className="text-gray-600 mb-6">投稿を作成するにはログインが必要です。</p>
          <Button onClick={() => navigate('/login')}>
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? '投稿を編集' : '新しい投稿を作成'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode 
              ? '投稿の内容を編集できます'
              : 'あなたの考えや経験を共有しましょう'
            }
          </p>
          
          {/* 編集モードの場合のローディング状態とエラー状態 */}
          {isEditMode && (
            <div className="mt-4">
              {postLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-700">投稿データを読み込み中...</span>
                  </div>
                </div>
              )}
              {postError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <span className="text-red-700">
                    {postError.response?.status === 403 
                      ? 'この投稿を編集する権限がありません'
                      : '投稿データの取得に失敗しました'
                    }
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {isEditMode ? '投稿編集' : '投稿情報'}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 編集モードでデータ読み込み中またはエラーの場合、フォームを無効化 */}
              {isEditMode && postLoading && !existingPost && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <span className="text-gray-600">データを読み込み中...</span>
                  </div>
                </div>
              )}
              
              {/* 編集モードでエラーの場合 */}
              {isEditMode && postError && !existingPost && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                  <div className="text-center">
                    <div className="text-red-600 mb-2">⚠️</div>
                    <span className="text-gray-600">データの読み込みに失敗しました</span>
                  </div>
                </div>
              )}
              {/* タイトル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル *
                </label>
                <Input
                  type="text"
                  placeholder="投稿のタイトルを入力してください"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                  maxLength={100}
                  required
                  disabled={isEditMode && postLoading && !existingPost}
                />
                <div className="mt-1 text-sm text-gray-500">
                  {formData.title.length}/100文字
                </div>
              </div>

              {/* カテゴリー */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリー *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm transition-colors ${
                    errors.categoryId
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  required
                  disabled={isEditMode && postLoading && !existingPost}
                >
                  <option value="">カテゴリーを選択してください</option>
                  {categoriesLoading ? (
                    <option disabled>読み込み中...</option>
                  ) : (
                    categoriesData?.categories?.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.categoryId}
                  </p>
                )}
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容 *
                </label>
                <textarea
                  rows={8}
                  placeholder="投稿の内容を入力してください"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm transition-colors ${
                    errors.content
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  maxLength={10000}
                  required
                  disabled={isEditMode && postLoading && !existingPost}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.content}
                  </p>
                )}
                <div className="mt-1 text-sm text-gray-500">
                  {formData.content.length}/10000文字
                </div>
              </div>

              {/* 画像アップロード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  画像（オプション）
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        画像をクリックして選択、またはドラッグ&ドロップ
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* 公開設定 */}
              <div className="flex items-center">
                <input
                  id="is-published"
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is-published" className="ml-2 block text-sm text-gray-900">
                  {isEditMode ? '投稿を公開状態にする' : '投稿を公開する'}
                </label>
              </div>
              
              {/* 下書き保存の説明 */}
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p>💡 下書きとして保存することをお勧めします。</p>
                <p>内容を確認してから公開設定を変更してください。</p>
              </div>

              {/* 送信ボタン */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/posts')}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
                
                {/* 下書き保存ボタン（新規作成時と編集時） */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const draftData = { ...formData, isPublished: false };
                    if (isEditMode) {
                      updatePostMutation.mutate(draftData);
                    } else {
                      createPostMutation.mutate(draftData);
                    }
                  }}
                  loading={isEditMode ? updatePostMutation.isLoading : createPostMutation.isLoading}
                  disabled={isSubmitting || 
                    (isEditMode ? updatePostMutation.isLoading : createPostMutation.isLoading) || 
                    (isEditMode && postLoading && !existingPost)
                  }
                >
                  下書きとして保存
                </Button>
                
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting || (isEditMode && postLoading && !existingPost)}
                >
                  {isEditMode 
                    ? (formData.isPublished ? '投稿を更新' : '下書きとして更新')
                    : (formData.isPublished ? '投稿を公開' : '下書きとして保存')
                  }
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default CreatePost
