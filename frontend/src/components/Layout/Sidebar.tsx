import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../../api/categoryApi';
import { tagApi } from '../../api/tagApi';
import { useI18n } from '../../i18n';
import SearchBar from '../Common/SearchBar';

export default function Sidebar() {
  const { t } = useI18n();
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll().then(r => r.data) });
  const { data: tags } = useQuery({ queryKey: ['tags'], queryFn: () => tagApi.getAll().then(r => r.data) });

  return (
    <aside className="space-y-5">
      <div className="md:hidden"><SearchBar /></div>

      {categories && categories.length > 0 && (
        <div className="card">
          <h3 className="section-title">{t('common.categories')}</h3>
          <div className="space-y-1">
            {categories.map(c => (
              <Link key={c.id} to={`/category/${c.slug}`}
                className="flex justify-between items-center py-2 px-3 -mx-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
                <span className="font-medium group-hover:translate-x-0.5 transition-transform">{c.name}</span>
                <span className="text-[11px] font-medium bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full tabular-nums">{c.articleCount}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className="card">
          <h3 className="section-title">{t('common.tags')}</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <Link key={t.id} to={`/tag/${t.slug}`}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 border border-gray-100 dark:border-gray-700/50 hover:border-primary-200 dark:hover:border-primary-800 transition-all">
                #{t.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
