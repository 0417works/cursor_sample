import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { postsApi } from '../services/api';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Drafts: React.FC = () => {
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // 下書き一覧の取得
  const { data: draftsData, isLoading, error } = useQuery({
    queryKey: ['drafts'],
    queryFn: postsApi.getDrafts,
  });

  // 下書きを公開に変更するミューテーション
  const publishMutation = useMutation({
    mutationFn: postsApi.publishDraft,
    onSuccess: () => {
      // 下書き一覧と投稿一覧を更新
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setSelectedDraft(null);
    },
    onError: (error) => {
      console.error('下書きの公開に失敗しました:', error);
      alert('下書きの公開に失敗しました。');
    },
  });

  // 下書きを公開に変更
  const handlePublish = (draftId: string) => {
    if (confirm('この下書きを公開しますか？')) {
      publishMutation.mutate(draftId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">下書き一覧</h1>
            <div className="text-center">読み込み中...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">下書き一覧</h1>
            <div className="text-red-600">エラーが発生しました。</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const drafts = draftsData?.drafts || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">下書き一覧</h1>
          
          {drafts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              下書きはありません。
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {drafts.map((draft: any) => (
                <Card key={draft.id} className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">{draft.title}</h3>
                    <p className="text-gray-600 line-clamp-3">{draft.content}</p>
                  </div>
                  
                  <div className="mb-4">
                    {draft.category && (
                      <span 
                        className="inline-block px-2 py-1 text-xs rounded-full text-white mr-2"
                        style={{ backgroundColor: draft.category.color }}
                      >
                        {draft.category.name}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      更新日: {new Date(draft.updatedAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePublish(draft.id)}
                                           disabled={publishMutation.isLoading}
                     className="flex-1"
                   >
                     {publishMutation.isLoading ? '公開中...' : '公開する'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDraft(draft.id)}
                      className="flex-1"
                    >
                      編集
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Drafts;
