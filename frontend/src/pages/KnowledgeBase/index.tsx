import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { kbApi } from '../../api/kbApi';
import { useI18n } from '../../i18n';

export default function KnowledgeBase() {
  const { t } = useI18n();
  const { data: projects } = useQuery({
    queryKey: ['kbProjects'],
    queryFn: () => kbApi.projects.list().then(r => r.data),
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-ink-100 mb-8">
        {t('kb.title')}
      </h1>

      {projects?.length === 0 && (
        <p className="text-ink-400 text-sm">{t('kb.noProjects')}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects?.map(p => (
          <Link
            key={p.id}
            to={`/kb/${p.slug}`}
            className="group block p-6 border border-ink-100 dark:border-ink-800 rounded-lg hover:border-accent/40 hover:shadow-sm transition-all"
          >
            <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-200 group-hover:text-accent transition-colors">
              {p.name}
            </h2>
            {p.description && (
              <p className="text-sm text-ink-400 dark:text-ink-500 mt-2 line-clamp-2">{p.description}</p>
            )}
            <div className="flex items-center gap-3 mt-4 text-xs text-ink-400">
              <span>{p.docCount} {t('kb.docs')}</span>
              {p.githubRepo && <span>· GitHub</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
