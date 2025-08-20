import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Plus,
  Search,
  Bell
} from 'lucide-react'

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/posts?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
    setIsUserMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴとメインナビゲーション */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">掲示板</span>
            </Link>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex ml-10 space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                ホーム
              </Link>
              <Link
                to="/posts"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                投稿一覧
              </Link>
              {isAuthenticated && (
                <Link
                  to="/posts/create"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  投稿作成
                </Link>
              )}
            </nav>
          </div>

          {/* 検索バー */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="投稿を検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
          </div>

          {/* 右側のメニュー */}
          <div className="flex items-center space-x-4">
            {/* 通知アイコン */}
            {isAuthenticated && (
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
            )}

            {/* ユーザーメニュー */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.username}
                  </span>
                </button>

                {/* ドロップダウンメニュー */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      プロフィール
                    </Link>
                    <Link
                      to="/posts/create"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      投稿作成
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="btn-outline"
                >
                  ログイン
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  登録
                </Link>
              </div>
            )}

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                ホーム
              </Link>
              <Link
                to="/posts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                投稿一覧
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/posts/create"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    投稿作成
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    プロフィール
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    ログアウト
                  </button>
                </>
              )}
            </div>

            {/* モバイル検索バー */}
            <div className="mt-4 px-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="投稿を検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
