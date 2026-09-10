import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';
import { useI18n } from '../../i18n';

const menuItems = [
  { key: 'admin.dashboard', path: '/admin', exact: true },
  { key: 'admin.articles', path: '/admin/articles' },
  { key: 'admin.categories', path: '/admin/categories' },
  { key: 'admin.tags', path: '/admin/tags' },
  { key: 'admin.settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore();
  const { configs } = useSiteConfigStore();
  const { lang, toggleLang, t } = useI18n();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink-100 dark:border-ink-800/80">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/admin" className="font-serif text-[17px] font-bold italic text-ink-900 dark:text-ink-100">
            {configs.site_title || 'HuangML'} {t('admin.brandSuffix')}
          </Link>
          <div className="flex items-center gap-4 text-[13px]">
            {menuItems.map(item => {
              const active = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={active
                    ? 'text-accent font-medium'
                    : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 transition-colors'
                  }
                >
                  {t(item.key)}
                </Link>
              );
            })}
            <span className="text-ink-200 dark:text-ink-700">|</span>
            <Link to="/" className="text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-200 transition-colors">
              {t('admin.viewSite')}
            </Link>
            <button onClick={handleLogout} className="text-ink-400 dark:text-ink-500 hover:text-red-500 transition-colors">
              {t('admin.logout')}
            </button>
            <button onClick={toggleLang} className="text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-200 transition-colors">
              {lang === 'zh' ? 'EN' : '中'}
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
