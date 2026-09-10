import { Link } from 'react-router-dom';
import type { Article } from '../../types';
import { useI18n } from '../../i18n';

export default function ArticleCard({ article }: { article: Article }) {
  const { t } = useI18n();
  return (
    <Link to={`/articles/${article.slug}`} className="article-row group">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          {article.isTop === 1 && (
            <span className="text-[11px] text-accent font-medium shrink-0">{t('common.pinned')} ·</span>
          )}
          <h2 className="text-[15px] font-medium text-ink-800 dark:text-ink-200 group-hover:text-accent transition-colors truncate">
            {article.title}
          </h2>
        </div>
        {article.summary && (
          <p className="text-[13px] text-ink-400 dark:text-ink-500 mt-1 line-clamp-1">{article.summary}</p>
        )}
      </div>
      <time className="text-[13px] text-ink-400 dark:text-ink-500 shrink-0 tabular-nums">
        {article.publishedAt?.slice(0, 10)}
      </time>
    </Link>
  );
}
