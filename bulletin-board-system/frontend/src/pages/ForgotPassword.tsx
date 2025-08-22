import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Mail, CheckCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('メールアドレスを入力してください')
      return
    }

    setIsLoading(true)
    
    try {
      // 実際のAPI呼び出し
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast.success('パスワードリセット用のメールを送信しました')
      } else {
        const error = await response.json()
        toast.error(error.message || 'パスワードリセットの送信に失敗しました')
      }
    } catch (error) {
      console.error('パスワードリセットエラー:', error)
      toast.error('パスワードリセットの送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              メールを送信しました
            </h2>
            <p className="text-gray-600 mb-6">
              <span className="font-medium">{email}</span> 宛にパスワードリセット用のメールを送信しました。
              メール内のリンクをクリックして、新しいパスワードを設定してください。
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                ログイン画面に戻る
              </Link>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>注意:</strong> メールが届かない場合は、迷惑メールフォルダもご確認ください。
                数分待っても届かない場合は、再度お試しください。
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link
            to="/login"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            ログインに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">パスワードを忘れた場合</h1>
          <p className="text-gray-600 mt-2">
            登録済みのメールアドレスを入力してください。
            パスワードリセット用のリンクをお送りします。
          </p>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  送信中...
                </>
              ) : (
                'パスワードリセットメールを送信'
              )}
            </button>
          </form>

          {/* 注意事項 */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">ご注意</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 登録済みのメールアドレスを入力してください</li>
              <li>• パスワードリセットリンクは24時間有効です</li>
              <li>• セキュリティのため、リンクは1回のみ使用できます</li>
            </ul>
          </div>

          {/* ログインへのリンク */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              パスワードを思い出しましたか？{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ログイン画面に戻る
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
