import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { siteConfigApi } from '../../../api/siteConfigApi';
import { useI18n } from '../../../i18n';

const inputCls = 'w-full px-3 py-2 text-sm bg-transparent border border-ink-200 dark:border-ink-700 rounded-md outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors';

export default function SiteConfigPage() {
  const { t } = useI18n();
  const { data } = useQuery({ queryKey: ['siteConfig'], queryFn: () => siteConfigApi.get().then(r => r.data) });
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (data?.configs) setForm(data.configs); }, [data]);

  const updateMut = useMutation({
    mutationFn: (configs: Record<string, string>) => siteConfigApi.update(configs),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const fields = [
    { key: 'site_title', label: t('settings.siteTitle') },
    { key: 'site_subtitle', label: t('settings.subtitle') },
    { key: 'site_description', label: t('settings.description') },
    { key: 'site_keywords', label: t('settings.keywords') },
    { key: 'site_logo', label: t('settings.logo') },
    { key: 'site_footer', label: t('settings.footer') },
    { key: 'about_content', label: t('settings.aboutContent') },
    { key: 'icp_number', label: t('settings.icp') },
  ];

  return (
    <div>
      <div className="flex justify-between items-baseline mb-8">
        <h1 className="font-serif text-2xl font-bold italic text-ink-900 dark:text-ink-100">{t('settings.title')}</h1>
        <button
          onClick={() => updateMut.mutate(form)}
          disabled={updateMut.isPending}
          className="text-sm font-medium text-accent hover:text-accent/80 transition-colors disabled:opacity-40"
        >
          {saved ? t('settings.saved') : updateMut.isPending ? t('settings.saving') : t('settings.save')}
        </button>
      </div>

      <div className="space-y-5 max-w-2xl">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium uppercase tracking-wider text-ink-400 mb-2">{f.label}</label>
            {f.key === 'about_content' ? (
              <textarea value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className={`${inputCls} font-mono`} rows={8} />
            ) : (
              <input type="text" value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className={inputCls} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
