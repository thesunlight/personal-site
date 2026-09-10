import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { siteConfigApi } from '../../api/siteConfigApi';
import MarkdownRenderer from '../../components/Article/MarkdownRenderer';
import { useSiteConfigStore } from '../../stores/useSiteConfigStore';
import { useI18n } from '../../i18n';

export default function About() {
  const { configs } = useSiteConfigStore();
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ['siteConfig'], queryFn: () => siteConfigApi.get().then(r => r.data) });
  const content = data?.configs?.about_content || '## About Me\n\nWelcome to my personal site!';

  return (
    <>
      <Helmet><title>{t('about.title')} - {configs.site_title || 'HuangML'}</title></Helmet>
      <div className="max-w-3xl mx-auto px-6">
        <header className="pt-16 pb-2">
          <h1 className="font-serif text-3xl font-bold text-ink-800 dark:text-ink-100 italic tracking-tight mb-8">{t('about.title')}</h1>
        </header>
        <MarkdownRenderer content={content} />
      </div>
    </>
  );
}
