import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { articleApi } from '../../api/articleApi';
import { formatDate } from '../../utils/date';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';
import { useI18n, getMonthNames } from '../../i18n';

export default function Archive() {
  const { configs } = useSiteConfigStore();
  const { lang, t } = useI18n();
  const monthNames = getMonthNames(lang);
  const { data: archives } = useQuery({ queryKey: ['archives'], queryFn: () => articleApi.getArchives().then(r => r.data) });

  return (
    <>
      <Helmet><title>{t('archive.title')} - {configs.site_title || 'HuangML'}</title></Helmet>
      <div className="max-w-3xl mx-auto px-6">
        <header className="pt-16 pb-2">
          <h1 className="font-serif text-3xl font-bold text-ink-800 dark:text-ink-100 italic tracking-tight mb-10">{t('archive.title')}</h1>
        </header>
        {!archives && <p className="text-ink-400">{t('common.loading')}</p>}
        {archives?.map(year => (
          <div key={year.year} className="mb-10">
            <h2 className="text-xl font-bold text-ink-800 dark:text-ink-200 mb-4">{year.year}</h2>
            {year.months.map(month => (
              <div key={month.month} className="mb-5 ml-2">
                <h3 className="text-[13px] font-semibold text-ink-400 dark:text-ink-500 mb-2">{monthNames[month.month - 1]}</h3>
                <div className="border-l border-ink-200 dark:border-ink-800 pl-5 space-y-1.5">
                  {month.articles.map(a => (
                    <div key={a.id} className="flex items-baseline gap-4">
                      <span className="text-[12px] text-ink-400 dark:text-ink-500 w-[72px] shrink-0 tabular-nums">{a.publishedAt?.slice(5, 10)}</span>
                      <Link to={`/articles/${a.slug}`} className="text-sm text-ink-600 dark:text-ink-300 hover:text-accent transition-colors">{a.title}</Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
