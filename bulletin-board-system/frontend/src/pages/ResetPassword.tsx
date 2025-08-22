import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    // トークンの有効性をチェック
    validateToken()
  }, [token])

  const validateToken = async () => {
    if (!token) {
      setTokenValid(false)
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/auth/reset-password/validate/${token}`)
      if (response.ok) {
        setTokenValid(true)
      } else {
        setTokenValid(false)
      }
    } catch (error) {
      console.error('トークン検証エラー:', error)
      setTokenValid(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validatePassword = (password: string) => {
    const minLength = 6
    const hasLetters = /[a-zA-Z]/.test(password)
    const hasNumbers = /\d/.test(password)

    return {
      isValid: password.length >= minLength && hasLetters && hasNumbers,
      errors: {
        length: password.length >= minLength,
        letters: hasLetters,
        numbers: hasNumbers
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('パスワードが一致しません')
      return
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      toast.error('パスワードの要件を満たしていません')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        toast.success('パスワードが正常にリセットされました')
        // 3秒後にログイン画面にリダイレクト
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        const error = await response.json()
        toast.error(error.message || 'パスワードリセットに失敗しました')
      }
    } catch (error) {
      console.error('パスワードリセットエラー:', error)
      toast.error('パスワードリセットに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">トークンを確認中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              無効なリンクです
            </h2>
            <p className="text-gray-600 mb-6">
              このパスワードリセットリンクは無効か、期限が切れています。
              新しいパスワードリセットメールをリクエストしてください。
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              パスワードリセットを再リクエスト
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              パスワードリセット完了
            </h2>
            <p className="text-gray-600 mb-6">
              パスワードが正常にリセットされました。
              新しいパスワードでログインしてください。
            </p>
            <div className="text-sm text-gray-500 mb-4">
              自動的にログイン画面にリダイレクトされます...
            </div>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログイン画面に移動
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const passwordValidation = validatePassword(formData.password)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新しいパスワードの設定</h1>
          <p className="text-gray-600 mt-2">
            新しいパスワードを入力してください
          </p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="新しいパスワード"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* パスワード要件 */}
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">パスワード要件:</p>
                <div className="space-y-1">
                  <div className={`flex items-center text-xs ${passwordValidation.errors.length ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">•</span>
                    最低6文字
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.errors.letters ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">•</span>
                    文字を含む
                  </div>
                  <div className={`flex items-center text-xs ${passwordValidation.errors.numbers ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="mr-2">•</span>
                    数字を含む
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード確認
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="パスワードを再入力"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {formData.confirmPassword && (
                <div className="mt-2">
                  <p className={`text-xs ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {formData.password === formData.confirmPassword ? '✓ パスワードが一致しています' : '✗ パスワードが一致しません'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  更新中...
                </>
              ) : (
                'パスワードを更新'
              )}
            </button>
          </form>

          {/* 注意事項 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">セキュリティについて</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 強力なパスワードを設定してください</li>
              <li>• 他のサービスで使用しているパスワードは避けてください</li>
              <li>• パスワードは定期的に変更することをお勧めします</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
