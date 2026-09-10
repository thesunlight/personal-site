import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { articleApi } from '../../api/articleApi';
import { categoryApi } from '../../api/categoryApi';
import ArticleCard from '../../components/Article/ArticleCard';
import Pagination from '../../components/Common/Pagination';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';
import { useI18n } from '../../i18n';

export default function CategoryArticles() {
  const { slug } = useParams<{ slug: string }>();
  const { configs } = useSiteConfigStore();
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const { data: category } = useQuery({ queryKey: ['category', slug], queryFn: () => categoryApi.getBySlug(slug!).then(r => r.data), enabled: !!slug });
  const { data } = useQuery({
    queryKey: ['categoryArticles', slug, page],
    queryFn: () => articleApi.getList({ page, size: 10, categoryId: category?.id }).then(r => r.data),
    enabled: !!category?.id,
  });

  return (
    <>
      <Helmet><title>{category?.name || t('common.categories')} - {configs.site_title || 'HuangML'}</title></Helmet>
      <div className="max-w-3xl mx-auto px-6">
        <header className="pt-16 pb-8">
          <h1 className="font-serif text-3xl font-bold text-ink-800 dark:text-ink-100 italic tracking-tight">{category?.name}</h1>
          {category?.description && <p className="text-ink-500 dark:text-ink-400 mt-2 text-[15px]">{category.description}</p>}
        </header>
        {data?.records.map(a => <ArticleCard key={a.id} article={a} />)}
        {data?.records.length === 0 && <p className="text-ink-400 text-center py-12 text-sm">{t('category.noArticles')}</p>}
        {data && data.pages > 1 && <div className="mt-8 mb-16"><Pagination current={data.page} total={data.total} pages={data.pages} onChange={setPage} /></div>}
      </div>
    </>
  );
}
