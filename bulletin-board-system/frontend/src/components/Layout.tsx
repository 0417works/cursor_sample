import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // 認証が必要なページのパス
  const protectedPaths = ['/posts/create', '/posts/edit', '/profile']
  const isProtectedPath = protectedPaths.some(path => location.pathname.includes(path))

  // 認証が必要なページでログインしていない場合のリダイレクト
  if (isProtectedPath && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">アクセス制限</h2>
          <p className="text-gray-600 mb-6">このページにアクセスするにはログインが必要です。</p>
          <Link
            to="/login"
            className="btn-primary"
          >
            ログインする
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
