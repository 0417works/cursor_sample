import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, HelpCircle, Search, MessageCircle, FileText, Settings, Shield, Users } from 'lucide-react'

const HelpCenter: React.FC = () => {
  const faqItems = [
    {
      question: '投稿の作成方法は？',
      answer: 'ヘッダーの「投稿作成」ボタンをクリックするか、/posts/create にアクセスして投稿を作成できます。タイトル、カテゴリ、内容、画像を入力して「投稿する」または「下書きとして保存」を選択してください。'
    },
    {
      question: '下書き機能の使い方は？',
      answer: '投稿作成画面で「下書きとして保存」ボタンを押すと、下書きとして保存されます。下書きは /drafts で確認でき、後から編集や公開が可能です。'
    },
    {
      question: '画像のアップロード方法は？',
      answer: '投稿作成画面で「画像を選択」ボタンをクリックし、JPG、PNG、GIF形式の画像ファイルを選択してください。最大5MBまでアップロード可能です。'
    },
    {
      question: 'プロフィールの更新方法は？',
      answer: 'ヘッダーのアカウントメニューから「プロフィール」を選択し、「編集」ボタンを押して情報を更新できます。ユーザー名、メールアドレス、自己紹介を変更可能です。'
    },
    {
      question: '投稿の検索・フィルタリングは？',
      answer: '/posts ページでキーワード検索、カテゴリ別フィルタリング、並び替えができます。検索ボックスにキーワードを入力するか、カテゴリドロップダウンから選択してください。'
    }
  ]

  const helpCategories = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: '投稿関連',
      description: '投稿の作成、編集、削除について',
      link: '/help/posts'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'アカウント管理',
      description: 'プロフィール更新、パスワード変更について',
      link: '/help/account'
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: '設定・カスタマイズ',
      description: 'アプリケーションの設定について',
      link: '/help/settings'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'セキュリティ',
      description: 'アカウントのセキュリティについて',
      link: '/help/security'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>ホームに戻る</span>
            </Link>
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ヘルプセンター</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索セクション */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              何かお困りですか？
            </h2>
            <p className="text-gray-600 mb-6">
              キーワードを入力して、お探しの情報を見つけてください
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="例：投稿の作成方法、下書きの保存..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* ヘルプカテゴリ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {helpCategories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-blue-600 mb-4">{category.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {category.description}
              </p>
              <Link
                to={category.link}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                詳細を見る →
              </Link>
            </div>
          ))}
        </div>

        {/* よくある質問 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              よくある質問 (FAQ)
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {faqItems.map((item, index) => (
              <div key={index} className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* お問い合わせ */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            まだ解決しませんか？
          </h3>
          <p className="text-gray-600 mb-4">
            お困りのことがございましたら、お気軽にお問い合わせください
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            お問い合わせ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HelpCenter
