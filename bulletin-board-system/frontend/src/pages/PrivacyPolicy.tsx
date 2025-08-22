import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Shield, Lock, Eye, Database, Users, Mail, Calendar } from 'lucide-react'

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: '1. 個人情報の収集について',
      content: '当サービスでは、サービス提供に必要な範囲で個人情報を収集いたします。収集する個人情報には、ユーザー名、メールアドレス、プロフィール情報（自己紹介等）、投稿内容、画像データ等が含まれます。これらの情報は、ユーザーが自ら入力するか、サービス利用時に自動的に収集されます。'
    },
    {
      title: '2. 個人情報の利用目的',
      content: '収集した個人情報は、以下の目的で利用いたします。サービスの提供・運営、ユーザー認証・セキュリティ管理、カスタマーサポート、サービス改善・新機能開発、法令に基づく対応、その他、ユーザーの同意を得た目的。'
    },
    {
      title: '3. 個人情報の管理・保護',
      content: '当サービスでは、個人情報の適切な管理・保護のため、以下の措置を講じています。アクセス制御による不正アクセスの防止、暗号化による通信の保護、定期的なセキュリティ監査の実施、従業員への教育・訓練の実施。'
    },
    {
      title: '4. 個人情報の第三者提供',
      content: '当サービスでは、以下の場合を除き、個人情報を第三者に提供いたしません。ユーザーの事前の同意がある場合、法令に基づく場合、人の生命・身体・財産の保護のために必要な場合、公衆衛生の向上または児童の健全な育成の推進のために特に必要な場合。'
    },
    {
      title: '5. 個人情報の開示・訂正・利用停止',
      content: 'ユーザーは、当サービスが保有する自己の個人情報について、開示・訂正・利用停止を求めることができます。これらの要求については、本人確認の上、合理的な範囲で対応いたします。要求方法については、お問い合わせフォームよりご連絡ください。'
    },
    {
      title: '6. クッキー（Cookie）の使用',
      content: '当サービスでは、ユーザー体験の向上のため、クッキーを使用することがあります。クッキーは、ユーザーの設定やログイン状態等の情報を保存し、より快適なサービス利用を可能にします。ブラウザの設定により、クッキーの使用を制限することができます。'
    },
    {
      title: '7. アクセスログの収集',
      content: '当サービスでは、サービス品質向上のため、アクセスログを収集しています。アクセスログには、IPアドレス、アクセス日時、利用した機能等が含まれます。これらの情報は、個人を特定できない形で統計的に処理され、サービス改善に活用されます。'
    },
    {
      title: '8. 外部サービスの利用',
      content: '当サービスでは、一部の機能において、Google Analytics等の外部サービスを利用することがあります。これらの外部サービスでは、独自のプライバシーポリシーに基づいて情報が処理されます。外部サービスの利用については、各サービスのプライバシーポリシーをご確認ください。'
    },
    {
      title: '9. 未成年者の個人情報',
      content: '未成年者の個人情報については、保護者の同意を得た上で収集・利用いたします。保護者の同意がない場合、当該未成年者の個人情報の収集・利用を行わないものとします。'
    },
    {
      title: '10. プライバシーポリシーの変更',
      content: '当サービスでは、必要に応じて本プライバシーポリシーを変更することがあります。重要な変更がある場合は、サービス内での通知またはメール等により、ユーザーにお知らせいたします。'
    },
    {
      title: '11. お問い合わせ',
      content: '本プライバシーポリシーに関するお問い合わせや、個人情報の開示・訂正・利用停止の要求については、お問い合わせフォームよりご連絡ください。当サービスでは、適切かつ迅速に対応いたします。'
    }
  ]

  const dataTypes = [
    {
      icon: <Users className="w-5 h-5" />,
      title: 'アカウント情報',
      description: 'ユーザー名、メールアドレス、パスワード（暗号化）'
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: 'プロフィール情報',
      description: '自己紹介、アバター画像、アカウント作成日'
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: '投稿データ',
      description: '投稿内容、画像、カテゴリ、タグ、投稿日時'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: 'コミュニケーション',
      description: 'コメント、いいね、フォロー関係'
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
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 概要 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              掲示板システム プライバシーポリシー
            </h2>
            <p className="text-gray-600 mb-4">
              最終更新日: 2025年8月22日
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-green-500" />
                <span>個人情報の保護を最優先に考えています</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>定期的に内容を見直し、更新しています</span>
              </div>
            </div>
          </div>
        </div>

        {/* 収集するデータの種類 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            収集するデータの種類
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataTypes.map((type, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-blue-600 mt-1">{type.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{type.title}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* プライバシーポリシー本文 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              プライバシーポリシー
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    {section.title}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* お問い合わせ */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            プライバシーについて
          </h3>
          <p className="text-gray-600 mb-4">
            個人情報の取り扱いについて、ご不明な点やご質問がございましたら、
            お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/help"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Shield className="w-5 h-5 mr-2" />
              ヘルプセンター
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
