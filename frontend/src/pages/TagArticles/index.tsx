import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { articleApi } from '../../api/articleApi';
import { tagApi } from '../../api/tagApi';
import ArticleCard from '../../components/Article/ArticleCard';
import Pagination from '../../components/Common/Pagination';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';
import { useI18n } from '../../i18n';

export default function TagArticles() {
  const { slug } = useParams<{ slug: string }>();
  const { configs } = useSiteConfigStore();
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: () => tagApi.getAll().then(r => r.data) });
  const tag = tags?.find(t => t.slug === slug);
  const { data } = useQuery({
    queryKey: ['tagArticles', tag?.id, page],
    queryFn: () => articleApi.getList({ page, size: 10, tagId: tag?.id }).then(r => r.data),
    enabled: !!tag?.id,
  });

  return (
    <>
      <Helmet><title>{t('tag.title', { name: tag?.name || slug || '' })} - {configs.site_title || 'HuangML'}</title></Helmet>
      <div className="max-w-3xl mx-auto px-6">
        <header className="pt-16 pb-8">
          <h1 className="font-serif text-3xl font-bold text-ink-800 dark:text-ink-100 italic tracking-tight">{t('tag.title', { name: tag?.name || '' })}</h1>
        </header>
        {data?.records.map(a => <ArticleCard key={a.id} article={a} />)}
        {data?.records.length === 0 && <p className="text-ink-400 text-center py-12 text-sm">{t('tag.noArticles')}</p>}
        {data && data.pages > 1 && <div className="mt-8 mb-16"><Pagination current={data.page} total={data.total} pages={data.pages} onChange={setPage} /></div>}
      </div>
    </>
  );
}
