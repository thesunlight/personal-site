import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { articleApi } from '../../api/articleApi';
import ArticleCard from '../../components/Article/ArticleCard';
import Pagination from '../../components/Common/Pagination';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';
import { useI18n } from '../../i18n';

export default function Home() {
  const [page, setPage] = useState(1);
  const { configs } = useSiteConfigStore();
  const { t } = useI18n();
  const { data: topArticles } = useQuery({ queryKey: ['topArticles'], queryFn: () => articleApi.getTop().then(r => r.data) });
  const { data: articles } = useQuery({
    queryKey: ['articles', page],
    queryFn: () => articleApi.getList({ page, size: 20 }).then(r => r.data),
  });

  return (
    <>
      <Helmet>
        <title>{configs.site_title || 'HuangML'}</title>
        <meta name="description" content={configs.site_description || ''} />
        <meta name="keywords" content={configs.site_keywords || ''} />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6">
        {/* Intro — typographic, no boxes */}
        <section className="pt-16 pb-10">
          <h1 className="font-serif text-4xl font-bold text-ink-800 dark:text-ink-100 italic tracking-tight">
            {configs.site_title || 'HuangML'}
          </h1>
          {configs.site_subtitle && (
            <p className="text-ink-500 dark:text-ink-400 mt-3 text-[15px]">
              {configs.site_subtitle}
            </p>
          )}
          <nav className="flex gap-5 mt-6 text-[13px]">
            <Link to="/articles" className="text-ink-400 dark:text-ink-500 hover:text-accent transition-colors">{t('nav.articles')} →</Link>
            <Link to="/archives" className="text-ink-400 dark:text-ink-500 hover:text-accent transition-colors">{t('nav.archives')} →</Link>
            <Link to="/about" className="text-ink-400 dark:text-ink-500 hover:text-accent transition-colors">{t('nav.about')} →</Link>
          </nav>
        </section>

        {/* Pinned */}
        {topArticles && topArticles.length > 0 && (
          <section className="pb-8">
            <h2 className="text-[13px] font-semibold text-ink-400 dark:text-ink-500 mb-2">
              {t('home.pinned')}
            </h2>
            <div>
              {topArticles.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )}

        {/* Latest */}
        <section className="pb-16">
          <h2 className="text-[13px] font-semibold text-ink-400 dark:text-ink-500 mb-2">
            {t('home.latest')}
          </h2>
          {articles?.records.length === 0 && (
            <p className="text-ink-400 py-12 text-center text-sm">{t('common.noArticles')}</p>
          )}
          <div>
            {articles?.records.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
          {articles && articles.pages > 1 && (
            <div className="mt-8">
              <Pagination current={articles.page} total={articles.total} pages={articles.pages} onChange={setPage} />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
