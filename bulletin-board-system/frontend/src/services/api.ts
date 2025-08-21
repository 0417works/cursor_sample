import axios from 'axios'

// APIのベースURL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエストインターセプター（認証トークンの追加）
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // トークンが無効な場合、ローカルストレージをクリア
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 認証関連のAPI
export const authApi = {
  // ユーザー登録
  register: async (userData: {
    email: string
    username: string
    password: string
  }) => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  // ユーザーログイン
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  // ログアウト
  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  // トークンリフレッシュ
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    const response = await apiClient.post('/auth/refresh', { refreshToken })
    return response.data
  },

  // 現在のユーザー情報取得
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  // プロフィール更新
  updateProfile: async (userData: {
    username?: string
    email?: string
    bio?: string
  }) => {
    const response = await apiClient.put('/auth/profile', userData)
    return response.data
  },

  // パスワード変更
  changePassword: async (passwordData: {
    currentPassword: string
    newPassword: string
  }) => {
    const response = await apiClient.put('/auth/password', passwordData)
    return response.data
  },

  // パスワードリセット要求
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  },

  // パスワードリセット
  resetPassword: async (resetData: {
    token: string
    newPassword: string
  }) => {
    const response = await apiClient.post('/auth/reset-password', resetData)
    return response.data
  },
}

// 投稿関連のAPI
export const postsApi = {
  // 投稿一覧取得
  getPosts: async (params: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
    authorId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    excludeId?: string
  } = {}) => {
    const response = await apiClient.get('/posts', { params })
    return response.data
  },

  // 投稿詳細取得
  getPost: async (id: string) => {
    const response = await apiClient.get(`/posts/${id}`)
    return response.data
  },

  // 投稿作成
  createPost: async (postData: {
    title: string
    content: string
    categoryId: string
    imageUrl?: string
    isPublished?: boolean
  }) => {
    const response = await apiClient.post('/posts', postData)
    return response.data
  },

  // 投稿更新
  updatePost: async (id: string, postData: {
    title?: string
    content?: string
    categoryId?: string
    imageUrl?: string
    isPublished?: boolean
  }) => {
    const response = await apiClient.put(`/posts/${id}`, postData)
    return response.data
  },

  // 投稿削除
  deletePost: async (id: string) => {
    const response = await apiClient.delete(`/posts/${id}`)
    return response.data
  },

  // 投稿の公開状態切り替え
  togglePostStatus: async (id: string) => {
    const response = await apiClient.patch(`/posts/${id}/toggle-status`)
    return response.data
  },

  // 投稿の閲覧数増加
  incrementViewCount: async (id: string) => {
    const response = await apiClient.patch(`/posts/${id}/increment-view`)
    return response.data
  },
}

// コメント関連のAPI
export const commentsApi = {
  // コメント一覧取得
  getComments: async (postId: string, params: {
    page?: number
    limit?: number
  } = {}) => {
    const response = await apiClient.get(`/posts/${postId}/comments`, { params })
    return response.data
  },

  // コメント作成
  createComment: async (commentData: {
    content: string
    postId: string
  }) => {
    const response = await apiClient.post('/comments', commentData)
    return response.data
  },

  // コメント更新
  updateComment: async (id: string, commentData: {
    content: string
  }) => {
    const response = await apiClient.put(`/comments/${id}`, commentData)
    return response.data
  },

  // コメント削除
  deleteComment: async (id: string) => {
    const response = await apiClient.delete(`/comments/${id}`)
    return response.data
  },
}

// カテゴリー関連のAPI
export const categoriesApi = {
  // カテゴリー一覧取得
  getCategories: async () => {
    const response = await apiClient.get('/categories')
    return response.data
  },

  // カテゴリー詳細取得
  getCategory: async (id: string) => {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data
  },

  // カテゴリー作成（管理者・モデレーターのみ）
  createCategory: async (categoryData: {
    name: string
    description?: string
  }) => {
    const response = await apiClient.post('/categories', categoryData)
    return response.data
  },

  // カテゴリー更新（管理者・モデレーターのみ）
  updateCategory: async (id: string, categoryData: {
    name?: string
    description?: string
  }) => {
    const response = await apiClient.put(`/categories/${id}`, categoryData)
    return response.data
  },

  // カテゴリー削除（管理者・モデレーターのみ）
  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`)
    return response.data
  },

  // カテゴリー別投稿取得
  getPostsByCategory: async (categoryId: string, params: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) => {
    const response = await apiClient.get(`/categories/${categoryId}/posts`, { params })
    return response.data
  },
}

// ファイルアップロード関連のAPI
export const uploadApi = {
  // 単一ファイルアップロード
  uploadFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // 複数ファイルアップロード
  uploadMultipleFiles: async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    
    const response = await apiClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // ファイル削除
  deleteFile: async (filename: string) => {
    const response = await apiClient.delete(`/upload/${filename}`)
    return response.data
  },

  // アップロード済みファイル一覧
  getUploadedFiles: async () => {
    const response = await apiClient.get('/upload/files')
    return response.data
  },
}

// 天気関連のAPI
export const weatherApi = {
  // 現在の天気取得
  getCurrentWeather: async (city: string) => {
    const response = await apiClient.get(`/weather/current?city=${encodeURIComponent(city)}`)
    return response.data
  },

  // 天気予報取得
  getWeatherForecast: async (city: string, days: number = 5) => {
    const response = await apiClient.get(`/weather/forecast?city=${encodeURIComponent(city)}&days=${days}`)
    return response.data
  },
}

// 画像関連のAPI
export const imageApi = {
  // 関連画像検索
  searchImage: async (query: string, count: number = 10) => {
    const response = await apiClient.get(`/images/search?query=${encodeURIComponent(query)}&count=${count}`)
    return response.data
  },

  // ランダム画像取得
  getRandomImage: async (category?: string) => {
    const params = category ? { category } : {}
    const response = await apiClient.get('/images/random', { params })
    return response.data
  },
}

// 統計関連のAPI
export const statsApi = {
  // 全体統計取得
  getOverallStats: async () => {
    const response = await apiClient.get('/posts/stats/overview')
    return response.data
  },

  // ユーザー統計取得
  getUserStats: async (userId: string) => {
    const response = await apiClient.get(`/stats/user/${userId}`)
    return response.data
  },

  // カテゴリー統計取得
  getCategoryStats: async () => {
    const response = await apiClient.get('/stats/categories')
    return response.data
  },
}

// 通知関連のAPI
export const notificationApi = {
  // 通知一覧取得
  getNotifications: async (params: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  } = {}) => {
    const response = await apiClient.get('/notifications', { params })
    return response.data
  },

  // 通知を既読にする
  markAsRead: async (notificationId: string) => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`)
    return response.data
  },

  // すべての通知を既読にする
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/mark-all-read')
    return response.data
  },

  // 通知設定更新
  updateNotificationSettings: async (settings: {
    emailNotifications?: boolean
    commentNotifications?: boolean
    systemNotifications?: boolean
  }) => {
    const response = await apiClient.put('/notifications/settings', settings)
    return response.data
  },
}

export default apiClient
