import axios, { AxiosInstance, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

// APIのベースURL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// axiosインスタンスの作成
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエストインターセプター（トークンの自動付与）
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

// レスポンスインターセプター（トークン更新、エラーハンドリング）
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 401エラーでトークンが期限切れの場合
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          // 元のリクエストを再実行
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // リフレッシュトークンも期限切れの場合
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // エラーメッセージの表示
    if (error.response?.data?.error) {
      toast.error(error.response.data.error)
    } else if (error.message) {
      toast.error(error.message)
    }

    return Promise.reject(error)
  }
)

// 認証関連のAPI
export const authApi = {
  // ユーザー登録
  register: async (email: string, username: string, password: string) => {
    const response = await apiClient.post('/auth/register', {
      email,
      username,
      password,
    })
    return response.data
  },

  // ログイン
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  // ログアウト
  logout: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/logout', {
      refreshToken,
    })
    return response.data
  },

  // 現在のユーザー情報取得
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data.user
  },

  // プロフィール更新
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/users/profile', data)
    return response.data.user
  },

  // パスワード変更
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.put('/users/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },
}

// 投稿関連のAPI
export const postsApi = {
  // 投稿一覧取得
  getPosts: async (params?: {
    page?: number
    limit?: number
    categoryId?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const response = await apiClient.get('/posts', { params })
    return response.data
  },

  // 投稿詳細取得
  getPost: async (id: string) => {
    const response = await apiClient.get(`/posts/${id}`)
    return response.data
  },

  // 投稿作成
  createPost: async (data: {
    title: string
    content: string
    categoryId?: string
    imageUrl?: string
    tags?: string[]
  }) => {
    const response = await apiClient.post('/posts', data)
    return response.data
  },

  // 投稿更新
  updatePost: async (id: string, data: {
    title?: string
    content?: string
    categoryId?: string
    imageUrl?: string
    tags?: string[]
  }) => {
    const response = await apiClient.put(`/posts/${id}`, data)
    return response.data
  },

  // 投稿削除
  deletePost: async (id: string) => {
    const response = await apiClient.delete(`/posts/${id}`)
    return response.data
  },

  // 投稿の公開状態切り替え
  togglePublish: async (id: string) => {
    const response = await apiClient.patch(`/posts/${id}/toggle-publish`)
    return response.data
  },
}

// コメント関連のAPI
export const commentsApi = {
  // コメント一覧取得
  getComments: async (postId: string, params?: {
    page?: number
    limit?: number
  }) => {
    const response = await apiClient.get(`/comments/post/${postId}`, { params })
    return response.data
  },

  // コメント作成
  createComment: async (data: {
    content: string
    postId: string
  }) => {
    const response = await apiClient.post('/comments', data)
    return response.data
  },

  // コメント更新
  updateComment: async (id: string, data: { content: string }) => {
    const response = await apiClient.put(`/comments/${id}`, data)
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
  createCategory: async (data: {
    name: string
    description?: string
    color?: string
  }) => {
    const response = await apiClient.post('/categories', data)
    return response.data
  },

  // カテゴリー更新（管理者・モデレーターのみ）
  updateCategory: async (id: string, data: {
    name?: string
    description?: string
    color?: string
  }) => {
    const response = await apiClient.put(`/categories/${id}`, data)
    return response.data
  },

  // カテゴリー削除（管理者・モデレーターのみ）
  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`)
    return response.data
  },
}

// タグ関連のAPI
export const tagsApi = {
  // タグ一覧取得
  getTags: async () => {
    const response = await apiClient.get('/tags')
    return response.data
  },

  // タグ作成（管理者・モデレーターのみ）
  createTag: async (data: { name: string; color?: string }) => {
    const response = await apiClient.post('/tags', data)
    return response.data
  },

  // タグ更新（管理者・モデレーターのみ）
  updateTag: async (id: string, data: { name?: string; color?: string }) => {
    const response = await apiClient.put(`/tags/${id}`, data)
    return response.data
  },

  // タグ削除（管理者・モデレーターのみ）
  deleteTag: async (id: string) => {
    const response = await apiClient.delete(`/tags/${id}`)
    return response.data
  },
}

// ファイルアップロード関連のAPI
export const uploadApi = {
  // 単一ファイルアップロード
  uploadSingle: async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiClient.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // 複数ファイルアップロード
  uploadMultiple: async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
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
}

// 外部API関連
export const externalApi = {
  // 天気情報取得
  getWeather: async (city: string) => {
    const response = await apiClient.get(`/posts/weather?city=${encodeURIComponent(city)}`)
    return response.data
  },

  // 関連画像検索
  searchImages: async (query: string) => {
    const response = await apiClient.get(`/posts/images?query=${encodeURIComponent(query)}`)
    return response.data
  },
}

export default apiClient
