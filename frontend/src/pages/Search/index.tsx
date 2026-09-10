import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { articleApi } from '../../api/articleApi';
import ArticleCard from '../../components/Article/ArticleCard';
import Pagination from '../../components/Common/Pagination';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';
import { useI18n } from '../../i18n';

export default function Search() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || searchParams.get('keyword') || '';
  const [page, setPage] = useState(1);
  const { configs } = useSiteConfigStore();
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ['search', keyword, page],
    queryFn: () => articleApi.getList({ page, size: 10, keyword }).then(r => r.data),
    enabled: !!keyword,
  });

  return (
    <>
      <Helmet><title>{t('search.title')}: {keyword} - {configs.site_title || 'HuangML'}</title></Helmet>
      <div className="max-w-3xl mx-auto px-6">
        <header className="pt-16 pb-6">
          <h1 className="font-serif text-3xl font-bold text-ink-800 dark:text-ink-100 italic tracking-tight">{t('search.title')}</h1>
          <p className="text-ink-500 dark:text-ink-400 mt-2 text-[15px]">{t('search.found', { n: data?.total || 0, k: keyword })}</p>
        </header>
        {data?.records.map(a => <ArticleCard key={a.id} article={a} />)}
        {data?.records.length === 0 && <p className="text-ink-400 text-center py-12 text-sm">{t('search.noResults')}</p>}
        {data && data.pages > 1 && <div className="mt-8 mb-16"><Pagination current={data.page} total={data.total} pages={data.pages} onChange={setPage} /></div>}
      </div>
    </>
  );
}
