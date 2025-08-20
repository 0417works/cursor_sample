import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'

interface User {
  id: string
  email: string
  username: string
  role: string
  avatar?: string
  bio?: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // 初期化時にユーザー情報を取得
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const userData = await authApi.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        // トークンが無効な場合は削除
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.login({ email, password })
      
      // トークンをローカルストレージに保存
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      
      setUser(response.user)
      toast.success('ログインに成功しました')
      navigate('/')
    } catch (error: any) {
      const message = error.response?.data?.error || 'ログインに失敗しました'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, username: string, password: string) => {
    try {
      setIsLoading(true)
      await authApi.register({ email, username, password })
      
      // 登録成功後、自動的にログイン
      await login(email, password)
      toast.success('アカウント登録に成功しました')
    } catch (error: any) {
      const message = error.response?.data?.error || 'アカウント登録に失敗しました'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // ローカルストレージをクリア
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
      toast.success('ログアウトしました')
      navigate('/login')
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true)
      const updatedUser = await authApi.updateProfile(data)
      setUser(updatedUser)
      toast.success('プロフィールを更新しました')
    } catch (error: any) {
      const message = error.response?.data?.error || 'プロフィールの更新に失敗しました'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updateUser: updateProfile, // updateProfileのエイリアス
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
