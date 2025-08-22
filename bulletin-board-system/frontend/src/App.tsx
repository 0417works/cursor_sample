import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Posts from './pages/Posts'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import Profile from './pages/Profile'
import Drafts from './pages/Drafts'
import HelpCenter from './pages/HelpCenter'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Contact from './pages/Contact'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// React Queryクライアントの設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分
    },
  },
})

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="App">
            <Routes>
              {/* 認証不要のページ */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* レイアウト付きのページ */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/posts" element={<Layout><Posts /></Layout>} />
              <Route path="/posts/:id" element={<Layout><PostDetail /></Layout>} />
              <Route path="/posts/create" element={<Layout><CreatePost /></Layout>} />
              <Route path="/posts/edit/:id" element={<Layout><CreatePost /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/drafts" element={<Drafts />} />
              
              {/* サポート・法的ページ */}
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* 404ページ */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* トースト通知 */}
            <Toaster
              position="top-left"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  zIndex: 9999,
                },
                success: {
                  duration: 2000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App
