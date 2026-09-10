import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { articleApi } from '../../api/articleApi';
import ArticleCard from '../../components/Article/ArticleCard';
import Pagination from '../../components/Common/Pagination';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';
import { useI18n } from '../../i18n';

export default function ArticleList() {
  const [page, setPage] = useState(1);
  const { configs } = useSiteConfigStore();
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ['articles', page],
    queryFn: () => articleApi.getList({ page, size: 20 }).then(r => r.data),
  });

  return (
    <>
      <Helmet><title>{t('articles.title')} - {configs.site_title || 'HuangML'}</title></Helmet>

      <div className="max-w-3xl mx-auto px-6">
        <header className="pt-16 pb-8">
          <h1 className="font-serif text-3xl font-bold text-ink-800 dark:text-ink-100 italic tracking-tight">{t('articles.title')}</h1>
        </header>
        {data?.records.map(a => <ArticleCard key={a.id} article={a} />)}
        {data?.records.length === 0 && <p className="text-ink-400 text-center py-12 text-sm">{t('common.noArticles')}</p>}
        {data && data.pages > 1 && (
          <div className="mt-8 mb-16">
            <Pagination current={data.page} total={data.total} pages={data.pages} onChange={setPage} />
          </div>
        )}
      </div>
    </>
  );
}
