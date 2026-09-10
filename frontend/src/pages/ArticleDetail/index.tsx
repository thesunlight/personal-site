import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { articleApi } from '../../api/articleApi';
import MarkdownRenderer from '../../components/Article/MarkdownRenderer';
import TableOfContents from '../../components/Article/TableOfContents';
import { formatDate } from '../../utils/date';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';
import { useI18n } from '../../i18n';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { configs } = useSiteConfigStore();
  const { t } = useI18n();
  const { data: article } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => articleApi.getDetail(slug!).then(r => r.data),
    enabled: !!slug,
  });

  if (!article) return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-ink-400 text-sm">{t('common.loading')}</div>;

  return (
    <>
      <Helmet>
        <title>{article.title} - {configs.site_title || 'HuangML'}</title>
        <meta name="description" content={article.summary || ''} />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6">
        <article className="pt-12">
          {/* Header — pure typography */}
          <header className="mb-10">
            <div className="flex items-center gap-3 text-[12px] text-ink-400 dark:text-ink-500 mb-4">
              {article.categoryName && (
                <Link to={`/category/${article.categorySlug}`} className="text-accent hover:underline underline-offset-[3px]">{article.categoryName}</Link>
              )}
              <span>·</span>
              <time className="tabular-nums">{formatDate(article.publishedAt)}</time>
              {article.isTop === 1 && (
                <>
                  <span>·</span>
                  <span className="text-accent">{t('common.pinned')}</span>
                </>
              )}
            </div>
            <h1 className="font-serif text-[34px] leading-[1.3] font-bold text-ink-800 dark:text-ink-100 tracking-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 mt-4 text-[12px] text-ink-400 dark:text-ink-500">
              <span>{article.viewCount} {t('common.views')}</span>
              <span>·</span>
              <span>{article.wordCount} {t('common.words')}</span>
            </div>
            {article.sourceUrl && (
              <div className="flex items-center gap-2 mt-3 text-[12px] text-ink-400 dark:text-ink-500">
                <span className="text-[10px] border border-ink-200 dark:border-ink-700 rounded px-1">{t('fetch.repost')}</span>
                {article.sourceName && <span>· {article.sourceName}</span>}
                {article.sourceAuthor && <span>· {article.sourceAuthor}</span>}
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer"
                   className="text-accent hover:underline underline-offset-[3px]">
                  {t('fetch.viewOriginal')} →
                </a>
              </div>
            )}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-[12px]">
                {article.tags.map(t => (
                  <Link key={t.id} to={`/tag/${t.slug}`} className="text-ink-400 dark:text-ink-500 hover:text-accent transition-colors">
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Content + TOC */}
          <div className="flex gap-10">
            <div className="flex-1 min-w-0">
              <MarkdownRenderer content={article.content} />
            </div>
            <TableOfContents />
          </div>

          {/* Prev / Next — plain text */}
          <nav className="flex justify-between mt-14 pt-6 border-t border-ink-100 dark:border-ink-800 gap-6 text-sm">
            {article.prevArticle ? (
              <Link to={`/articles/${article.prevArticle.slug}`} className="group min-w-0 flex-1">
                <span className="text-[12px] text-ink-400 dark:text-ink-500">{t('common.previous')}</span>
                <p className="text-ink-600 dark:text-ink-300 group-hover:text-accent transition-colors mt-0.5 truncate">{article.prevArticle.title}</p>
              </Link>
            ) : <div className="flex-1" />}
            {article.nextArticle && (
              <Link to={`/articles/${article.nextArticle.slug}`} className="group min-w-0 flex-1 text-right">
                <span className="text-[12px] text-ink-400 dark:text-ink-500">{t('common.next')}</span>
                <p className="text-ink-600 dark:text-ink-300 group-hover:text-accent transition-colors mt-0.5 truncate">{article.nextArticle.title}</p>
              </Link>
            )}
          </nav>
        </article>
      </div>
    </>
  );
}
