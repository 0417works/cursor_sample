import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, FileText, Shield, Users, AlertTriangle, CheckCircle } from 'lucide-react'

const TermsOfService: React.FC = () => {
  const sections = [
    {
      title: '第1条（適用）',
      content: '本規約は、掲示板システム（以下「本サービス」）の利用条件を定めるものです。本サービスを利用するユーザー（以下「ユーザー」）は、本規約に同意したものとみなします。'
    },
    {
      title: '第2条（利用登録）',
      content: '本サービスの利用を希望する者は、本規約に同意の上、本サービスの定める方法によって利用登録を行うものとします。利用登録の申請に際して虚偽の情報を提供した場合、当該申請を拒否することがあります。'
    },
    {
      title: '第3条（ユーザーの責任）',
      content: 'ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。法令または公序良俗に違反する行為、犯罪行為に関連する行為、本サービスのサーバーまたはネットワークの機能を破壊する行為、他のユーザーに迷惑をかける行為、その他、本サービスが不適切と判断する行為。'
    },
    {
      title: '第4条（投稿内容の責任）',
      content: 'ユーザーが投稿した内容について、当該ユーザーが一切の責任を負うものとします。本サービスは、ユーザーが投稿した内容について、その正確性、完全性、有用性等を保証するものではありません。'
    },
    {
      title: '第5条（禁止事項）',
      content: '以下の行為は禁止します。他人の著作権、商標権等の知的財産権を侵害する行為、他人の名誉、信用、プライバシーを侵害する行為、差別的、暴力的、性的、その他他人に不快感を与える表現を含む投稿、スパム、チェーンメール等の迷惑行為。'
    },
    {
      title: '第6条（本サービスの提供の停止等）',
      content: '本サービスは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。本サービスにかかるコンピュータシステムの保守点検または更新を行う場合、地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合。'
    },
    {
      title: '第7条（利用制限および登録抹消）',
      content: '本サービスは、ユーザーが以下のいずれかに該当する場合、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。本規約のいずれかの条項に違反した場合、登録事項に虚偽の事実があることが判明した場合、その他、本サービスが利用登録を適当でないと判断した場合。'
    },
    {
      title: '第8条（免責事項）',
      content: '本サービスは、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。ただし、本サービスとユーザーとの間の契約（本規約を含みます）が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。'
    },
    {
      title: '第9条（サービス内容の変更等）',
      content: '本サービスは、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーまたは第三者に生じた損害について一切の責任を負いません。'
    },
    {
      title: '第10条（利用規約の変更）',
      content: '本サービスは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を継続した場合には、変更後の規約に同意したものとみなします。'
    },
    {
      title: '第11条（通知または連絡）',
      content: 'ユーザーと本サービスとの間の通知または連絡は、本サービスの定める方法によって行うものとします。本サービスは、ユーザーから、本サービスが定める方法に従った変更の届出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。'
    },
    {
      title: '第12条（権利義務の譲渡の禁止）',
      content: 'ユーザーは、本サービスの書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。'
    },
    {
      title: '第13条（準拠法・裁判管轄）',
      content: '本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。'
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
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">利用規約</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 概要 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              掲示板システム 利用規約
            </h2>
            <p className="text-gray-600 mb-4">
              最終更新日: 2025年8月22日
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>利用開始前に必ずお読みください</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span>違反行為は利用停止の対象となります</span>
              </div>
            </div>
          </div>
        </div>

        {/* 利用規約本文 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              利用規約
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

        {/* 同意確認 */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            利用規約について
          </h3>
          <p className="text-gray-600 mb-4">
            本サービスの利用にあたり、上記の利用規約に同意いただく必要があります。
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/help"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              ヘルプセンター
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService
