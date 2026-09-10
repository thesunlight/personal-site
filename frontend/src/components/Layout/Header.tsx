import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';
import { useI18n } from '../../i18n';

const navItems = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.articles', path: '/articles' },
  { key: 'nav.kb', path: '/kb' },
  { key: 'nav.archives', path: '/archives' },
  { key: 'nav.about', path: '/about' },
];

export default function Header() {
  const location = useLocation();
  const { configs, darkMode, toggleDarkMode } = useSiteConfigStore();
  const { lang, toggleLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-ink-900/95 backdrop-blur-sm border-b border-ink-100 dark:border-ink-800">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-serif text-[19px] font-bold text-ink-800 dark:text-ink-100 hover:text-accent transition-colors">
          {configs.site_title || 'HuangML'}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`text-sm transition-colors ${
                location.pathname === item.path
                  ? 'text-accent'
                  : 'text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100'
              }`}>
              {t(item.key)}
            </Link>
          ))}
          <div className="w-px h-4 bg-ink-200 dark:bg-ink-700" />
          <form action="/search" method="get" className="hidden lg:block">
            <input type="text" name="q" placeholder={t('common.search')} autoComplete="off"
              className="w-32 px-2 py-1 text-[13px] bg-transparent border border-transparent rounded-md focus:border-ink-200 dark:focus:border-ink-700 focus:bg-ink-50 dark:focus:bg-ink-800 outline-none transition-all focus:w-44 text-ink-600 dark:text-ink-300 placeholder:text-ink-400" />
          </form>
          <button onClick={toggleLang} className="text-[13px] font-medium text-ink-400 dark:text-ink-500 hover:text-accent transition-colors" title="Switch language / 切换语言">
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          <button onClick={toggleDarkMode} className="text-ink-400 dark:text-ink-500 hover:text-accent transition-colors" title="Toggle dark mode">
            {darkMode ? (
              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggleLang} className="text-[13px] font-medium text-ink-400 hover:text-accent">
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          <button onClick={toggleDarkMode} className="text-ink-400 hover:text-accent">
            {darkMode ? (
              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          <button className="text-ink-600 dark:text-ink-300" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-ink-100 dark:border-ink-800 px-6 py-3 space-y-0.5">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm transition-colors ${
                location.pathname === item.path
                  ? 'text-accent'
                  : 'text-ink-500 dark:text-ink-400'
              }`}>
              {t(item.key)}
            </Link>
          ))}
          <form action="/search" method="get" className="pt-2">
            <input type="text" name="q" placeholder={t('common.search')} autoComplete="off"
              className="w-full px-3 py-1.5 text-sm bg-ink-50 dark:bg-ink-800 rounded-md outline-none border border-ink-200 dark:border-ink-700 focus:border-accent text-ink-600 dark:text-ink-300 placeholder:text-ink-400" />
          </form>
        </div>
      )}
    </header>
  );
}
