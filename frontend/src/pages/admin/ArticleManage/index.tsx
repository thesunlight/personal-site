import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleApi } from '../../../api/articleApi';
import { formatDate } from '../../../utils/date';
import Pagination from '../../../components/Common/Pagination';
import ArticleFetchDialog from '../../../components/Admin/ArticleFetchDialog';
import { useI18n } from '../../../i18n';

export default function ArticleManage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [showFetchDialog, setShowFetchDialog] = useState(false);
  const { data } = useQuery({
    queryKey: ['adminArticles', page, keyword],
    queryFn: () => articleApi.getListAll({ page, size: 10, keyword: keyword || undefined }).then(r => r.data),
  });

  const deleteMutation = useMutation({ mutationFn: (id: number) => articleApi.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminArticles'] }) });
  const toggleTop = useMutation({ mutationFn: (id: number) => articleApi.toggleTop(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminArticles'] }) });
  const toggleStatus = useMutation({ mutationFn: (id: number) => articleApi.toggleStatus(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminArticles'] }) });

  return (
    <div>
      <div className="flex justify-between items-baseline mb-6">
        <h1 className="font-serif text-2xl font-bold italic text-ink-900 dark:text-ink-100">{t('admin.articles')}</h1>
        <div className="flex gap-4">
          <button onClick={() => setShowFetchDialog(true)} className="text-sm text-accent hover:text-accent/80 transition-colors">
            {t('fetch.title')} →
          </button>
          <Link to="/admin/articles/new" className="text-sm text-accent hover:text-accent/80 transition-colors">
            {t('dashboard.newArticle')} →
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPage(1); }}
          placeholder={t('manage.searchPlaceholder')}
          className="w-full max-w-sm px-3 py-2 text-sm bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 dark:border-ink-800/80">
              <th className="text-left py-3 pr-4 font-medium text-ink-400 text-xs uppercase tracking-wider">{t('manage.thTitle')}</th>
              <th className="text-left py-3 pr-4 font-medium text-ink-400 text-xs uppercase tracking-wider hidden md:table-cell">{t('manage.thCategory')}</th>
              <th className="text-left py-3 pr-4 font-medium text-ink-400 text-xs uppercase tracking-wider hidden md:table-cell">{t('manage.thDate')}</th>
              <th className="text-left py-3 pr-4 font-medium text-ink-400 text-xs uppercase tracking-wider">{t('manage.thStatus')}</th>
              <th className="text-right py-3 font-medium text-ink-400 text-xs uppercase tracking-wider">{t('manage.thActions')}</th>
            </tr>
          </thead>
          <tbody>
            {data?.records.map((a: any) => (
              <tr key={a.id} className="border-b border-ink-100 dark:border-ink-800/80 last:border-0 hover:bg-ink-50/50 dark:hover:bg-ink-900/30 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {a.isTop === 1 && <span className="text-[10px] text-accent font-medium shrink-0">PIN</span>}
                    {a.sourceUrl && <span className="text-[10px] text-ink-400 dark:text-ink-500 border border-ink-200 dark:border-ink-700 rounded px-1 shrink-0">{t('fetch.repost')}</span>}
                    <Link to={`/admin/articles/${a.id}/edit`} className="font-medium text-ink-800 dark:text-ink-200 hover:text-accent transition-colors line-clamp-1">
                      {a.title}
                    </Link>
                  </div>
                </td>
                <td className="py-3 pr-4 text-ink-400 dark:text-ink-500 hidden md:table-cell">{a.categoryName}</td>
                <td className="py-3 pr-4 text-ink-400 dark:text-ink-500 hidden md:table-cell tabular-nums">{formatDate(a.publishedAt || a.createdAt)}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs ${a.status === 1 ? 'text-accent' : 'text-ink-400 dark:text-ink-500'}`}>
                    {a.status === 1 ? t('dashboard.published') : t('dashboard.draft')}
                  </span>
                </td>
                <td className="py-3 text-right space-x-3">
                  <button onClick={() => toggleTop.mutate(a.id)} className="text-xs text-ink-500 hover:text-accent transition-colors">
                    {a.isTop === 1 ? t('manage.unpin') : t('manage.pin')}
                  </button>
                  <button onClick={() => toggleStatus.mutate(a.id)} className="text-xs text-ink-500 hover:text-accent transition-colors">
                    {a.status === 1 ? t('manage.unpublish') : t('manage.publish')}
                  </button>
                  <button onClick={() => { if (confirm(t('manage.deleteConfirm'))) deleteMutation.mutate(a.id); }} className="text-xs text-ink-400 hover:text-red-500 transition-colors">
                    {t('manage.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && <Pagination current={data.page} total={data.total} pages={data.pages} onChange={setPage} />}

      <ArticleFetchDialog open={showFetchDialog} onClose={() => setShowFetchDialog(false)} />
    </div>
  );
}
