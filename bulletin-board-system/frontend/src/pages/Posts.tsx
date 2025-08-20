import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { postsApi, categoriesApi } from '../services/api'
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Eye, 
  MessageSquare, 
  Clock,
  User,
  Tag,
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

const Posts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // URLパラメータから状態を取得
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  // ローカル状態
  const [searchQuery, setSearchQuery] = useState(search)
  const [selectedCategory, setSelectedCategory] = useState(categoryId)
  const [selectedSort, setSelectedSort] = useState(`${sortBy}-${sortOrder}`)
  const [showFilters, setShowFilters] = useState(false)

  // 投稿データの取得
  const { data: postsData, isLoading, error } = useQuery(
    ['posts', page, limit, search, categoryId, sortBy, sortOrder],
    () => postsApi.getPosts({
      page,
      limit,
      search,
      categoryId,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc'
    }),
    {
      keepPreviousData: true
    }
  )

  // カテゴリーデータの取得
  const { data: categoriesData } = useQuery(
    'categories',
    categoriesApi.getCategories
  )

  // URLパラメータの更新
  const updateSearchParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    newParams.set('page', '1') // 検索条件変更時は1ページ目に戻る
    setSearchParams(newParams)
  }

  // 検索実行
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams({ search: searchQuery })
  }

  // カテゴリーフィルター変更
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    updateSearchParams({ categoryId })
  }

  // ソート変更
  const handleSortChange = (sortValue: string) => {
    setSelectedSort(sortValue)
    const [newSortBy, newSortOrder] = sortValue.split('-')
    updateSearchParams({ sortBy: newSortBy, sortOrder: newSortOrder })
  }

  // ページネーション
  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage.toString() })
  }

  // フィルターリセット
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedSort('createdAt-desc')
    setSearchParams({})
  }

  // ソートオプション
  const sortOptions = [
    { value: 'createdAt-desc', label: '最新順', icon: SortDesc },
    { value: 'createdAt-asc', label: '古い順', icon: SortAsc },
    { value: 'viewCount-desc', label: '閲覧数順', icon: Eye },
    { value: 'title-asc', label: 'タイトル順', icon: SortAsc }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">投稿一覧</h1>
          <p className="text-gray-600">
            {postsData?.pagination?.totalItems || 0}件の投稿が見つかりました
          </p>
        </div>

        {/* 検索・フィルター */}
        <Card className="mb-6">
          <CardBody>
            <div className="space-y-4">
              {/* 検索バー */}
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="投稿を検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                  />
                </div>
                <Button type="submit">検索</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  フィルター
                </Button>
              </form>

              {/* フィルターオプション */}
              {showFilters && (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* カテゴリーフィルター */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        カテゴリー
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">すべてのカテゴリー</option>
                        {categoriesData?.categories?.map((category: any) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ソート */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        並び順
                      </label>
                      <select
                        value={selectedSort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {sortOptions.map((option) => {
                          const Icon = option.icon
                          return (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    {/* 表示件数 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        表示件数
                      </label>
                      <select
                        value={limit}
                        onChange={(e) => updateSearchParams({ limit: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="12">12件</option>
                        <option value="24">24件</option>
                        <option value="48">48件</option>
                      </select>
                    </div>
                  </div>

                  {/* フィルターリセット */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                    >
                      フィルターをリセット
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* 投稿一覧 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(limit)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardBody>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-red-600">投稿の取得に失敗しました</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                再試行
              </Button>
            </CardBody>
          </Card>
        ) : postsData?.posts?.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                投稿が見つかりません
              </h3>
              <p className="text-gray-600 mb-4">
                検索条件を変更するか、新しい投稿を作成してください
              </p>
              <Link to="/posts/create">
                <Button>投稿を作成</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {postsData?.posts?.map((post: any) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardBody>
                    {/* 投稿画像 */}
                    {post.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* 投稿情報 */}
                    <div className="space-y-3">
                      <Link
                        to={`/posts/${post.id}`}
                        className="block group"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-gray-600 text-sm line-clamp-3">
                        {post.content}
                      </p>

                      {/* カテゴリー */}
                      {post.category && (
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {post.category.name}
                          </span>
                        </div>
                      )}

                      {/* 投稿メタ情報 */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{post.author?.username}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatDistanceToNow(new Date(post.createdAt), { 
                              addSuffix: true, 
                              locale: ja 
                            })}
                          </span>
                        </div>
                      </div>

                      {/* 統計情報 */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{post.viewCount}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{post._count?.comments || 0}</span>
                        </div>
                        <Link
                          to={`/posts/${post.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          詳細を見る →
                        </Link>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* ページネーション */}
            {postsData?.pagination && postsData.pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  {/* 前のページ */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!postsData.pagination.hasPrevPage}
                  >
                    前へ
                  </Button>

                  {/* ページ番号 */}
                  {Array.from({ length: postsData.pagination.totalPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      const current = page
                      const total = postsData.pagination.totalPages
                      return pageNum === 1 || pageNum === total || 
                             (pageNum >= current - 2 && pageNum <= current + 2)
                    })
                    .map((pageNum, index, array) => (
                      <React.Fragment key={pageNum}>
                        {index > 0 && array[index - 1] !== pageNum - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <Button
                          variant={pageNum === page ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      </React.Fragment>
                    ))}

                  {/* 次のページ */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!postsData.pagination.hasNextPage}
                  >
                    次へ
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Posts
