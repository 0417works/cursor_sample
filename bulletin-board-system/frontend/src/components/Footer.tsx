import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Github, Twitter, Mail } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ロゴと説明 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold">掲示板システム</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              ユーザーが自由に投稿・閲覧・コメントできる掲示板システムです。
              IT技術の成長目標評価におけるレベル2達成を目指して開発されています。
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@example.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* クイックリンク */}
          <div>
            <h3 className="text-lg font-semibold mb-4">クイックリンク</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  ホーム
                </Link>
              </li>
              <li>
                <Link
                  to="/posts"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  投稿一覧
                </Link>
              </li>
              <li>
                <Link
                  to="/posts/create"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  投稿作成
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  プロフィール
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h3 className="text-lg font-semibold mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 技術スタック */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <h4 className="text-sm font-medium text-gray-400 mb-3">技術スタック</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
              React 18
            </span>
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
              TypeScript
            </span>
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
              Tailwind CSS
            </span>
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
              Node.js
            </span>
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
              Express
            </span>
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
              PostgreSQL
            </span>
            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
              Prisma
            </span>
          </div>
        </div>

        {/* 著作権 */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} 掲示板システム. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Made with <Heart className="inline w-4 h-4 text-red-500" /> by AI Assistant
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
