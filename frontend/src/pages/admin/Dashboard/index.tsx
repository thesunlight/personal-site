import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { siteConfigApi } from '../../../api/siteConfigApi';
import { articleApi } from '../../../api/articleApi';
import { formatDate } from '../../../utils/date';
import { useI18n } from '../../../i18n';

export default function Dashboard() {
  const { t } = useI18n();
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: () => siteConfigApi.getStats().then(r => r.data) });
  const { data: recent } = useQuery({ queryKey: ['recentArticles'], queryFn: () => articleApi.getListAll({ page: 1, size: 5 }).then(r => r.data) });

  const items = [
    { label: t('admin.articles'), value: stats?.articleCount ?? '-' },
    { label: t('admin.categories'), value: stats?.categoryCount ?? '-' },
    { label: t('admin.tags'), value: stats?.tagCount ?? '-' },
    { label: t('dashboard.totalViews'), value: stats?.totalViews ?? '-' },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold italic text-ink-900 dark:text-ink-100 mb-8">
        {t('admin.dashboard')}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 mb-10 pb-6 border-b border-ink-100 dark:border-ink-800/80">
        {items.map(item => (
          <div key={item.label}>
            <p className="text-3xl font-bold text-ink-900 dark:text-ink-100 tabular-nums">{item.value}</p>
            <p className="text-[13px] text-ink-400 dark:text-ink-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Recent articles */}
      <div className="flex justify-between items-baseline mb-4">
        <h2 className="font-serif text-lg font-semibold italic text-ink-800 dark:text-ink-200">
          {t('dashboard.recentArticles')}
        </h2>
        <Link to="/admin/articles/new" className="text-sm text-accent hover:text-accent/80 transition-colors">
          {t('dashboard.newArticle')} →
        </Link>
      </div>
      <div>
        {recent?.records.map((a: any) => (
          <div key={a.id} className="flex justify-between items-baseline py-3 border-b border-ink-100 dark:border-ink-800/80 last:border-0">
            <div className="min-w-0">
              <Link to={`/admin/articles/${a.id}/edit`} className="text-[15px] font-medium text-ink-800 dark:text-ink-200 hover:text-accent transition-colors truncate block">
                {a.title}
              </Link>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">
                {formatDate(a.publishedAt || a.createdAt)}{a.categoryName && ` · ${a.categoryName}`}
              </p>
            </div>
            <span className={`text-xs shrink-0 ml-4 ${a.status === 1 ? 'text-accent' : 'text-ink-400 dark:text-ink-500'}`}>
              {a.status === 1 ? t('dashboard.published') : t('dashboard.draft')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
